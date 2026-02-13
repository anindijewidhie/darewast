
import React, { useState, useMemo } from 'react';
import { Language, MasteryLevel, CurriculumCluster } from '../types';
import { translations } from '../translations';
import { MASTERY_LEVEL_ORDER, LEVEL_METADATA } from '../constants';
import { mapExternalCurriculum } from '../services/geminiService';

interface Props {
  language: Language;
  onBack: () => void;
  onApply: (level: MasteryLevel, system: string, category: string) => void;
}

const GradeConverterView: React.FC<Props> = ({ language, onBack, onApply }) => {
  const [cluster, setCluster] = useState<CurriculumCluster>('Academic (Global)');
  const [subSystem, setSubSystem] = useState<string>('US (Common Core)');
  const [currentLevel, setCurrentLevel] = useState<string>('Grade 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [aiResult, setAiResult] = useState<{ level: MasteryLevel; explanation: string; comparison: string } | null>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const registry: Record<CurriculumCluster, Record<string, string[]>> = {
    'Academic (Global)': {
      'US (Common Core)': ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College Fr', 'College So', 'College Jr', 'College Sr'],
      'UK (National)': ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12 (Sixth)', 'Year 13 (Sixth)', 'Undergrad'],
      'IB (Continuum)': ['PYP 1-5', 'MYP 1-3', 'MYP 4-5', 'DP 1', 'DP 2', 'Advanced Research'],
      'Indonesia (Merdeka)': ['PAUD/TK', 'SD Kelas 1', 'SD Kelas 2', 'SD Kelas 3', 'SD Kelas 4', 'SD Kelas 5', 'SD Kelas 6', 'SMP Kelas 7', 'SMP Kelas 8', 'SMP Kelas 9', 'SMA Kelas 10', 'SMA Kelas 11', 'SMA Kelas 12', 'Perguruan Tinggi']
    },
    'Methods (Kumon/EyeLevel)': {
      'Kumon (Math/Eng)': ['Level 7A-4A', 'Level 3A-2A', 'Level A1-B2', 'Level C1-D2', 'Level E1-F2', 'Level G1-H2', 'Level I1-J2', 'Level K1-L2', 'Level M1-N2', 'Level O', 'Level P'],
      'Sakamoto (Logic)': ['Intro Level', 'Grade 1 Logic', 'Grade 2 Logic', 'Grade 3 Logic', 'Grade 4 Logic', 'Grade 5 Logic', 'Grade 6 Logic', 'Advanced Synthesis'],
      'Eye Level (Global)': ['Levels 1-8', 'Levels 9-16', 'Levels 17-24', 'Levels 25-32']
    },
    'Arts (ABRSM/Suzuki)': {
      'ABRSM (Music)': ['Initial Grade', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'],
      'Suzuki Method': ['Book 1', 'Book 2', 'Book 3', 'Book 4', 'Book 5', 'Book 6', 'Book 7', 'Book 8', 'Book 9', 'Book 10']
    },
    'Vocational (Career)': {
      'Technical Tier': ['Entry (L1)', 'Junior (L2)', 'Technician (L3)', 'Professional (L4)', 'Specialist (L5)'],
      'Corporate Path': ['Graduate Trainee', 'Associate', 'Senior Associate', 'Consultant']
    }
  };

  const calculateMapping = (c: CurriculumCluster, s: string, v: string): MasteryLevel => {
    const list = registry[c][s];
    const index = list.indexOf(v);
    if (index === -1) return 'A';
    const standardLevels = MASTERY_LEVEL_ORDER.filter(l => !l.includes('Beyond'));
    let scaleFactor = (standardLevels.length - 1) / (list.length - 1);
    const targetIdx = Math.min(Math.floor(index * scaleFactor), standardLevels.length - 1);
    return standardLevels[targetIdx];
  };

  const currentMappedLevel = useMemo(() => calculateMapping(cluster, subSystem, currentLevel), [cluster, subSystem, currentLevel]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-12 text-gray-400 hover:text-dare-teal flex items-center transition-all font-black uppercase text-xs tracking-widest group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-dare-gold dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border-4 border-white/20 relative overflow-hidden">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <span className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center text-lg">📊</span>
                 Mapping Registry
              </h3>

              <div className="space-y-8">
                 <section>
                    <label className="text-[10px] font-black text-white uppercase tracking-widest block mb-4">Curriculum Cluster</label>
                    <div className="grid grid-cols-2 gap-2">
                       {(Object.keys(registry) as CurriculumCluster[]).map(c => (
                         <button key={c} onClick={() => setCluster(c)} className={`py-3 px-2 rounded-xl text-[8px] font-black uppercase transition-all ${cluster === c ? 'bg-white text-dare-gold shadow-lg' : 'bg-white/10 text-white/60'}`}>{c}</button>
                       ))}
                    </div>
                 </section>

                 <section>
                    <label className="text-[10px] font-black text-white uppercase tracking-widest block mb-4">Milestone</label>
                    <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {registry[cluster][subSystem].map(lvl => (
                         <button key={lvl} onClick={() => setCurrentLevel(lvl)} className={`p-3 rounded-xl text-[8px] font-black uppercase transition-all ${currentLevel === lvl ? 'bg-white text-dare-gold shadow-lg' : 'bg-white/10 text-white/60'}`}>{lvl}</button>
                       ))}
                    </div>
                 </section>
              </div>
           </div>
        </div>

        <div className="lg:col-span-7">
           <div className="bg-dare-gold dark:bg-slate-900 rounded-[4rem] p-12 md:p-20 shadow-2xl border-4 border-white/20 text-center relative overflow-hidden min-h-[600px] flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-4 bg-white/20 animate-pulse"></div>
              <div className="relative inline-block mb-12 animate-float">
                 <div className="absolute inset-0 bg-white/20 rounded-full blur-[100px] animate-pulse"></div>
                 <div className="relative text-[15rem] md:text-[20rem] font-black text-white leading-none tracking-tighter transition-all duration-1000">
                    {aiResult ? aiResult.level : currentMappedLevel}
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">
                    darewast Master Grade
                 </div>
              </div>

              <div className="bg-white/20 rounded-[3rem] p-10 border-2 border-white/30 text-left">
                 <h5 className="font-black text-sm uppercase tracking-widest text-white mb-4">Mapping Insight</h5>
                 <p className="text-xl font-bold text-white leading-relaxed italic mb-10">
                   "Equates to {LEVEL_METADATA[currentMappedLevel].equivalency} standards. This coordinate is optimized for the Trinity Method path."
                 </p>
                 <button onClick={() => onApply(currentMappedLevel, subSystem, cluster)} className="w-full py-6 bg-white text-dare-gold rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">🚀 Set as Primary Academic Path</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GradeConverterView;
