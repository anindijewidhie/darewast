
import React, { useState, useMemo } from 'react';
import { Language, MasteryLevel } from '../types';
import { translations } from '../translations';
import { MASTERY_LEVEL_ORDER, LEVEL_METADATA } from '../constants';
import { mapExternalCurriculum } from '../services/geminiService';

interface Props {
  language: Language;
  onBack: () => void;
  onApply: (level: MasteryLevel, system: string, category: string) => void;
}

type CurriculumCategory = 
  | 'Academic (Western)' 
  | 'Academic (Asia-Pacific)' 
  | 'Inclusion & Special Needs' 
  | 'Global Nomadic & Diplomatic' 
  | 'Work-Integrated (PLAR)'
  | 'Fine Arts' 
  | 'Specialized Methods';

type TransferContext = 'nomadic' | 'working' | 'special_needs' | 'standard';

const GradeConverterView: React.FC<Props> = ({ language, onBack, onApply }) => {
  const [category, setCategory] = useState<CurriculumCategory>('Academic (Western)');
  const [subCurriculum, setSubCurriculum] = useState<string>('US (Common Core)');
  const [grade, setGrade] = useState<string>('Grade 1');
  const [transferContext, setTransferContext] = useState<TransferContext>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [aiResult, setAiResult] = useState<{ level: MasteryLevel; explanation: string; comparison: string } | null>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const curricula: Record<CurriculumCategory, Record<string, string[]>> = {
    'Academic (Western)': {
      'US (Common Core)': ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Post-Secondary'],
      'UK (National)': ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Undergrad'],
      'Finland (Nordic)': ['Esikoulu', 'Luokka 1', 'Luokka 2', 'Luokka 3', 'Luokka 4', 'Luokka 5', 'Luokka 6', 'Luokka 7', 'Luokka 8', 'Luokka 9', 'Lukio 1', 'Lukio 2', 'Lukio 3'],
      'IB (Full Continuum)': ['PYP 1-5', 'MYP 1-5', 'DP 1-2', 'Advanced Research']
    },
    'Academic (Asia-Pacific)': {
      'Japan (Monbu)': ['Primary 1-6', 'Junior High 1-3', 'Senior High 1-3', 'University'],
      'China (Gaokao)': ['Primary 1-6', 'Junior Middle 1-3', 'Senior Middle 1-3', 'Elite Undergrad'],
      'Singapore (O/A)': ['Primary 1-6', 'Secondary 1-4', 'JC 1-2', 'University'],
      'Indonesia (Merdeka)': ['PAUD', 'SD 1-6', 'SMP 7-9', 'SMA 10-12', 'PTN/S']
    },
    'Inclusion & Special Needs': {
      'IEP (Tier Logic)': ['Tier 1 (Foundational)', 'Tier 2 (Supported)', 'Tier 3 (Intensive)', 'Functional Life Skills', 'Pre-Vocational Inclusion'],
      'Sensory Pathways': ['Stage 1 (Regulate)', 'Stage 2 (Engage)', 'Stage 3 (Mastery)', 'Applied Integration'],
      'ASD Support Track': ['Level 1 Support', 'Level 2 Support', 'Level 3 Support', 'Independent Transition']
    },
    'Global Nomadic & Diplomatic': {
      'UN International (ISA)': ['Early Childhood', 'Primary A-C', 'Middle A-C', 'Diploma Stage', 'Global Citizen Research'],
      'US State Dept (Overseas)': ['Pre-Departure 1', 'Overseas Grade 1-5', 'Overseas Grade 6-8', 'Global High School 9-12'],
      'Nomadic/Homeschool Net': ['Foundation Blocks', 'Modular Phase I', 'Modular Phase II', 'Advanced Portfolio']
    },
    'Work-Integrated (PLAR)': {
      'Professional Competency': ['Level 1 (Entry)', 'Level 2 (Junior)', 'Level 3 (Senior)', 'Level 4 (Expert)', 'Architect/Executive'],
      'Apprenticeship Std': ['Year 1 Apprentice', 'Year 2 Apprentice', 'Journeyman Stage', 'Master Craftsman'],
      'Technical Cert Track': ['Foundational Cert', 'Associate Cert', 'Professional Cert', 'Expert/Master Cert']
    },
    'Specialized Methods': {
      'Kumon (Standard)': ['Level 7A-2A', 'Level A-F', 'Level G-L', 'Level M-O', 'Level P', 'Beyond P'],
      'Montessori (Planes)': ['Plane 1 (Early)', 'Plane 2 (Childhood)', 'Plane 3 (Adol)', 'Plane 4 (Maturity)'],
      'Waldorf/Steiner': ['Kindergarten', 'Class 1-4', 'Class 5-8', 'Class 9-12']
    },
    'Fine Arts': {
      'ABRSM/Trinity': ['Initial-Grade 3', 'Grade 4-5', 'Grade 6-8', 'Diploma (Dip)', 'Fellowship (FRSM)'],
      'RAD (Dance)': ['Primary', 'Grade 1-5', 'Grade 6-8', 'Vocational Intermediate', 'Advanced 2']
    }
  };

  const mapToLevel = (cat: CurriculumCategory, sub: string, val: string): MasteryLevel => {
    const list = curricula[cat][sub];
    const index = list.indexOf(val);
    if (index === -1) return 'A';
    
    const standardLevels = MASTERY_LEVEL_ORDER.filter(l => !l.includes('Beyond'));
    let scaleFactor = (standardLevels.length - 1) / (list.length - 1);
    
    if (cat === 'Academic (Asia-Pacific)') scaleFactor *= 1.05;
    if (cat === 'Inclusion & Special Needs') scaleFactor *= 0.85; // Slower, deeper increments
    
    const targetIdx = Math.min(Math.floor(index * scaleFactor), standardLevels.length - 1);
    return standardLevels[targetIdx];
  };

  const currentPresetLevel = useMemo(() => mapToLevel(category, subCurriculum, grade), [category, subCurriculum, grade]);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsConverting(true);
    setAiResult(null);
    try {
      const result = await mapExternalCurriculum(searchQuery, language, transferContext);
      setAiResult(result);
    } catch (err) {
      alert("Curriculum Mapping Engine requires more specific identifiers.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 animate-fadeIn px-4 md:px-6">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-teal flex items-center transition-all font-black uppercase text-xs tracking-widest group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
        <div className="px-4 py-1.5 bg-dare-teal/10 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-dare-teal/20">
          Inclusive Transfer Protocol v6.0
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left: Configuration Sector */}
        <div className="lg:col-span-5 space-y-8">
          {/* Situation Context Selector */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white border border-white/10 shadow-2xl">
            <h4 className="text-[10px] font-black text-dare-teal uppercase tracking-[0.3em] mb-4">Transfer Situation</h4>
            <div className="grid grid-cols-2 gap-2">
              {(['standard', 'nomadic', 'working', 'special_needs'] as TransferContext[]).map(ctx => (
                <button
                  key={ctx}
                  onClick={() => setTransferContext(ctx)}
                  className={`py-3 px-2 rounded-xl text-[8px] font-black uppercase transition-all ${transferContext === ctx ? 'bg-dare-teal text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {ctx.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-dare-teal"></div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">📋</span>
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">Transfer Registry</h3>
            </div>
            
            <div className="space-y-8">
              <section>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Region / Philosophy</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(curricula) as CurriculumCategory[]).map(c => (
                    <button
                      key={c}
                      onClick={() => { 
                        setCategory(c); 
                        setSubCurriculum(Object.keys(curricula[c])[0]); 
                        setGrade(curricula[c][Object.keys(curricula[c])[0]][0]); 
                        setAiResult(null);
                      }}
                      className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${category === c ? 'bg-dare-teal text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>

              <section className="animate-fadeIn">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Select Target System</label>
                <select 
                  value={subCurriculum}
                  onChange={(e) => { 
                    setSubCurriculum(e.target.value); 
                    setGrade(curricula[category][e.target.value][0]); 
                    setAiResult(null);
                  }}
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-black text-xs uppercase tracking-widest dark:text-white transition-all appearance-none cursor-pointer shadow-inner"
                >
                  {Object.keys(curricula[category]).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </section>

              <section className="animate-fadeIn">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Current Milestone / Grade</label>
                <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {curricula[category][subCurriculum].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setGrade(opt); setAiResult(null); }}
                      className={`px-2 py-3 rounded-xl text-[8px] font-black uppercase transition-all text-center leading-tight ${grade === opt ? 'bg-dare-teal/10 border-2 border-dare-teal text-dare-teal' : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent text-gray-400'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black group-hover:scale-110 transition-transform">🔍</div>
             <h3 className="text-xl font-black mb-2">Unlisted System Search</h3>
             <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">AI analysis of niche or historic tracks</p>
             
             <form onSubmit={handleGlobalSearch} className="space-y-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. 1990s French Special Ed Levels"
                  spellCheck={true}
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-dare-gold transition-all"
                />
                <button 
                  disabled={isConverting || !searchQuery.trim()}
                  className="w-full py-5 bg-dare-gold text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-dare-gold/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isConverting ? 'Synthesizing Data...' : 'Analyze & Map Context'}
                </button>
             </form>
          </div>
        </div>

        {/* Right: Output Sector */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 md:p-20 shadow-2xl border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden flex flex-col justify-center min-h-[700px]">
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple opacity-40"></div>
              
              <div className="space-y-4 mb-12 animate-fadeIn">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-dare-teal animate-pulse"></div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">{aiResult ? 'Neural Alignment Confirmed' : 'Institutional Calibration'}</p>
                 </div>
                 <h4 className="text-3xl font-black dark:text-white tracking-tighter">
                   {aiResult ? searchQuery : `${subCurriculum}: ${grade}`}
                 </h4>
              </div>

              <div className="relative inline-block mb-12 animate-float">
                 <div className="absolute inset-0 bg-dare-teal/10 rounded-full blur-[90px] animate-pulse-slow"></div>
                 <div className="relative text-[14rem] md:text-[18rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-dare-teal via-dare-purple to-dare-gold leading-none tracking-tighter transition-all duration-1000">
                    {aiResult ? aiResult.level : currentPresetLevel}
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl border border-white/10 whitespace-nowrap">
                    darewast Master Grade
                 </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[3.5rem] p-10 md:p-14 border border-gray-100 dark:border-slate-700 text-left animate-fadeIn">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dare-teal/10 text-dare-teal flex items-center justify-center text-2xl">🎓</div>
                      <div>
                        <h5 className="font-black text-sm uppercase tracking-widest dark:text-white">Transition Strategy</h5>
                        <p className="text-[10px] font-bold text-gray-400">Context: {transferContext.replace('_', ' ')}</p>
                      </div>
                    </div>
                 </div>

                 <p className="text-xl font-bold text-gray-600 dark:text-gray-300 leading-relaxed italic mb-10">
                   "{aiResult ? aiResult.explanation : `Equates to ${LEVEL_METADATA[currentPresetLevel].equivalency} standards. Based on your profile, darewast will prioritize ${transferContext === 'nomadic' ? 'global continuity' : (transferContext === 'working' ? 'practical theory bridges' : 'sensory-adaptive increments')}.`}"
                 </p>
                 
                 {aiResult && (
                   <div className="pt-10 border-t border-gray-200 dark:border-slate-700 animate-fadeIn mb-10">
                      <h6 className="text-[10px] font-black text-dare-gold uppercase tracking-[0.3em] mb-4">Universal Equivalencies</h6>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                        {aiResult.comparison}
                      </p>
                   </div>
                 )}

                 <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => onApply(aiResult ? aiResult.level : currentPresetLevel, aiResult ? searchQuery : subCurriculum, category)}
                      className="flex-[2] py-6 bg-dare-teal text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-dare-teal/30 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      🚀 Initialize Mastery Pathway
                    </button>
                    <button 
                      onClick={() => {
                        const lvl = aiResult ? aiResult.level : currentPresetLevel;
                        alert(`Path Anchored to Level ${lvl}. Personalizing nodes for ${transferContext}...`);
                      }}
                      className="flex-1 py-6 bg-white dark:bg-slate-700 text-gray-500 rounded-3xl font-black text-sm transition-all hover:bg-gray-100 border-2 border-gray-100 dark:border-slate-600"
                    >
                      ⚓ Anchor
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="p-10 border-4 border-dashed border-gray-100 dark:border-slate-800 rounded-[4rem] text-center bg-white/30 dark:bg-slate-900/30">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] leading-relaxed">
                Academic equivalence for nomadic and special needs scholars is architected using global standards ISO-ACAD-INCL-9001. <br/>
                Every human with a mastery ambition has a place in the darewast grid.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GradeConverterView;
