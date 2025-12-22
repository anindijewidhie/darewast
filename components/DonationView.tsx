
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
    { type: 'Bank', name: 'Global Reserve Bank', account: '888-999-001', icon: '🏦' },
    { type: 'E-Wallet', name: 'PayPal / GoPay / OVO', account: '+62 812 3456 7890', icon: '📱' },
    { type: 'Crypto', name: 'ETH / USDT', account: '0x123...456789abc', icon: '🪙' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fadeIn">
      <button onClick={onBack} className="mb-8 text-gray-500 hover:text-dare-teal flex items-center dark:text-gray-400">
        ← {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-800">
        <div className="bg-gradient-to-br from-dare-teal via-dare-gold to-dare-purple p-12 text-white text-center">
          <h2 className="text-4xl font-black mb-4">{t('supportDarewast')}</h2>
          <p className="text-white/90 max-w-lg mx-auto text-lg">
            {t('donationText')}
          </p>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('scanToDonate')}</h3>
              <div className="aspect-square max-w-[280px] mx-auto bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-slate-700 relative overflow-hidden group">
                {/* Simulated QR Code */}
                <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center opacity-60 group-hover:opacity-100 transition-opacity">
                   <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
                     {Array.from({length: 16}).map((_, i) => (
                       <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-slate-800 dark:bg-slate-200' : 'bg-transparent'}`}></div>
                     ))}
                   </div>
                </div>
                <div className="absolute bottom-4 bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-lg text-xs font-bold text-dare-teal">
                  {t('allCurrencies')}
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm italic">
                {t('scanWithAny')}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('directAccounts')}</h3>
              {accounts.map(acc => (
                <div key={acc.name} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="text-3xl bg-white dark:bg-slate-700 w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">
                    {acc.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-dare-teal uppercase tracking-widest">{acc.type}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{acc.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{acc.account}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(acc.account)} className="text-xs font-bold px-3 py-1 bg-dare-teal/10 text-dare-teal rounded-full hover:bg-dare-teal hover:text-white transition-colors">
                    {t('copy')}
                  </button>
                </div>
              ))}

              <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Founder Note:</strong> {t('founderNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;
