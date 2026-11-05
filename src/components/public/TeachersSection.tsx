import React, { useState } from 'react';
import { Teacher } from '../../types';
import { StorageService } from '../../services/storage';
import { Award, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';

export const TeachersSection: React.FC = () => {
  const [teachers] = useState<Teacher[]>(StorageService.getTeachers());
  const [campusFilter, setCampusFilter] = useState<'all' | 'boys' | 'girls'>('all');

  const filteredTeachers = teachers.filter((t) => {
    if (campusFilter === 'all') return true;
    return t.campus_id === campusFilter || t.campus_id === 'both';
  });

  return (
    <section id="teachers" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Faculty of Distinction
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experienced Mentors & Subject Specialists
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Our faculty comprises subject specialists with advanced degrees (M.Phil, M.Sc, M.Ed) committed to fostering intellectual rigor and character excellence in Zafarwal.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setCampusFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                campusFilter === 'all' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Faculty
            </button>
            <button
              onClick={() => setCampusFilter('girls')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                campusFilter === 'girls' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Girls Campus
            </button>
            <button
              onClick={() => setCampusFilter('boys')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                campusFilter === 'boys' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Boys Campus
            </button>
          </div>
        </div>

        {/* Teacher Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 bg-slate-950 overflow-hidden">
                  <img
                    src={teacher.image_url}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded">
                    {teacher.campus_id === 'both' ? 'Both Wings' : teacher.campus_id === 'girls' ? 'Girls Wing' : 'Boys Wing'}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {teacher.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-medium mt-0.5 mb-2">
                    {teacher.designation}
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-slate-200">{teacher.qualification}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{teacher.subject}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {teacher.bio}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-amber-300 font-semibold">{teacher.experience_years}+ Years Experience</span>
                <span className="text-[11px] text-slate-400 font-mono">{teacher.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
