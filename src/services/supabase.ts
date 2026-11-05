import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'bss_supabase_url';
const SUPABASE_KEY_KEY = 'bss_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY) || envKey;

  return {
    url: localUrl.trim(),
    anonKey: localKey.trim(),
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (anonKey) localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(SUPABASE_KEY_KEY);
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

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'Please provide both Supabase Project URL and Anon Key.' };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    // Try pinging auth or a generic query
    const { error } = await testClient.from('announcements').select('id').limit(1);
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      return { success: false, message: `Supabase returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase endpoint!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Could not connect to Supabase.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Brain Science School Zafarwal - Complete Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor to initialize all tables & RLS

-- 1. Create Enums
CREATE TYPE campus_type AS ENUM ('boys', 'girls');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE fee_status_type AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE admission_status_type AS ENUM ('pending', 'interview_scheduled', 'approved', 'rejected', 'enrolled');

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    gender gender_type NOT NULL,
    campus_id campus_type NOT NULL,
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

-- 4. Admissions Inquiries Table
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_no VARCHAR(50) UNIQUE NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    gender gender_type NOT NULL,
    campus_id campus_type NOT NULL,
    applied_grade SMALLINT NOT NULL CHECK (applied_grade >= 1 AND applied_grade <= 10),
    guardian_phone VARCHAR(30) NOT NULL,
    guardian_cnic VARCHAR(30),
    address TEXT,
    previous_school TEXT,
    status admission_status_type DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Fees & Payments Table
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_no VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(50),
    student_name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    class_grade SMALLINT NOT NULL,
    campus_id campus_type NOT NULL,
    month VARCHAR(30) NOT NULL,
    year SMALLINT NOT NULL,
    tuition_fee NUMERIC(10, 2) DEFAULT 0,
    exam_fee NUMERIC(10, 2) DEFAULT 0,
    misc_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    status fee_status_type DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    class_grade SMALLINT NOT NULL,
    campus_id campus_type NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Examinations & Results Table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_title VARCHAR(200) NOT NULL,
    term VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    class_grade SMALLINT NOT NULL,
    campus_id campus_type NOT NULL,
    subjects JSONB NOT NULL,
    total_marks NUMERIC(8,2) NOT NULL,
    obtained_marks NUMERIC(8,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    remarks TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(250) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    campus_id VARCHAR(20) DEFAULT 'all',
    publish_date DATE DEFAULT CURRENT_DATE,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads for Announcements & Faculty
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public can view teachers" ON public.teachers FOR SELECT USING (true);

-- Allow Public to submit Admission Inquiries
CREATE POLICY "Public can insert admission inquiry" ON public.admissions FOR INSERT WITH CHECK (true);

-- Allow Authenticated Admins Full Access
CREATE POLICY "Admins full access to students" ON public.students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to teachers" ON public.teachers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to admissions" ON public.admissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to fees" ON public.fees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to attendance" ON public.attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to exam_results" ON public.exam_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to announcements" ON public.announcements FOR ALL USING (auth.role() = 'authenticated');
`;
