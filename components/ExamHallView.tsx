
import React, { useState, useMemo, useEffect } from 'react';
import { Subject, Language, User, UserProgress, EducationTrack } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onBack: () => void;
  onStartExam: (sub: Subject) => void;
  onStartPrep: (sub: Subject) => void;
}

const ExamHallView: React.FC<Props> = ({ user, progress, language, onBack, onStartExam, onStartPrep }) => {
  const [search, setSearch] = useState('');
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const filtered = useMemo(() => {
    return SUBJECTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-gold flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl mb-16 border-b-[16px] border-dare-gold">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-[12rem] font-black rotate-12 tracking-tighter uppercase">HALL</div>
        <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] mb-4">Global Exam Hall</h1>
        <p className="text-dare-gold font-black uppercase tracking-[0.5em] text-lg">Downloadable Digital Certificates Recognized Everywhere.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map(sub => {
          const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
          return (
            <div key={sub.id} className="bg-dare-gold dark:bg-slate-900 rounded-[3.5rem] p-10 border-4 border-white/30 shadow-xl flex flex-col justify-between group hover:scale-[1.03] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-7xl font-black">{sub.icon}</div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                    {sub.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-2">Target Registry</p>
                    <p className="text-3xl font-black text-white leading-none tracking-tighter">LVL {subProg.level}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{sub.name}</h3>
                <p className="text-slate-800 dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed italic">"Official mastery verification for institutional entry."</p>
              </div>

              <div className="grid gap-3 relative z-10">
                <button 
                  onClick={() => onStartExam(sub)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:text-slate-900 transition-all"
                >
                  🏆 Official Exam
                </button>
                <button 
                  onClick={() => onStartPrep(sub)}
                  className="w-full py-4 bg-white/20 text-white border-2 border-white/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all"
                >
                  🎯 Simulation
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamHallView;
