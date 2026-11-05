import React from 'react';
import { Target, Compass, BookOpen, Quote, ShieldCheck, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Who We Are
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Academic Excellence Powered by Scientific Curiosity
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Brain Science School in Zafarwal was founded on the fundamental conviction that children learn best when encouraged to think critically, experiment boldly, and develop unshakeable Islamic character.
          </p>
        </div>

        {/* Principal's Message Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative mb-5 group">
              <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-2xl shadow-blue-950/80">
                <img
                  src="/src/assets/images/principal_shahid_javed_1793858554259.jpg"
                  alt="Principal Shahid Javed - Brain Science School"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-extrabold uppercase px-3 py-1 rounded-md shadow-md">
                Principal
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Shahid Javed</h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">Principal & Founder</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">brain@gmail.com · 03401212046</p>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
              <Quote className="w-5 h-5" />
              <span>A Message from the Principal</span>
            </div>
            <blockquote className="text-lg sm:text-xl text-slate-200 font-medium italic leading-relaxed">
              "At Brain Science School, our mission is not simply to help students pass examinations; we prepare young minds to question, analyze, and lead in a rapidly changing world. By combining rigorous Punjab Board academics with practical laboratory experimentation and separate moral campus environments, we ensure our boys and girls achieve their highest potential."
            </blockquote>
            <p className="text-sm text-slate-400 leading-relaxed pt-2">
              Our campus in Zafarwal serves as a beacon of modern education where dedicated teachers mentor each child individually. Whether in robotics, biology, mathematics, or moral studies, our students consistently earn positions of honor across Gujranwala Division.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>22+ Years Educational Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>M.Sc Physics & Educational Psychology</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vision, Mission & Goals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-amber-400 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To be the premier school system in Punjab recognized for synthesizing advanced scientific literacy, technological competence, and authentic character development.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-amber-400 mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Deliver comprehensive Grade 1–10 education through empirical science learning, high-caliber teacher mentorship, and safe, dignified separate campus facilities.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-amber-400 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Educational Goals</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              100% board distinction rates, mastery of computational problem-solving, fluency in English communication, and profound grounding in Islamic ethics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
