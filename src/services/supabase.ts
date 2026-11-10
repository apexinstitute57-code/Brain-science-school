import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'bss_supabase_url';
const SUPABASE_KEY_KEY = 'bss_supabase_anon_key';

/**
 * Normalizes and validates a Supabase Project URL.
 * Handles common user mistakes:
 * - Missing protocol (adds https://)
 * - Trailing slashes
 * - Accidental dashboard URL copy-paste
 * - Whitespace and quotes
 */
export function normalizeSupabaseUrl(input: string): { url: string; error?: string } {
  let cleaned = (input || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) {
    return { url: '', error: 'Project URL is required.' };
  }

  // Detect Supabase Dashboard URL (e.g., https://supabase.com/dashboard/project/abcdefgh)
  const dashboardMatch = cleaned.match(/supabase\.(?:com|io)\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    cleaned = `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  // Upgrade http to https
  if (cleaned.startsWith('http://')) {
    cleaned = cleaned.replace('http://', 'https://');
  }

  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');

  // Validate URL format
  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname.includes('.')) {
      return { url: cleaned, error: 'Invalid URL. Format should be: https://your-project-id.supabase.co' };
    }
    return { url: cleaned };
  } catch {
    return { url: cleaned, error: 'Invalid URL format. Example: https://your-project-id.supabase.co' };
  }
}

/**
 * Normalizes and validates a Supabase Public / Publishable / Anon Key.
 * Rejects secret service_role keys to protect security.
 */
export function normalizeSupabaseKey(input: string): { key: string; error?: string; isServiceRole?: boolean } {
  const cleaned = (input || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) {
    return { key: '', error: 'API Key is required.' };
  }

  if (cleaned.length < 20) {
    return { key: cleaned, error: 'The API Key is too short. Please copy the anon public key or publishable key from Project Settings -> API.' };
  }

  if (cleaned.startsWith('postgres://') || cleaned.startsWith('postgresql://')) {
    return { key: cleaned, error: 'You entered a database connection string instead of the API key. Please copy the anon public key (JWT) from Supabase Project Settings -> API.' };
  }

  // Security Check: Never allow service_role / secret key in browser
  try {
    const parts = cleaned.split('.');
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      if (payload.role === 'service_role') {
        return {
          key: cleaned,
          isServiceRole: true,
          error: 'Security Warning: You entered a secret "service_role" key. Never use service_role in client-side code! Please copy the "anon" public key instead.',
        };
      }
    }
  } catch {
    // Might be a new publishable key format (sbp_... or pk_...)
  }

  return { key: cleaned };
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY) || envKey;

  const normUrl = normalizeSupabaseUrl(localUrl);
  const normKey = normalizeSupabaseKey(localKey);

  return {
    url: normUrl.url || localUrl.trim(),
    anonKey: normKey.key || localKey.trim(),
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): { success: boolean; error?: string } {
  const normUrl = normalizeSupabaseUrl(url);
  if (url && normUrl.error) {
    return { success: false, error: normUrl.error };
  }

  const normKey = normalizeSupabaseKey(anonKey);
  if (anonKey && normKey.error && normKey.isServiceRole) {
    return { success: false, error: normKey.error };
  }

  if (normUrl.url) localStorage.setItem(SUPABASE_URL_KEY, normUrl.url);
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (normKey.key) localStorage.setItem(SUPABASE_KEY_KEY, normKey.key);
  else localStorage.removeItem(SUPABASE_KEY_KEY);

  // Invalidate any existing client instance
  supabaseInstance = null;

  return { success: true };
}

export function disconnectSupabase(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export interface AdmissionsTableSchema {
  discovered: boolean;
  columns: string[];
  columnDetails: Record<string, { type: string; format?: string }>;
}

let cachedAdmissionsSchema: AdmissionsTableSchema | null = null;

/**
 * Discovers the exact columns of the 'admissions' table from PostgREST OpenAPI or live query.
 * Guarantees that the app does not guess column names.
 */
export async function discoverAdmissionsTableSchema(
  client?: SupabaseClient | null,
  forceRefresh = false
): Promise<AdmissionsTableSchema> {
  if (cachedAdmissionsSchema && !forceRefresh) {
    return cachedAdmissionsSchema;
  }

  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return { discovered: false, columns: [], columnDetails: {} };
  }

  // 1. Attempt PostgREST OpenAPI discovery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${url}/rest/v1/?apikey=${anonKey}`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const openApi = await res.json();
      const def =
        openApi?.definitions?.admissions ||
        openApi?.components?.schemas?.admissions;

      if (def?.properties) {
        const columns = Object.keys(def.properties);
        const columnDetails: Record<string, { type: string; format?: string }> = {};
        for (const col of columns) {
          columnDetails[col] = {
            type: def.properties[col]?.type || 'string',
            format: def.properties[col]?.format,
          };
        }

        cachedAdmissionsSchema = {
          discovered: true,
          columns,
          columnDetails,
        };

        try {
          localStorage.setItem('bss_admissions_columns', JSON.stringify(columns));
        } catch {}

        return cachedAdmissionsSchema;
      }
    }
  } catch (err) {
    // OpenAPI endpoint might be disabled or timed out
  }

  // 2. Query admissions table directly if client available
  const subClient = client || getSupabase();
  if (subClient) {
    try {
      const { data, error } = await subClient
        .from('admissions')
        .select('*')
        .limit(1);

      if (!error && data && data.length > 0) {
        const columns = Object.keys(data[0]);
        cachedAdmissionsSchema = {
          discovered: true,
          columns,
          columnDetails: Object.fromEntries(columns.map((c) => [c, { type: 'unknown' }])),
        };
        try {
          localStorage.setItem('bss_admissions_columns', JSON.stringify(columns));
        } catch {}
        return cachedAdmissionsSchema;
      }
    } catch {}
  }

  // 3. Fallback to localStorage cached columns
  try {
    const stored = localStorage.getItem('bss_admissions_columns');
    if (stored) {
      const cols = JSON.parse(stored);
      if (Array.isArray(cols) && cols.length > 0) {
        cachedAdmissionsSchema = {
          discovered: true,
          columns: cols,
          columnDetails: Object.fromEntries(cols.map((c) => [c, { type: 'unknown' }])),
        };
        return cachedAdmissionsSchema;
      }
    }
  } catch {}

  return { discovered: false, columns: [], columnDetails: {} };
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  tableFound?: boolean;
  rlsRestricted?: boolean;
  errorType?: 'offline' | 'invalid_url' | 'invalid_key' | 'project_paused' | 'table_missing' | 'rls_error' | 'fetch_error';
  discoveredColumns?: string[];
}

/**
 * Robust Supabase connection tester with deep diagnostics.
 * Differentiates between offline states, paused projects, invalid keys, and missing tables.
 */
export async function testSupabaseConnection(rawUrl: string, rawKey: string): Promise<ConnectionTestResult> {
  // 1. Check browser network connectivity
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      errorType: 'offline',
      message: 'You are currently offline. Please check your internet connection and try again.',
    };
  }

  // 2. Validate input strings
  const normUrl = normalizeSupabaseUrl(rawUrl);
  if (normUrl.error) {
    return {
      success: false,
      errorType: 'invalid_url',
      message: normUrl.error,
    };
  }

  const normKey = normalizeSupabaseKey(rawKey);
  if (normKey.error) {
    return {
      success: false,
      errorType: 'invalid_key',
      message: normKey.error,
    };
  }

  const url = normUrl.url;
  const anonKey = normKey.key;

  // 3. Stage 1: Fast ping to PostgREST root endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const pingRes = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    }).catch((err) => {
      clearTimeout(timeoutId);
      throw err;
    });

    clearTimeout(timeoutId);

    if (pingRes.status === 401 || pingRes.status === 403) {
      return {
        success: false,
        errorType: 'invalid_key',
        message: 'Invalid API Key. Supabase rejected your key (HTTP ' + pingRes.status + '). Please check the anon/publishable key in Supabase Project Settings -> API.',
      };
    }

    if (pingRes.status === 503) {
      return {
        success: false,
        errorType: 'project_paused',
        message: 'Supabase project is temporarily unavailable (HTTP 503). Your project may be paused in your Supabase dashboard.',
      };
    }
  } catch (err: any) {
    // If fetch failed
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        errorType: 'offline',
        message: 'Network offline. Your internet connection appears to be disconnected.',
      };
    }

    if (err.name === 'AbortError') {
      return {
        success: false,
        errorType: 'fetch_error',
        message: 'Connection timed out after 8 seconds. Please check if your Supabase project is active or paused.',
      };
    }

    const errStr = String(err?.message || err);
    if (errStr.includes('Failed to fetch') || err.name === 'TypeError') {
      return {
        success: false,
        errorType: 'project_paused',
        message: `Failed to connect to Supabase at "${url}". Common causes:\n` +
          `1. The project may be paused in your Supabase Dashboard (free tier projects pause after 7 days of inactivity). Go to supabase.com and unpause it.\n` +
          `2. The Project URL is incorrect (ensure it looks like https://<project-ref>.supabase.co).\n` +
          `3. An adblocker, VPN, or firewall is blocking requests to supabase.co.`,
      };
    }

    return {
      success: false,
      errorType: 'fetch_error',
      message: `Connection error: ${errStr}`,
    };
  }

  // 4. Stage 2: Initialize official Supabase client and query the 'admissions' table
  try {
    const testClient = createClient(url, anonKey);
    const schema = await discoverAdmissionsTableSchema(testClient, true);

    const { data, error } = await testClient
      .from('admissions')
      .select('id')
      .limit(1);

    if (!error) {
      const colMsg = schema.columns.length > 0 ? ` Detected columns: [${schema.columns.join(', ')}]` : '';
      return {
        success: true,
        tableFound: true,
        discoveredColumns: schema.columns,
        message: `Successfully connected to Supabase! The "admissions" table was verified and is active.${colMsg}`,
      };
    }

    // Check specific error codes
    const errMsg = (error.message || '').toLowerCase();
    const errCode = (error as any).code || '';

    // Table does not exist yet (PostgreSQL error 42P01)
    if (errCode === '42P01' || errMsg.includes('does not exist') || errMsg.includes('relation "public.admissions"')) {
      return {
        success: true,
        tableFound: false,
        errorType: 'table_missing',
        message: 'Connected to Supabase! However, the "admissions" table has not been created in your project yet. Run the provided SQL script in your Supabase SQL Editor.',
      };
    }

    // RLS restrictions (PostgreSQL error 42501)
    if (errCode === '42501' || errMsg.includes('row-level security') || errMsg.includes('permission denied')) {
      const colMsg = schema.columns.length > 0 ? ` Detected columns: [${schema.columns.join(', ')}]` : '';
      return {
        success: true,
        tableFound: true,
        rlsRestricted: true,
        discoveredColumns: schema.columns,
        errorType: 'rls_error',
        message: `Connected to Supabase! Table "admissions" exists.${colMsg} Row Level Security allows public INSERT and restricts SELECT to authorized administrators.`,
      };
    }

    if (errMsg.includes('invalid api key') || errMsg.includes('jwt')) {
      return {
        success: false,
        errorType: 'invalid_key',
        message: `Invalid API key: ${error.message}`,
      };
    }

    return {
      success: true,
      tableFound: true,
      discoveredColumns: schema.columns,
      message: `Connected to Supabase endpoint! Notice: ${error.message}`,
    };
  } catch (err: any) {
    return {
      success: false,
      errorType: 'fetch_error',
      message: err?.message || 'Could not connect to Supabase client.',
    };
  }
}

/**
 * Production-ready SQL script to create the 'admissions' table with all needed columns
 * and complete RLS policies for public INSERT and admin SELECT/UPDATE.
 */
export const SUPABASE_ADMISSIONS_TABLE_SQL = `-- Brain Science School Zafarwal - Admissions Table & RLS Policies
-- Run this in your Supabase Project -> SQL Editor to initialize the admissions table

CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_no VARCHAR(50) UNIQUE NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'male',
    campus_id VARCHAR(20) NOT NULL DEFAULT 'boys',
    applied_grade SMALLINT NOT NULL CHECK (applied_grade >= 1 AND applied_grade <= 10),
    guardian_phone VARCHAR(30) NOT NULL,
    guardian_cnic VARCHAR(30),
    address TEXT NOT NULL,
    previous_school TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    notes TEXT,
    -- Compatible alias columns in case custom scripts reference student_name / phone
    student_name VARCHAR(150),
    guardian_name VARCHAR(150),
    phone VARCHAR(30),
    grade VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Public can insert admission inquiry" ON public.admissions;
DROP POLICY IF EXISTS "Anyone can read admissions" ON public.admissions;
DROP POLICY IF EXISTS "Public and admins can view admissions" ON public.admissions;
DROP POLICY IF EXISTS "Allow update admissions" ON public.admissions;
DROP POLICY IF EXISTS "Allow public insert to admissions" ON public.admissions;
DROP POLICY IF EXISTS "Allow public select to admissions" ON public.admissions;
DROP POLICY IF EXISTS "public_admissions_insert" ON public.admissions;
DROP POLICY IF EXISTS "authenticated_admissions_select" ON public.admissions;
DROP POLICY IF EXISTS "authenticated_admissions_update" ON public.admissions;

-- 1. Allow public applicants (anon and authenticated) to submit admission applications
CREATE POLICY "public_admissions_insert" 
ON public.admissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 2. Allow ONLY authenticated administrators to read student admission applications
-- (Public anonymous visitors CANNOT read student applications, protecting student data privacy)
CREATE POLICY "authenticated_admissions_select" 
ON public.admissions 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Allow authenticated administrators to update admission status, interview notes, and enrollment
CREATE POLICY "authenticated_admissions_update" 
ON public.admissions 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);
`;

export const SUPABASE_SIMPLE_5_COLUMNS_SQL = `-- Minimal 5-Field Admissions Table (with RLS: Public INSERT, Admin SELECT)
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    guardian_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    grade TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous submissions
DROP POLICY IF EXISTS "Allow public insert to admissions" ON public.admissions;
DROP POLICY IF EXISTS "public_simple_insert" ON public.admissions;
CREATE POLICY "public_simple_insert"
ON public.admissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading of admissions for authenticated administrators only
DROP POLICY IF EXISTS "Allow public select to admissions" ON public.admissions;
DROP POLICY IF EXISTS "authenticated_simple_select" ON public.admissions;
CREATE POLICY "authenticated_simple_select"
ON public.admissions
FOR SELECT
TO authenticated
USING (true);
`;

export const SUPABASE_AI_PROMPT = `Create a PostgreSQL table in Supabase called "admissions" for student admission inquiries at Brain Science School Zafarwal with these fields:
1. "id": UUID primary key default gen_random_uuid()
2. "tracking_no": VARCHAR(50) unique not null
3. "applicant_name": VARCHAR(150) not null
4. "father_name": VARCHAR(150) not null
5. "gender": VARCHAR(20) not null check in ('male', 'female')
6. "campus_id": VARCHAR(20) not null check in ('boys', 'girls')
7. "applied_grade": SMALLINT not null check between 1 and 10
8. "guardian_phone": VARCHAR(30) not null
9. "guardian_cnic": VARCHAR(30) nullable
10. "address": TEXT not null
11. "previous_school": TEXT nullable
12. "status": VARCHAR(30) default 'pending'
13. "notes": TEXT nullable
14. "created_at": TIMESTAMP WITH TIME ZONE default now() not null

Enable Row Level Security (RLS) on public.admissions. Add an RLS policy allowing public anonymous users to INSERT so anyone can submit the "Apply now" online admission form, and a policy allowing SELECT.`;

export const SUPABASE_SQL_SCHEMA = `-- Brain Science School Zafarwal - Complete Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor to initialize all tables & RLS

-- 1. Admissions Table
${SUPABASE_ADMISSIONS_TABLE_SQL}

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    campus_id VARCHAR(20) NOT NULL,
    class_grade SMALLINT NOT NULL CHECK (class_grade >= 1 AND class_grade <= 10),
    section VARCHAR(10) DEFAULT 'A',
    dob DATE,
    phone VARCHAR(30),
    address TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    campus_id VARCHAR(20) DEFAULT 'both',
    phone VARCHAR(30),
    email VARCHAR(100),
    experience_years SMALLINT DEFAULT 1,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Fees Table
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_no VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(50),
    student_name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    class_grade SMALLINT NOT NULL,
    campus_id VARCHAR(20) NOT NULL,
    month VARCHAR(30) NOT NULL,
    year SMALLINT NOT NULL,
    tuition_fee NUMERIC(10, 2) DEFAULT 0,
    exam_fee NUMERIC(10, 2) DEFAULT 0,
    misc_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Admins full access to students" ON public.students FOR ALL USING (true);
CREATE POLICY "Admins full access to teachers" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Admins full access to fees" ON public.fees FOR ALL USING (true);
`;
