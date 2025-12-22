
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

const LandingView: React.FC<Props> = ({ language, onJoin, onPlacementTest, onOpenConverter, onDashboard, onDonate, onContribute }) => {
  const [verifyId, setVerifyId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    // Simulation of public blockchain/database verification
    await new Promise(r => setTimeout(r, 2000));
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

  const academicBranches = [
    { name: 'darewast for School', desc: 'Supplemental K-12 support.', icon: '🎒', color: 'border-dare-gold' },
    { name: 'darewast for University', desc: 'Academic research complement.', icon: '🏛️', color: 'border-dare-purple' },
    { name: 'Distance School', desc: 'Full K-12 distance institution.', icon: '🌍', color: 'border-orange-500' },
    { name: 'Distance University', desc: 'Degree-track distance academy.', icon: '🎓', color: 'border-blue-500' },
  ];

  const vocationalBranches = [
    { name: 'Vocational School', desc: 'Industrial skills mastery.', icon: '🔧', color: 'border-emerald-500' },
    { name: 'Vocational University', desc: 'Technical engineering tracks.', icon: '🛠️', color: 'border-emerald-700' },
    { name: 'Dist. Vocational School', desc: '24/7 technical distance campus.', icon: '📡', color: 'border-cyan-500' },
    { name: 'Dist. Vocational Uni', desc: 'Advanced professional distance ed.', icon: '🏢', color: 'border-indigo-600' },
  ];

  const platforms = [
    { id: 'web', name: t('webPlatform'), icon: '🌐', color: 'hover:border-dare-teal' },
    { id: 'google', name: t('playStore'), icon: '🤖', color: 'hover:border-emerald-500' },
    { id: 'apple', name: t('appStore'), icon: '🍎', color: 'hover:border-slate-400' },
    { id: 'huawei', name: t('appGallery'), icon: '💠', color: 'hover:border-rose-500' },
  ];

  return (
    <div className="animate-fadeIn pb-32">
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-dare-teal/10 text-dare-teal text-[10px] font-black uppercase tracking-[0.2em] border border-dare-teal/20 backdrop-blur-md">
            <span className="w-2 h-2 bg-dare-teal rounded-full animate-pulse"></span>
            24/7 Unified Academic & Vocational Hub
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black text-gray-900 dark:text-white mb-8 leading-[0.95] tracking-tighter">
            Universal Mastery <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple">
              For Everyone
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            Nine integrated branches covering Independent Study, K-12 Schooling, University Research, and Practical Vocational Excellence in 14 languages.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <button 
              onClick={onPlacementTest}
              className="w-full sm:w-auto px-8 py-5 bg-dare-purple text-white rounded-[2rem] font-black text-lg shadow-xl shadow-dare-purple/20 hover:scale-105 active:scale-95 transition-all"
            >
              Placement Test
            </button>

            <button 
              onClick={onJoin}
              className="group relative w-full sm:w-auto px-10 py-6 bg-dare-teal text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-dare-teal/30 hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              <span className="relative z-10">Enroll in Institution</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button 
              onClick={onOpenConverter}
              className="w-full sm:w-auto px-8 py-5 bg-dare-gold text-white rounded-[2rem] font-black text-lg shadow-xl shadow-dare-gold/20 hover:scale-105 active:scale-95 transition-all"
            >
              Level Assessment
            </button>
          </div>
        </div>

        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
           {SUBJECTS.slice(0, 18).map((sub, i) => (
             <div key={sub.id} className="absolute animate-float" style={{
               top: `${(i * 12) % 85}%`,
               left: `${(i * 19) % 95}%`,
               fontSize: `${1.5 + Math.random() * 2}rem`,
               animationDelay: `${i * 0.4}s`,
               animationDuration: `${10 + Math.random() * 10}s`
             }}>{sub.icon}</div>
           ))}
        </div>
      </section>

      {/* Global Acceptance Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
         <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-20 opacity-5 text-9xl font-black rotate-12">VALIDATED</div>
            <div className="relative z-10 space-y-12">
               <div className="space-y-4">
                  <h2 className="text-xs font-black text-dare-gold uppercase tracking-[0.5em]">{t('acceptancePolicyTitle')}</h2>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Accepted by Academic & Corporate Sectors</h3>
                  <p className="text-slate-400 text-lg md:text-xl max-w-4xl mx-auto font-medium leading-relaxed">
                    darewast subject certificates are universally recognized by institutions on every scale.
                  </p>
               </div>

               <div className="grid md:grid-cols-2 gap-10 text-left">
                  <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">A-T</div>
                     <h4 className="font-black text-2xl mb-4 text-dare-teal">{t('acceptanceLevelBased')}</h4>
                     <p className="text-slate-400 font-medium leading-relaxed">
                        {t('schoolPolicyNote')}
                     </p>
                     <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-dare-teal/20 text-dare-teal rounded-lg text-[10px] font-black uppercase tracking-widest">K-12 Schools</span>
                        <span className="px-3 py-1 bg-dare-teal/20 text-dare-teal rounded-lg text-[10px] font-black uppercase tracking-widest">Academies</span>
                        <span className="px-3 py-1 bg-dare-teal/20 text-dare-teal rounded-lg text-[10px] font-black uppercase tracking-widest">Certain Universities</span>
                     </div>
                  </div>

                  <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">0-10</div>
                     <h4 className="font-black text-2xl mb-4 text-dare-gold">{t('acceptanceScoreBased')}</h4>
                     <p className="text-slate-400 font-medium leading-relaxed">
                        {t('uniCorpPolicyNote')}
                     </p>
                     <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-dare-gold/20 text-dare-gold rounded-lg text-[10px] font-black uppercase tracking-widest">Universities</span>
                        <span className="px-3 py-1 bg-dare-gold/20 text-dare-gold rounded-lg text-[10px] font-black uppercase tracking-widest">Global Companies</span>
                        <span className="px-3 py-1 bg-dare-gold/20 text-dare-gold rounded-lg text-[10px] font-black uppercase tracking-widest">National Agencies</span>
                     </div>
                  </div>
               </div>

               <div className="pt-12">
                  <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                     <div className="flex -space-x-4">
                        <div className="w-14 h-14 bg-white/10 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl shadow-xl">🏫</div>
                        <div className="w-14 h-14 bg-white/10 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl shadow-xl">🏛️</div>
                        <div className="w-14 h-14 bg-white/10 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl shadow-xl">🏢</div>
                     </div>
                     <p className="text-sm font-bold text-slate-400 italic">
                        Accepted by global corporations, national agencies, and local businesses. Benchmarks: <span className="text-dare-gold font-black">6.0 Score</span> or <span className="text-dare-teal font-black">Level P+</span>.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* The 9 Branches Ecosystem */}
      <section className="max-w-7xl mx-auto px-6 space-y-24">
        <div className="text-center">
           <h2 className="text-xs font-black text-dare-teal uppercase tracking-[0.5em] mb-4">Integrated Educational Ecosystem</h2>
           <h3 className="text-4xl md:text-6xl font-black dark:text-white tracking-tight">The Nine Branches</h3>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 group">
            <div className="h-full p-12 rounded-[4rem] bg-white dark:bg-slate-900 border-2 border-dare-teal shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black text-dare-teal group-hover:opacity-10 transition-opacity">1</div>
               <div>
                  <div className="w-24 h-24 bg-dare-teal/10 text-dare-teal rounded-[2rem] flex items-center justify-center text-5xl mb-8 group-hover:rotate-12 transition-transform shadow-inner">📚</div>
                  <h4 className="text-4xl font-black dark:text-white mb-6 leading-tight">Standard <br/>Independent Path</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                    The original Kumon-style mastery. 20+ subjects from Literacy to AI, designed for self-paced, atomic incrementalism.
                  </p>
               </div>
               <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-dare-teal uppercase tracking-widest bg-dare-teal/5 px-4 py-2 rounded-full border border-dare-teal/10">Foundation Branch</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-3">
                 <span className="w-8 h-px bg-gray-200 dark:bg-slate-800"></span> Academic & Distance
               </h5>
               <div className="grid grid-cols-1 gap-4">
                 {academicBranches.map((branch, idx) => (
                   <div key={idx} className={`p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 ${branch.color}/20 hover:${branch.color} shadow-lg transition-all group/card cursor-pointer flex items-center gap-6`}>
                      <div className={`w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover/card:scale-110 transition-transform`}>{branch.icon}</div>
                      <div>
                         <h6 className="font-black dark:text-white text-lg">{branch.name}</h6>
                         <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{branch.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-3">
                 <span className="w-8 h-px bg-gray-200 dark:bg-slate-800"></span> Vocational & Technical
               </h5>
               <div className="grid grid-cols-1 gap-4">
                 {vocationalBranches.map((branch, idx) => (
                   <div key={idx} className={`p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 ${branch.color}/20 hover:${branch.color} shadow-lg transition-all group/card cursor-pointer flex items-center gap-6`}>
                      <div className={`w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-3xl group-hover/card:scale-110 transition-transform`}>{branch.icon}</div>
                      <div>
                         <h6 className="font-black dark:text-white text-lg">{branch.name}</h6>
                         <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{branch.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Certificate Verification Portal */}
        <div className="py-20 max-w-4xl mx-auto px-6">
           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 md:p-16 border-2 border-dashed border-gray-100 dark:border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-gold to-yellow-600"></div>
              <div className="space-y-6 relative z-10">
                 <h4 className="text-xs font-black text-dare-gold uppercase tracking-[0.5em] mb-4">Official Verification Portal</h4>
                 <h3 className="text-4xl font-black dark:text-white tracking-tighter">Recognized Everywhere</h3>
                 <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
                   Enter a Verification ID below to validate a darewast Mastery Certificate instantly. Our digital standards are compatible with global, national, and local institutional registries.
                 </p>
                 
                 <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input 
                      type="text"
                      placeholder="e.g. DARE-CERT-12345678"
                      value={verifyId}
                      onChange={e => setVerifyId(e.target.value)}
                      className="flex-1 px-8 py-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-gold rounded-[2rem] outline-none font-bold text-lg dark:text-white transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || !verifyId.trim()}
                      className="px-10 py-5 bg-dare-gold text-slate-900 rounded-[2rem] font-black text-lg shadow-xl shadow-dare-gold/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify ID'}
                    </button>
                 </div>

                 {verificationResult && (
                   <div className="mt-8 p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 animate-fadeIn text-left">
                      {verificationResult.valid ? (
                        <div className="flex gap-6 items-center">
                           <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">✓</div>
                           <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Authenticity Confirmed</p>
                              <p className="text-lg font-black dark:text-white">{verificationResult.name}</p>
                              <p className="text-sm font-bold text-gray-500">{verificationResult.subject} • Level {verificationResult.level} • {verificationResult.date}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex gap-6 items-center">
                           <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg">✕</div>
                           <div>
                              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Invalid Certificate</p>
                              <p className="text-sm font-bold text-gray-500">The verification ID entered does not match any current institutional records.</p>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Global Access Section */}
        <section className="py-20 text-center">
          <h2 className="text-xs font-black text-dare-teal uppercase tracking-[0.5em] mb-8">Access darewast Anywhere</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-6">
            {platforms.map(p => (
              <div 
                key={p.id} 
                className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 transition-all ${p.color} cursor-pointer group shadow-xl hover:shadow-2xl hover:-translate-y-2`}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{p.icon}</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('availableOn')}</p>
                <h4 className="text-sm font-black dark:text-white">{p.name}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Global Stats Footer Section */}
        <div className="grid md:grid-cols-4 gap-8 py-16 px-12 bg-slate-950 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-br from-dare-teal/10 via-transparent to-dare-purple/10 pointer-events-none"></div>
           <div className="text-center md:text-left z-10">
              <p className="text-4xl font-black mb-1">14</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-dare-teal">Languages</p>
           </div>
           <div className="text-center md:text-left z-10">
              <p className="text-4xl font-black mb-1">20+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-dare-gold">Core Subjects</p>
           </div>
           <div className="text-center md:text-left z-10">
              <p className="text-4xl font-black mb-1">24/7</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-dare-purple">Active Campus</p>
           </div>
           <div className="text-center md:text-left z-10">
              <p className="text-4xl font-black mb-1">85k+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Lesson Nodes</p>
           </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default LandingView;
