import React, { useState, useEffect } from 'react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  disconnectSupabase,
  resetToSchoolSupabase,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  testSupabaseConnection,
  normalizeSupabaseUrl,
  normalizeSupabaseKey,
  inspectSupabaseKey,
  ConnectionTestResult,
  SUPABASE_ADMISSIONS_TABLE_SQL,
  SUPABASE_FIX_RLS_SQL,
  SUPABASE_AI_PROMPT,
  SUPABASE_SQL_SCHEMA,
} from '../../services/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  WifiOff,
  Clock,
  Sparkles,
  HelpCircle,
  Info,
  Radio,
} from 'lucide-react';

export const SupabaseSettings: React.FC = () => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [showHelp401, setShowHelp401] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedFixSql, setCopiedFixSql] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(currentConfig.url && currentConfig.anonKey));

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.anonKey);
    setIsSaved(Boolean(config.url && config.anonKey));
  }, []);

  // Real-time inspection
  const normUrl = normalizeSupabaseUrl(url);
  const inspectedKey = inspectSupabaseKey(anonKey);
  const hasRefMismatch = Boolean(
    normUrl.projectRef &&
    inspectedKey.projectRef &&
    normUrl.projectRef.toLowerCase() !== inspectedKey.projectRef.toLowerCase()
  );

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    // Normalize URL and Key
    const normalizedUrl = normalizeSupabaseUrl(url);
    const normalizedKey = normalizeSupabaseKey(anonKey);

    if (normalizedUrl.url && normalizedUrl.url !== url) {
      setUrl(normalizedUrl.url);
    }
    if (normalizedKey.key && normalizedKey.key !== anonKey) {
      setAnonKey(normalizedKey.key);
    }

    if (normalizedKey.isServiceRole) {
      setTestResult({
        success: false,
        errorType: 'invalid_key',
        message: 'Security Alert: Do not use the service_role secret key in the browser! Please use your "anon" public key or "publishable" key.',
      });
      setTesting(false);
      return;
    }

    const saveResult = saveStoredSupabaseConfig(normalizedUrl.url || url, normalizedKey.key || anonKey);
    if (!saveResult.success) {
      setTestResult({
        success: false,
        message: saveResult.error || 'Failed to save configuration.',
      });
      setTesting(false);
      return;
    }

    setIsSaved(true);
    const result = await testSupabaseConnection(normalizedUrl.url || url, normalizedKey.key || anonKey);
    setTestResult(result);
    setTesting(false);
  };

  const handleResetToOfficial = async () => {
    resetToSchoolSupabase();
    setUrl(DEFAULT_SUPABASE_URL);
    setAnonKey(DEFAULT_SUPABASE_ANON_KEY);
    saveStoredSupabaseConfig(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    setIsSaved(true);
    setTesting(true);
    const res = await testSupabaseConnection(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    setTestResult(res);
    setTesting(false);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect Supabase? Applications will be saved to local storage until reconnected.')) {
      disconnectSupabase();
      setUrl('');
      setAnonKey('');
      setIsSaved(false);
      setTestResult(null);
    }
  };

  const handleCopy = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 mb-1">
            <Database className="w-4 h-4" />
            <span>Backend & Database Integration</span>
          </div>
          <h2 className="text-xl font-bold text-white">Supabase PostgreSQL & Admissions Sync</h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Brain Science School Zafarwal database (<code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">xxxqbjqqurptpiidlrwd</code>). Admission inquiries submitted on the public website save automatically to the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">admissions</code> table across all devices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetToOfficial}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Restore official school Supabase credentials"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore School Supabase</span>
          </button>

          {isSaved && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* Connection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Supabase Project Credentials</span>
          </h3>
          <span
            className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
              isSaved && testResult?.success
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : isSaved
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isSaved && testResult?.success ? 'Connected & Verified' : isSaved ? 'Credentials Saved' : 'Not Connected'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Find your Project URL and anon public key in your Supabase Dashboard under <strong>Project Settings → API</strong>.
        </p>

        <form onSubmit={handleSaveAndTest} className="space-y-4 max-w-xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Supabase Project URL <span className="text-amber-400">*</span>
              </label>
              {normUrl.projectRef && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/80">
                  Ref: {normUrl.projectRef}
                </span>
              )}
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Format: <code className="text-slate-400">https://xyzcompany.supabase.co</code> (Dashboard links are auto-corrected)
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Supabase Anon / Publishable Public Key <span className="text-amber-400">*</span>
              </label>
              {inspectedKey.projectRef && (
                <span className="text-[10px] font-mono text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/80">
                  Key Ref: {inspectedKey.projectRef} ({inspectedKey.role || 'anon'})
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white p-0.5 cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-slate-500">
                Only use the public anon/publishable key. Never use the secret service_role key.
              </span>
              <button
                type="button"
                onClick={() => setShowHelp401(!showHelp401)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Got HTTP 401?</span>
              </button>
            </div>
          </div>

          {/* Real-time Project Mismatch Warning */}
          {hasRefMismatch && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-700 text-amber-200 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Project Reference Mismatch Detected!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your Project URL points to <code className="text-white bg-slate-900 px-1 py-0.5 rounded">{normUrl.projectRef}</code>, but this API key is from <code className="text-white bg-slate-900 px-1 py-0.5 rounded">{inspectedKey.projectRef}</code>.
                Supabase will reject this key with <strong>HTTP 401</strong>. Please copy the anon key from project <code className="text-amber-300">{normUrl.projectRef}</code>.
              </p>
            </div>
          )}

          {/* Expandable 401 Troubleshooting Guide */}
          {showHelp401 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>How to Fix "Invalid API Key (HTTP 401)":</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300">
                <li>Log in to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">supabase.com/dashboard</a>.</li>
                <li>Make sure you select the exact project matching your URL: <strong className="text-white">{normUrl.projectRef || 'your project'}</strong>.</li>
                <li>In the left sidebar, click <strong>Project Settings (gear icon)</strong> → <strong>API</strong>.</li>
                <li>Under <strong>Project API keys</strong>, locate the key labeled <span className="text-emerald-400 font-mono">anon</span> / <span className="text-emerald-400 font-mono">public</span>.</li>
                <li>Click <strong>Copy</strong> next to <span className="font-mono text-emerald-300">anon</span> (starts with <code className="bg-slate-900 px-1 text-slate-200">eyJhbGci...</code>).</li>
                <li>Ensure you do <strong>not</strong> copy the <span className="text-red-400 font-mono">service_role</span> key.</li>
              </ol>
            </div>
          )}

          {/* Diagnostic Result Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                testResult.success
                  ? testResult.tableFound === false
                    ? 'bg-amber-950/80 border-amber-700 text-amber-200'
                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : 'bg-red-950/80 border-red-800 text-red-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  testResult.tableFound === false ? (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )
                ) : testResult.errorType === 'offline' ? (
                  <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {testResult.success
                      ? testResult.tableFound === false
                        ? 'Connected to Project (Table Setup Needed)'
                        : 'Connection Successful & Verified!'
                      : 'Connection Failed'}
                  </div>
                  <p className="mt-1 leading-relaxed whitespace-pre-line text-xs opacity-95">
                    {testResult.message}
                  </p>
                </div>
              </div>

              {testResult.discoveredColumns && testResult.discoveredColumns.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/60 mt-1">
                  <div className="text-[11px] font-semibold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                    <span>Database Columns Identified in public.admissions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.discoveredColumns.map((col) => (
                      <span key={col} className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/80 text-[10px] font-mono text-emerald-200">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {testResult.tableFound === false && (
                <div className="pt-2 border-t border-amber-800/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(SUPABASE_ADMISSIONS_TABLE_SQL, setCopiedSql)}
                    className="px-3 py-1 text-[11px] font-semibold bg-amber-400 text-slate-950 rounded hover:bg-amber-300 cursor-pointer flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy admissions Table SQL</span>
                  </button>
                  <span className="text-[11px] text-amber-300">
                    Paste this into Supabase SQL Editor to finish setup.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={testing}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Connect</span>
                </>
              )}
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </form>
      </div>

      {/* Admissions Table AI Prompt Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Prompt to Create Admissions Database in Supabase AI</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy this exact prompt and paste it directly into Supabase Studio's AI Assistant to generate the table and RLS policies automatically.
            </p>
          </div>

          <button
            onClick={() => handleCopy(SUPABASE_AI_PROMPT, setCopiedPrompt)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shrink-0"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Supabase AI Prompt'}</span>
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-amber-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
          {SUPABASE_AI_PROMPT}
        </div>
      </div>

      {/* Multi-Device Shared Sync & RLS Fix Card */}
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/80 text-[11px] font-mono mb-2">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Fix Live Data Synchronization</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Fix Multi-Device Sync: Allow Visitors and Admin to Share Submissions</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              If submissions from other visitors on Netlify or other phones are not appearing in your admin dashboard, run this 1-step SQL fix. It configures Supabase Row Level Security (RLS) to allow both public visitors to <code className="text-amber-300 font-bold">INSERT</code> and the dashboard to <code className="text-amber-300 font-bold">SELECT</code> all records.
            </p>
          </div>

          <button
            onClick={() => handleCopy(SUPABASE_FIX_RLS_SQL, setCopiedFixSql)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shrink-0 shadow-lg"
          >
            {copiedFixSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFixSql ? 'SQL Copied!' : 'Copy Multi-Device Sync SQL'}</span>
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-56 overflow-y-auto">
          <pre className="font-mono text-[11px] text-amber-300/90 leading-relaxed whitespace-pre">
            {SUPABASE_FIX_RLS_SQL}
          </pre>
        </div>
      </div>

      {/* Full SQL Migration Script & Schema Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Database Schema & Row Level Security (RLS) SQL Script</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Copy and execute this script once in your Supabase SQL Editor to create the admissions table and all 6 school management tables with complete security policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(SUPABASE_ADMISSIONS_TABLE_SQL, setCopiedSql)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Admissions SQL'}</span>
            </button>
            <button
              onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, setCopiedSchema)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'All SQL Copied!' : 'Copy All Tables SQL'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-72 overflow-y-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {SUPABASE_ADMISSIONS_TABLE_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};

