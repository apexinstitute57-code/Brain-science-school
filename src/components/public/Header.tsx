import React, { useState } from 'react';
import { Menu, X, Shield, Phone, Mail, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onNavigateSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About Us', id: 'about' },
    { label: 'Our Campuses', id: 'campuses' },
    { label: 'Academics', id: 'academics' },
    { label: 'Facilities', id: 'facilities' },
    { label: 'Admissions', id: 'admissions' },
    { label: 'News & Events', id: 'news' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs font-semibold py-1.5 px-4 sm:px-8 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-wider uppercase text-[11px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
              Admissions 2026-27
            </span>
            <span className="hidden sm:inline">Admissions Open for Grade 1 to 10 (Separate Girls & Boys Campuses)</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:03401212046" className="flex items-center gap-1.5 hover:underline font-mono">
              <Phone className="w-3.5 h-3.5" />
              <span>03401212046</span>
            </a>
            <span className="hidden md:inline text-amber-900">|</span>
            <a href="mailto:brain@gmail.com" className="hidden md:flex items-center gap-1.5 hover:underline font-mono">
              <Mail className="w-3.5 h-3.5" />
              <span>brain@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-blue-950/50">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('home');
                }}
                className="text-xl md:text-2xl font-extrabold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                Brain Science School
              </a>
              <span className="text-[11px] text-slate-400 tracking-wider font-medium">
                Zafarwal, Punjab, Pakistan
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="hover:text-amber-400 transition-colors whitespace-nowrap py-1 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Admin Portal Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('admissions')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md hover:shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              Apply Online
            </button>

            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 border border-blue-700/60 rounded-lg shadow-sm hover:border-amber-400/50 transition-all whitespace-nowrap cursor-pointer"
              title="Access School Management Dashboard"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 py-5 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left py-2 text-base font-medium text-slate-200 hover:text-amber-400 transition-colors border-b border-slate-800/60"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('admissions')}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg text-center"
            >
              Apply Online
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Enter Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
