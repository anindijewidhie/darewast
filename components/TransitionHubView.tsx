
import React, { useState } from 'react';
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
  outgrowthGrades: string[];
  sourceMethod: 'Kumon' | 'Sakamoto' | 'Eye Level' | 'Wink Smart Learning';
  label: string;
  compatibleTypes: DistanceSchoolType[];
  color: string;
  icon: string;
  outgrowthDesc: string;
}

const EXTERNAL_PROTOCOLS: TransitionProtocol[] = [
  { 
    sourceMethod: 'Kumon', 
    label: "Kumon Mastery Transition", 
    compatibleTypes: ['6-3-3', '8-3', '7-3'], 
    color: '#1e40af', 
    icon: '📘',
    outgrowthGrades: ['Grade 6', 'Grade 9', 'Grade 12'],
    outgrowthDesc: "For Kumon alumni who have mastered G6, G9, or G12 equivalency. Upgrades calculation speed into deep logical application."
  },
  { 
    sourceMethod: 'Sakamoto', 
    label: "Sakamoto Logic Transition", 
    compatibleTypes: ['8-3', '6-3-3', '7-3'], 
    color: '#b91c1c', 
    icon: '📐',
    outgrowthGrades: ['Grade 6', 'Grade 9'],
    outgrowthDesc: "For Sakamoto alumni. Translates linear logic-modeling into high-rigor academic research and interdisciplinary synthesis."
  },
  { 
    sourceMethod: 'Eye Level', 
    label: "Eye Level Critical Transition", 
    compatibleTypes: ['7-3', '6-3-3', '8-3'], 
    color: '#047857', 
    icon: '👁️',
    outgrowthGrades: ['Grade 6', 'Grade 9'],
    outgrowthDesc: "For Eye Level alumni. Extends critical reasoning paths into professional ethics and complex scientific inquiry."
  },
  { 
    sourceMethod: 'Wink Smart Learning', 
    label: "Wink Smart Learning Transition", 
    compatibleTypes: ['6-3-3', '4-4-4', '8-4'], 
    color: '#ec4899', 
    icon: '✨',
    outgrowthGrades: ['Age 6', 'Age 7'],
    outgrowthDesc: "For Wink Smart Learning graduates aged 6-7. Bridges early childhood sensory-play mastery into formal school-age academic rigor."
  }
];

const TransitionHubView: React.FC<Props> = ({ user, language, onBack, onEnroll, onStartLesson }) => {
  const [selectedExternal, setSelectedExternal] = useState<TransitionProtocol | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<DistanceSchoolType | null>(null);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const handleEnroll = () => {
    if (!selectedExternal || !selectedGrade || !targetType) return;
    
    const program: TransitionProgram = {
      id: `trans-${selectedExternal.sourceMethod}-${Date.now()}`,
      targetAge: user.age,
      targetTypes: [targetType],
      yearsRemaining: 2,
      enrolledDate: new Date().toISOString(),
      sourceMethod: selectedExternal.sourceMethod,
      legacyGrade: selectedGrade
    };
    onEnroll(program);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mb-16 border-b-[12px] border-dare-teal">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 uppercase tracking-tighter">Trinity</div>
        <div className="absolute inset-0 bg-gradient-to-tr from-dare-teal/10 via-transparent to-dare-purple/10 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal/20 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-teal/30">
            🗓️ Alumni Bridging Program • Trinity Phase
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">Universal Transition</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs max-w-3xl mx-auto leading-relaxed">
            Grade-based transition for Kumon, Sakamoto, and Eye Level alumni. <br/> Compatible with 6-3-3, 8-3, and 7-3 distance school frameworks.
          </p>
        </div>
      </header>

      {!user.transitionProgram ? (
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black dark:text-white mb-4 uppercase tracking-tighter">Legacy Method Selection</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              Your transition is determined by your completed grade level, ensuring your current mastery is the anchor of your new path.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {EXTERNAL_PROTOCOLS.map(proto => (
              <button 
                key={proto.sourceMethod}
                onClick={() => { setSelectedExternal(proto); setSelectedGrade(null); setTargetType(null); }}
                className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex flex-col justify-between group h-full relative overflow-hidden ${selectedExternal?.sourceMethod === proto.sourceMethod ? 'border-dare-teal bg-dare-teal/5 shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
              >
                <div>
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner bg-gray-50 dark:bg-slate-800 mb-8 group-hover:scale-110 transition-all duration-500 border border-gray-100 dark:border-slate-700">
                    {proto.icon}
                  </div>
                  <h3 className="text-2xl font-black dark:text-white mb-2 leading-tight">{proto.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">{proto.outgrowthDesc}</p>
                </div>
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entry Available For</p>
                   <p className="text-xs font-black text-dare-teal uppercase">{proto.outgrowthGrades.join(' / ')}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedExternal && (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-gray-100 dark:border-slate-800 shadow-2xl animate-scale-in space-y-12 relative overflow-hidden">
               <div className="grid md:grid-cols-2 gap-12">
                  <section>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-6">1. Completed Legacy Grade</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedExternal.outgrowthGrades.map(grade => (
                        <button
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedGrade === grade ? 'bg-dare-teal text-white shadow-xl scale-110' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className={selectedGrade ? 'opacity-100' : 'opacity-30 pointer-events-none'}>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-6">2. Target Distance System</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedExternal.compatibleTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setTargetType(type)}
                          className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${targetType === type ? 'bg-dare-gold text-white shadow-xl scale-110' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100'}`}
                        >
                          System {type}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest italic">Optimized compatible program for {selectedExternal.sourceMethod} foundation.</p>
                  </section>
               </div>

               {selectedGrade && targetType && (
                 <div className="bg-slate-900 text-white p-10 rounded-[3rem] border border-white/5 shadow-2xl animate-fadeIn text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dare-teal to-dare-gold animate-gradient-x"></div>
                    <div className="relative z-10 space-y-4">
                       <h3 className="text-3xl font-black tracking-tighter">Initialize {selectedExternal.sourceMethod} Bridge</h3>
                       <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                         "Bridging {selectedGrade} logic to the <span className="text-dare-teal font-black">{targetType}</span> grid ensures your legacy mastery is officially recognized globally."
                       </p>
                    </div>
                    
                    <button 
                       onClick={handleEnroll}
                       className="relative z-10 px-16 py-7 bg-dare-teal text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-dare-teal/40 hover:scale-105 active:scale-95 transition-all group overflow-hidden"
                    >
                      <span className="relative z-10">Confirm Transition Enrollment 🚀</span>
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-12 items-start">
           <div className="lg:col-span-8 space-y-12">
              <section className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[4rem] border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black text-dare-teal">BRIDGE</div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Active {user.transitionProgram.sourceMethod} Bridge</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Initialized via {user.transitionProgram.legacyGrade}</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                     Target Program {user.transitionProgram.targetTypes[0]}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                  {SUBJECTS.slice(0, 9).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => onStartLesson(sub, true)}
                      className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-dare-teal hover:bg-white dark:hover:bg-slate-800 transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-xl h-48"
                    >
                      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {sub.icon}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[8px] font-black text-dare-teal uppercase tracking-[0.2em] mb-1 truncate">Transition Path</p>
                        <h4 className="text-lg font-black dark:text-white truncate">{sub.name}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
           </div>

           <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-dare-teal/5 rounded-full blur-3xl"></div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Legacy Pedigree</p>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                        {EXTERNAL_PROTOCOLS.find(p => p.sourceMethod === user.transitionProgram?.sourceMethod)?.icon || '🏛️'}
                       </div>
                       <div>
                          <p className="font-black dark:text-white uppercase tracking-tighter leading-none">{user.transitionProgram.sourceMethod} Alumni</p>
                          <p className="text-[9px] font-black text-dare-teal uppercase tracking-widest mt-1">System {user.transitionProgram.targetTypes[0]} Compat</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 text-center relative group">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Equivalent Bridge Grade</p>
                    <p className="text-5xl font-black text-dare-teal group-hover:scale-110 transition-transform duration-500">{user.transitionProgram.legacyGrade}</p>
                 </div>

                 <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Year-Round Access</p>
                    <p className="text-sm font-medium text-gray-500 italic leading-relaxed text-center px-4">
                      "Bridging your legacy speed into the universal grid. Every week provides a new slot for mastery verification."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TransitionHubView;
