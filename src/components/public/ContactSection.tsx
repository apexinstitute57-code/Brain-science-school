import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, Clock, GraduationCap, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 md:py-28 bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Get In Touch
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Brain Science School Zafarwal
          </h2>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            Reach our administrative team, schedule a campus visit, or connect directly with our admissions helpline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phone Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-amber-400 mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Official Helpline
              </h3>
              <a
                href="tel:03401212046"
                className="text-lg font-bold text-white font-mono hover:text-amber-400 transition-colors block"
              >
                03401212046
              </a>
              <p className="text-xs text-slate-400 mt-2">
                Direct phone inquiries for admissions, fee verification, and student administration.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              Mon–Sat: 8:00 AM – 3:00 PM
            </div>
          </div>

          {/* Email Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-amber-400 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </h3>
              <a
                href="mailto:brain@gmail.com"
                className="text-lg font-bold text-white font-mono hover:text-amber-400 transition-colors block"
              >
                brain@gmail.com
              </a>
              <p className="text-xs text-slate-400 mt-2">
                Send formal academic inquiries, transcripts, and document verification requests.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              24/7 Electronic Inquiries
            </div>
          </div>

          {/* Campus Location Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-amber-400 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Campus Location
              </h3>
              <div className="text-base font-bold text-white">
                Zafarwal, Punjab, Pakistan
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Main Campus (Boys Wing & Girls Wing), Shakargarh Road, District Narowal, Punjab.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-amber-400 font-semibold">
              Separate Campus Wings
            </div>
          </div>

          {/* Direct WhatsApp Card */}
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 hover:border-emerald-500/80 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-950/50">
                <MessageSquare className="w-6 h-6 fill-white" />
              </div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">
                WhatsApp Chat
              </h3>
              <div className="text-lg font-bold text-white font-mono">
                03401212046
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Chat directly with our admissions officer on WhatsApp for immediate assistance.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-emerald-900/60">
              <a
                href="https://wa.me/923401212046?text=Assalam-o-Alaikum%2C%20I%20would%20like%20to%20inquire%20about%20Brain%20Science%20School%20Zafarwal."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 hover:text-white"
              >
                <span>Open WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Call to Admission Banner */}
        <div className="mt-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Seeking Admission for Academic Year 2026–2027?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Use our official Online Admission Form above to submit your application directly to our database.
              </p>
            </div>
          </div>

          <a
            href="#admissions"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shrink-0 text-center"
          >
            Go to Admission Form
          </a>
        </div>
      </div>
    </section>
  );
};
