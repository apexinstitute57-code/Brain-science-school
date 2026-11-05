import React from 'react';
import { StorageService } from '../../services/storage';
import { Student, AdmissionInquiry, FeeRecord, CampusType } from '../../types';
import { Users, UserPlus, CreditCard, Award, GraduationCap, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

interface AdminDashboardProps {
  campusFilter: 'all' | CampusType;
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ campusFilter, onNavigateTab }) => {
  const students = StorageService.getStudents().filter((s) => campusFilter === 'all' || s.campus_id === campusFilter);
  const admissions = StorageService.getAdmissions().filter((a) => campusFilter === 'all' || a.campus_id === campusFilter);
  const fees = StorageService.getFees().filter((f) => campusFilter === 'all' || f.campus_id === campusFilter);
  const teachers = StorageService.getTeachers().filter((t) => campusFilter === 'all' || t.campus_id === campusFilter || t.campus_id === 'both');
  const results = StorageService.getResults().filter((r) => campusFilter === 'all' || r.campus_id === campusFilter);

  const boysCount = students.filter((s) => s.campus_id === 'boys').length;
  const girlsCount = students.filter((s) => s.campus_id === 'girls').length;
  const pendingAdmissions = admissions.filter((a) => a.status === 'pending');

  const totalFeeExpected = fees.reduce((acc, f) => acc + f.total_amount, 0);
  const totalFeeCollected = fees.reduce((acc, f) => acc + (f.status === 'paid' ? f.total_amount : f.paid_amount), 0);
  const feeRecoveryRate = totalFeeExpected > 0 ? Math.round((totalFeeCollected / totalFeeExpected) * 100) : 100;

  // Grade breakdown
  const gradeCounts: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) gradeCounts[i] = 0;
  students.forEach((s) => {
    gradeCounts[s.class_grade] = (gradeCounts[s.class_grade] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 mb-1">
            <span>Executive Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>Academic Year 2026–2027</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Brain Science School Zafarwal
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Active view: <strong className="text-amber-300 capitalize">{campusFilter === 'all' ? 'All Campuses (Boys & Girls)' : `${campusFilter} Campus`}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('admissions')}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md cursor-pointer transition-all"
          >
            Review Inquiries ({pendingAdmissions.length})
          </button>
          <button
            onClick={() => onNavigateTab('students')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-all"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {students.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-3">
            <span>Boys: <strong className="text-slate-200">{boysCount}</strong></span>
            <span>·</span>
            <span>Girls: <strong className="text-slate-200">{girlsCount}</strong></span>
          </div>
        </div>

        {/* Admissions Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Online Inquiries</span>
            <UserPlus className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {admissions.length}
          </div>
          <div className="mt-2 text-[11px] text-amber-300">
            {pendingAdmissions.length} pending review / interview
          </div>
        </div>

        {/* Fee Recovery */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Fee Recovery Rate</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {feeRecoveryRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Collected PKR {totalFeeCollected.toLocaleString()}
          </div>
        </div>

        {/* Faculty & Staff */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Teaching Faculty</span>
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {teachers.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            100% Specialist educators
          </div>
        </div>
      </div>

      {/* Two Column Section: Grade Distribution & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Grade Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Student Enrollment by Grade (1 to 10)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across primary and matriculation tiers</p>
            </div>
            <span className="text-xs font-mono text-amber-400">Class 1–10</span>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade) => {
              const count = gradeCounts[grade] || 0;
              const max = Math.max(...Object.values(gradeCounts), 1);
              const percentage = Math.round((count / max) * 100);
              return (
                <div key={grade} className="flex items-center gap-3 text-xs">
                  <span className="w-16 font-mono text-slate-400 font-medium">Class {grade}</span>
                  <div className="flex-1 bg-slate-950 h-5 rounded-md overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-amber-400 h-full rounded transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono font-bold text-white tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Admissions Queue */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Latest Admission Inquiries</h3>
              <button
                onClick={() => onNavigateTab('admissions')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {admissions.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{inq.applicant_name}</span>
                    <span className="text-[10px] font-mono text-amber-400">{inq.tracking_no}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Applying for Class {inq.applied_grade} · <span className="capitalize">{inq.campus_id} Campus</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Phone: {inq.guardian_phone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('admissions')}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg text-center cursor-pointer"
            >
              Manage Admissions Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
