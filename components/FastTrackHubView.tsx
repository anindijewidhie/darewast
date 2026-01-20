
import React, { useState } from 'react';
import { Subject, Language, User, UserProgress, SubjectProgress } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onBack: () => void;
  onUpdateProgress: (subjectId: string, data: Partial<SubjectProgress>) => void;
}

const FastTrackHubView: React.FC<Props> = ({ user, progress, language, onBack, onUpdateProgress }) => {
  const [activeTab, setActiveTab] = useState<'A-P' | 'Q-T'>('A-P');
  const [configuringSubject, setConfiguringSubject] = useState<Subject | null>(null);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  // darewast standard study durations
  const durations = [
    { label: `5 ${t('minutes')}`, value: 5 },
    { label: `10 ${t('minutes')}`, value: 10 },
    { label: `15 ${t('minutes')}`, value: 15 },
    { label: `30 ${t('minutes')}`, value: 30 },
    { label: `45 ${t('minutes')}`, value: 45 },
    { label: `60 ${t('minutes')}`, value: 60 },
    { label: `90 ${t('minutes')}`, value: 90 },
    { label: `120 ${t('minutes')}`, value: 120 },
    { label: `180 ${t('minutes')}`, value: 180 },
    { label: `240 ${t('minutes')}`, value: 240 },
  ];

  const getFastTrackStatus = (subjectId: string) => progress[subjectId]?.isFastTrack || false;
  const getFastTrackDuration = (subjectId: string) => progress[subjectId]?.fastTrackDuration || 30;

  const handleToggleFastTrack = (subject: Subject) => {
    if (getFastTrackStatus(subject.id)) {
      onUpdateProgress(subject.id, { isFastTrack: false, fastTrackDuration: undefined });
    } else {
      setConfiguringSubject(subject);
    }
  };

  const applyConfiguration = (duration: number) => {
    if (configuringSubject) {
      onUpdateProgress(configuringSubject.id, { isFastTrack: true, fastTrackDuration: duration });
      setConfiguringSubject(null);
    }
  };

  const filteredSubjects = SUBJECTS.filter(s => {
    const subProg = progress[s.id];
    if (!subProg) return activeTab === 'A-P';
    const isAdvanced = ['Q', 'R', 'S', 'T'].includes(subProg.level);
    return activeTab === 'Q-T' ? isAdvanced : !isAdvanced;
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-rose-500 flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      {configuringSubject && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 bg-gradient-to-r from-rose-500 to-rose-600 text-white relative">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">{configuringSubject.icon}</div>
               <h3 className="text-3xl font-black mb-2">{t('fastTrack')} {t('setup')}</h3>
               <p className="text-white/80 font-medium">{configuringSubject.name}</p>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">{t('dailyLearningTime')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {durations.map(d => (
                    <button
                      key={d.value}
                      onClick={() => applyConfiguration(d.value)}
                      className="p-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-rose-500 hover:bg-rose-500/5 transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">⏰</span>
                        <span className="font-bold dark:text-white text-xs">{d.label}</span>
                      </div>
                      <span className="text-rose-500 font-black text-[9px] uppercase tracking-widest">{t('setup')} →</span>
                    </button>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => setConfiguringSubject(null)}
                className="w-full py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-rose-500 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black text-rose-500">FAST</div>
        <div className="relative z-10 space-y-8">
          <header className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20 mb-6">
              ⚡ {t('fastTrackLab')}
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-6">
              {t('fastTrack')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-2xl leading-relaxed">
              {t('fastTrackDesc')}
            </p>
          </header>

          <div className="pt-12">
            <div className="flex gap-4 mb-8 border-b border-gray-100 dark:border-slate-800">
               <button 
                onClick={() => setActiveTab('A-P')}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'A-P' ? 'text-rose-500 border-b-4 border-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
               >
                {t('foundationPath')}
               </button>
               <button 
                onClick={() => setActiveTab('Q-T')}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Q-T' ? 'text-rose-500 border-b-4 border-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
               >
                {t('advancedPath')}
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredSubjects.map(sub => {
                 const isFast = getFastTrackStatus(sub.id);
                 const duration = getFastTrackDuration(sub.id);
                 return (
                   <button 
                    key={sub.id}
                    onClick={() => handleToggleFastTrack(sub)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group ${isFast ? 'border-rose-500 bg-rose-500/5 shadow-xl' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-rose-500/40'}`}
                   >
                     <div className="flex items-center gap-4">
                       <span className="text-3xl group-hover:scale-110 transition-transform">{sub.icon}</span>
                       <div>
                         <p className="font-black text-sm dark:text-white">{sub.name}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isFast ? 'text-rose-500' : 'text-gray-400'}`}>
                              {isFast ? `⚡ ${t('acceleratedMastery')}` : t('standardSpeed')}
                            </p>
                            {isFast && (
                              <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase">
                                {duration} {t('minutesShort')}
                              </span>
                            )}
                         </div>
                       </div>
                     </div>
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isFast ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-200 text-transparent'}`}>
                        ✓
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastTrackHubView;
