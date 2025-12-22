
import React, { useState } from 'react';
import { Subject, Language, User } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';
import { generateHybridLesson } from '../services/geminiService';

interface Props {
  language: Language;
  user: User;
  onBack: () => void;
  onLaunch: (lesson: any) => void;
}

const LessonCombinationView: React.FC<Props> = ({ language, user, onBack, onLaunch }) => {
  const [selected, setSelected] = useState<Subject[]>([]);
  const [isFusing, setIsFusing] = useState(false);
  const [fusingStep, setFusingStep] = useState(0); // 0: Start, 1: Connecting, 2: Synthesizing
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const toggleSubject = (sub: Subject) => {
    if (selected.find(s => s.id === sub.id)) {
      setSelected(selected.filter(s => s.id !== sub.id));
    } else if (selected.length < 2) {
      setSelected([...selected, sub]);
    }
  };

  const handleFuse = async () => {
    if (selected.length !== 2) return;
    setIsFusing(true);
    setFusingStep(1);
    
    // Aesthetic timing for fusion animation steps
    const stepTimer = setInterval(() => {
      setFusingStep(prev => (prev < 2 ? prev + 1 : 2));
    }, 2000);

    try {
      const lesson = await generateHybridLesson(selected[0], selected[1], language, user);
      onLaunch(lesson);
    } catch (err) {
      alert(t('errorGenerating'));
      setIsFusing(false);
    } finally {
      clearInterval(stepTimer);
    }
  };

  if (isFusing) {
    const steps = [
      t('fusingKnowledge'),
      "Finding Interdisciplinary Bridges...",
      "Designing Hybrid Exercises..."
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-fadeIn p-6">
        <div className="relative group">
          {/* Outer Ring */}
          <div className="w-48 h-48 border-[12px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin"></div>
          {/* Inner Counter-rotating Ring */}
          <div className="absolute inset-4 border-[12px] border-dare-purple/10 border-b-dare-purple rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
          {/* Center Pulsing Content */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse">
            <span className="relative">
               {fusingStep === 0 ? '⚛️' : fusingStep === 1 ? '🧠' : '🧬'}
               <span className="absolute -inset-4 bg-dare-gold/20 rounded-full blur-xl animate-ping"></span>
            </span>
          </div>
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple mb-4 animate-gradient-x">
            {steps[fusingStep]}
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
            Combining the logical foundations of <span className="text-dare-teal font-black">{selected[0]?.name}</span> with the creative perspectives of <span className="text-dare-purple font-black">{selected[1]?.name}</span>.
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

      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1 bg-dare-gold/10 text-dare-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-gold/20 mb-4">
          Inquiry-Based Learning
        </div>
        <h2 className="text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">{t('lessonCombination')}</h2>
        <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
          Choose two disciplines to reveal their hidden connections. Our AI will synthesize a unique curriculum that bridges theory and practice across both fields.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{t('selectSubjects')}</h3>
            <span className="text-[10px] font-black text-dare-teal uppercase bg-dare-teal/5 px-3 py-1 rounded-lg">
              {selected.length}/2 Selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {SUBJECTS.map(sub => {
              const isSelected = selected.find(s => s.id === sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub)}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all text-center relative overflow-hidden group ${
                    isSelected 
                    ? 'border-dare-teal bg-dare-teal/5 shadow-xl scale-105 z-10' 
                    : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100 hover:border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-dare-teal text-white rounded-2xl flex items-center justify-center text-sm font-black animate-fadeIn shadow-lg">
                      {selected.indexOf(isSelected) + 1}
                    </div>
                  )}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">{sub.icon}</div>
                  <p className="text-xs font-black uppercase tracking-widest dark:text-white group-hover:text-dare-teal transition-colors">{sub.name}</p>
                  {isSelected && <div className="absolute bottom-0 left-0 w-full h-1 bg-dare-teal"></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl text-center relative overflow-hidden">
            {selected.length === 2 && (
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-dare-gold/10 rounded-full blur-3xl"></div>
            )}
            
            <div className="flex justify-center items-center gap-6 mb-10">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner transition-all duration-500 ${selected[0] ? 'bg-dare-teal/10 border-2 border-dare-teal/20 animate-fadeIn rotate-3' : 'bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-100'}`}>
                {selected[0]?.icon || '?'}
              </div>
              <div className="text-3xl font-black text-gray-200 animate-pulse">+</div>
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner transition-all duration-500 ${selected[1] ? 'bg-dare-purple/10 border-2 border-dare-purple/20 animate-fadeIn -rotate-3' : 'bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-100'}`}>
                {selected[1]?.icon || '?'}
              </div>
            </div>

            {selected.length === 2 ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
                  <h4 className="text-xs font-black text-dare-teal uppercase tracking-[0.2em] mb-3">Synthesis Logic</h4>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed">
                    We'll explore how the principles of 
                    <span className="text-dare-teal font-black"> {selected[0].name}</span> intersect with 
                    <span className="text-dare-purple font-black"> {selected[1].name}</span> to reveal a deeper, unified understanding.
                  </p>
                </div>
                <button 
                  onClick={handleFuse}
                  className="w-full py-6 bg-gradient-to-r from-dare-teal to-dare-purple text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.03] hover:shadow-dare-teal/20 active:scale-95 transition-all"
                >
                  {t('startHybridLesson')} 🚀
                </button>
              </div>
            ) : (
              <div className="py-12">
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Awaiting Selection</p>
                <p className="text-gray-300 font-bold text-sm">
                  Choose {2 - selected.length} more subject{selected.length === 0 ? 's' : ''} to begin synthesis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCombinationView;
