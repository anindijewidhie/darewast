
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
  const [liveExams, setLiveExams] = useState(12482);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveExams(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return SUBJECTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-gold flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl mb-16 border-b-[16px] border-dare-gold">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-[12rem] font-black rotate-12 tracking-tighter pointer-events-none">EXAM</div>
        <div className="absolute inset-0 bg-gradient-to-br from-dare-gold/10 via-transparent to-dare-purple/10 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-center gap-4 mb-6">
             <div className="px-4 py-2 bg-dare-gold/20 border border-dare-gold/30 rounded-2xl flex items-center gap-2 backdrop-blur-md">
                <div className="w-2 h-2 bg-dare-gold rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dare-gold">Global Network Live</span>
             </div>
             <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-2xl flex items-center gap-2 backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{liveExams.toLocaleString()} Active Sessions</span>
             </div>
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.8] mb-4">
            {t('examHall')}
          </h1>
          
          <p className="text-dare-gold font-black uppercase tracking-[0.5em] text-lg max-w-3xl mx-auto drop-shadow-xl">
            {t('hallSubtitle')}
          </p>
          
          <div className="pt-10 flex flex-wrap justify-center gap-6 opacity-60">
             <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Every Nation</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="text-[10px] font-black uppercase tracking-widest">24/7 Availability</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-[10px] font-black uppercase tracking-widest">A.I. Proctored</span>
             </div>
          </div>
        </div>
      </header>

      <div className="mb-16 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8">
          <div className="relative group">
            <input 
              type="text"
              placeholder={t('searchSubjects')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-8 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-[2.5rem] outline-none font-bold text-2xl dark:text-white transition-all focus:border-dare-gold shadow-2xl focus:scale-[1.01]"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-gray-400">🔍</div>
          </div>
        </div>
        <div className="lg:col-span-4 p-8 bg-dare-gold text-slate-950 rounded-[2.5rem] shadow-xl text-center">
           <p className="text-[10px] font-black uppercase tracking-widest mb-1">Institutional Status</p>
           <h4 className="text-xl font-black">Global Exam Authority</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map(sub => {
          const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
          return (
            <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col justify-between group hover:border-dare-gold transition-all relative overflow-hidden hover:-translate-y-2">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 dark:bg-slate-800 group-hover:bg-dare-gold transition-colors"></div>
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
                    {sub.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Mastery Index</p>
                    <p className="text-3xl font-black dark:text-white leading-none tracking-tighter">LVL {subProg.level}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-3 group-hover:text-dare-gold transition-colors">{sub.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed line-clamp-2">{sub.description}</p>
              </div>

              <div className="grid gap-3">
                <button 
                  onClick={() => onStartExam(sub)}
                  className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-dare-gold hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  🏆 {t('masteryCertification')}
                </button>
                <button 
                  onClick={() => onStartPrep(sub)}
                  className="w-full py-4 bg-white dark:bg-slate-900 text-dare-purple border-2 border-dare-purple/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-dare-purple hover:text-white transition-all"
                >
                  🎯 {t('boardPreparation')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-24 grid md:grid-cols-2 gap-8">
         <div className="p-12 bg-slate-900 rounded-[4rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black">24/7</div>
            <h4 className="text-2xl font-black mb-4">Always Open</h4>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Unlike traditional institutions, the darewast Exam Hall never sleeps. Take your professional certification exam at 3 AM or 3 PM, from Tokyo to Toronto.
            </p>
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🕒</div>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🏠</div>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">🌐</div>
            </div>
         </div>
         <div className="p-12 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black text-dare-gold">GLOBAL</div>
            <h4 className="text-2xl font-black mb-4 dark:text-white">Institutional Grade</h4>
            <p className="text-gray-500 font-medium leading-relaxed mb-6">
              Every certificate issued is architected to exceed global academic standards, proctored by Gemini 3.1 Pro vision models to ensure total integrity.
            </p>
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-dare-gold/10 text-dare-gold rounded-2xl flex items-center justify-center text-xl">🎓</div>
               <div className="w-12 h-12 bg-dare-gold/10 text-dare-gold rounded-2xl flex items-center justify-center text-xl">📜</div>
               <div className="w-12 h-12 bg-dare-gold/10 text-dare-gold rounded-2xl flex items-center justify-center text-xl">🤖</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ExamHallView;
