
import React, { useState } from 'react';
import { LearningMethod, Language, User } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  user: User;
  onBack: () => void;
  onApply: (methods: [LearningMethod, LearningMethod]) => void;
}

const PHILOSOPHIES: { id: LearningMethod; name: string; icon: string; desc: string }[] = [
  { id: 'Kumon-style', name: 'Kumon Style', icon: '📝', desc: 'Atomic incrementalism, daily drills, and computational fluency.' },
  { id: 'Montessori-inspired', name: 'Montessori', icon: '🤲', desc: 'Hands-on learning, autonomy, and concrete-to-abstract logic.' },
  { id: 'Waldorf-aligned', name: 'Waldorf', icon: '🎨', desc: 'Holistic, story-driven, and focused on imagination and rhythm.' },
  { id: 'Traditional-Rote', name: 'Traditional', icon: '🏛️', desc: 'Rigorous memorization, standardized drills, and academic grit.' },
  { id: 'Inquiry-based', name: 'Inquiry', icon: '🔎', desc: 'Socratic questioning, discovery learning, and research-led tasks.' }
];

const MethodCombinationView: React.FC<Props> = ({ language, user, onBack, onApply }) => {
  const [selected, setSelected] = useState<LearningMethod[]>(user.academicDNA?.hybridMethods || []);
  const [isFusing, setIsFusing] = useState(false);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const toggleMethod = (method: LearningMethod) => {
    if (selected.includes(method)) {
      setSelected(selected.filter(m => m !== method));
    } else if (selected.length < 2) {
      setSelected([...selected, method]);
    }
  };

  const handleApply = () => {
    if (selected.length !== 2) return;
    setIsFusing(true);
    setTimeout(() => {
      onApply(selected as [LearningMethod, LearningMethod]);
      setIsFusing(false);
    }, 2500);
  };

  if (isFusing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-fadeIn p-6">
        <div className="relative">
          <div className="w-48 h-48 border-[12px] border-dare-purple/10 border-t-dare-purple rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-[12px] border-pink-500/10 border-b-pink-500 rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse">🧪</div>
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-dare-purple to-pink-500 mb-4 animate-gradient-x">
            {t('fusingMethods')}
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
            Merging the foundations of <span className="text-dare-purple font-black">{selected[0]}</span> and <span className="text-pink-500 font-black">{selected[1]}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-purple flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1 bg-dare-purple/10 text-dare-purple rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-purple/20 mb-4">
          Experimental Pedagogy
        </div>
        <h2 className="text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">{t('methodCombination')}</h2>
        <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
          {t('combineMethodsDesc')}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">{t('selectMethods')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {PHILOSOPHIES.map(p => {
              const isSelected = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleMethod(p.id)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group ${
                    isSelected 
                    ? 'border-dare-purple bg-dare-purple/5 shadow-xl scale-[1.02]' 
                    : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{p.icon}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-dare-purple text-white rounded-full flex items-center justify-center text-xs font-black">
                        {selected.indexOf(p.id) + 1}
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-black dark:text-white mb-2">{p.name}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl text-center">
            <div className="flex justify-center items-center gap-6 mb-10">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner ${selected[0] ? 'bg-dare-purple/10 border-2 border-dare-purple/20' : 'bg-gray-50 dark:bg-slate-800'}`}>
                {PHILOSOPHIES.find(p => p.id === selected[0])?.icon || '?'}
              </div>
              <div className="text-3xl font-black text-gray-200">+</div>
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner ${selected[1] ? 'bg-pink-500/10 border-2 border-pink-500/20' : 'bg-gray-50 dark:bg-slate-800'}`}>
                {PHILOSOPHIES.find(p => p.id === selected[1])?.icon || '?'}
              </div>
            </div>

            {selected.length === 2 ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 bg-gradient-to-br from-dare-purple/5 to-pink-500/5 rounded-2xl border border-dare-purple/20">
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    Your bespoke DNA will now blend 
                    <span className="text-dare-purple font-black"> {selected[0]}</span> with 
                    <span className="text-pink-600 font-black"> {selected[1]}</span> across all generated lessons.
                  </p>
                </div>
                <button 
                  onClick={handleApply}
                  className="w-full py-6 bg-gradient-to-r from-dare-purple to-pink-500 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.03] transition-all"
                >
                  {t('applySynergy')} 🧬
                </button>
              </div>
            ) : (
              <div className="py-12 text-gray-400 font-black uppercase tracking-widest text-xs">
                Choose {2 - selected.length} more philosophy
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodCombinationView;
