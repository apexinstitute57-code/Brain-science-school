import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'labs' | 'campus' | 'sports' | 'events'>('all');
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const galleryItems = [
    {
      id: 1,
      title: 'Main Academic Campus & Courtyard',
      category: 'campus',
      categoryLabel: 'Campus Architecture',
      image: '/src/assets/images/hero_school_building_1793858551952.jpg',
      caption: 'Main entrance facade and manicured lawns of Brain Science School in Zafarwal.',
    },
    {
      id: 2,
      title: 'Secondary Chemistry & Biology Experimentation',
      category: 'labs',
      categoryLabel: 'Science Labs',
      image: '/src/assets/images/school_science_lab_1793858553650.jpg',
      caption: 'Students conducting titration and microbiological microscopy in the central science lab.',
    },
    {
      id: 3,
      title: 'Digital Computing & Robotics Workshop',
      category: 'labs',
      categoryLabel: 'Digital Tech',
      image: '/src/assets/images/school_computer_lab_1793858553521.jpg',
      caption: 'Scholars working on algorithms, web development, and hardware logic in the computer lab.',
    },
    {
      id: 4,
      title: 'Central Reference Library Study Hours',
      category: 'campus',
      categoryLabel: 'Library & Research',
      image: '/src/assets/images/school_library_1793858553792.jpg',
      caption: 'Scholars researching encyclopedia reference volumes during afternoon study hours.',
    },
    {
      id: 5,
      title: 'Annual Science Fair & Working Models Showcase',
      category: 'events',
      categoryLabel: 'Events & Awards',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&q=80',
      caption: 'Students demonstrating physics circuit models and automated water filtration systems.',
    },
    {
      id: 6,
      title: 'Inter-Campus Cricket & Athletic Tournament',
      category: 'sports',
      categoryLabel: 'Athletics & Sports',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=80',
      caption: 'Annual sports day cricket match at the Brain Science School athletic grounds.',
    },
    {
      id: 7,
      title: 'Matric Position Holders Prize Distribution',
      category: 'events',
      categoryLabel: 'Events & Awards',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
      caption: 'Principal Shahid Javed awarding merit trophies and cash scholarships to top board scorers.',
    },
    {
      id: 8,
      title: 'Quran Recitation & Seerah Conference',
      category: 'events',
      categoryLabel: 'Moral & Spiritual',
      image: 'https://images.unsplash.com/photo-1584697964190-71e469502bd2?w=900&q=80',
      caption: 'Annual Husn-e-Qiraat competition hosted in the school main auditorium.',
    },
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <section id="gallery" className="py-20 md:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Visual Chronicles
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Life at Brain Science School
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Glimpses into our dynamic classrooms, advanced laboratory sessions, sports triumphs, and memorable campus events in Zafarwal.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'labs', label: 'Labs & Tech' },
              { id: 'campus', label: 'Campus' },
              { id: 'sports', label: 'Sports' },
              { id: 'events', label: 'Events & Awards' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  filter === f.id ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/60 transition-all cursor-pointer shadow-lg aspect-4/3"
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-400 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded">
                {item.categoryLabel}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-sm font-bold text-white leading-tight group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white hover:text-amber-400 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-slate-950 overflow-hidden flex items-center justify-center">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block mb-1">
                  {activePhoto.categoryLabel}
                </span>
                <h3 className="text-lg font-bold text-white">{activePhoto.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{activePhoto.caption}</p>
              </div>

              <button
                onClick={() => setActivePhoto(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer self-start sm:self-center"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
