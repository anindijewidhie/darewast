
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

  // Credit calculation logic
  const creditSummary = useMemo(() => {
    let totalUS = 0;
    let totalECTS = 0;
    let totalCarnegie = 0;
    const completedSubjects: any[] = [];

    Object.keys(progress).forEach(subId => {
      const subProg = progress[subId];
      const lvlIdx = MASTERY_LEVEL_ORDER.indexOf(subProg.level);
      
      // We only count levels that are completed (High School N+ or Univ Q+)
      // High School levels (N, O, P)
      const hsLevels = MASTERY_LEVEL_ORDER.slice(MASTERY_LEVEL_ORDER.indexOf('N'), MASTERY_LEVEL_ORDER.indexOf('Q'));
      // Univ levels (Q, R, S, T)
      const univLevels = MASTERY_LEVEL_ORDER.slice(MASTERY_LEVEL_ORDER.indexOf('Q'), MASTERY_LEVEL_ORDER.indexOf('Beyond P'));

      let subUS = 0;
      let subECTS = 0;
      let subCarnegie = 0;

      // Calculate HS Units
      hsLevels.forEach(lvl => {
        if (MASTERY_LEVEL_ORDER.indexOf(subProg.level) > MASTERY_LEVEL_ORDER.indexOf(lvl)) {
          subCarnegie += 1.0;
        }
      });

      // Calculate Univ Units
      univLevels.forEach(lvl => {
        if (MASTERY_LEVEL_ORDER.indexOf(subProg.level) > MASTERY_LEVEL_ORDER.indexOf(lvl)) {
          subUS += 3.0;
          subECTS += 6.0;
        }
      });

      if (subUS > 0 || subCarnegie > 0) {
        totalUS += subUS;
        totalECTS += subECTS;
        totalCarnegie += subCarnegie;
        completedSubjects.push({
          id: subId,
          level: subProg.level,
          us: subUS,
          ects: subECTS,
          carnegie: subCarnegie
        });
      }
    });

    return { totalUS, totalECTS, totalCarnegie, completedSubjects };
  }, [progress]);

  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-blue-600 flex items-center transition-all font-bold group print:hidden">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none">
        {/* Header Branding */}
        <header className="bg-slate-950 p-12 md:p-24 text-white relative overflow-hidden text-center border-b-[16px] border-blue-600">
           <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] font-black rotate-12 tracking-tighter pointer-events-none">UNIT</div>
           <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-dare-purple/40 pointer-events-none"></div>
           
           <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/30 backdrop-blur-md mb-4">
                {t('academicGrid')}
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] mb-4">
                {t('creditTransfer')}
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed italic">
                "{t('transferDesc')}"
              </p>
           </div>
        </header>

        <div className="p-8 md:p-20 space-y-16">
           {/* Credit Summary Grid */}
           <div className="grid md:grid-cols-3 gap-8">
              <button 
                onClick={() => setActiveSystem('US')}
                className={`p-10 rounded-[3rem] border-2 transition-all text-center group relative overflow-hidden ${activeSystem === 'US' ? 'border-blue-600 bg-blue-50/10 shadow-2xl' : 'border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50'}`}
              >
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('usCredits')}</p>
                 <p className={`text-6xl font-black transition-colors ${activeSystem === 'US' ? 'text-blue-600' : 'text-gray-300'}`}>{creditSummary.totalUS.toFixed(1)}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase mt-4">{t('semesterHours') || 'Semester Hours'}</p>
              </button>

              <button 
                onClick={() => setActiveSystem('ECTS')}
                className={`p-10 rounded-[3rem] border-2 transition-all text-center group relative overflow-hidden ${activeSystem === 'ECTS' ? 'border-blue-600 bg-blue-50/10 shadow-2xl' : 'border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50'}`}
              >
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('ectsCredits')}</p>
                 <p className={`text-6xl font-black transition-colors ${activeSystem === 'ECTS' ? 'text-blue-600' : 'text-gray-300'}`}>{creditSummary.totalECTS.toFixed(1)}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase mt-4">{t('europeanTransfer') || 'European Credit Transfer'}</p>
              </button>

              <button 
                onClick={() => setActiveSystem('Carnegie')}
                className={`p-10 rounded-[3rem] border-2 transition-all text-center group relative overflow-hidden ${activeSystem === 'Carnegie' ? 'border-blue-600 bg-blue-50/10 shadow-2xl' : 'border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50'}`}
              >
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('hsCredits')}</p>
                 <p className={`text-6xl font-black transition-colors ${activeSystem === 'Carnegie' ? 'text-blue-600' : 'text-gray-300'}`}>{creditSummary.totalCarnegie.toFixed(1)}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase mt-4">{t('carnegieUnits') || 'High School Units'}</p>
              </button>
           </div>

           {/* Transcript Table */}
           <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[3rem] border border-gray-100 dark:border-slate-700 p-10 md:p-16">
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{t('academicTranscript')}</h3>
                 <button 
                  onClick={handlePrintTranscript}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all print:hidden"
                 >
                   📥 {t('generateTranscript')}
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-12 gap-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="col-span-6">{t('subjectAndMastery')}</div>
                    <div className="col-span-2 text-center">{t('usUnits') || 'US Units'}</div>
                    <div className="col-span-2 text-center">{t('ectsUnits') || 'ECTS'}</div>
                    <div className="col-span-2 text-center">{t('hsUnitsShort') || 'HS Units'}</div>
                 </div>
                 <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
                 
                 {creditSummary.completedSubjects.length > 0 ? (
                   creditSummary.completedSubjects.map(sub => (
                    <div key={sub.id} className="grid grid-cols-12 gap-4 items-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="col-span-6 flex items-center gap-4">
                           <span className="text-3xl">📘</span>
                           <div>
                              <p className="font-black text-lg dark:text-white leading-none mb-1">{sub.id.toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase">{t('atLevel')} {sub.level}</p>
                           </div>
                        </div>
                        <div className="col-span-2 text-center font-black text-xl dark:text-white">{sub.us.toFixed(1)}</div>
                        <div className="col-span-2 text-center font-black text-xl dark:text-white">{sub.ects.toFixed(1)}</div>
                        <div className="col-span-2 text-center font-black text-xl dark:text-white">{sub.carnegie.toFixed(1)}</div>
                    </div>
                   ))
                 ) : (
                   <div className="py-20 text-center text-gray-400 font-bold italic">
                      {t('noTransferableCredits')}
                   </div>
                 )}
              </div>
           </div>

           {/* Footer Info */}
           <div className="flex flex-col md:flex-row gap-10 items-center justify-between opacity-60">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 border-2 border-blue-600/20 rounded-full flex items-center justify-center grayscale">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl text-white font-black flex items-center justify-center">d</div>
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest">{t('officialSeal')}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">ISO: ACAD-9001-CREDIT</p>
                 </div>
              </div>
              <p className="max-w-md text-[10px] font-medium text-gray-500 leading-relaxed text-right md:text-right">
                {t('transferLegalDisclaimer') || 'Transfer of credits is subject to the policies of the receiving institution. darewast provides official verification IDs for all academic units displayed on this portal.'}
              </p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .max-w-6xl, .max-w-6xl * { visibility: visible; }
          .max-w-6xl { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .bg-slate-950 { background-color: #000 !important; color: #fff !important; }
          .bg-blue-600 { background-color: #2563eb !important; }
        }
      `}} />
    </div>
  );
};

export default CreditTransferView;
