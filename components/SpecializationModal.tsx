
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
  const [customTopic, setCustomTopic] = useState('');
  
  const t = (key: string) => translations[language]?.[key] || translations['English']?.[key] || key;

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = customTopic.trim();
    if (topic && !selected.includes(topic)) {
      setSelected([...selected, topic]);
      setCustomTopic('');
    }
  };

  const isVocal = subject.id === 'music-vocal';
  const displayOptions = subject.suggestedSubTopics || [];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`p-10 bg-gradient-to-r from-dare-teal to-dare-purple text-white relative`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">{subject.icon}</div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-2">Academic DNA: {subject.name}</h3>
            <p className="text-white/80 font-medium">Calibrate your personalized chapter logic for unlimited variations.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {isVocal && (
            <section className="animate-fadeIn">
               <h4 className="text-[10px] font-black text-dare-teal uppercase tracking-[0.3em] mb-4">Target Language (Vocal Focus)</h4>
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
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Suggested Sub-Disciplines</h4>
            <div className="flex flex-wrap gap-2">
              {displayOptions.map(option => {
                const isActive = selected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`px-5 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                      isActive 
                      ? 'border-dare-teal bg-dare-teal text-white shadow-lg' 
                      : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-400 hover:border-dare-teal/30'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Custom Mastery Focus</h4>
            <form onSubmit={addCustom} className="flex gap-2">
               <input 
                 type="text"
                 value={customTopic}
                 onChange={(e) => setCustomTopic(e.target.value)}
                 placeholder="Enter any interest (e.g. Space Exploration, Robotics)..."
                 className="flex-1 p-4 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-purple rounded-2xl outline-none font-bold text-sm dark:text-white transition-all shadow-inner"
               />
               <button 
                 type="submit"
                 className="px-6 py-4 bg-dare-purple text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-dare-purple/20 active:scale-95 transition-all"
               >
                 Add
               </button>
            </form>
          </section>

          {selected.length > 0 && (
            <section className="animate-fadeIn">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Active Synthesis Markers</h4>
               <div className="flex flex-wrap gap-2">
                  {selected.map(s => (
                    <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest animate-fadeIn">
                       <span>{s}</span>
                       <button onClick={() => toggle(s)} className="text-dare-teal hover:text-rose-500">✕</button>
                    </div>
                  ))}
               </div>
            </section>
          )}
          
          {selected.length === 0 && (
            <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-dashed border-amber-200 dark:border-amber-900/30 text-center">
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-relaxed italic">
                "Specialization is the key to deep mastery. Select a focus area to theme your upcoming unlimited chapters."
              </p>
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
            onClick={() => onSave(selected, isVocal ? songLanguage : undefined)}
            className="flex-1 py-4 bg-dare-teal text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Update DNA Synthesis
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecializationModal;
