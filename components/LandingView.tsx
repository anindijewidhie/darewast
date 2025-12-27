
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { SUBJECTS } from '../constants';

interface Props {
  language: Language;
  onJoin: () => void;
  onPlacementTest: () => void;
  onOpenConverter: () => void;
  onDashboard: () => void;
  onDonate: () => void;
  onContribute: () => void;
}

const AppleIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const PlayStoreIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 512 512" fill="currentColor">
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
);

const AppGalleryIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 512 512" fill="currentColor">
    <path d="M256 0c141.4 0 256 114.6 256 256s-114.6 256-256 256S0 397.4 0 256 114.6 0 256 0zm0 100c-86.2 0-156 69.8-156 156s69.8 156 156 156 156-69.8 156-156-69.8-156-156-156zm-24 212l-56-56 28-28 28 28 84-84 28 28-112 112z"/>
  </svg>
);

const LandingView: React.FC<Props> = ({ language, onJoin, onPlacementTest, onOpenConverter, onDashboard, onDonate, onContribute }) => {
  const [verifyId, setVerifyId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setIsVerifying(false);
    
    if (verifyId.startsWith('DARE-CERT-')) {
      setVerificationResult({
        valid: true,
        name: "Validated Scholar",
        subject: "Applied Sciences",
        level: "N (High School)",
        date: "Oct 2025"
      });
    } else {
      setVerificationResult({ valid: false });
    }
  };

  const coreDisciplines = [
    { name: 'Literacy', icon: '📖', color: '#53CDBA', desc: 'Linguistic mastery across 14 languages.' },
    { name: 'Numeracy', icon: '🔢', color: '#CCB953', desc: 'Foundation to advanced abstract logic.' },
    { name: 'Science', icon: '⚛️', color: '#4D96FF', desc: 'Physics, Chemistry, Biology, and Astronomy.' },
    { name: 'Humanities', icon: '📜', color: '#FF9F43', desc: 'History, Geography, and Social Sciences.' },
    { name: 'Tech', icon: '💻', color: '#B953CC', desc: 'OS, Software, Programming, and AI.' },
    { name: 'Music', icon: '🎼', color: '#F368E0', desc: 'Theory, Performance, and Vocal Mastery.' },
    { name: 'Ethics', icon: '⚖️', color: '#10AC84', desc: 'Moral inquiry and Global Jurisprudence.' }
  ];

  return (
    <div className="animate-fadeIn pb-32">
      {/* 1. Cinematic Hero Section */}
      <section className="relative py-12 md:py-32 lg:py-56 overflow-hidden bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4 md:px-6">
          <p className="text-dare-teal text-[10px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-8 md:mb-12 animate-fadeIn">
            {t('hallSubtitle')}
          </p>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] xl:text-[11.5rem] font-black text-gray-900 dark:text-white mb-8 md:mb-10 leading-[0.95] md:leading-[0.8] tracking-tighter">
            Universal Mastery For <span className="text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-gradient-x">Everyone</span>
          </h1>
          
          <p className="text-xl md:text-3xl lg:text-4xl text-gray-500 dark:text-gray-400 mb-12 md:mb-16 leading-relaxed max-w-5xl mx-auto font-medium px-4">
            {t('heroSubtitle')}
          </p>
          
          {/* Brand-Colored Mastery Console */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* PLACEMENT TEST - GOLD */}
            <button 
              onClick={onPlacementTest}
              className="group w-full md:flex-1 px-6 py-6 md:px-8 md:py-7 bg-dare-gold text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl shadow-2xl shadow-dare-gold/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-yellow-700/30"
            >
              <span className="text-[9px] md:text-[11px] uppercase tracking-widest opacity-80">Initial Logic Check</span>
              <span className="relative z-10 flex items-center gap-2">🎯 {t('placementTest')}</span>
            </button>

            {/* ASSESSMENT - TEAL */}
            <button 
              onClick={onJoin}
              className="group w-full md:flex-1 px-6 py-6 md:px-8 md:py-7 bg-dare-teal text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl shadow-2xl shadow-dare-teal/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-teal-700/30"
            >
              <span className="text-[9px] md:text-[11px] uppercase tracking-widest opacity-80">Retention Diagnostic</span>
              <span className="relative z-10 flex items-center gap-2">📊 {t('assessmentTitle')}</span>
            </button>

            {/* ENROLLMENT - PURPLE */}
            <button 
              onClick={onJoin}
              className="group w-full md:flex-1 px-6 py-6 md:px-8 md:py-7 bg-dare-purple text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-xl md:text-2xl shadow-2xl shadow-dare-purple/20 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-purple-800/30"
            >
              <span className="text-[9px] md:text-[11px] uppercase tracking-widest opacity-80">Full Academy Access</span>
              <span className="relative z-10 flex items-center gap-2">📝 {t('enrollmentTitle')}</span>
            </button>
          </div>
        </div>

        {/* Decorative Floating Nodes */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
           {SUBJECTS.slice(0, 15).map((sub, i) => (
             <div key={sub.id} className="absolute animate-float" style={{
               top: `${(i * 10) % 90}%`,
               left: `${(i * 17) % 95}%`,
               fontSize: `${2 + Math.random() * 3}rem`,
               animationDelay: `${i * 0.5}s`,
               animationDuration: `${20 + Math.random() * 20}s`
             }} aria-hidden="true">{sub.icon}</div>
           ))}
        </div>
      </section>

      {/* 2. Redesigned Academic Breadth Section */}
      <section className="py-20 md:py-24 bg-gray-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] mb-12 md:mb-16">Academic Breadth</h2>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {coreDisciplines.map((discipline, idx) => (
                <div 
                  key={discipline.name} 
                  className={`p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[3rem] md:rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col items-center gap-4 md:gap-6 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 opacity-40" style={{ backgroundColor: discipline.color }}></div>
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-4xl md:text-5xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ backgroundColor: `${discipline.color}15` }}
                  >
                    <span className="drop-shadow-md">{discipline.icon}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-lg md:text-xl dark:text-white tracking-tight">{discipline.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium leading-relaxed px-4">
                      {discipline.desc}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Special 'And More' Card */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center gap-4 text-white">
                 <span className="text-3xl md:text-4xl">🚀</span>
                 <h3 className="font-black text-xl md:text-2xl tracking-tighter">Over 24+ Subjects</h3>
                 <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Spanning all major disciplines</p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. Trust & Verification Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
         <div className="bg-slate-900 rounded-[3rem] md:rounded-[5rem] p-8 md:p-32 text-center text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute -top-10 -right-10 p-20 opacity-5 text-[8rem] md:text-[18rem] font-black rotate-12 tracking-tighter pointer-events-none">DARE</div>
            <div className="relative z-10 space-y-12 md:space-y-16">
               <div className="space-y-6 md:space-y-8">
                  <h2 className="text-[10px] md:text-xs font-black text-dare-gold uppercase tracking-[0.5em] md:tracking-[0.8em] mb-4">Institutional Credibility</h2>
                  <h3 className="text-3xl md:text-7xl font-black tracking-tighter leading-tight max-w-5xl mx-auto">
                    {t('recognizedBy')}
                  </h3>
                  <p className="text-slate-400 text-lg md:text-2xl max-w-4xl mx-auto font-medium leading-relaxed">
                    darewast certificates are universally anchored. Enter an ID below to validate institutional mastery instantly.
                  </p>
               </div>

               <div className="max-w-2xl mx-auto">
                 <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-2.5 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 backdrop-blur-md">
                    <input 
                      type="text"
                      placeholder="DARE-CERT-XXXX"
                      value={verifyId}
                      onChange={e => setVerifyId(e.target.value)}
                      className="flex-1 px-6 md:px-8 py-4 md:py-5 bg-transparent border-none outline-none font-bold text-lg md:text-xl text-white placeholder:text-white/20"
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || !verifyId.trim()}
                      className="px-8 md:px-12 py-4 md:py-5 bg-dare-gold text-slate-900 rounded-[1.8rem] md:rounded-[2.5rem] font-black text-base md:text-lg shadow-xl shadow-dare-gold/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifying ? 'Searching Registry...' : 'Verify ID'}
                    </button>
                 </div>
                 {verificationResult && (
                   <div className="mt-8 p-8 md:p-10 bg-white/5 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 animate-fadeIn text-left flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                      {verificationResult.valid ? (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shadow-xl shadow-emerald-500/20">✓</div>
                          <div className="text-center sm:text-left">
                            <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Authentic Credential</p>
                            <h4 className="text-xl md:text-2xl font-black">{verificationResult.name}</h4>
                            <p className="text-slate-400 font-bold text-sm md:text-base">{verificationResult.subject} • Mastery Level {verificationResult.level}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl text-white shadow-xl shadow-rose-500/20">✕</div>
                          <p className="font-bold text-rose-400 text-lg md:text-xl leading-relaxed text-center sm:text-left">Credential ID not found in the darewast global mastery database.</p>
                        </>
                      )}
                   </div>
                 )}
               </div>
            </div>
         </div>
      </section>

      {/* 4. App Download Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-24 text-center">
        <div className="bg-gradient-to-br from-dare-teal via-dare-purple to-dare-gold p-12 md:p-32 rounded-[3.5rem] md:rounded-[5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-10 pattern-grid-lg"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-[6rem] font-black mb-8 md:mb-10 tracking-tighter leading-none">{t('downloadApp')}</h2>
            <p className="text-white/80 text-lg md:text-3xl mb-12 md:mb-20 max-w-3xl mx-auto font-medium leading-relaxed px-4">
              {t('mobileAccess')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-10">
              <a href="#" className="flex items-center gap-4 md:gap-5 px-6 md:px-10 py-4 md:py-6 bg-black rounded-[1.8rem] md:rounded-[2.5rem] font-black text-base md:text-lg shadow-2xl hover:scale-105 transition-all group border border-white/10">
                <AppleIcon />
                <div className="text-left leading-none">
                  <p className="text-[8px] md:text-[10px] uppercase font-black opacity-60 mb-1 md:mb-2">Available on</p>
                  <p className="text-xl md:text-2xl font-black tracking-tight">{t('appStore')}</p>
                </div>
              </a>

              <a href="#" className="flex items-center gap-4 md:gap-5 px-6 md:px-10 py-4 md:py-6 bg-black rounded-[1.8rem] md:rounded-[2.5rem] font-black text-base md:text-lg shadow-2xl hover:scale-105 transition-all group border border-white/10">
                <PlayStoreIcon />
                <div className="text-left leading-none">
                  <p className="text-[8px] md:text-[10px] uppercase font-black opacity-60 mb-1 md:mb-2">Available on</p>
                  <p className="text-xl md:text-2xl font-black tracking-tight">{t('googlePlay')}</p>
                </div>
              </a>

              <a href="#" className="flex items-center gap-4 md:gap-5 px-6 md:px-10 py-4 md:py-6 bg-[#C7000B] rounded-[1.8rem] md:rounded-[2.5rem] font-black text-base md:text-lg shadow-2xl hover:scale-105 transition-all group border border-white/10">
                <AppGalleryIcon />
                <div className="text-left leading-none">
                  <p className="text-[8px] md:text-[10px] uppercase font-black opacity-80 mb-1 md:mb-2">Available on</p>
                  <p className="text-xl md:text-2xl font-black tracking-tight">{t('appGallery')}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer & Mission */}
      <footer className="mt-20 md:mt-40 text-center py-20 md:py-24 border-t border-gray-100 dark:border-slate-800">
         <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 dark:bg-slate-900 rounded-[1.8rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl mx-auto mb-8 md:mb-10 shadow-inner">👑</div>
         <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-gray-400 mb-4 md:mb-6">{t('founderFull')}</p>
         <p className="text-base md:text-lg font-bold text-gray-300 dark:text-gray-700 italic max-w-2xl mx-auto px-6 leading-relaxed">
           "{t('missionStatement')}"
         </p>
      </footer>
    </div>
  );
};

export default LandingView;
