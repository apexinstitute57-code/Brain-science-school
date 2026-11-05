import React, { useState } from 'react';
import { FeeRecord, CampusType, ClassGrade } from '../../types';
import { StorageService } from '../../services/storage';
import { FeeVoucherModal } from './FeeVoucherModal';
import { CreditCard, Plus, Download, Printer, CheckCircle2, Clock, AlertCircle, X, Search } from 'lucide-react';

interface FeeManagerProps {
  campusFilter: 'all' | CampusType;
}

export const FeeManager: React.FC<FeeManagerProps> = ({ campusFilter }) => {
  const [fees, setFees] = useState<FeeRecord[]>(StorageService.getFees());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [voucherModalFee, setVoucherModalFee] = useState<FeeRecord | null>(null);

  // New Voucher modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const students = StorageService.getStudents();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [newMonth, setNewMonth] = useState('November');
  const [newTuition, setNewTuition] = useState(3500);
  const [newExam, setNewExam] = useState(500);
  const [newMisc, setNewMisc] = useState(200);

  const filteredFees = fees.filter((f) => {
    const campusMatch = campusFilter === 'all' || f.campus_id === campusFilter;
    const statusMatch = statusFilter === 'all' || f.status === statusFilter;
    const monthMatch = monthFilter === 'all' || f.month === monthFilter;
    const searchMatch =
      !search ||
      f.student_name.toLowerCase().includes(search.toLowerCase()) ||
      f.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      f.voucher_no.toLowerCase().includes(search.toLowerCase());
    return campusMatch && statusMatch && monthMatch && searchMatch;
  });

  const handleMarkAsPaid = (fee: FeeRecord) => {
    const updated = StorageService.updateFee({
      ...fee,
      status: 'paid',
      paid_amount: fee.total_amount,
      paid_date: new Date().toISOString().split('T')[0],
    });
    setFees(updated);
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const total = Number(newTuition) + Number(newExam) + Number(newMisc);
    const voucherNo = `BSS-${newMonth.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: FeeRecord = {
      id: `fee-${Date.now()}`,
      voucher_no: voucherNo,
      student_id: st.id,
      student_name: st.full_name,
      roll_no: st.roll_no,
      class_grade: st.class_grade,
      campus_id: st.campus_id,
      month: newMonth,
      year: 2026,
      tuition_fee: Number(newTuition),
      exam_fee: Number(newExam),
      misc_fee: Number(newMisc),
      total_amount: total,
      paid_amount: 0,
      status: 'pending',
      due_date: '2026-11-15',
    };

    const updated = StorageService.addFee(newRecord);
    setFees(updated);
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportRows = filteredFees.map((f) => ({
      Voucher_Number: f.voucher_no,
      Student_Name: f.student_name,
      Roll_No: f.roll_no,
      Class_Grade: `Grade ${f.class_grade}`,
      Campus: f.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus',
      Billing_Month: `${f.month} ${f.year}`,
      Tuition_Fee: f.tuition_fee,
      Exam_Fee: f.exam_fee,
      Misc_Fee: f.misc_fee,
      Total_Amount: f.total_amount,
      Paid_Amount: f.paid_amount,
      Status: f.status,
      Due_Date: f.due_date,
      Paid_Date: f.paid_date || 'N/A',
    }));
    StorageService.exportToCSV('Brain_Science_School_Fee_Ledger', exportRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Fees, Challans & Payment Ledger</h2>
          <p className="text-xs text-slate-400">
            Track monthly tuition fees, generate bank vouchers, and verify clearance
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Fee CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Voucher</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or voucher code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Months</option>
            <option value="November">November 2026</option>
            <option value="October">October 2026</option>
            <option value="December">December 2026</option>
          </select>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Grade & Campus</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Voucher & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {fee.voucher_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{fee.student_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{fee.roll_no}</div>
                    </td>
                    <td className="py-3 px-4">
                      Grade {fee.class_grade} · <span className="capitalize">{fee.campus_id}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {fee.month} {fee.year}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                      PKR {fee.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          fee.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : fee.status === 'overdue'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setVoucherModalFee(fee)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer flex items-center gap-1"
                          title="Print 3-Part Bank Voucher"
                        >
                          <Printer className="w-3 h-3 text-amber-400" />
                          <span>Print Slip</span>
                        </button>
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(fee)}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 rounded cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Fee Voucher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Generate Monthly Fee Voucher</h3>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Month</label>
                <select
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m} 2026</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tuition Fee</label>
                  <input
                    type="number"
                    value={newTuition}
                    onChange={(e) => setNewTuition(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Exam Fee</label>
                  <input
                    type="number"
                    value={newExam}
                    onChange={(e) => setNewExam(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lab/Misc</label>
                  <input
                    type="number"
                    value={newMisc}
                    onChange={(e) => setNewMisc(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Total Payable:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  PKR {(Number(newTuition) + Number(newExam) + Number(newMisc)).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                >
                  Issue Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      <FeeVoucherModal fee={voucherModalFee} onClose={() => setVoucherModalFee(null)} />
    </div>
  );
};
