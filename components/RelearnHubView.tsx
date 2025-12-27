
import React, { useState, useMemo } from 'react';
import { Subject, Language, User, EducationalStage, LessonContent } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';
import { generateRelearnLesson } from '../services/geminiService';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onLaunchRelearn: (lesson: LessonContent) => void;
  onOpenRelearnPlacement: () => void;
}

const RelearnHubView: React.FC<Props> = ({ user, language, onBack, onLaunchRelearn, onOpenRelearnPlacement }) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isFastTrack, setIsFastTrack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const stages: { id: EducationalStage; label: string; icon: string; desc: string; color: string }[] = [
    { id: 'Preschool', label: t('preschoolRelearn'), icon: '🧩', desc: 'Pre-reading, early logic, and motor foundations.', color: 'dare-teal' },
    { id: 'Primary', label: t('primaryRelearn'), icon: '✏️', desc: 'Literacy, arithmetic, and basic life sciences.', color: 'dare-gold' },
    { id: 'Middle', label: t('middleRelearn'), icon: '📐', desc: 'Intermediate math, history, and physical geography.', color: 'orange-500' },
    { id: 'High', label: t('highRelearn'), icon: '🧪', desc: 'Advanced science, linguistics, and legal basics.', color: 'dare-purple' },
    { id: 'University', label: t('uniRelearn'), icon: '🎓', desc: 'Research synthesis, logic, and professional theory.', color: 'blue-500' },
  ];

  const handleStartRelearn = async () => {
    if (!selectedStage || !selectedSubject) return;
    setIsLoading(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 1 ? prev + 1 : 1));
    }, 2500);

    try {
      const lesson = await generateRelearnLesson(selectedSubject, language, selectedStage, user, isFastTrack);
      onLaunchRelearn(lesson);
    } catch (err) {
      alert(t('errorGenerating'));
      setIsLoading(false);
    } finally {
      clearInterval(interval);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-fadeIn p-6">
        <div className="relative">
          <div className={`w-48 h-48 border-[12px] ${isFastTrack ? 'border-rose-500/10 border-t-rose-500 animate-[spin_0.5s_linear_infinite]' : 'border-dare-teal/10 border-t-dare-teal rounded-full animate-spin'}`}></div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse">{isFastTrack ? '⚡' : '🛠️'}</div>
        </div>
        <div className="text-center max-w-md">
          <h2 className={`text-4xl font-black mb-4 uppercase tracking-tighter ${isFastTrack ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
            {loadingStep === 0 ? t('identifyingGaps') : t('synthesizingRecovery')}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
            Personalizing foundations for {user.age}yr scholar • <span className="text-dare-teal">{user.culturalBackground || 'Global'} Context</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mb-16">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 uppercase tracking-tighter">Restore</div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-center gap-2 mb-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal/20 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-teal/30">
               🏥 Academic Restoration Lab
             </div>
             {isFastTrack && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/30 animate-pulse">
                  ⚡ Fast Track Relearn Active
                </div>
             )}
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{t('relearnLab')}</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-sm max-w-2xl mx-auto">
            {t('relearnHubSubtitle')}
          </p>
          
          <div className="pt-8">
             <button 
                onClick={onOpenRelearnPlacement}
                className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
             >
                <span className="text-2xl">🔬</span> Run Restoration Diagnostic Test
             </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">1. Select Restoration Stage</h3>
              
              <button 
                onClick={() => setIsFastTrack(!isFastTrack)}
                className={`flex items-center gap-3 px-6 py-2 rounded-2xl border-2 transition-all ${isFastTrack ? 'border-rose-500 bg-rose-500/5 text-rose-500 shadow-lg' : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-rose-500/30'}`}
              >
                 <span className={`text-xl ${isFastTrack ? 'animate-bounce' : ''}`}>⚡</span>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase leading-none">Fast Track Relearn</p>
                    <p className="text-[8px] font-bold opacity-70">Condensed Recovery</p>
                 </div>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stages.map(stage => {
                const isSelected = selectedStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group ${
                      isSelected 
                      ? `border-${stage.color} bg-${stage.color}/5 shadow-xl scale-[1.02] z-10` 
                      : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{stage.icon}</span>
                      {isSelected && <div className={`w-6 h-6 rounded-full bg-${stage.color} text-white flex items-center justify-center text-[10px]`}>✓</div>}
                    </div>
                    <h4 className={`text-lg font-black dark:text-white mb-2 ${isSelected ? `text-${stage.color}` : ''}`}>{stage.label}</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{stage.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`transition-opacity duration-500 ${selectedStage ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">2. Subject for Gaps Recovery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {SUBJECTS.map(sub => {
                const isSelected = selectedSubject?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub)}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-center group ${
                      isSelected 
                      ? 'border-dare-teal bg-dare-teal/5 shadow-lg' 
                      : 'border-gray-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{sub.icon}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">{sub.name}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl text-center">
            <div className="mb-10">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                {selectedStage ? stages.find(s => s.id === selectedStage)?.icon : '❔'}
              </div>
              <h4 className="text-xl font-black dark:text-white mb-2">Recovery Synthesis</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {selectedStage && selectedSubject 
                  ? `Synthesizing unlimited age-adapted material for ${selectedSubject.name} at ${selectedStage} stage.`
                  : 'Specify stage and subject to begin adaptive node restoration.'
                }
              </p>
            </div>

            {selectedStage && selectedSubject ? (
              <button 
                onClick={handleStartRelearn}
                className={`w-full py-6 text-white rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all ${isFastTrack ? 'bg-rose-600 shadow-rose-600/20' : 'bg-dare-teal shadow-dare-teal/20'}`}
              >
                Restore Concepts {isFastTrack ? '⚡' : '🚀'}
              </button>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration Awaited</p>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 text-left space-y-4">
              <div className="flex gap-4">
                <span className="text-xl">📜</span>
                <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                  Restoration Diplomas are valid academic credentials recognized by workplaces and schools globally.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-xl">🧬</span>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">
                   Age-Adapted • Skill-Adapted • Culture-Adapted Synthesis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelearnHubView;
