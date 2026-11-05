import React, { useState } from 'react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../../services/supabase';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export const SupabaseSettings: React.FC = () => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    saveStoredSupabaseConfig(url, anonKey);
    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 mb-1">
          <Database className="w-4 h-4" />
          <span>Backend & Database Integration</span>
        </div>
        <h2 className="text-xl font-bold text-white">Supabase PostgreSQL & Auth Configuration</h2>
        <p className="text-xs text-slate-400 max-w-2xl mt-1">
          Connect Brain Science School management system to your Supabase PostgreSQL project. When configured, all student records, admissions, fees, and examination results sync directly with Supabase.
        </p>
      </div>

      {/* Connection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>Supabase Project Credentials</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Find your Project URL and anon public key in your Supabase Dashboard under <strong>Project Settings → API</strong>.
        </p>

        <form onSubmit={handleSaveAndTest} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-800 text-amber-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">{testResult.success ? 'Connected!' : 'Notice:'}</span>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={testing}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating Connection...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Verify Connection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SQL Migration Script & Schema Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Database Schema & Row Level Security (RLS) SQL Script</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Copy and execute this script once in your Supabase SQL Editor to create all 7 required school management tables and security policies.
            </p>
          </div>

          <button
            onClick={handleCopySchema}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'SQL Copied!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-72 overflow-y-auto">
          <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>
    </div>
  );
};
