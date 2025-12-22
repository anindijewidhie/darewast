
import React from 'react';
import { Certificate as CertificateType, Language } from '../types';
import { translations } from '../translations';
import { LEVEL_METADATA } from '../constants';

interface Props {
  certificate: CertificateType;
  language: Language;
  onClose: () => void;
}

const Certificate: React.FC<Props> = ({ certificate, language, onClose }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;
  const levelInfo = LEVEL_METADATA[certificate.level as any];
  const isMaintenance = levelInfo?.type === 'maintenance';
  const isFastTrack = certificate.programType === 'fast-track';
  const isSuperior = certificate.score >= 10.0;

  const handlePrint = () => {
    window.print();
  };

  // Color Mapping for Designs
  const primaryColor = isSuperior ? 'dare-teal' : (isFastTrack ? 'rose-600' : (isMaintenance ? 'dare-purple' : 'dare-gold'));
  const accentColor = isSuperior ? 'emerald-500' : (isFastTrack ? 'rose-500' : (isMaintenance ? 'pink-600' : 'yellow-600'));
  const bgColor = isSuperior ? 'bg-emerald-50 dark:bg-emerald-950/20' : (isFastTrack ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900');
  const borderColor = isSuperior ? 'border-emerald-500/40' : (isFastTrack ? 'border-rose-500/30' : (isMaintenance ? 'border-dare-purple/30' : 'border-dare-gold/30'));

  const getScoreColor = (score: number) => {
    if (score >= 10.0) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 6.0) return 'text-dare-gold';
    if (score >= 4.0) return 'text-dare-teal';
    return 'text-rose-500';
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static print:inset-auto print:backdrop-blur-none`}>
      <div className={`relative max-w-4xl w-full ${bgColor} rounded-[3rem] shadow-2xl overflow-hidden border-8 ${borderColor} print:shadow-none print:border-dare-gold print:rounded-none print:max-w-none print:w-[210mm] print:h-[297mm] print:mx-auto print:flex print:flex-col print:justify-center`}>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full flex items-center justify-center text-2xl transition-all z-10 print:hidden"
        >
          ✕
        </button>

        {(isFastTrack || isSuperior) && (
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] ${isSuperior ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full blur-[100px] animate-pulse`}></div>
            <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] ${isSuperior ? 'bg-dare-teal' : 'bg-rose-500'} rounded-full blur-[100px] animate-pulse`} style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.02)_20px,rgba(0,0,0,0.02)_40px)]"></div>
          </div>
        )}

        <div className="p-12 md:p-20 text-center relative print:p-16">
          <div className={`absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-${primaryColor} rounded-tl-3xl opacity-50 print:opacity-100 print:top-12 print:left-12`}></div>
          <div className={`absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-${primaryColor} rounded-tr-3xl opacity-50 print:opacity-100 print:top-12 print:right-12`}></div>
          <div className={`absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-${primaryColor} rounded-bl-3xl opacity-50 print:opacity-100 print:bottom-12 print:left-12`}></div>
          <div className={`absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-${primaryColor} rounded-br-3xl opacity-50 print:opacity-100 print:bottom-12 print:right-12`}></div>

          <div className="mb-12 print:mb-16">
            <div className={`w-24 h-24 bg-gradient-to-br rounded-full mx-auto flex items-center justify-center text-white text-5xl shadow-xl mb-8 print:shadow-none print:scale-125 from-${primaryColor} to-${accentColor} shadow-${primaryColor}/30`}>
              {isSuperior ? '💎' : (isFastTrack ? '⚡' : (isMaintenance ? '🛠️' : '🏅'))}
            </div>
            
            {isSuperior && (
              <div className="inline-block px-4 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-emerald-600/20">
                Superior Mastery Achievement
              </div>
            )}
            
            {isFastTrack && !isSuperior && (
              <div className="inline-block px-4 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-rose-600/20">
                Fast Track Program
              </div>
            )}

            <h2 className={`text-${primaryColor} text-sm font-black uppercase tracking-[0.5em] mb-2 print:text-lg`}>
              {isMaintenance 
                ? "Certificate of Sustained Mastery" 
                : (isSuperior ? "Superior Mastery Diploma" : (isFastTrack ? "Certificate of Accelerated Mastery" : t('certificateTitle')))
              }
            </h2>
            <div className={`w-20 h-1 mx-auto rounded-full bg-${primaryColor}/30 print:w-32`}></div>
          </div>

          <p className="text-gray-400 dark:text-gray-500 italic mb-4 font-serif text-xl print:text-2xl print:text-gray-600">{t('certificateSubtitle')}</p>
          <h3 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight font-serif uppercase print:text-7xl print:mb-14">{certificate.userName}</h3>
          
          <div className="mb-8 flex flex-col md:flex-row justify-center items-center gap-6">
             <div className="inline-flex flex-col items-center p-6 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-700 min-w-[200px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('scoreLabel')}</p>
                <p className={`text-5xl font-black ${getScoreColor(certificate.score)} tracking-tighter`}>{certificate.score.toFixed(1)} <span className="text-xl opacity-40">/ 10,0</span></p>
                <div className="mt-3 px-4 py-1 bg-white dark:bg-slate-900 rounded-full border border-gray-100 dark:border-slate-700">
                   <p className="text-[10px] font-black uppercase text-gray-500">{certificate.gradeDescription}</p>
                </div>
             </div>

             <div className="inline-flex flex-col items-center p-6 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-700 min-w-[200px]">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mastery Level</p>
                <p className={`text-5xl font-black text-${primaryColor} tracking-tighter`}>{certificate.level}</p>
                <div className="mt-3 px-4 py-1 bg-white dark:bg-slate-900 rounded-full border border-gray-100 dark:border-slate-700">
                   <p className="text-[10px] font-black uppercase text-gray-500">{levelInfo?.equivalency}</p>
                </div>
             </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg max-w-2xl mx-auto leading-relaxed print:text-2xl print:max-w-2xl print:text-gray-700">
            {isMaintenance 
              ? <>has successfully demonstrated ongoing excellence and maintenance of <span className={`text-${primaryColor} font-black`}>{certificate.subjectName}</span></>
              : <>{t('certificateFooter')} <span className="text-dare-teal font-black">{certificate.subjectName}</span></>
            } {t('atLevel')} <span className={`text-${primaryColor} font-black`}>{certificate.level}</span>. 
            This dual-metric achievement verifies both <span className="font-bold">curriculum completion</span> and <span className="font-bold">technical proficiency</span>.
          </p>

          <div className="grid grid-cols-3 items-end mt-12 print:mt-32">
            <div className="text-left">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Verification ID: {certificate.verificationId}</p>
              <div className="w-full h-px bg-gray-200 dark:bg-slate-800 mb-4 print:bg-gray-400"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Date of Mastery</p>
              <p className="text-sm font-bold dark:text-white print:text-lg">{certificate.date}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-2 border-dare-teal/20 rounded-full flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all print:opacity-100 print:grayscale-0 print:border-dare-teal/40 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black bg-${primaryColor}`}>d</div>
              </div>
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Accepted via Level (Schools/Academies)<br/>& Level or Score (Uni / Corporations)</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Institutional Anchor</p>
              <div className="w-full h-px bg-gray-200 dark:bg-slate-800 mb-4 print:bg-gray-400"></div>
              <p className={`text-sm font-bold uppercase text-${primaryColor} print:text-lg`}>
                darewast GLOBAL SEAL
              </p>
              <p className="text-[8px] font-black text-gray-400 uppercase">ISO: ACAD-9001-SYNTH</p>
            </div>
          </div>

          <div className="mt-16 flex justify-center print:hidden">
            <button 
              onClick={handlePrint} 
              className={`px-10 py-4 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 bg-${primaryColor} shadow-${primaryColor}/20`}
            >
              📥 {t('downloadCertificate')}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #root, #root * {
            visibility: hidden;
          }
          .fixed {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            visibility: visible !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .fixed * {
            visibility: visible !important;
          }
          .fixed button, .fixed .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          .dark {
            background-color: white !important;
            color: black !important;
          }
          .dark .bg-slate-900, .dark .bg-rose-950\\/20, .dark .bg-emerald-950\\/20 {
            background-color: white !important;
          }
          .dark .text-white {
            color: black !important;
          }
        }
      `}} />
    </div>
  );
};

export default Certificate;
