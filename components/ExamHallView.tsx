
import React, { useState, useMemo } from 'react';
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

      <header className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mb-16">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black rotate-12">EXAM</div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{t('examHall')}</h1>
          <p className="text-dare-gold font-black uppercase tracking-[0.4em] text-sm max-w-2xl mx-auto">{t('hallSubtitle')}</p>
        </div>
      </header>

      <div className="mb-12 max-w-2xl mx-auto">
        <div className="relative group">
          <input 
            type="text"
            placeholder={t('searchSubjects')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-[2rem] outline-none font-bold text-xl dark:text-white transition-all focus:border-dare-gold shadow-xl"
          />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">🔍</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(sub => {
          const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
          return (
            <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col justify-between group hover:border-dare-gold transition-all">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl group-hover:scale-110 transition-transform">{sub.icon}</span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-2xl font-black dark:text-white leading-none">Level {subProg.level}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-2">{sub.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{sub.description}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => onStartExam(sub)}
                  className="w-full py-4 bg-dare-gold text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-dare-gold/20 hover:scale-[1.02] transition-all"
                >
                  🏆 {t('masteryCertification')}
                </button>
                <button 
                  onClick={() => onStartPrep(sub)}
                  className="w-full py-4 bg-dare-purple text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-dare-purple/20 hover:scale-[1.02] transition-all"
                >
                  🎯 {t('boardPreparation')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-24 p-12 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-slate-800 text-center">
         <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.5em] mb-6">Universal Coverage Lab</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
               <p className="text-3xl mb-1">🌍</p>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Curricula</p>
            </div>
            <div>
               <p className="text-3xl mb-1">🧬</p>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Methods</p>
            </div>
            <div>
               <p className="text-3xl mb-1">💻</p>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Systems</p>
            </div>
            <div>
               <p className="text-3xl mb-1">🏛️</p>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">All Institutions</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ExamHallView;
