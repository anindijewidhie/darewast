
import React, { useState } from 'react';
import { Subject, Language } from '../types';
import { translations } from '../translations';
import { LANGUAGES } from '../constants';

interface Props {
  subject: Subject;
  language: Language;
  initialSelected: string[];
  initialSecondaryLanguage?: Language;
  onClose: () => void;
  onSave: (specializations: string[], secondaryLanguage?: Language) => void;
}

const SpecializationModal: React.FC<Props> = ({ subject, language, initialSelected, initialSecondaryLanguage, onClose, onSave }) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [songLanguage, setSongLanguage] = useState<Language>(initialSecondaryLanguage || language);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const isVocal = subject.id === 'music-vocal';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`p-10 bg-gradient-to-r from-dare-teal to-dare-purple text-white relative`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">{subject.icon}</div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2">Academic DNA: {subject.name}</h3>
            <p className="text-white/80 font-medium">Select specific sub-disciplines to focus your mastery path.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {isVocal && (
            <section className="animate-fadeIn">
               <h4 className="text-[10px] font-black text-dare-teal uppercase tracking-[0.3em] mb-4">Target Song Language</h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                 {LANGUAGES.map(lang => (
                   <button 
                    key={lang}
                    onClick={() => setSongLanguage(lang)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${songLanguage === lang ? 'bg-dare-teal border-dare-teal text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 border-transparent text-gray-500 hover:border-dare-teal/40'}`}
                   >
                     {lang}
                   </button>
                 ))}
               </div>
               <div className="mt-8 mb-4 border-t border-gray-100 dark:border-slate-800"></div>
            </section>
          )}

          <section>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">{isVocal ? 'Vocal Genres' : 'Focus Areas'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subject.availableSpecializations?.map(option => {
                const isActive = selected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`p-6 rounded-[2rem] text-left border-2 transition-all flex items-center justify-between group ${
                      isActive 
                      ? 'border-dare-teal bg-dare-teal/5 shadow-lg' 
                      : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-400'
                    }`}
                  >
                    <span className={`font-black uppercase tracking-widest text-xs ${isActive ? 'text-dare-teal' : ''}`}>{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${isActive ? 'bg-dare-teal border-dare-teal text-white' : 'border-gray-300'}`}>
                      {isActive && <span className="text-[10px]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          
          {selected.length === 0 && (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 text-center">
              <p className="text-sm font-bold text-amber-600">Please select at least one focus area to begin.</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white dark:bg-slate-900 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs border border-gray-200 dark:border-slate-700 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={selected.length === 0}
            onClick={() => onSave(selected, isVocal ? songLanguage : undefined)}
            className="flex-1 py-4 bg-dare-teal text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            Confirm DNA Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecializationModal;
