
import React, { useState } from 'react';
import { Subject, Language, LessonContent, User } from '../types';
import { translations } from '../translations';

interface Props {
  user: User;
  subject: Subject;
  lesson: LessonContent | null;
  language: Language;
  onBack: () => void;
}

const WeekendEnrichmentHub: React.FC<Props> = ({ user, subject, lesson, language, onBack }) => {
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  // darewast standard media durations
  const mediaDurations = [5, 10, 15, 30, 45, 60];

  const activities = [
    { id: 'seminar', title: t('interactiveSeminar'), icon: '📽️', type: 'video', desc: t('seminarDesc') },
    { id: 'analysis', title: t('scholarlyAnalysis'), icon: '📑', type: 'blog', desc: t('analysisDesc') },
    { id: 'lab', title: t('virtualLab'), icon: '🥽', type: 'virtual', desc: t('labDesc') },
  ];

  const handleDurationSelect = (actId: string, mins: number) => {
    setSelectedDurations(prev => ({ ...prev, [actId]: mins }));
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-indigo-400 flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-indigo-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl mb-16 border-b-[16px] border-indigo-500">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-[12rem] font-black rotate-12 tracking-tighter pointer-events-none uppercase">REST</div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-purple-900/40 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-indigo-500/30 backdrop-blur-md">
              🌙 {t('weekendMode')}
           </div>
           <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] mb-4">
              {t('weekendActivities')}
           </h1>
           <p className="text-indigo-200/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed italic">
              "{t('enrichmentDesc')}"
           </p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
         {activities.map(act => (
           <div key={act.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <h3 className="text-2xl font-black dark:text-white mb-4">{act.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{act.desc}</p>
              
              <div className="w-full space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('mediaDuration')}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {mediaDurations.map(mins => (
                      <button 
                        key={mins}
                        onClick={() => handleDurationSelect(act.id, mins)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedDurations[act.id] === mins ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  disabled={!selectedDurations[act.id]}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {t('launchExperience')} {selectedDurations[act.id] ? `(${selectedDurations[act.id]}m)` : ''}
                </button>
              </div>
           </div>
         ))}
      </div>

      {lesson && (
        <div className="mt-20 p-12 bg-gray-50 dark:bg-slate-800/50 rounded-[4rem] border border-gray-100 dark:border-slate-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">📖</div>
           <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.5em] mb-8">{t('activeChapterRef')}</h3>
           <div className="max-w-3xl">
              <h4 className="text-3xl font-black dark:text-white mb-4">{lesson.title}</h4>
              <p className="text-xl text-gray-500 font-medium leading-relaxed italic line-clamp-3">"{lesson.explanation}"</p>
           </div>
           <div className="mt-10 flex gap-4">
              <span className="px-6 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                Lvl {lesson.level}
              </span>
              <span className="px-6 py-2 bg-white dark:bg-slate-900 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-slate-800">
                Chapter {lesson.lessonNumber}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default WeekendEnrichmentHub;
