import React, { useState } from 'react';
import { Shield, Sparkles, Building2, CheckCircle2, Users, MapPin, Phone } from 'lucide-react';

export const CampusesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'both' | 'girls' | 'boys'>('both');

  return (
    <section id="campuses" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Tailored Learning Environments
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Our Campuses: Separate Wings for Girls & Boys
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Brain Science School provides independent, fully equipped campuses for female and male scholars in Zafarwal, ensuring focused academic focus, cultural respect, and dedicated facilities.
            </p>
          </div>

          {/* Interactive Campus Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'both' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Wings
            </button>
            <button
              onClick={() => setActiveTab('girls')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'girls' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Girls Campus
            </button>
            <button
              onClick={() => setActiveTab('boys')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === 'boys' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Boys Campus
            </button>
          </div>
        </div>

        {/* Campuses Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Girls Campus Card */}
          {(activeTab === 'both' || activeTab === 'girls') && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-400/50 transition-all">
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src="/src/assets/images/school_library_1793858553792.jpg"
                    alt="Brain Science School Girls Campus Academic Wing"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-blue-900/90 backdrop-blur-md border border-amber-400/50 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                    Girls Campus
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">Girls Campus Wing</h3>
                    <div className="flex items-center gap-2 text-xs text-amber-300 mt-1">
                      <span>Under Supervision of Vice Principal Madam Razia Sultana</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Designed to provide an empowering, safe, and academically rigorous space where young women excel in science, arts, leadership, and Islamic values. Supervised exclusively by qualified senior female educators.
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Campus Features & Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Dedicated Girls Science & IT Labs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>High-walled 24/7 CCTV & Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Indoor Badminton & Sports Court</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Separate Library & Research Section</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Safe Supervised Transport Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Declamation & Arts Society</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Girls Wing, Brain Science School, Zafarwal</span>
                </div>
                <div className="font-mono text-amber-400 font-semibold">Grades 1 to 10</div>
              </div>
            </div>
          )}

          {/* Boys Campus Card */}
          {(activeTab === 'both' || activeTab === 'boys') && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-400/50 transition-all">
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src="/src/assets/images/school_computer_lab_1793858553521.jpg"
                    alt="Brain Science School Boys Campus STEM Lab"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-amber-400/50 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                    Boys Campus
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">Boys Campus Wing</h3>
                    <div className="flex items-center gap-2 text-xs text-amber-300 mt-1">
                      <span>Under Direct Direction of Principal Shahid Javed</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    A vibrant campus environment fostering technological innovation, athletic discipline, analytical reasoning, and character development to prepare boys for engineering, medical, and civil leadership.
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Campus Features & Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Advanced Robotics & Coding Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Full Physics, Chemistry & Bio Labs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Outdoor Cricket & Football Arena</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Matric Pre-Engineering & Pre-Med Wings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Career Counseling & Entry Test Prep</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Discipline & Physical Fitness Drills</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Main Campus, Shakargarh Road, Zafarwal</span>
                </div>
                <div className="font-mono text-amber-400 font-semibold">Grades 1 to 10</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
