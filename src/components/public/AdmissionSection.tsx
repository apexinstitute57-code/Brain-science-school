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
  inspectSupabaseKey,
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

  const [showPromptDrawer, setShowPromptDrawer] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSimpleSql, setCopiedSimpleSql] = useState(false);
  const [sqlMode, setSqlMode] = useState<'minimal' | 'full'>('minimal');

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

    // Never show success without a successful insert!
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
        'Database Insert Failed: Unable to insert into Supabase admissions table. Please verify Supabase connection.'
      );
    }
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
          {/* Left Column: School Admission Guidelines, Criteria & Helpline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Official Admission Portal
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session 2025–2026 Open</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Brain Science School Admissions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to the official online admission portal for Brain Science School Zafarwal. Submit prospective student details below for Class 1 to Class 10 (separate Boys and Girls campuses).
            </p>

            {/* Checklist: Required Documents */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Required Documents for Final Admission</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>NADRA Form-B or official Birth Certificate photocopy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>4 recent passport-size photographs with blue background.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>Father or Guardian CNIC photocopy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  <span>Previous School Leaving Certificate & result card (for Classes 2–10).</span>
                </li>
              </ul>
            </div>

            {/* Academic Highlights */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Campuses & Facilities Highlights</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Separate purpose-built wings for boys and girls, fully equipped Physics, Chemistry, Biology and Computer laboratories, digital audio-visual classrooms, and special fee concession for orphan and deserving position-holder students.
              </p>
            </div>

            {/* Principal Office & Helpline Box */}
            <div className="p-5 rounded-2xl bg-blue-950/50 border border-blue-800/80 text-xs text-slate-300 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Admission Office & Helpline
                </div>
                <span className="text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700 font-mono">
                  Zafarwal, Punjab
                </span>
              </div>
              <div className="font-mono text-lg text-amber-400 font-bold">
                0340-1212046
              </div>
              <p className="text-slate-300 text-xs">
                Principal: <strong className="text-white">Shahid Javed</strong> · Brain Science School, Circular Road & Model Town, Zafarwal.
              </p>
            </div>

            {/* Database Reference Toggle */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Database Schema & Policies Reference:</span>
              <button
                type="button"
                onClick={() => setShowPromptDrawer(!showPromptDrawer)}
                className="text-xs text-amber-400 hover:text-white underline cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{showPromptDrawer ? 'Hide SQL Reference' : 'View SQL & Prompt'}</span>
              </button>
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
                  <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Database Insert Failed</span>
                    </div>
                    <p className="leading-relaxed opacity-95">
                      {submissionError}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] border-t border-red-900/60">
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3 py-1 rounded-md bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                          <span>Retry Submission Now</span>
                        </button>
                        <span className="text-red-300">Your inputs were preserved.</span>
                      </div>
                      <a
                        href="tel:03401212046"
                        className="underline font-semibold text-amber-400 hover:text-white cursor-pointer"
                      >
                        School Office: 0340-1212046
                      </a>
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
