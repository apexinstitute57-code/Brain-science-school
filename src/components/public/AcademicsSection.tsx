import React, { useState } from 'react';
import { BookOpen, Layers, Award, CheckCircle2, ChevronRight } from 'lucide-react';

export const AcademicsSection: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<'primary' | 'middle' | 'matric'>('matric');

  const tiers = {
    primary: {
      name: 'Primary Section',
      grades: 'Grade 1 to Grade 5',
      tagline: 'Building Strong Cognitive & Moral Foundations',
      description: 'Focuses on inquiry-driven foundational learning, phonics, numeracy, ethical stories, and motor skill development in an encouraging, joyful classroom.',
      subjects: [
        'English (Spoken & Phonics)',
        'Urdu & Nazra Quran',
        'Mathematics (Mental Math & Operations)',
        'General Science & Nature Study',
        'Islamiyat & Character Building',
        'Social Studies & Geography',
        'Creative Arts & Digital Introduction',
      ],
      features: [
        'Activity-based sensory learning kits',
        'Daily moral storytelling & Tajweed',
        'Continuous diagnostic assessment (no stress)',
        'Spoken English immersion drills',
      ],
    },
    middle: {
      name: 'Middle Section',
      grades: 'Grade 6 to Grade 8',
      tagline: 'Bridging Curiosity to Scientific Methodologies',
      description: 'Prepares students for rigorous analytical thinking, deeper laboratory exposure, computer programming fundamentals, and structured bilingual communication.',
      subjects: [
        'English Language & Literature',
        'Urdu Grammar & Composition',
        'Algebra, Geometry & Arithmetic',
        'Integrated General Science (Physics/Chem/Bio concepts)',
        'Computer Education & Typing',
        'History & Geography of Pakistan',
        'Islamiyat & Arabic Translation',
      ],
      features: [
        'Weekly dedicated practical science lab experiments',
        'Coding & computational logic modules',
        'Declamations, speech debates, and quiz bees',
        'Rigorous semester revision tests',
      ],
    },
    matric: {
      name: 'Secondary / Matriculation',
      grades: 'Grade 9 & Grade 10',
      tagline: 'BISE Board Distinction & Pre-College Mastery',
      description: 'Affiliated with the Board of Intermediate and Secondary Education (BISE) Gujranwala. Designed to secure top divisional positions and entry into premier medical/engineering colleges.',
      subjects: [
        'Physics (Theory + Full Practical Lab)',
        'Chemistry (Analytical & Organic + Lab)',
        'Biology / Computer Science (Electives)',
        'Mathematics (Higher Science Group)',
        'English Compulsory (Advanced Essay & Grammar)',
        'Urdu Compulsory',
        'Pakistan Studies',
        'Islamiyat Compulsory / Quran Translation',
      ],
      features: [
        'Intensive Board exam question-bank solving',
        'Simulated Pre-Board examinations with Board roll sheets',
        'Hands-on laboratory practicals with individual apparatus',
        'Career counseling for Pre-Medical, Pre-Engineering & ICS',
      ],
    },
  };

  const current = tiers[selectedLevel];

  return (
    <section id="academics" className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Academic Pathways
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Grade 1 to Grade 10 Comprehensive Curriculum
          </h2>
          <p className="mt-3 text-base text-slate-300">
            A progressive academic structure governed by Punjab Curriculum standards and enhanced with STEM labs, English language fluency, and moral grounding.
          </p>
        </div>

        {/* Tier Selector Buttons */}
        <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-slate-950 border border-slate-800 rounded-xl max-w-xl">
          <button
            onClick={() => setSelectedLevel('primary')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
              selectedLevel === 'primary' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Primary (Grade 1–5)
          </button>
          <button
            onClick={() => setSelectedLevel('middle')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
              selectedLevel === 'middle' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Middle (Grade 6–8)
          </button>
          <button
            onClick={() => setSelectedLevel('matric')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
              selectedLevel === 'matric' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Matric (Grade 9–10)
          </button>
        </div>

        {/* Selected Tier Academic Showcase */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-block text-xs font-mono font-semibold text-amber-400 tracking-wider">
                {current.grades}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{current.name}</h3>
              <p className="text-amber-300 font-medium text-sm">{current.tagline}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Academic Benchmarks
                </h4>
                <div className="space-y-2">
                  {current.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Subjects & Core Syllabus</span>
                </h4>
                <span className="text-xs font-mono text-slate-400">BISE & PCTB Aligned</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 hover:border-amber-400/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-blue-950 border border-blue-800 flex items-center justify-center font-mono font-bold text-amber-400 text-[10px]">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{sub}</span>
                  </div>
                ))}
              </div>

              {selectedLevel === 'matric' && (
                <div className="mt-6 p-4 rounded-lg bg-blue-950/40 border border-blue-800/50 text-xs text-slate-300">
                  <span className="font-bold text-amber-300 block mb-1">
                    Science Group Streams (Grade 9 & 10):
                  </span>
                  Students can opt for <strong className="text-white">Biology Group</strong> (Pre-Medical preparation) or <strong className="text-white">Computer Science Group</strong> (Pre-Engineering & IT preparation), both supported by full laboratory practical sessions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
