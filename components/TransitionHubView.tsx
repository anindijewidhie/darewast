
import React, { useState, useMemo } from 'react';
import { Subject, Language, User, DistanceSchoolType, TransitionProgram } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onEnroll: (program: TransitionProgram) => void;
  onStartLesson: (sub: Subject, isTransition: boolean) => void;
}

interface TransitionProtocol {
  age: number;
  label: string;
  targetTypes: DistanceSchoolType[];
  prepLabelKey: string;
  color: string;
  icon: string;
}

const TRANSITION_PROTOCOLS: TransitionProtocol[] = [
  { age: 5, label: "5-Year-Old Prep", targetTypes: ['7-4', '4-3-4', '8-3', '4-4-3'], prepLabelKey: 'prepForPrimary', color: '#10AC84', icon: '🎨' },
  { age: 6, label: "6-Year-Old Prep", targetTypes: ['5-5', '7-3'], prepLabelKey: 'prepForPrimary', color: '#10AC84', icon: '🧩' },
  { age: 11, label: "11-Year-Old Prep", targetTypes: ['5-5'], prepLabelKey: 'prepForSecondary', color: '#F368E0', icon: '📐' },
  { age: 12, label: "12-Year-Old Prep", targetTypes: ['4-4-4', '8-4', '7-4', '4-3-4'], prepLabelKey: 'prepForHigh', color: '#B953CC', icon: '🧪' },
  { age: 13, label: "13-Year-Old Prep", targetTypes: ['6-3-3', '8-3', '4-4-3', '7-3'], prepLabelKey: 'prepForHigh', color: '#B953CC', icon: '📜' },
];

const TransitionHubView: React.FC<Props> = ({ user, language, onBack, onEnroll, onStartLesson }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const eligibleProtocol = useMemo(() => {
    return TRANSITION_PROTOCOLS.find(p => p.age === user.age);
  }, [user.age]);

  const handleEnroll = () => {
    if (!eligibleProtocol) return;
    const program: TransitionProgram = {
      id: `trans-${user.age}-${Date.now()}`,
      targetAge: user.age,
      targetTypes: eligibleProtocol.targetTypes,
      yearsRemaining: 2,
      enrolledDate: new Date().toISOString()
    };
    onEnroll(program);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      {!eligibleProtocol ? (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 text-center shadow-2xl border border-gray-100 dark:border-slate-800">
           <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-8">⏳</div>
           <h2 className="text-3xl font-black mb-4 dark:text-white">Transition Protocol Inactive</h2>
           <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
             These 2-year bridging programs are specifically calibrated for students aged 5, 6, 11, 12, or 13. Your profile is currently on the standard mastery track.
           </p>
        </div>
      ) : (
        <div className="space-y-12">
          <header className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 uppercase tracking-tighter">Bridge</div>
             <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal/20 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-teal/30">
                  🗓️ 2-Year Transition Program
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{t('transitionProgramTitle')}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-sm max-w-2xl mx-auto">
                  {eligibleProtocol.label} • {t(eligibleProtocol.prepLabelKey)}
                </p>
                
                {!user.transitionProgram && (
                  <div className="pt-8">
                    <button 
                      onClick={handleEnroll}
                      className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                    >
                      🚀 {t('startTransition')}
                    </button>
                  </div>
                )}
             </div>
          </header>

          {user.transitionProgram && (
            <div className="grid lg:grid-cols-12 gap-12 items-start">
               <div className="lg:col-span-8 space-y-12">
                  <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Supplementary Bridging Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SUBJECTS.slice(0, 4).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onStartLesson(sub, true)}
                          className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 hover:border-dare-teal transition-all text-left flex items-center gap-6 group"
                        >
                          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                            {sub.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mb-1">Bridge Mode</p>
                            <h4 className="text-xl font-black dark:text-white">{sub.name}</h4>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
               </div>

               <div className="lg:col-span-4 lg:sticky lg:top-24">
                  <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-10">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('targetInstitutions')}</p>
                        <div className="flex flex-wrap gap-2">
                           {eligibleProtocol.targetTypes.map(type => (
                             <span key={type} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs font-black dark:text-white">Type {type}</span>
                           ))}
                        </div>
                     </div>
                     
                     <div className="p-8 bg-gray-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('yearsRemaining')}</p>
                        <p className="text-6xl font-black text-dare-teal">2.0</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Academic Cycles</p>
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                          "This protocol aligns your current mastery level with the specific requirements of your target school structure."
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionHubView;
