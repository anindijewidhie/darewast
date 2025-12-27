
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onBack: () => void;
  language: Language;
}

const DonationView: React.FC<Props> = ({ onBack, language }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const accounts = [
    { type: 'Bank', name: 'Global Education Fund', account: '888-DARE-001', icon: '🏦' },
    { type: 'Digital Wallet', name: 'A. Widhi (Founder) / PayPal', account: 'awidhi@darewast.io', icon: '📱' },
    { type: 'Infrastructure', name: 'Cloud & Server Costs', account: 'infrastructure@darewast.io', icon: '☁️' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fadeIn px-4">
      <button onClick={onBack} className="mb-8 text-gray-500 hover:text-dare-teal flex items-center dark:text-gray-400 transition-all group font-bold">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="bg-gradient-to-br from-dare-teal via-dare-gold to-dare-purple p-12 md:p-20 text-white text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{t('supportDarewast')}</h2>
            <p className="text-white/90 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
              Fund the maintenance of this site, the development of the mobile apps, and support the visionary founder keeping global education free for everyone.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-dare-teal">🛡️</span> Single Founder Support
              </h3>
              <div className="space-y-6">
                {accounts.map(acc => (
                  <div key={acc.name} className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:scale-[1.02] transition-all">
                    <div className="text-4xl bg-white dark:bg-slate-700 w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
                      {acc.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mb-1">{acc.type}</p>
                      <p className="font-black text-gray-900 dark:text-white leading-none mb-2">{acc.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 font-mono text-sm break-all">{acc.account}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(acc.account); alert('Copied to clipboard'); }} className="p-3 bg-dare-teal/10 text-dare-teal rounded-xl hover:bg-dare-teal hover:text-white transition-all">
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-dare-gold">📲</span> Global Exam Hub
              </h3>
              <div className="aspect-square max-w-[320px] mx-auto bg-gray-50 dark:bg-slate-800 rounded-[3.5rem] flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-slate-700 relative overflow-hidden group">
                <div className="w-full h-full p-10 flex flex-col items-center justify-center text-center opacity-60 group-hover:opacity-100 transition-opacity">
                   <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
                     {Array.from({length: 16}).map((_, i) => (
                       <div key={i} className={`rounded-lg ${Math.random() > 0.5 ? 'bg-slate-800 dark:bg-slate-200' : 'bg-dare-gold/20'}`}></div>
                     ))}
                   </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-3xl shadow-2xl border-2 border-dare-gold animate-bounce">
                    <span className="text-3xl">☕</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 font-bold text-sm italic">
                Contributions go directly toward infrastructure and expanding the world's largest online examination provider.
              </p>
            </div>
          </div>

          <div className="mt-20 p-10 bg-slate-900 rounded-[3.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">💡</div>
            <div className="relative z-10">
              <h4 className="text-dare-gold font-black uppercase text-xs tracking-widest mb-4">A Note from A. Widhi (anindijewidhie)</h4>
              <p className="text-slate-300 text-lg font-medium leading-relaxed italic">
                "darewast is architected with a single mission: to spread knowledge across over 20 subjects in 14 languages, ensuring that mastery is never limited by borders or resources. 100% of these contributions go directly to server clusters, API endpoints for localized content, and maintaining this ecosystem 24/7. We are on the path to becoming the world's largest 24/7 online lesson, education, and exam provider for all curricula, methods, and providers."
              </p>
              <div className="mt-8 flex items-center gap-4">
                 <div className="flex">
                    <div className="w-12 h-12 rounded-2xl border-2 border-dare-teal bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-lg">👑</div>
                 </div>
                 <div>
                    <p className="text-white font-black text-[11px] uppercase tracking-widest leading-none">A. Widhi</p>
                    <p className="text-dare-teal font-black text-[9px] uppercase tracking-[0.2em] mt-1">Architect & Lead Engineer</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;
