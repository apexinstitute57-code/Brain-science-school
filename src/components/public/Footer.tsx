import React from 'react';
import { GraduationCap, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateSection }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-slate-950 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Brain Science School</h3>
                <p className="text-[11px] text-amber-400 font-medium">Zafarwal, Punjab, Pakistan</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fostering scientific inquiry, Islamic character, and academic distinctions from Grade 1 to Grade 10 under the supervision of Principal Shahid Javed.
            </p>
            <div className="text-xs text-slate-400 font-mono space-y-1">
              <div>Phone: <a href="tel:03401212046" className="text-amber-300 hover:underline">03401212046</a></div>
              <div>Email: <a href="mailto:brain@gmail.com" className="text-amber-300 hover:underline">brain@gmail.com</a></div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateSection('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us & Principal Message
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('campuses')} className="hover:text-white transition-colors cursor-pointer">
                  Our Campuses (Girls & Boys)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('academics')} className="hover:text-white transition-colors cursor-pointer">
                  Academics (Grade 1 to 10)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('teachers')} className="hover:text-white transition-colors cursor-pointer">
                  Faculty & Mentors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('facilities')} className="hover:text-white transition-colors cursor-pointer">
                  Laboratories & Library
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  Campus Photo Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Admissions & Campuses */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Campuses & Admissions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateSection('admissions')} className="hover:text-white transition-colors cursor-pointer text-amber-300 font-semibold">
                  Online Admission Inquiry
                </button>
              </li>
              <li>
                <span className="text-slate-300 font-medium">Girls Campus:</span> Separate high-security wing with female faculty leadership
              </li>
              <li>
                <span className="text-slate-300 font-medium">Boys Campus:</span> STEM & athletic grounds, Shakargarh Road
              </li>
              <li>
                <button onClick={() => onNavigateSection('news')} className="hover:text-white transition-colors cursor-pointer">
                  Matric Examination Schedules
                </button>
              </li>
            </ul>
          </div>

          {/* Admin Management Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              School Management System
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Restricted portal for authorized faculty and administrative staff to manage student records, admissions, attendance, marks, and fee vouchers.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-lg shadow-sm hover:border-amber-400/50 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Management Login</span>
            </button>
          </div>
        </div>

        <div className="pt-10 mt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Brain Science School Zafarwal. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Principal: Shahid Javed</span>
            <span aria-hidden="true">·</span>
            <span>Affiliated with BISE Gujranwala</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
