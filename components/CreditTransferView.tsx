
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, MasteryLevel } from '../types';
import { translations } from '../translations';
import { MASTERY_LEVEL_ORDER, LEVEL_METADATA } from '../constants';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onBack: () => void;
}

const CreditTransferView: React.FC<Props> = ({ user, progress, language, onBack }) => {
  const [activeSystem, setActiveSystem] = useState<'US' | 'ECTS' | 'Carnegie'>(user.age > 18 ? 'US' : 'Carnegie');
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const creditSummary = useMemo(() => {
    let totalUS = 0;
    let completedSubjects: any[] = [];
    Object.keys(progress).forEach(subId => {
      const subProg = progress[subId];
      const lvlIdx = MASTERY_LEVEL_ORDER.indexOf(subProg.level);
      if (lvlIdx >= MASTERY_LEVEL_ORDER.indexOf('N')) {
        totalUS += 3.0;
        completedSubjects.push({ id: subId, level: subProg.level, units: 3.0 });
      }
    });
    return { totalUS, completedSubjects };
  }, [progress]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-gold flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-dare-gold dark:bg-slate-900 rounded-[4rem] shadow-2xl border-4 border-white/30 overflow-hidden text-white">
        <header className="bg-slate-950 p-12 md:p-24 text-center relative overflow-hidden border-b-8 border-white/10">
           <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] font-black rotate-12 tracking-tighter">UNIT</div>
           <div className="relative z-10 space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">{t('creditTransfer')}</h1>
              <p className="text-dare-gold font-black uppercase tracking-[0.5em] text-sm">Official Universal Credit Ledger</p>
           </div>
        </header>

        <div className="p-8 md:p-20 space-y-16">
           <div className="grid md:grid-cols-3 gap-8">
              <div className="p-10 rounded-[3rem] bg-white/20 border-2 border-white/30 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-2">Total Accumulated Credits</p>
                 <p className="text-7xl font-black">{creditSummary.totalUS.toFixed(1)}</p>
              </div>
           </div>

           <div className="bg-white/10 rounded-[3rem] border-2 border-white/20 p-10 md:p-16">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-12">Academic Transcript</h3>
              <div className="space-y-4">
                 {creditSummary.completedSubjects.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-6 bg-white/10 rounded-2xl border border-white/20">
                        <div>
                           <p className="font-black text-lg leading-none mb-1">{sub.id.toUpperCase()}</p>
                           <p className="text-[10px] font-bold uppercase opacity-70">Mastered at Level {sub.level}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black">{sub.units.toFixed(1)}</p>
                           <p className="text-[8px] font-bold uppercase opacity-50">Units</p>
                        </div>
                    </div>
                 ))}
                 {creditSummary.completedSubjects.length === 0 && <p className="text-center italic opacity-60 py-10">No transferable credits detected.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreditTransferView;
