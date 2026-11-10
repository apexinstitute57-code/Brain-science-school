import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storage';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  disconnectSupabase,
  testSupabaseConnection,
  normalizeSupabaseUrl,
  normalizeSupabaseKey,
  ConnectionTestResult,
  SUPABASE_ADMISSIONS_TABLE_SQL,
  SUPABASE_SIMPLE_5_COLUMNS_SQL,
  SUPABASE_AI_PROMPT,
} from '../../services/supabase';
import { CampusType, ClassGrade, Gender, AdmissionInquiry } from '../../types';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  Copy,
  Check,
  Terminal,
  Settings,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  WifiOff,
} from 'lucide-react';

export const AdmissionSection: React.FC = () => {
  // Form State (At least 5 core fields)
  const [formData, setFormData] = useState({
    applicant_name: '',
    father_name: '',
    gender: 'male' as Gender,
    campus_id: 'boys' as CampusType,
    applied_grade: 9 as ClassGrade,
    guardian_phone: '',
    address: '',
    previous_school: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<AdmissionInquiry | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Status message state explicitly requested by user:
  // "Saved in Supabase successfully" or "Not yet saved in Supabase"
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{
    status: 'success' | 'not_yet';
    headline: string;
    detail: string;
  } | null>(null);

  // Supabase Quick Config Panel
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [showPromptDrawer, setShowPromptDrawer] = useState(false);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickKey, setQuickKey] = useState('');
  const [showQuickKey, setShowQuickKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSimpleSql, setCopiedSimpleSql] = useState(false);
  const [sqlMode, setSqlMode] = useState<'minimal' | 'full'>('minimal');

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setQuickUrl(config.url);
    setQuickKey(config.anonKey);
    setIsConfigured(Boolean(config.url && config.anonKey));
  }, []);

  const handleGenderChange = (gender: Gender) => {
    const campus: CampusType = gender === 'female' ? 'girls' : 'boys';
    setFormData((prev) => ({
      ...prev,
      gender,
      campus_id: campus,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.applicant_name.trim()) errs.applicant_name = 'Student full name is required';
    if (!formData.father_name.trim()) errs.father_name = "Father / Guardian name is required";
    if (!formData.guardian_phone.trim()) {
      errs.guardian_phone = 'Guardian contact number is required';
    } else if (formData.guardian_phone.replace(/\D/g, '').length < 10) {
      errs.guardian_phone = 'Please enter a valid phone number (e.g. 03401212046)';
    }
    if (!formData.address.trim()) errs.address = 'Residential address in Zafarwal is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmissionError(null);
    setSupabaseStatusMsg(null);

    const trackingCode = `BSS-${new Date().getFullYear()}-ADM${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await StorageService.submitAdmissionWithSupabase({
      tracking_no: trackingCode,
      applicant_name: formData.applicant_name.trim(),
      father_name: formData.father_name.trim(),
      gender: formData.gender,
      campus_id: formData.campus_id,
      applied_grade: Number(formData.applied_grade) as ClassGrade,
      guardian_phone: formData.guardian_phone.trim(),
      guardian_cnic: 'Provided at interview',
      address: formData.address.trim(),
      previous_school: formData.previous_school.trim() || 'N/A',
      status: 'pending',
      created_at: new Date().toISOString(),
      notes: 'Submitted via Online Admission Form',
    });

    setIsSubmitting(false);

    // TASK 3: Never show success without a successful insert!
    if (result.savedToSupabase) {
      setSubmittedInquiry(result.inquiry);
      setSubmissionError(null);
      setSupabaseStatusMsg({
        status: 'success',
        headline: 'Saved in Supabase successfully',
        detail: `The application was successfully transmitted and recorded in the "public.admissions" table in Supabase with tracking code ${result.inquiry.tracking_no}.`,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#1E3A8A', '#38BDF8'],
        });
      } catch (err) {
        // ignore
      }
    } else {
      // FAILED: Do NOT show success! Form stays visible with entered values.
      setSubmittedInquiry(null);
      setSubmissionError(
        result.error ||
        'Database Insert Failed: Unable to insert into Supabase admissions table. Please check your Supabase Project URL, API Key, and RLS policies.'
      );
    }
  };

  const handleSaveQuickConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const normUrl = normalizeSupabaseUrl(quickUrl);
    const normKey = normalizeSupabaseKey(quickKey);

    if (normUrl.url && normUrl.url !== quickUrl) {
      setQuickUrl(normUrl.url);
    }
    if (normKey.key && normKey.key !== quickKey) {
      setQuickKey(normKey.key);
    }

    if (normKey.isServiceRole) {
      setTestResult({
        success: false,
        errorType: 'invalid_key',
        message: 'Security Alert: Do not use the service_role key in browser! Use anon public key.',
      });
      setIsTesting(false);
      return;
    }

    const saveRes = saveStoredSupabaseConfig(normUrl.url || quickUrl, normKey.key || quickKey);
    if (!saveRes.success) {
      setTestResult({
        success: false,
        message: saveRes.error || 'Failed to save configuration.',
      });
      setIsTesting(false);
      return;
    }

    const res = await testSupabaseConnection(normUrl.url || quickUrl, normKey.key || quickKey);
    setTestResult(res);
    setIsTesting(false);
    setIsConfigured(res.success);
  };

  const handleDisconnectQuick = () => {
    disconnectSupabase();
    setQuickUrl('');
    setQuickKey('');
    setIsConfigured(false);
    setTestResult(null);
  };

  const resetForm = () => {
    setSubmittedInquiry(null);
    setSubmissionError(null);
    setSupabaseStatusMsg(null);
    setFormData({
      applicant_name: '',
      father_name: '',
      gender: 'male',
      campus_id: 'boys',
      applied_grade: 9,
      guardian_phone: '',
      address: '',
      previous_school: '',
    });
    setErrors({});
  };

  return (
    <section id="admissions" className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Guidelines, Status & Supabase Prompt Trigger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Official Admission Form
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                  isConfigured
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>{isConfigured ? 'Supabase Connected' : 'Supabase: Not Yet Connected'}</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Brain Science School Admissions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This is the official online admission form for Brain Science School Zafarwal. It directly connects to the Supabase database to store prospective student applications.
            </p>

            {/* Supabase Prompt & Setup Action Box */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Database className="w-4 h-4" />
                  <span>Supabase Database Prompt & SQL</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPromptDrawer(!showPromptDrawer)}
                  className="text-xs text-amber-300 hover:text-white underline cursor-pointer"
                >
                  {showPromptDrawer ? 'Hide Details' : 'View AI Prompt'}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need to create the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">admissions</code> table in Supabase? Copy the AI prompt or SQL query below.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPromptDrawer(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Prompt for Supabase</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-800 text-xs font-medium text-blue-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Connect Project Keys</span>
                </button>
              </div>
            </div>

            {/* Quick Supabase Configuration Drawer */}
            {showConfigDrawer && (
              <form onSubmit={handleSaveQuickConfig} className="p-5 rounded-2xl bg-slate-950 border border-blue-800 space-y-3.5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Connect Your Supabase Project</span>
                  </h4>
                  {isConfigured && (
                    <button
                      type="button"
                      onClick={handleDisconnectQuick}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      title="Clear stored keys"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Anon Public API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showQuickKey ? 'text' : 'password'}
                      value={quickKey}
                      onChange={(e) => setQuickKey(e.target.value)}
                      placeholder="eyJhbGciOi..."
                      className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickKey(!showQuickKey)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                      title={showQuickKey ? 'Hide key' : 'Show key'}
                    >
                      {showQuickKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed space-y-1 ${
                      testResult.success
                        ? testResult.tableFound === false
                          ? 'bg-amber-950/80 border border-amber-800 text-amber-200'
                          : 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                        : 'bg-red-950/80 border border-red-800 text-red-200'
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      {testResult.success ? (
                        testResult.tableFound === false ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )
                      ) : testResult.errorType === 'offline' ? (
                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>
                        {testResult.success
                          ? testResult.tableFound === false
                            ? 'Connected to Project (Table Setup Needed)'
                            : 'Connected & Verified!'
                          : 'Connection Error'}
                      </span>
                    </div>
                    <p className="text-[11px] whitespace-pre-line opacity-95">{testResult.message}</p>
                  </div>
                )}

                <div className="pt-1 flex justify-between items-center">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save & Connect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigDrawer(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>
            )}

            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">Principal Office & Helpline:</div>
              <div className="font-mono text-amber-400 font-bold">03401212046</div>
              <div className="text-slate-400">Shahid Javed · Brain Science School, Zafarwal, Punjab</div>
            </div>
          </div>

          {/* Right Column: The Single Admission Form (At least 5 core fields) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
            {submittedInquiry ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>

                {/* Always prominent Supabase status message requested by user */}
                {supabaseStatusMsg && (
                  <div
                    className={`p-4 rounded-xl border text-left text-xs ${
                      supabaseStatusMsg.status === 'success'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                        : 'bg-amber-950/80 border-amber-600 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {supabaseStatusMsg.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>{supabaseStatusMsg.headline}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{supabaseStatusMsg.detail}</p>
                  </div>
                )}

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl inline-block text-left max-w-sm w-full font-mono text-xs text-slate-300 space-y-1.5">
                  <div className="text-slate-400 text-[11px] uppercase tracking-wider">
                    Official Reference Tracking:
                  </div>
                  <div className="text-lg font-bold text-amber-400">
                    {submittedInquiry.tracking_no}
                  </div>
                  <div className="text-slate-400 pt-2 border-t border-slate-800 font-sans">
                    Applicant: <strong className="text-white">{submittedInquiry.applicant_name}</strong>
                  </div>
                  <div className="text-slate-400 font-sans">
                    Grade: <span className="text-white">Class {submittedInquiry.applied_grade}</span> · Campus: <span className="text-white capitalize">{submittedInquiry.campus_id} Campus</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Student Admission Form</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Please enter applicant details below. All fields are saved to the database.
                    </p>
                  </div>
                </div>

                {/* Field 1 & 2: Student Name & Father Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      1. Student Full Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.applicant_name}
                      onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                      placeholder="e.g. Muhammad Haris"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                        errors.applicant_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                    {errors.applicant_name && (
                      <span className="text-[11px] text-red-400 mt-1 block">{errors.applicant_name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      2. Father / Guardian Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      placeholder="e.g. Tariq Mehmood"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                        errors.father_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                    {errors.father_name && (
                      <span className="text-[11px] text-red-400 mt-1 block">{errors.father_name}</span>
                    )}
                  </div>
                </div>

                {/* Field 3 & 4: Gender / Campus & Applying Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      3. Student Gender & Campus Wing <span className="text-amber-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenderChange('male')}
                        className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                          formData.gender === 'male'
                            ? 'bg-blue-900 text-white border-amber-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Male (Boys Campus)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenderChange('female')}
                        className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                          formData.gender === 'female'
                            ? 'bg-blue-900 text-white border-amber-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Female (Girls Campus)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      4. Applying for Class / Grade <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.applied_grade}
                      onChange={(e) => setFormData({ ...formData, applied_grade: Number(e.target.value) as ClassGrade })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((gr) => (
                        <option key={gr} value={gr}>
                          Class / Grade {gr} {gr >= 9 ? '(Matriculation Science)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 5: Guardian Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    5. Guardian Phone / WhatsApp Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    placeholder="e.g. 03401212046"
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                      errors.guardian_phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {errors.guardian_phone && (
                    <span className="text-[11px] text-red-400 mt-1 block">{errors.guardian_phone}</span>
                  )}
                </div>

                {/* Field 6: Residential Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6. Residential Address in Zafarwal & Vicinity <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Mohallah Model Town, Circular Road, Zafarwal, Punjab"
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                      errors.address ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {errors.address && (
                    <span className="text-[11px] text-red-400 mt-1 block">{errors.address}</span>
                  )}
                </div>

                {/* Field 7: Previous School (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    7. Previous School Attended (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                    placeholder="e.g. Crescent Model School or Montessori"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {submissionError && (
                  <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Database Insert Failed</span>
                    </div>
                    <p className="leading-relaxed opacity-95">
                      {submissionError}
                    </p>
                    <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-red-900/60">
                      <span className="text-red-300">Your inputs were preserved. Check credentials or RLS policies.</span>
                      <button
                        type="button"
                        onClick={() => setShowConfigDrawer(true)}
                        className="underline font-semibold hover:text-white cursor-pointer ml-2"
                      >
                        Open Supabase Settings
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Application to Supabase...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Admission Application (Save to Supabase)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Collapsible Supabase Prompt & SQL Display */}
        {showPromptDrawer && (
          <div className="mt-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <span>Prompt to Create Table in Supabase AI (According to this Form)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Copy and paste this exact prompt into Supabase Studio's AI chat to generate the table and permissions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_AI_PROMPT);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SIMPLE_5_COLUMNS_SQL);
                    setCopiedSimpleSql(true);
                    setTimeout(() => setCopiedSimpleSql(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 text-blue-200 hover:bg-blue-800 border border-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSimpleSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSimpleSql ? 'Copied 5-Field SQL!' : 'Copy 5-Field SQL'}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_ADMISSIONS_TABLE_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied Full SQL!' : 'Copy Full SQL'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: AI Prompt */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  <span>Prompt for Supabase AI Assistant:</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {SUPABASE_AI_PROMPT}
                </div>
              </div>

              {/* Box 2: Ready-to-Run SQL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>PostgreSQL SQL Code (SQL Editor):</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSqlMode('minimal')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        sqlMode === 'minimal'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      5-Field Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqlMode('full')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        sqlMode === 'full'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Full Schema
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-slate-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre">
                  {sqlMode === 'minimal' ? SUPABASE_SIMPLE_5_COLUMNS_SQL : SUPABASE_ADMISSIONS_TABLE_SQL}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
