import React, { useState, useEffect } from 'react';
import { AdmissionInquiry, CampusType, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { getStoredSupabaseConfig, getSupabase, SUPABASE_FIX_RLS_SQL } from '../../services/supabase';
import {
  Search,
  Download,
  UserCheck,
  Calendar,
  Check,
  X,
  Phone,
  UserPlus,
  RefreshCw,
  Database,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface AdmissionManagerProps {
  campusFilter: 'all' | CampusType;
}

export const AdmissionManager: React.FC<AdmissionManagerProps> = ({ campusFilter }) => {
  const isSupabaseConfigured = Boolean(getStoredSupabaseConfig().url);
  const [admissions, setAdmissions] = useState<AdmissionInquiry[]>(() => {
    // If Supabase is configured, start empty to avoid flashing mock data before cloud records arrive
    return isSupabaseConfigured ? [] : StorageService.getAdmissions();
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSyncSql, setCopiedSyncSql] = useState(false);
  const [showSyncHelper, setShowSyncHelper] = useState(false);
  const [syncInfo, setSyncInfo] = useState<{
    synced: boolean;
    message: string;
    lastSyncTime?: string;
  }>({
    synced: false,
    message: isSupabaseConfigured ? 'Connecting to Supabase admissions...' : 'Supabase not configured (Local records active)',
  });

  const loadFromSupabase = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const result = await StorageService.fetchAdmissionsFromSupabase();
      if (result.fromSupabase) {
        setAdmissions(result.admissions);
        setSyncInfo({
          synced: true,
          message: `Supabase: Connected (${result.admissions.length} record${result.admissions.length === 1 ? '' : 's'})`,
          lastSyncTime: new Date().toLocaleTimeString(),
        });
      } else {
        const config = getStoredSupabaseConfig();
        if (!config.url) {
          setAdmissions(StorageService.getAdmissions());
          setSyncInfo({
            synced: false,
            message: 'Supabase credentials not configured.',
            lastSyncTime: new Date().toLocaleTimeString(),
          });
        } else {
          setSyncInfo({
            synced: false,
            message: `Supabase notice: ${result.error || 'Check table / RLS policy'}`,
            lastSyncTime: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err: any) {
      setSyncInfo({
        synced: false,
        message: `Sync notice: ${err?.message || 'Error reaching Supabase'}`,
        lastSyncTime: new Date().toLocaleTimeString(),
      });
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadFromSupabase(false);

    // Set up Supabase Realtime broadcast listener for instant cross-device updates
    const client = getSupabase();
    let channel: any = null;
    if (client) {
      try {
        channel = client
          .channel('public:admissions-live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'admissions' },
            () => {
              loadFromSupabase(true);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription fallback to polling:', err);
      }
    }

    // Auto-polling backup: refresh newly submitted admissions every 8 seconds
    const interval = setInterval(() => {
      loadFromSupabase(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      if (client && channel) {
        client.removeChannel(channel);
      }
    };
  }, []);

  const filtered = admissions.filter((inq) => {
    const campusMatch = campusFilter === 'all' || inq.campus_id === campusFilter;
    const statusMatch = statusFilter === 'all' || inq.status === statusFilter;
    const searchMatch =
      !search ||
      inq.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      inq.tracking_no.toLowerCase().includes(search.toLowerCase()) ||
      inq.guardian_phone.includes(search);
    return campusMatch && statusMatch && searchMatch;
  });

  const handleUpdateStatus = async (inq: AdmissionInquiry, newStatus: AdmissionInquiry['status']) => {
    const updated = await StorageService.updateAdmission({
      ...inq,
      status: newStatus,
    });
    setAdmissions(updated);
    if (selectedInquiry?.id === inq.id) {
      setSelectedInquiry({ ...inq, status: newStatus });
    }
  };

  const handleEnrollStudent = (inq: AdmissionInquiry) => {
    // Generate new student record
    const existingStudents = StorageService.getStudents();
    const campusCode = inq.campus_id === 'girls' ? 'G' : 'B';
    const rollNo = `BSS-${inq.applied_grade < 10 ? '0' + inq.applied_grade : inq.applied_grade}-${campusCode}${existingStudents.length + 1}`;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      roll_no: rollNo,
      full_name: inq.applicant_name,
      father_name: inq.father_name,
      gender: inq.gender,
      campus_id: inq.campus_id,
      class_grade: inq.applied_grade,
      section: 'A',
      dob: '2012-01-01',
      phone: inq.guardian_phone,
      address: inq.address,
      admission_date: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    StorageService.addStudent(newStudent);
    handleUpdateStatus(inq, 'enrolled');
    alert(`Applicant ${inq.applicant_name} has been enrolled successfully with Roll No: ${rollNo}!`);
  };

  const handleExportCSV = () => {
    const exportRows = filtered.map((a) => ({
      Tracking_ID: a.tracking_no,
      Applicant_Name: a.applicant_name,
      Father_Name: a.father_name,
      Gender: a.gender,
      Campus: a.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus',
      Applied_Grade: `Grade ${a.applied_grade}`,
      Guardian_Phone: a.guardian_phone,
      Guardian_CNIC: a.guardian_cnic,
      Previous_School: a.previous_school,
      Address: a.address,
      Status: a.status,
      Application_Date: a.created_at,
    }));
    StorageService.exportToCSV('Brain_Science_School_Admissions', exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Student Admissions & Inquiries Queue</h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                syncInfo.synced
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Database className="w-3 h-3 text-amber-400" />
              <span>{syncInfo.message}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Review online application submissions from website, schedule interviews, and enroll candidates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowSyncHelper(!showSyncHelper)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-700/80 hover:bg-amber-900/60 rounded-lg cursor-pointer transition-colors"
            title="Fix Multi-Device Sync & RLS"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Multi-Device Sync Fix</span>
          </button>

          <button
            onClick={() => loadFromSupabase(false)}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            title="Fetch latest admissions from Supabase admissions table"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync with Supabase'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Device Sync Explanation & 1-Click SQL Fix Card */}
      {showSyncHelper && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-amber-600/60 text-xs text-slate-200 space-y-3 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Radio className="w-4 h-4" />
              <span>Fix Multi-Device Synchronization (Supabase RLS Policy)</span>
            </div>
            <button
              onClick={() => setShowSyncHelper(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed text-xs">
            <strong>Why other visitors' submissions were not showing up:</strong> PostgreSQL Row Level Security (RLS) restricts <code className="text-amber-300">SELECT</code> queries for the public anon key unless a policy specifically permits it. Submissions from visitors were saved to Supabase, but the admin panel could not read them due to the restrictive RLS policy.
          </p>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300 text-[11px]">
                Copy & Run this in Supabase SQL Editor to enable shared sync:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_FIX_RLS_SQL);
                  setCopiedSyncSql(true);
                  setTimeout(() => setCopiedSyncSql(false), 2500);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                {copiedSyncSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSyncSql ? 'SQL Copied!' : 'Copy Multi-Device Sync SQL'}</span>
              </button>
            </div>
            <pre className="font-mono text-[10px] text-slate-400 max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded border border-slate-800">
              {SUPABASE_FIX_RLS_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by applicant name, tracking no, or guardian phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Application Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="approved">Approved for Admission</option>
            <option value="enrolled">Enrolled as Student</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Grade & Campus</th>
                <th className="py-3 px-4">Guardian Phone</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Database className="w-7 h-7 mx-auto text-slate-600 mb-2" />
                    <div className="font-semibold text-sm text-slate-300">
                      {syncInfo.synced
                        ? 'No admission applications found in Supabase admissions table.'
                        : 'No admission records found matching criteria.'}
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      {syncInfo.synced
                        ? 'If other visitors already submitted applications but they are not showing up, the Row Level Security (RLS) policy in Supabase needs to allow SELECT.'
                        : 'Configure your Supabase Project in Settings or submit an admission via the public website.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_FIX_RLS_SQL);
                        setCopiedSyncSql(true);
                        setTimeout(() => setCopiedSyncSql(false), 2500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 cursor-pointer transition-colors shadow"
                    >
                      {copiedSyncSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSyncSql ? 'Sync Fix SQL Copied!' : 'Copy Multi-Device Sync Fix SQL'}</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {inq.tracking_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {inq.applicant_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inq.father_name}
                    </td>
                    <td className="py-3 px-4">
                      Grade {inq.applied_grade} · <span className="capitalize">{inq.campus_id} Campus</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {inq.guardian_phone}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          inq.status === 'enrolled'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : inq.status === 'approved'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : inq.status === 'interview_scheduled'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : inq.status === 'rejected'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          View Details
                        </button>
                        {inq.status !== 'enrolled' && (
                          <button
                            onClick={() => handleEnrollStudent(inq)}
                            className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded cursor-pointer flex items-center gap-1"
                            title="Enroll directly into active student records"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Enroll</span>
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

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Application Dossier · {selectedInquiry.tracking_no}
              </span>
              <h3 className="text-xl font-bold text-white">{selectedInquiry.applicant_name}</h3>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Father Name:</span>
                <span className="font-semibold text-slate-200">{selectedInquiry.father_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Grade:</span>
                <span className="font-semibold text-slate-200">Class {selectedInquiry.applied_grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Campus:</span>
                <span className="capitalize text-slate-200">{selectedInquiry.campus_id} Campus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian Phone:</span>
                <span className="font-mono text-amber-400">{selectedInquiry.guardian_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian CNIC:</span>
                <span className="font-mono text-slate-300">{selectedInquiry.guardian_cnic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous School:</span>
                <span className="text-slate-300">{selectedInquiry.previous_school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-slate-300 text-right max-w-xs">{selectedInquiry.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold uppercase text-amber-400">{selectedInquiry.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 mb-1">Update Status:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry, 'interview_scheduled')}
                  className="py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry, 'approved')}
                  className="py-2 text-xs font-semibold rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 cursor-pointer"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry, 'rejected')}
                  className="py-2 text-xs font-semibold rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                >
                  Mark Rejected
                </button>
                {selectedInquiry.status !== 'enrolled' && (
                  <button
                    onClick={() => {
                      handleEnrollStudent(selectedInquiry);
                      setSelectedInquiry(null);
                    }}
                    className="py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer"
                  >
                    Enroll as Student
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
