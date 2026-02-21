
import React, { useState } from 'react';
import { CreativeSession, Language } from '../types';

interface Props {
  session: CreativeSession;
  language: Language;
}

const CreativeStudio: React.FC<Props> = ({ session, language }) => {
  const [activeStep, setActiveStep] = useState(0);

  const getAccentColor = () => {
    switch (session.type) {
      case 'notation': return 'dare-teal';
      case 'choreography': return 'rose-500';
      case 'blueprint': return 'blue-500';
      case 'craft-guide': return 'dare-gold';
      default: return 'dare-teal';
    }
  };

  const accent = getAccentColor();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
      <div className={`p-10 bg-gradient-to-br from-slate-900 to-slate-950 text-white relative`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-black uppercase tracking-tighter">{session.type}</div>
        <div className="relative z-10 space-y-4">
           <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${accent}/20 text-${accent} rounded-lg text-[10px] font-black uppercase tracking-widest border border-${accent}/30`}>
              ✨ {session.type === 'notation' ? 'Musical Logic' : session.type === 'choreography' ? 'Movement Synthesis' : 'Technical Blueprint'}
           </div>
           <h3 className="text-3xl md:text-4xl font-black tracking-tighter">{session.title}</h3>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{session.interactionPrompt}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* Interaction Stage */}
        <div className="lg:col-span-8 p-10 bg-gray-50 dark:bg-slate-950 flex flex-col justify-center min-h-[400px]">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-inner border border-gray-100 dark:border-slate-800 relative group overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-${accent}`}></div>
              
              {session.type === 'notation' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                      <span>Rhythmic Logic</span>
                      <span className={`text-${accent}`}>BPM: 120</span>
                   </div>
                   <div className="flex flex-col items-center gap-6 py-10">
                      <p className="text-4xl font-sans font-black tracking-[0.2em] text-center dark:text-white leading-relaxed select-all bg-gray-50 dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                         {session.data}
                      </p>
                      <button className={`px-10 py-4 bg-${accent} text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-${accent}/30 hover:scale-105 active:scale-95 transition-all`}>
                        Generate Neural Audio 🎙️
                      </button>
                   </div>
                </div>
              )}

              {session.type === 'choreography' && (
                <div className="space-y-10 animate-fadeIn">
                   <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                      <span>Tempo Node: 8-Count Synthesis</span>
                   </div>
                   <div className="grid grid-cols-4 gap-4 h-32 items-end">
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <div key={n} className={`flex-1 rounded-2xl transition-all duration-500 border-b-8 ${activeStep === n-1 ? `bg-${accent} border-black/20 h-full shadow-lg` : 'bg-gray-100 dark:bg-slate-800 h-1/2 opacity-30 border-transparent'}`}></div>
                      ))}
                   </div>
                   <div className="p-8 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 text-center">
                      <p className="text-2xl font-black dark:text-white leading-none mb-2">Count {activeStep + 1}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                         {session.steps[activeStep]?.label || 'Initialization'}
                      </p>
                   </div>
                </div>
              )}

              {session.type === 'blueprint' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="aspect-video bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 pattern-grid-lg opacity-20"></div>
                      <div className="text-center relative z-10 space-y-4">
                         <p className="text-5xl">📐</p>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Axiomatic Draft Layer Active</p>
                      </div>
                      {/* Simulated overlaying lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                         <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#3B82F6" strokeWidth="1" strokeDasharray="5,5" />
                         <line x1="90%" y1="20%" x2="10%" y2="80%" stroke="#3B82F6" strokeWidth="1" strokeDasharray="5,5" />
                      </svg>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      {session.steps.slice(0, 4).map((s, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                           <p className="text-[8px] font-black text-blue-500 uppercase mb-1">{s.label}</p>
                           <p className="text-xs font-bold dark:text-white">{s.value || 'Verified'}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {session.type === 'craft-guide' && (
                <div className="space-y-8 animate-fadeIn">
                   <div className="flex items-center gap-6 p-6 bg-dare-gold/5 rounded-3xl border border-dare-gold/20">
                      <div className="w-20 h-20 bg-dare-gold/10 text-dare-gold rounded-2xl flex items-center justify-center text-4xl shadow-inner">🧶</div>
                      <div>
                         <h4 className="text-lg font-black dark:text-white uppercase tracking-tighter">Material Logic Matrix</h4>
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-widest italic leading-relaxed">Synthesizing optimal technical paths for this node.</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {session.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                           <span className="w-8 h-8 rounded-lg bg-dare-gold/10 text-dare-gold flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                           <div>
                              <p className="text-sm font-black dark:text-white leading-none mb-1">{step.label}</p>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">{step.details}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Control Sidebar */}
        <div className="lg:col-span-4 p-10 border-l border-gray-100 dark:border-slate-800 flex flex-col justify-between">
           <div className="space-y-10">
              <section>
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Interaction Nodes</h4>
                 <div className="space-y-3">
                    {session.steps.map((step, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`w-full p-5 rounded-2xl text-left border-2 transition-all group ${activeStep === i ? `border-${accent} bg-${accent}/5 shadow-lg` : 'border-gray-50 dark:border-slate-800 hover:border-gray-200'}`}
                      >
                         <p className={`text-[10px] font-black uppercase transition-colors ${activeStep === i ? `text-${accent}` : 'text-gray-400'}`}>Node {(i+1).toString().padStart(2, '0')}</p>
                         <p className="text-xs font-black dark:text-white uppercase tracking-tighter">{step.label}</p>
                      </button>
                    ))}
                 </div>
              </section>
           </div>

           <div className="mt-12 p-8 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                 Interactive sessions are dynamically synthesized based on your academic DNA and preferred learning style.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;
