import React, { useState } from 'react';
import { CampusType } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { StudentManager } from './StudentManager';
import { AdmissionManager } from './AdmissionManager';
import { TeacherManager } from './TeacherManager';
import { FeeManager } from './FeeManager';
import { AttendanceManager } from './AttendanceManager';
import { ExamManager } from './ExamManager';
import { AnnouncementManager } from './AnnouncementManager';
import { SupabaseSettings } from './SupabaseSettings';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  CreditCard,
  ClipboardList,
  Award,
  Bell,
  Database,
  LogOut,
  Globe,
  Menu,
  X,
  Shield,
  Building2,
} from 'lucide-react';

interface AdminLayoutProps {
  userEmail: string;
  onLogout: () => void;
  onReturnToWebsite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ userEmail, onLogout, onReturnToWebsite }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [campusFilter, setCampusFilter] = useState<'all' | CampusType>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'admissions', label: 'Admissions Queue', icon: UserPlus },
    { id: 'teachers', label: 'Faculty & Classes', icon: GraduationCap },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    { id: 'exams', label: 'Exams & Marksheets', icon: Award },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'database', label: 'Supabase DB & SQL', icon: Database },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Brain Science School</div>
            <div className="text-[10px] text-amber-400 font-mono">Management Dashboard</div>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-40 transition-all`}
      >
        {/* Brand Lockup */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
                Brain Science
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">Zafarwal, Pakistan</p>
            </div>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="text-xs font-semibold text-white">Shahid Javed</div>
          <div className="text-[11px] text-slate-400 truncate">{userEmail}</div>
          <div className="text-[10px] text-amber-400 font-mono mt-0.5">Principal & Administrator</div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onReturnToWebsite}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Public Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Control Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              Campus Filter:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setCampusFilter('all')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  campusFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Wings
              </button>
              <button
                onClick={() => setCampusFilter('boys')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  campusFilter === 'boys'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Boys Campus
              </button>
              <button
                onClick={() => setCampusFilter('girls')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  campusFilter === 'girls'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Girls Campus
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToWebsite}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Go to Public Website</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="p-6 sm:p-8 flex-1">
          {activeTab === 'dashboard' && (
            <AdminDashboard campusFilter={campusFilter} onNavigateTab={handleTabChange} />
          )}
          {activeTab === 'students' && <StudentManager campusFilter={campusFilter} />}
          {activeTab === 'admissions' && <AdmissionManager campusFilter={campusFilter} />}
          {activeTab === 'teachers' && <TeacherManager campusFilter={campusFilter} />}
          {activeTab === 'fees' && <FeeManager campusFilter={campusFilter} />}
          {activeTab === 'attendance' && <AttendanceManager campusFilter={campusFilter} />}
          {activeTab === 'exams' && <ExamManager campusFilter={campusFilter} />}
          {activeTab === 'announcements' && <AnnouncementManager />}
          {activeTab === 'database' && <SupabaseSettings />}
        </div>
      </main>
    </div>
  );
};
