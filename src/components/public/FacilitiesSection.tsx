import React, { useState } from 'react';
import { Microscope, Monitor, BookOpen, Presentation, Trophy, Cpu, CheckCircle } from 'lucide-react';

export const FacilitiesSection: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<number>(0);

  const facilities = [
    {
      id: 0,
      title: 'Advanced Science Laboratories',
      subtitle: 'Physics, Chemistry & Biology Workstations',
      description: 'Equipped with precision optical microscopes, calibrated glassware, chemical reagents, and electrical circuit boards compliant with BISE Board matric practical syllabi.',
      image: '/src/assets/images/school_science_lab_1793858553650.jpg',
      icon: Microscope,
      specs: [
        'Individual apparatus sets for all secondary students',
        'Chemical fume hoods & comprehensive safety gear',
        'Demonstration workbench with digital projection',
        'Specimen preparation area for zoology & botany',
      ],
    },
    {
      id: 1,
      title: 'Computer & AI Robotics Center',
      subtitle: 'Digital Literacy & Computational Thinking',
      description: 'A modern computing laboratory featuring high-speed networked desktop workstations, fiber optic connectivity, coding environments (Python, C++, HTML/CSS), and introductory robotics kits.',
      image: '/src/assets/images/school_computer_lab_1793858553521.jpg',
      icon: Monitor,
      specs: [
        'Dedicated 1-to-1 computer workstation ratio during class',
        'High-speed filtered broadband internet connection',
        'Robotics & STEM microcontroller experiment modules',
        'Regular software development & typing speed drills',
      ],
    },
    {
      id: 2,
      title: 'Central Library & Research Hall',
      subtitle: 'Quiet Study, Encyclopedias & Reference Textbooks',
      description: 'A tranquil academic haven holding over 5,000 catalogued volumes including science reference sets, classical Urdu & English literature, Islamic history, and competitive exam past papers.',
      image: '/src/assets/images/school_library_1793858553792.jpg',
      icon: BookOpen,
      specs: [
        'Silent individual research cubicles and reading desks',
        'Daily national newspapers and educational periodicals',
        'Digital archive of past BISE 10-year solved papers',
        'Lending library system encouraging lifelong reading habits',
      ],
    },
    {
      id: 3,
      title: 'Smart Interactive Classrooms',
      subtitle: 'Multimedia Visual Learning & Ergonomic Spaces',
      description: 'Well-ventilated, sunlit classrooms equipped with smart interactive screens, ergonomic desks, and optimal teacher-to-student ratios (maximum 25 students per section).',
      image: '/src/assets/images/hero_school_building_1793858551952.jpg',
      icon: Presentation,
      specs: [
        'Interactive smartboards with audio-visual learning aids',
        'Proper acoustic planning and climate-conscious design',
        'Dual section distribution for Girls and Boys wings',
        'Individual student lockers and display project boards',
      ],
    },
    {
      id: 4,
      title: 'Sports & Athletic Complexes',
      subtitle: 'Physical Fitness, Teamwork & Sportsmanship',
      description: 'Dedicated sports facilities featuring outdoor cricket pitches, football turf, volleyball courts, and an enclosed indoor gymnasium for badminton and fitness.',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
      icon: Trophy,
      specs: [
        'Separate designated athletic hours for Girls & Boys',
        'Professional sports coaching in Cricket and Badminton',
        'Annual Inter-Campus Championship tournament trophies',
        'First aid trained physical education supervisors',
      ],
    },
    {
      id: 5,
      title: 'Digital Learning Hub & CCTV Safety',
      subtitle: 'Continuous Campus Supervision & Hybrid Learning',
      description: 'Integrated campus infrastructure with 24/7 high-definition security camera surveillance, computerized student attendance monitoring, and automated SMS notice dispatch.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80',
      icon: Cpu,
      specs: [
        'Full perimeter boundary security with guarded access',
        'Automated parent SMS alerts for attendance and fees',
        'Uninterrupted solar & generator backup power system',
        'Safe, supervised van pick-and-drop transportation network',
      ],
    },
  ];

  const current = facilities[selectedFacility];

  return (
    <section id="facilities" className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            World-Class Infrastructure
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Facilities Engineered for Tomorrow's Leaders
          </h2>
          <p className="mt-3 text-base text-slate-300">
            From modern science and computer laboratories to quiet study libraries and sports complexes, explore the infrastructure supporting Brain Science School in Zafarwal.
          </p>
        </div>

        {/* Facility Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-10">
          {facilities.map((fac) => {
            const Icon = fac.icon;
            const isSelected = selectedFacility === fac.id;
            return (
              <button
                key={fac.id}
                onClick={() => setSelectedFacility(fac.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-start gap-2 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="text-xs font-bold tracking-tight line-clamp-1">{fac.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Facility Spotlight Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[360px] overflow-hidden">
              <img
                src={current.image}
                alt={current.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent lg:hidden" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  {current.subtitle}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  {current.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {current.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Facility Specifications
                  </h4>
                  {current.specs.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Brain Science School Zafarwal</span>
                <span className="font-mono text-amber-400 font-semibold">Available for Both Campuses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
