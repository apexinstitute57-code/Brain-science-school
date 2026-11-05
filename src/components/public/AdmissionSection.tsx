import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storage';
import { CampusType, ClassGrade, Gender, AdmissionInquiry } from '../../types';
import { Send, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';

export const AdmissionSection: React.FC = () => {
  const [formData, setFormData] = useState({
    applicant_name: '',
    father_name: '',
    gender: 'male' as Gender,
    campus_id: 'boys' as CampusType,
    applied_grade: 9 as ClassGrade,
    guardian_phone: '',
    guardian_cnic: '',
    address: '',
    previous_school: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<AdmissionInquiry | null>(null);

  const handleGenderChange = (gender: Gender) => {
    // Automatically match campus for convenience
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
      errs.guardian_phone = 'Phone number is required';
    } else if (formData.guardian_phone.replace(/\D/g, '').length < 10) {
      errs.guardian_phone = 'Please enter a valid Pakistani phone number (e.g. 03401212046)';
    }
    if (!formData.address.trim()) errs.address = 'Residential address in or near Zafarwal is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const trackingCode = `BSS-2026-ADM${Math.floor(100 + Math.random() * 900)}`;
      const newInquiry: AdmissionInquiry = {
        id: `adm-${Date.now()}`,
        tracking_no: trackingCode,
        applicant_name: formData.applicant_name.trim(),
        father_name: formData.father_name.trim(),
        gender: formData.gender,
        campus_id: formData.campus_id,
        applied_grade: Number(formData.applied_grade) as ClassGrade,
        guardian_phone: formData.guardian_phone.trim(),
        guardian_cnic: formData.guardian_cnic.trim() || 'Pending at verification',
        address: formData.address.trim(),
        previous_school: formData.previous_school.trim() || 'N/A',
        status: 'pending',
        created_at: new Date().toISOString().split('T')[0],
        notes: 'Submitted via Online Website Portal',
      };

      StorageService.addAdmission(newInquiry);
      setIsSubmitting(false);
      setSubmittedInquiry(newInquiry);

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
    }, 600);
  };

  const resetForm = () => {
    setSubmittedInquiry(null);
    setFormData({
      applicant_name: '',
      father_name: '',
      gender: 'male',
      campus_id: 'boys',
      applied_grade: 9,
      guardian_phone: '',
      guardian_cnic: '',
      address: '',
      previous_school: '',
    });
    setErrors({});
  };

  return (
    <section id="admissions" className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Admission Guidelines & Trust Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Session 2026–2027
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Apply for Online Admission
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We welcome applications for Grade 1 through Grade 10 across our separate Boys Campus and Girls Campus. Submit the inquiry form below to reserve an assessment test and interview slot.
            </p>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Admission Process Steps</span>
              </h3>
              <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
                <li className="leading-relaxed">
                  <strong className="text-white">Submit Online Inquiry:</strong> Fill out student and guardian details accurately.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Receive Tracking ID:</strong> Save your official application reference number.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Assessment Call:</strong> School office contacts you within 24 hours to schedule the diagnostic test.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Final Enrollment:</strong> Fee voucher clearance and verification of previous school leaving certificate.
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">Admissions Helpline:</div>
              <div className="font-mono text-amber-400 font-bold">03401212046</div>
              <div className="text-slate-400">Main Campus Office, Zafarwal, Punjab</div>
            </div>
          </div>

          {/* Right Column: Interactive Admission Form */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
            {submittedInquiry ? (
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Inquiry Submitted Successfully!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for applying to Brain Science School. Our admissions coordinator will reach out via phone at <strong className="text-white">{submittedInquiry.guardian_phone}</strong> to confirm your child's assessment test date.
                </p>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl inline-block text-left max-w-sm w-full font-mono text-xs text-slate-300 space-y-1.5">
                  <div className="text-slate-400 text-[11px] uppercase tracking-wider">Application Tracking Number:</div>
                  <div className="text-lg font-bold text-amber-400">{submittedInquiry.tracking_no}</div>
                  <div className="text-slate-400 pt-2 border-t border-slate-800">
                    Applicant: <span className="text-white font-sans">{submittedInquiry.applicant_name}</span>
                  </div>
                  <div className="text-slate-400">
                    Grade: <span className="text-white">Class {submittedInquiry.applied_grade}</span> · Campus: <span className="text-white capitalize">{submittedInquiry.campus_id} Campus</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-slate-800 pb-4 mb-2">
                  <h3 className="text-xl font-bold text-white">Student & Guardian Inquiry Form</h3>
                  <p className="text-xs text-slate-400 mt-1">Please provide accurate contact information for prompt communication.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Student Full Name <span className="text-amber-400">*</span>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Father / Guardian Name <span className="text-amber-400">*</span>
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

                {/* Gender & Campus Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Student Gender & Campus Wing <span className="text-amber-400">*</span>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Applying for Class / Grade <span className="text-amber-400">*</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Guardian Phone / WhatsApp <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                      placeholder="e.g. 0340-1212046"
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                        errors.guardian_phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                    {errors.guardian_phone && (
                      <span className="text-[11px] text-red-400 mt-1 block">{errors.guardian_phone}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Guardian CNIC (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.guardian_cnic}
                      onChange={(e) => setFormData({ ...formData, guardian_cnic: e.target.value })}
                      placeholder="e.g. 34403-xxxxxxx-x"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Previous School Attended (If any)
                  </label>
                  <input
                    type="text"
                    value={formData.previous_school}
                    onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                    placeholder="e.g. Crescent Public School or Montessori"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Residential Address (Zafarwal & Vicinity) <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Mohallah Model Town, Circular Road, Zafarwal"
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                      errors.address ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-400 focus:ring-amber-400'
                    }`}
                  />
                  {errors.address && (
                    <span className="text-[11px] text-red-400 mt-1 block">{errors.address}</span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Processing Application...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Admission Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
