import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Announcement } from '../../types';
import { Bell, Calendar, Pin, ArrowRight } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const [announcements] = useState<Announcement[]>(StorageService.getAnnouncements());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = announcements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <section id="news" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Official Bulletin
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              News, Notifications & Academic Events
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Stay informed with circulars, board date sheets, sports fixtures, and special updates directly from the principal's desk at Brain Science School.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            {['all', 'admission', 'academic', 'sports', 'event'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Updates' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 sm:p-8 rounded-2xl bg-slate-900/90 border transition-all flex flex-col justify-between ${
                item.is_pinned ? 'border-amber-400/60 shadow-lg shadow-amber-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono">{item.publish_date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase text-[11px] font-semibold text-slate-300">
                      {item.category}
                    </span>
                  </div>

                  {item.is_pinned && (
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      <Pin className="w-3 h-3" />
                      <span>Featured Circular</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {item.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">
                  Applicable To: <strong className="text-white">{item.campus_id === 'all' ? 'Both Campuses' : `${item.campus_id} Campus`}</strong>
                </span>
                <span className="font-mono text-amber-400 text-[11px]">Brain Science School Notice</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
