
import React, { useState, useMemo } from 'react';
import { Language, MasteryLevel } from '../types';
import { translations } from '../translations';
import { MASTERY_LEVEL_ORDER, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  onBack: () => void;
  onApply: (level: MasteryLevel, system: string, category: string) => void;
}

type CurriculumCategory = 'Academic' | 'Historical Standards' | 'Learning Method' | 'Music';

const GradeConverterView: React.FC<Props> = ({ language, onBack, onApply }) => {
  const [category, setCategory] = useState<CurriculumCategory>('Academic');
  const [subCurriculum, setSubCurriculum] = useState<string>('US (Common Core)');
  const [grade, setGrade] = useState<string>('Grade 1');
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const curricula: Record<CurriculumCategory, Record<string, string[]>> = {
    'Academic': {
      'US (Common Core)': ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'University'],
      'UK (National)': ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'University'],
      'IB (PYP/MYP/DP)': ['PYP 1', 'PYP 2', 'PYP 3', 'PYP 4', 'PYP 5', 'MYP 1', 'MYP 2', 'MYP 3', 'MYP 4', 'MYP 5', 'DP 1', 'DP 2', 'University'],
      'Global Standard': ['Age 3-4', 'Age 5', 'Age 6', 'Age 7', 'Age 8', 'Age 9', 'Age 10', 'Age 11', 'Age 12', 'Age 13', 'Age 14', 'Age 15', 'Age 16', 'Age 17-18', 'University']
    },
    'Historical Standards': {
      'UK (O-Levels 1980s)': ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower 6', 'Upper 6'],
      'Indonesia (Kurikulum 1994)': ['SD Kelas 1', 'SD Kelas 2', 'SD Kelas 3', 'SD Kelas 4', 'SD Kelas 5', 'SD Kelas 6', 'SMP Kelas 1', 'SMP Kelas 2', 'SMP Kelas 3', 'SMA Kelas 1', 'SMA Kelas 2', 'SMA Kelas 3'],
      'US (Early 20th Century)': ['First Reader', 'Second Reader', 'Third Reader', 'Fourth Reader', 'Fifth Reader', 'Grammar School', 'High School']
    },
    'Learning Method': {
      'Kumon': ['Level 7A', 'Level 6A', 'Level 5A', 'Level 4A', 'Level 3A', 'Level 2A', 'Level A', 'Level B', 'Level C', 'Level D', 'Level E', 'Level F', 'Level G', 'Level H', 'Level I', 'Level J', 'Level K', 'Level L', 'Level M', 'Level N', 'Level O', 'Level P'],
      'Montessori': ['Nido', 'Toddler', 'Children House', 'Lower Elementary', 'Upper Elementary', 'Erdkinder', 'High School'],
      'Waldorf/Steiner': ['Early Years', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
    },
    'Music': {
      'ABRSM': ['Initial Grade', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'ARSM', 'DipABRSM', 'LRSM', 'FRSM']
    }
  };

  const mapToLevel = (cat: CurriculumCategory, sub: string, val: string): MasteryLevel => {
    const list = curricula[cat][sub];
    const index = list.indexOf(val);
    if (index === -1) return 'A';
    const levelMap = MASTERY_LEVEL_ORDER;
    const scale = (levelMap.length - 1) / (list.length - 1);
    return levelMap[Math.min(Math.floor(index * scale), levelMap.length - 1)];
  };

  const recommended = useMemo(() => mapToLevel(category, subCurriculum, grade), [category, subCurriculum, grade]);

  return (
    <div className="max-w-6xl mx-auto py-12 animate-fadeIn px-4">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold">
        ← {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple"></div>
        
        <header className="mb-16 text-center">
          <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">{t('gradeConverter')}</h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">{t('converterSubtitle')}</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-10">
            <section>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Category</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(curricula) as CurriculumCategory[]).map(c => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setSubCurriculum(Object.keys(curricula[c])[0]); setGrade(curricula[c][Object.keys(curricula[c])[0]][0]); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${category === c ? 'bg-dare-teal text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">System</label>
              <select 
                value={subCurriculum}
                onChange={(e) => { setSubCurriculum(e.target.value); setGrade(curricula[category][e.target.value][0]); }}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold dark:text-white"
              >
                {Object.keys(curricula[category]).map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </section>

            <section>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Grade</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold dark:text-white"
              >
                {curricula[category][subCurriculum].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </section>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-dare-gold/10 to-dare-gold/5 p-10 rounded-[3rem] text-center border-4 border-dare-gold/20 border-dashed">
              <p className="text-[10px] font-black text-dare-gold uppercase tracking-widest mb-4">{t('recommendedLevel')}</p>
              <div className="text-[12rem] font-black text-dare-gold leading-none drop-shadow-2xl">{recommended}</div>
              <p className="text-gray-500 font-bold mb-8 px-8">
                Based on <span className="text-dare-gold">{subCurriculum}</span> ({category}), your recommended darewast Level is {recommended}.
              </p>
              <button 
                onClick={() => onApply(recommended, subCurriculum, category)}
                className="w-full py-5 bg-dare-teal text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-[1.02] transition-all"
              >
                🚀 {t('applyToAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeConverterView;
