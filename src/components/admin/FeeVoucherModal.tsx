import React from 'react';
import { FeeRecord } from '../../types';
import { X, Printer, CreditCard } from 'lucide-react';

interface FeeVoucherModalProps {
  fee: FeeRecord | null;
  onClose: () => void;
}

export const FeeVoucherModal: React.FC<FeeVoucherModalProps> = ({ fee, onClose }) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const copies = ['Bank Copy', 'School Copy', 'Student Copy'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl relative my-8 overflow-hidden print-page">
        {/* Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Bank Fee Voucher (3-Part Slip)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Column Voucher Slip (Bank, School, Student) */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-300">
          {copies.map((copyTitle, index) => (
            <div key={copyTitle} className={index > 0 ? 'md:pl-6 pt-6 md:pt-0' : ''}>
              <div className="text-center border-b border-slate-300 pb-3 mb-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {copyTitle}
                </div>
                <h4 className="font-extrabold text-sm uppercase text-slate-900">
                  Brain Science School
                </h4>
                <div className="text-[10px] text-slate-600">Zafarwal, Punjab, Pakistan</div>
                <div className="text-[10px] font-mono font-semibold text-blue-900 mt-1">
                  Voucher: {fee.voucher_no}
                </div>
              </div>

              {/* Student details */}
              <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Student:</span>
                  <strong className="text-slate-900">{fee.student_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Roll No:</span>
                  <span className="font-mono font-semibold text-slate-900">{fee.roll_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Class:</span>
                  <span>Class {fee.class_grade} ({fee.campus_id === 'girls' ? 'Girls' : 'Boys'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Billing Month:</span>
                  <span className="font-semibold text-slate-900">{fee.month} {fee.year}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span className="text-[11px]">Due Date:</span>
                  <span className="font-mono font-semibold">{fee.due_date}</span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-1 text-xs border-b border-slate-200 pb-3 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tuition Fee:</span>
                  <span className="font-mono tabular-nums">PKR {fee.tuition_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Examination Fee:</span>
                  <span className="font-mono tabular-nums">PKR {fee.exam_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Science Lab / Misc:</span>
                  <span className="font-mono tabular-nums">PKR {fee.misc_fee}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Payable Amount:</span>
                  <span className="font-mono text-sm tabular-nums text-blue-900">
                    PKR {fee.total_amount}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center py-2 mb-4 bg-slate-50 rounded border border-slate-200 text-xs">
                Status:{' '}
                <strong
                  className={`uppercase ${
                    fee.status === 'paid'
                      ? 'text-emerald-700'
                      : fee.status === 'overdue'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {fee.status}
                </strong>
                {fee.paid_date && (
                  <div className="text-[10px] text-slate-500 font-mono">Paid on: {fee.paid_date}</div>
                )}
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1 w-20 text-center">Cashier</div>
                <div className="border-t border-slate-300 pt-1 w-20 text-center">Officer</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
