import React, { useState } from 'react';
import { ExamResult, CampusType, ClassGrade, SubjectMarks } from '../../types';
import { StorageService } from '../../services/storage';
import { MarksheetModal } from './MarksheetModal';
import { Award, Plus, Download, Printer, Search, X, Check, BookOpen } from 'lucide-react';

interface ExamManagerProps {
  campusFilter: 'all' | CampusType;
}

export const ExamManager: React.FC<ExamManagerProps> = ({ campusFilter }) => {
  const [results, setResults] = useState<ExamResult[]>(StorageService.getResults());
  const [search, setSearch] = useState('');
  const [termFilter, setTermFilter] = useState('all');
  const [activeMarksheet, setActiveMarksheet] = useState<ExamResult | null>(null);

  // New Marks Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const students = StorageService.getStudents();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [examTitle, setExamTitle] = useState('Mid-Term Examination 2026');
  const [term, setTerm] = useState<'First Term' | 'Mid Term' | 'Final Term' | 'Monthly Test'>('Mid Term');

  // Subjects for entry
  const [subjectsList, setSubjectsList] = useState<SubjectMarks[]>([
    { name: 'Physics', total_marks: 75, obtained_marks: 65 },
    { name: 'Chemistry', total_marks: 75, obtained_marks: 62 },
    { name: 'Biology', total_marks: 75, obtained_marks: 68 },
    { name: 'Mathematics', total_marks: 75, obtained_marks: 70 },
    { name: 'English', total_marks: 75, obtained_marks: 60 },
    { name: 'Urdu', total_marks: 75, obtained_marks: 64 },
    { name: 'Pak Studies', total_marks: 50, obtained_marks: 45 },
    { name: 'Islamiyat', total_marks: 50, obtained_marks: 46 },
  ]);

  const [remarks, setRemarks] = useState('Satisfactory academic progress. Keep striving for distinction.');

  const filteredResults = results.filter((r) => {
    const campusMatch = campusFilter === 'all' || r.campus_id === campusFilter;
    const termMatch = termFilter === 'all' || r.term === termFilter;
    const searchMatch =
      !search ||
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      r.exam_title.toLowerCase().includes(search.toLowerCase());
    return campusMatch && termMatch && searchMatch;
  });

  const handleSubjectMarkChange = (index: number, val: number) => {
    const copy = [...subjectsList];
    copy[index].obtained_marks = Math.max(0, Math.min(copy[index].total_marks, Number(val)));
    setSubjectsList(copy);
  };

  const calculateGrade = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const total = subjectsList.reduce((acc, s) => acc + s.total_marks, 0);
    const obtained = subjectsList.reduce((acc, s) => acc + s.obtained_marks, 0);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    const grade = calculateGrade(percentage);

    const newResult: ExamResult = {
      id: `res-${Date.now()}`,
      exam_title: examTitle,
      term,
      student_id: st.id,
      student_name: st.full_name,
      roll_no: st.roll_no,
      class_grade: st.class_grade,
      campus_id: st.campus_id,
      subjects: subjectsList,
      total_marks: total,
      obtained_marks: obtained,
      percentage: Number(percentage.toFixed(1)),
      grade,
      remarks,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = StorageService.addResult(newResult);
    setResults(updated);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportRows = filteredResults.map((r) => ({
      Exam_Title: r.exam_title,
      Term: r.term,
      Roll_No: r.roll_no,
      Student_Name: r.student_name,
      Class_Grade: `Grade ${r.class_grade}`,
      Campus: r.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus',
      Total_Marks: r.total_marks,
      Obtained_Marks: r.obtained_marks,
      Percentage: `${r.percentage}%`,
      Grade: r.grade,
      Remarks: r.remarks,
      Date: r.date,
    }));
    StorageService.exportToCSV('Brain_Science_School_Exam_Results', exportRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Examinations & Marksheet Generation</h2>
          <p className="text-xs text-slate-400">
            Record term marks, calculate subject percentages, and print official report cards
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Results CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Marks</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or exam title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Examination Terms</option>
            <option value="First Term">First Term</option>
            <option value="Mid Term">Mid Term</option>
            <option value="Final Term">Final Term</option>
            <option value="Monthly Test">Monthly Test</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Class & Campus</th>
                <th className="py-3 px-4 text-right">Marks (Obt / Tot)</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-right">Marksheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No examination records found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {result.roll_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {result.student_name}
                    </td>
                    <td className="py-3 px-4">
                      <div>{result.exam_title}</div>
                      <span className="text-[10px] text-slate-400">{result.term}</span>
                    </td>
                    <td className="py-3 px-4">
                      Grade {result.class_grade} · <span className="capitalize">{result.campus_id}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <strong className="text-white">{result.obtained_marks}</strong> / {result.total_marks} ({result.percentage.toFixed(1)}%)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-amber-300 border border-blue-800 font-mono font-bold text-xs">
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveMarksheet(result)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded cursor-pointer"
                        title="Print Official Report Card"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Marksheet</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Marks Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Record Examination Marks</h3>
            <p className="text-xs text-slate-400 mb-6">Enter subject scores to generate automated marksheet transcript</p>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.full_name} ({st.roll_no} - Grade {st.class_grade} {st.campus_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Examination Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Term">Final Term</option>
                    <option value="First Term">First Term</option>
                    <option value="Monthly Test">Monthly Test</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Examination Title</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Subject Marks Grid */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
                  <span>Subject</span>
                  <span>Obtained / Total Marks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjectsList.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="font-semibold text-slate-200">{sub.name}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={sub.obtained_marks}
                          onChange={(e) => handleSubjectMarkChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-center font-bold"
                        />
                        <span className="text-slate-500 font-mono">/ {sub.total_marks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Principal / Teacher Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                >
                  Save Result & Generate Marksheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Marksheet Modal */}
      <MarksheetModal result={activeMarksheet} onClose={() => setActiveMarksheet(null)} />
    </div>
  );
};
