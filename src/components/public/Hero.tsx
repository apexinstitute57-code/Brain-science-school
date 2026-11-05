import React from 'react';
import { ArrowRight, BookOpen, Compass, Award } from 'lucide-react';

interface HeroProps {
  onApplyClick: () => void;
  onExploreCampuses: () => void;
  onOpenAdmin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onApplyClick, onExploreCampuses, onOpenAdmin }) => {
  return (
    <section id="home" className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Graphic & Light Glow */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_school_building_1793858551952.jpg"
          alt="Brain Science School Campus in Zafarwal"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-95 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl">
          {/* Subtle Editorial Kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
            <span>Brain Science School</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Zafarwal, Punjab, Pakistan</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Est. 2012</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Igniting Scientific Inquiry, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
              Shaping Ethical Leaders
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Under the visionary leadership of Principal <strong className="text-white font-semibold">Shahid Javed</strong>, Brain Science School offers world-class education from Grade 1 to Grade 10 with separate, secure campuses for Boys and Girls, advanced STEM laboratories, and outstanding BISE Board achievements.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button
              onClick={onApplyClick}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <span>Apply for Admission 2026-27</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreCampuses}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl hover:border-amber-400/40 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore Campuses</span>
            </button>
          </div>

          {/* Unboxed Highlights & Statistics Strip */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                Grade 1–10
              </div>
              <div className="text-xs text-slate-400 mt-1">Complete Matric Syllabus</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                2 Campuses
              </div>
              <div className="text-xs text-slate-400 mt-1">Dedicated Girls & Boys Wings</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-1">Matric Board Success Rate</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                3+ Labs
              </div>
              <div className="text-xs text-slate-400 mt-1">Computer, Physics & Chemistry</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
