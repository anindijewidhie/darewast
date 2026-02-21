
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
  const isElite = certificate.score >= 60;
  const isSuperior = certificate.score >= 95;

  const handlePrint = () => {
    window.print();
  };

  const primaryColor = isSuperior ? 'dare-gold' : (isFastTrack ? 'rose-600' : (isMaintenance ? 'dare-purple' : 'dare-teal'));
  const accentColor = isSuperior ? 'yellow-600' : (isFastTrack ? 'rose-500' : (isMaintenance ? 'pink-600' : 'emerald-600'));
  const bgColor = isSuperior ? 'bg-yellow-50 dark:bg-yellow-950/20' : (isFastTrack ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900');
  const borderColor = isSuperior ? 'border-dare-gold/40' : (isFastTrack ? 'border-rose-500/30' : (isMaintenance ? 'border-dare-purple/30' : 'border-dare-teal/30'));

  const getCareerReadiness = (score: number) => {
    if (score >= 80) return { label: t('highTierJob'), color: 'text-dare-purple' };
    if (score >= 70) return { label: t('midTierJob'), color: 'text-dare-teal' };
    if (score >= 60) return { label: t('lowTierJob'), color: 'text-emerald-500' };
    return { label: 'Pending Professional Rigor', color: 'text-gray-400' };
  };

  const careerInfo = getCareerReadiness(certificate.score);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static print:inset-auto print:backdrop-blur-none`}>
      <div className={`relative max-w-4xl w-full ${bgColor} rounded-[3rem] shadow-2xl overflow-hidden border-8 ${borderColor} print:shadow-none print:border-dare-gold print:rounded-none print:max-w-none print:w-[210mm] print:h-[297mm] print:mx-auto print:flex print:flex-col print:justify-center`}>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full flex items-center justify-center text-2xl transition-all z-10 print:hidden"
        >
          ✕
        </button>

        {/* Global Security Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-45 select-none">
          <p className="text-8xl font-black uppercase">Official Mastery Credential • Authorized Global Entry • darewast Method Certified • ISO-ACAD-SP Verified</p>
        </div>

        <div className="p-10 md:p-16 text-center relative print:p-16">
          <div className={`absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-${primaryColor} rounded-tl-3xl opacity-50 print:opacity-100 print:top-12 print:left-12`}></div>
          <div className={`absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-${primaryColor} rounded-tr-3xl opacity-50 print:opacity-100 print:top-12 print:right-12`}></div>
          <div className={`absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-${primaryColor} rounded-bl-3xl opacity-50 print:opacity-100 print:bottom-12 print:left-12`}></div>
          <div className={`absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-${primaryColor} rounded-br-3xl opacity-50 print:opacity-100 print:bottom-12 print:right-12`}></div>

          <div className="mb-10 print:mb-16">
            <div className={`w-24 h-24 bg-gradient-to-br rounded-full mx-auto flex items-center justify-center text-white text-5xl shadow-xl mb-6 print:shadow-none print:scale-125 from-${primaryColor} to-${accentColor} shadow-${primaryColor}/30`}>
              {isSuperior ? '💎' : (isElite ? '🌟' : '🏅')}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                Universal Entry Certified
              </div>
              {isElite && (
                <div className="inline-block px-3 py-1 bg-dare-gold text-slate-950 rounded-lg text-[8px] font-black uppercase tracking-widest">
                  darewast Elite Registry Ready
                </div>
              )}
            </div>

            <h2 className={`text-${primaryColor} text-sm font-black uppercase tracking-[0.5em] mb-2 print:text-lg`}>
               Accredited Academic Diploma
            </h2>
            <div className={`w-20 h-1 mx-auto rounded-full bg-${primaryColor}/30 print:w-32`}></div>
          </div>

          <p className="text-gray-400 dark:text-gray-500 italic mb-2 font-sans text-lg print:text-2xl print:text-gray-600">This official master credential is awarded to</p>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-10 tracking-tight font-sans uppercase print:text-6xl print:mb-14">{certificate.userName}</h3>
          
          <div className="mb-10 grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
             {/* General Level Path */}
             <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dare-teal/20 text-center flex flex-col justify-center">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Grade</p>
                <p className={`text-4xl font-black text-dare-teal tracking-tighter`}>{certificate.level}</p>
                <p className="text-[7px] font-bold text-gray-500 uppercase mt-2">Accepted Everywhere</p>
             </div>

             {/* Elite Academic Path */}
             <div className={`p-4 rounded-[2rem] border-2 text-center transition-all flex flex-col justify-center ${isElite ? 'bg-dare-gold/5 border-dare-gold shadow-lg' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 opacity-60'}`}>
                <p className={`text-[8px] font-black ${isElite ? 'text-dare-gold' : 'text-gray-400'} uppercase tracking-widest mb-1`}>Exam Rigor Index</p>
                <p className={`text-4xl font-black ${isElite ? 'text-dare-gold' : 'text-gray-300'} tracking-tighter`}>{certificate.score} <span className="text-sm">SP</span></p>
                <p className="text-[7px] font-bold text-gray-500 uppercase mt-2">Elite Floor: 60</p>
             </div>

             {/* Career Readiness Path */}
             <div className={`p-4 rounded-[2rem] border-2 text-center transition-all flex flex-col justify-center ${isElite ? 'bg-dare-purple/5 border-dare-purple shadow-lg' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 opacity-60'}`}>
                <p className={`text-[8px] font-black ${isElite ? 'text-dare-purple' : 'text-gray-400'} uppercase tracking-widest mb-1`}>Professional Entry</p>
                <p className={`text-xl font-black ${careerInfo.color} uppercase tracking-tighter leading-none`}>{careerInfo.label}</p>
                <p className="text-[7px] font-bold text-gray-500 uppercase mt-2">Ladder: 60/70/80</p>
             </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-10 text-base max-w-2xl mx-auto leading-relaxed print:text-xl print:max-w-2xl print:text-gray-700">
            For successful completion of <span className="text-dare-teal font-black">{certificate.subjectName}</span> foundations. 
            Validated via the <span className="text-dare-teal font-black">darewast Unified Method</span> for standard admission and {certificate.score} Skill Points for professional career ladders and top-tier competitive entry.
          </p>

          <div className="grid grid-cols-3 items-end mt-12 print:mt-32">
            <div className="text-left">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Verification ID: {certificate.verificationId}</p>
              <div className="w-full h-px bg-gray-200 dark:bg-slate-800 mb-4 print:bg-gray-400"></div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Accreditation Date</p>
              <p className="text-sm font-bold dark:text-white print:text-lg">{certificate.date}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-2 border-dare-gold/40 rounded-full flex items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all print:opacity-100 print:grayscale-0 print:border-dare-gold/60 mb-3 relative">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black bg-slate-900`}>d</div>
                <div className="absolute -bottom-1 -right-1 bg-dare-gold text-[5px] font-black text-white px-1.5 py-0.5 rounded-full border border-white">SEAL</div>
              </div>
              <p className="text-[6px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">darewast Unified Standard<br/>ISO-ACAD-SP Verified</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 print:text-xs">Official Registrar</p>
              <div className="w-full h-px bg-gray-200 dark:bg-slate-800 mb-4 print:bg-gray-400"></div>
              <p className={`text-xs font-bold uppercase text-${primaryColor} print:text-lg`}>
                darewast GLOBAL REGISTRY
              </p>
              <p className="text-[7px] font-black text-gray-400 uppercase">Standardized Admissions Matrix: ISO-9001</p>
            </div>
          </div>

          <div className="mt-12 flex justify-center print:hidden">
            <button 
              onClick={handlePrint} 
              className={`px-10 py-4 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 bg-slate-900 shadow-slate-900/20`}
            >
              📥 Download admissions-grade certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
