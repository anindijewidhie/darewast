
import React from 'react';
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
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const features = [
    { id: 'fusion', icon: '⚛️', title: 'Fusion Lab', desc: 'Synthesize interdisciplinary logic nodes.', action: onJoin, color: 'bg-dare-teal', text: 'text-slate-950' },
    { id: 'exam', icon: '🏛️', title: 'Exam Hall', desc: 'Universal 24/7 certification registry.', action: onPlacementTest, color: 'bg-dare-gold', text: 'text-slate-950' },
    { id: 'restore', icon: '🩹', title: 'Relearn Lab', desc: 'Repair foundational academic gaps.', action: onJoin, color: 'bg-dare-purple', text: 'text-white' },
    { id: 'ink', icon: '🖋️', title: 'Neural Ink', desc: 'Digital handwriting & motor logic.', action: onJoin, color: 'bg-slate-900', text: 'text-white' },
    { id: 'bridge', icon: '🌉', title: 'Transition Hub', desc: 'Upgrade from Kumon/Sakamoto/EyeLevel.', action: onJoin, color: 'bg-emerald-600', text: 'text-white' },
    { id: 'units', icon: '📜', title: 'Credit Transfer', desc: 'Map mastery to US/ECTS credits.', action: onOpenConverter, color: 'bg-blue-600', text: 'text-white' },
  ];

  const platforms = [
    { id: 'web', name: 'Web Browser', icon: '🌐', desc: 'Universal Web Access', link: '#' },
    { id: 'android', name: 'Android App', icon: '🤖', desc: 'Google Play Store', link: '#' },
    { id: 'ios', name: 'iOS App', icon: '🍎', desc: 'Apple App Store', link: '#' },
    { id: 'harmony', name: 'HarmonyOS', icon: '⭕', desc: 'Huawei AppGallery', link: '#' },
  ];

  return (
    <div className="animate-fadeIn pb-32 relative">
      <div className="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
      
      <section className="relative pt-24 pb-40 lg:pt-48 lg:pb-64 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10 px-6">
          <div className="flex flex-col items-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-dare-purple text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-2xl border-2 border-white/20">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              The Definitive Learning App
            </div>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-[10rem] font-black mb-10 leading-[0.8] tracking-tighter uppercase font-display text-slate-900 dark:text-white">
            Universal <br /> 
            <span className="inline-block py-4 text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-gradient-x">
              Mastery
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-500 dark:text-slate-400 mb-16 leading-relaxed max-w-4xl mx-auto font-medium italic">
            "Designed to replace standard lessons and complement school studies with a proprietary method and universal exam system."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-4xl mx-auto mb-24">
            <button onClick={onJoin} className="group w-full sm:flex-1 h-24 bg-dare-teal text-slate-950 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 relative border-4 border-white/30">
              <span className="flex flex-col items-start text-left">
                <span className="text-[10px] uppercase tracking-widest opacity-60">Synthesis</span>
                <span>Lesson Mode</span>
              </span>
              <span className="text-3xl">📖</span>
            </button>
            <button onClick={onPlacementTest} className="group w-full sm:flex-1 h-24 bg-dare-gold text-slate-950 rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 border-4 border-white/30">
              <span className="flex flex-col items-start text-left">
                <span className="text-[10px] uppercase tracking-widest opacity-60">Validation</span>
                <span>Exam Mode</span>
              </span>
              <span className="text-3xl">🏛️</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase font-display text-slate-900 dark:text-white">Mastery Ecosystem</h2>
             <p className="text-dare-gold font-black uppercase tracking-[0.5em] text-xs mt-4">Solid Academic Architecture</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map(feat => (
              <button key={feat.id} onClick={feat.action} className={`p-12 ${feat.color} rounded-[4rem] border-4 border-white/30 transition-all text-left flex flex-col justify-between group shadow-2xl hover:-translate-y-3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 pattern-grid opacity-20"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-slate-950/20 backdrop-blur-md text-slate-950 dark:text-white rounded-[2rem] flex items-center justify-center text-4xl mb-12 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all border border-white/20">{feat.icon}</div>
                  <h4 className={`text-4xl font-black ${feat.text} mb-4 uppercase tracking-tighter font-display`}>{feat.title}</h4>
                  <p className={`text-base ${feat.text} opacity-90 font-bold leading-relaxed italic`}>"{feat.desc}"</p>
                </div>
                <div className={`mt-16 pt-8 border-t-2 border-black/10 flex justify-between items-center ${feat.text} relative z-10`}>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">Access Node</span>
                   <span className="text-3xl group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Universal Access Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6 font-display text-slate-900 dark:text-white">Universal Access</h2>
             <p className="text-dare-teal font-black uppercase tracking-[0.5em] text-xs">Master your world on any device, anywhere, 24/7.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {platforms.map((platform) => (
              <a 
                key={platform.id} 
                href={platform.link}
                className="p-10 glass-card rounded-[3.5rem] text-center group hover:border-dare-teal transition-all shadow-2xl block border-2"
              >
                <div className="text-6xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-xl">{platform.icon}</div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight font-display">{platform.name}</h4>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">{platform.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-24 text-center uppercase font-display text-slate-900 dark:text-white">Subject Registry</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {SUBJECTS.map((sub) => (
              <div key={sub.id} className="p-12 bg-dare-teal text-slate-950 rounded-[4rem] shadow-2xl border-4 border-white/30 hover:scale-105 transition-all cursor-pointer text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 pattern-grid opacity-20"></div>
                <div className="w-24 h-24 bg-slate-950/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl mb-8 shadow-inner mx-auto group-hover:rotate-12 transition-all border border-white/20 relative z-10">{sub.icon}</div>
                <h4 className="text-3xl font-black mb-2 uppercase tracking-tighter leading-none font-display relative z-10">{sub.name}</h4>
                <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.4em] relative z-10">{sub.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-dare-gold p-12 md:p-24 rounded-[6rem] text-center border-4 border-white/40 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 text-[15rem] font-black uppercase rotate-12 group-hover:scale-110 transition-transform duration-1000">FOUNDATION</div>
             <div className="relative z-10 space-y-12">
                <h2 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none uppercase font-display">Support the Mission</h2>
                <p className="text-slate-900 text-2xl md:text-3xl font-bold italic leading-relaxed max-w-3xl mx-auto">
                  "darewast is 100% donation-funded. Help us keep the 24/7 academic grid free from commercial barriers and open to all scholars."
                </p>
                <button 
                  onClick={onDonate}
                  className="px-20 py-10 bg-slate-950 text-white rounded-[4rem] font-black text-4xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter group border-4 border-white/20"
                >
                  Donate to Foundation <span className="inline-block group-hover:translate-x-6 transition-transform">💎</span>
                </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
