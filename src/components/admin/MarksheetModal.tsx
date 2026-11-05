import React from 'react';
import { ExamResult } from '../../types';
import { X, Printer, GraduationCap, Award, CheckCircle } from 'lucide-react';

interface MarksheetModalProps {
  result: ExamResult | null;
  onClose: () => void;
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl relative my-8 overflow-hidden print-page">
        {/* Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Academic Transcript & Marksheet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Marksheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Content */}
        <div className="p-8 sm:p-12 space-y-6">
          {/* School Header Lockup */}
          <div className="text-center border-b-2 border-slate-900 pb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
                  Brain Science School
                </h1>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                  Zafarwal, Punjab, Pakistan · Affiliated with BISE Gujranwala
                </p>
              </div>
            </div>
            <div className="inline-block bg-slate-100 text-slate-800 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
              Official Examination Marksheet · {result.term}
            </div>
          </div>

          {/* Student Dossier Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Student Name:</span>
              <strong className="text-slate-900 text-sm">{result.student_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Roll Number:</span>
              <strong className="text-slate-900 font-mono text-sm">{result.roll_no}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Class & Campus:</span>
              <strong className="text-slate-900 text-sm">
                Grade {result.class_grade} ({result.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus'})
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Exam Session:</span>
              <strong className="text-slate-900 text-sm font-mono">{result.date}</strong>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                <th className="p-2.5 border border-slate-700">#</th>
                <th className="p-2.5 border border-slate-700">Subject Name</th>
                <th className="p-2.5 border border-slate-700 text-right">Total Marks</th>
                <th className="p-2.5 border border-slate-700 text-right">Obtained Marks</th>
                <th className="p-2.5 border border-slate-700 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result.subjects.map((sub, idx) => {
                const passed = sub.obtained_marks >= sub.total_marks * 0.33;
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 border border-slate-300 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 font-semibold text-slate-800">{sub.name}</td>
                    <td className="p-2.5 border border-slate-300 text-right font-mono tabular-nums">{sub.total_marks}</td>
                    <td className="p-2.5 border border-slate-300 text-right font-mono font-bold tabular-nums text-slate-900">
                      {sub.obtained_marks}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 text-xs">
                <td colSpan={2} className="p-3 border border-slate-300 uppercase">
                  Grand Aggregate Total:
                </td>
                <td className="p-3 border border-slate-300 text-right font-mono tabular-nums">
                  {result.total_marks}
                </td>
                <td className="p-3 border border-slate-300 text-right font-mono tabular-nums text-blue-900 text-sm">
                  {result.obtained_marks}
                </td>
                <td className="p-3 border border-slate-300 text-center font-mono">
                  {result.percentage.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Performance Summary Strip */}
          <div className="grid grid-cols-3 gap-4 border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Overall Grade</span>
              <span className="text-2xl font-extrabold text-blue-900 font-mono">{result.grade}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Percentage</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{result.percentage.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Academic Standing</span>
              <span className="text-xs font-bold text-emerald-700 mt-1 block">Promoted with Distinction</span>
            </div>
          </div>

          {/* Remarks */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Principal's Remarks: </strong> {result.remarks}
          </div>

          {/* Official Signatures & Seal */}
          <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold">Class Incharge</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center text-[9px] uppercase font-bold text-slate-400 tracking-tighter mb-1">
                School Stamp
              </div>
              <span className="text-[10px]">Official Seal</span>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">
                Shahid Javed
              </div>
              <span className="text-[10px] text-slate-500">Principal & Director</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
