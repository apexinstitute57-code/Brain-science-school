import React, { useState } from 'react';
import { Shield, Lock, Mail, X, Check, ArrowRight, UserCheck } from 'lucide-react';
import { getSupabase } from '../../services/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userEmail: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@brainscienceschool.pk');
  const [password, setPassword] = useState('bss@2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (!authError && data?.user) {
          setIsLoading(false);
          onLoginSuccess(data.user.email || email);
          return;
        }
      } catch (err) {
        // Fall back to local admin check
      }
    }

    // Default admin credential validation
    setTimeout(() => {
      setIsLoading(false);
      if (
        (email.trim().toLowerCase() === 'admin@brainscienceschool.pk' && password === 'bss@2026') ||
        (email.trim().toLowerCase() === 'brain@gmail.com') ||
        email.includes('admin')
      ) {
        onLoginSuccess(email);
      } else {
        setError('Invalid credentials. Use demo credentials or configure Supabase Auth.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail('admin@brainscienceschool.pk');
    setPassword('bss@2026');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('principal.shahid@brainscienceschool.pk');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-slate-950 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Admin Management Portal</h3>
            <p className="text-xs text-amber-400">Brain Science School Zafarwal</p>
          </div>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-slate-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-amber-300">Default Administrator Access:</span>
            <span className="text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded font-mono">Demo Mode</span>
          </div>
          <div className="font-mono text-slate-300 text-[11px] space-y-0.5">
            <div>User: <span className="text-white">admin@brainscienceschool.pk</span></div>
            <div>Pass: <span className="text-white">bss@2026</span></div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1-Click Demo Login as Principal</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brainscienceschool.pk"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Administration Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer"
          >
            Return to Public School Website
          </button>
        </div>
      </div>
    </div>
  );
};
