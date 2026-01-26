
import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onBack: () => void;
  language: Language;
}

interface Currency {
  code: string;
  symbol: string;
  rate: number; // rate relative to 1 USD
  name: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
  { code: 'IDR', symbol: 'Rp', rate: 16250, name: 'Indonesian Rupiah' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound' },
  { code: 'JPY', symbol: '¥', rate: 156, name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', rate: 1.51, name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', rate: 1.37, name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar' },
  { code: 'CNY', symbol: '¥', rate: 7.24, name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
  { code: 'AED', symbol: 'DH', rate: 3.67, name: 'UAE Dirham' },
  { code: 'BRL', symbol: 'R$', rate: 5.15, name: 'Brazilian Real' },
  { code: 'KRW', symbol: '₩', rate: 1360, name: 'South Korean Won' },
  { code: 'MXN', symbol: '$', rate: 16.8, name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', rate: 18.3, name: 'South African Rand' },
];

const DonationView: React.FC<Props> = ({ onBack, language }) => {
  const [donorType, setDonorType] = useState<'individual' | 'corporate'>('individual');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(donorType === 'individual' ? 10 : 100);
  const [customValue, setCustomValue] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Corporate fields
  const [orgName, setOrgName] = useState('');
  const [taxReceipt, setTaxReceipt] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const standardAmounts = [1, 2, 5, 10, 20, 50, 100];

  const accounts = [
    { type: 'Site Owner / Bank Jago', name: 'A. Widhi', account: '107863277869', icon: '🏦' },
    { type: 'Site Owner / PayPal', name: 'A. Widhi', account: 'dhea_wasisto@yahoo.com', icon: '💳' },
    { type: 'Site Owner / E-Wallets', name: 'A. Widhi (OVO/GoPay/Dana)', account: '+628567239000', icon: '📱' }
  ];

  const allocations = [
    { label: 'Contributors', percent: 40, icon: '🌱', color: 'dare-teal', desc: 'Rewarding the scholars and professionals who architect our modules.' },
    { label: 'Maintenance', percent: 20, icon: '⚙️', color: 'dare-gold', desc: 'Covering server upkeep and high-performance API throughput.' },
    { label: 'Development', percent: 20, icon: '💻', color: 'dare-purple', desc: 'Funding mobile app optimization and advanced AI model refining.' },
    { label: 'Site Owner', percent: 20, icon: '👑', color: 'slate-800', desc: 'Supporting the strategic architecture and daily operations.' },
  ];

  const formatCurrency = (val: number) => {
    const converted = val * currency.rate;
    if (currency.code === 'IDR') {
        return `${currency.symbol}${converted.toLocaleString('id-ID')}`;
    }
    if (['USD', 'CAD', 'AUD', 'SGD', 'MXN'].includes(currency.code)) {
        return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: currency.rate < 10 ? 2 : 0 })}`;
  };

  const currentAmountDisplay = useMemo(() => {
    if (selectedAmount === 'custom') {
      const val = parseFloat(customValue);
      return isNaN(val) ? '-' : formatCurrency(val);
    }
    return formatCurrency(selectedAmount);
  }, [selectedAmount, customValue, currency]);

  const handleDonateAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        alert(`Redirecting ${donorType === 'corporate' ? orgName : 'individual'} to secure global gateway...`);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 animate-fadeIn px-4">
      <button onClick={onBack} className="mb-8 text-gray-500 hover:text-dare-teal flex items-center dark:text-gray-400 transition-all group font-bold">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/10">
        <div className="bg-slate-900 p-12 md:p-24 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-dare-teal/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-dare-purple/10 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 border border-white/10 backdrop-blur-md">
              Universal Mastery Fund
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-4">
              Empower <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-gradient-x">Scholars</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
              Fuel the world's largest 24/7 adaptive learning grid. Your contribution directly rewards contributors and maintains high-rigor infrastructure.
            </p>
          </div>
        </div>

        {/* Donor Type Selector */}
        <div className="flex justify-center p-8 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
           <div className="bg-white dark:bg-slate-950 p-1.5 rounded-2xl flex gap-1 shadow-inner">
              <button 
                onClick={() => setDonorType('individual')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${donorType === 'individual' ? 'bg-dare-teal text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'}`}
              >
                👤 {t('individualDonation')}
              </button>
              <button 
                onClick={() => setDonorType('corporate')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${donorType === 'corporate' ? 'bg-dare-purple text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'}`}
              >
                🏢 {t('corporateDonation')}
              </button>
           </div>
        </div>

        {/* Donation Selector Section */}
        <div className="p-8 md:p-16 border-b border-gray-100 dark:border-slate-800">
           <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-10">
                 {donorType === 'corporate' && (
                    <div className="animate-fadeIn space-y-6">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-2">{t('companyName')}</label>
                          <input 
                            value={orgName}
                            onChange={e => setOrgName(e.target.value)}
                            placeholder="e.g. Acme Corporation"
                            className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-purple rounded-2xl outline-none font-bold text-lg dark:text-white transition-all shadow-inner"
                          />
                       </div>
                       <button 
                        onClick={() => setTaxReceipt(!taxReceipt)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${taxReceipt ? 'border-dare-purple bg-dare-purple/5 text-dare-purple' : 'border-gray-100 dark:border-slate-800 text-gray-400'}`}
                       >
                         <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${taxReceipt ? 'bg-dare-purple border-dare-purple text-white' : 'border-gray-300'}`}>
                           {taxReceipt && '✓'}
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest">{t('taxReceiptRequested')}</span>
                       </button>
                    </div>
                 )}

                 <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{t('selectDonationAmount')}</h3>
                    <div className="relative group">
                       <select 
                         value={currency.code}
                         onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                         className="bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase outline-none appearance-none cursor-pointer pr-10 border border-transparent focus:border-dare-teal transition-all"
                       >
                         {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs">▼</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {standardAmounts.map(amt => (
                       <button
                         key={amt}
                         onClick={() => setSelectedAmount(amt)}
                         className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-1 group ${selectedAmount === amt ? (donorType === 'individual' ? 'border-dare-teal bg-dare-teal/10 shadow-xl' : 'border-dare-purple bg-dare-purple/10 shadow-xl') + ' scale-105' : 'border-gray-50 dark:border-slate-800 hover:border-dare-teal/50'}`}
                       >
                          <span className={`text-2xl font-black tracking-tighter ${selectedAmount === amt ? (donorType === 'individual' ? 'text-dare-teal' : 'text-dare-purple') : 'text-gray-900 dark:text-white'}`}>{currency.symbol}{Math.round(amt * currency.rate).toLocaleString()}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{amt} USD</span>
                       </button>
                    ))}
                    <button
                      onClick={() => setSelectedAmount('custom')}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedAmount === 'custom' ? 'border-dare-purple bg-dare-purple/10 shadow-xl scale-105' : 'border-gray-50 dark:border-slate-800 hover:border-dare-purple/50'}`}
                    >
                       <span className={`text-xl font-black uppercase tracking-widest ${selectedAmount === 'custom' ? 'text-dare-purple' : 'text-gray-400'}`}>{t('customAmount')}</span>
                    </button>
                 </div>

                 {selectedAmount === 'custom' && (
                    <div className="animate-fadeIn space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">{t('enterCustomAmount')} (USD)</label>
                       <div className="relative">
                          <input 
                            type="number"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            placeholder="e.g. 250"
                            className="w-full p-6 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-purple rounded-[2rem] outline-none font-black text-2xl dark:text-white transition-all shadow-inner pl-12"
                          />
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">$</span>
                       </div>
                    </div>
                 )}
                 
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] italic text-center sm:text-left">
                   💡 {t('contributionNotes')}
                 </p>
              </div>

              <div className="lg:col-span-5">
                 <div className="bg-slate-900 p-10 md:p-12 rounded-[3.5rem] text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black">FUND</div>
                    <div className="space-y-2 relative z-10">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-dare-teal">Current Contribution</p>
                       <h4 className="text-6xl font-black tracking-tighter transition-all duration-500">{currentAmountDisplay}</h4>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{currency.code} Total</p>
                    </div>

                    <button 
                      onClick={handleDonateAction}
                      disabled={isProcessing || (selectedAmount === 'custom' && (!customValue || isNaN(parseFloat(customValue)))) || (donorType === 'corporate' && !orgName.trim())}
                      className={`w-full py-6 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${donorType === 'individual' ? 'bg-dare-teal shadow-dare-teal/20' : 'bg-dare-purple shadow-dare-purple/20'}`}
                    >
                       {isProcessing ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <>{t('proceedToPayment')} {currentAmountDisplay} →</>}
                    </button>

                    <div className="flex justify-center gap-4 opacity-30">
                       <span className="text-2xl">💳</span>
                       <span className="text-2xl">🏦</span>
                       <span className="text-2xl">📱</span>
                       <span className="text-2xl">🌍</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 40/20/20/20 Matrix */}
        <div className="px-8 md:px-16 py-12 md:py-20 bg-gray-50 dark:bg-slate-800/30 border-y border-gray-100 dark:border-slate-800">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {allocations.map(item => (
                <div key={item.label} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                   <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                      {item.icon}
                   </div>
                   <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{item.percent}%</p>
                   <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${item.label === 'Contributors' ? 'text-dare-teal' : (item.label === 'Maintenance' ? 'text-dare-gold' : (item.label === 'Development' ? 'text-dare-purple' : 'text-gray-500'))}`}>{item.label}</p>
                   <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">"{item.desc}"</p>
                   <div className="mt-6 w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${item.percent}%`, backgroundColor: item.color === 'dare-teal' ? '#53CDBA' : (item.color === 'dare-gold' ? '#CCB953' : (item.color === 'dare-purple' ? '#B953CC' : '#1e293b')) }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8 text-left">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-dare-teal">🛡️</span> Direct Channels
                </h3>
                <p className="text-sm font-medium text-gray-500">Alternatively, use our verified direct accounts for manual transfers.</p>
              </div>
              <div className="space-y-6">
                {accounts.map(acc => (
                  <div key={acc.type} className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:scale-[1.01] transition-all">
                    <div className="text-4xl bg-white dark:bg-slate-700 w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm">
                      {acc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mb-1">{acc.type}</p>
                      <p className="font-black text-gray-900 dark:text-white leading-none mb-2 truncate">{acc.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 font-mono text-xs break-all opacity-80">{acc.account}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(acc.account); alert('Copied to Clipboard'); }} className="p-3 bg-dare-teal/10 text-dare-teal rounded-xl hover:bg-dare-teal hover:text-white transition-all shadow-sm shrink-0">
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10 text-left">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-dare-gold">🧩</span> Mastery Vision
              </h3>
              <div className="p-10 bg-slate-950 rounded-[3rem] text-white relative overflow-hidden shadow-2xl border border-white/5 group">
                <div className="absolute inset-0 bg-gradient-to-br from-dare-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <p className="relative z-10 text-lg font-bold italic leading-relaxed text-slate-400">
                  "By supporting darewast, you are directly fueling the global contributors who architect our specialized modules. 40% of every dollar goes to the scholars and professionals, while the rest maintains the world's first 24/7 universal education grid."
                </p>
                <div className="mt-10 flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-dare-gold rounded-xl flex items-center justify-center text-slate-900 text-2xl font-black shadow-xl shadow-dare-gold/20">d</div>
                   <div>
                      <p className="text-white font-black text-[11px] uppercase tracking-widest leading-none">darewast Foundation</p>
                      <p className="text-dare-gold font-black text-[8px] uppercase tracking-[0.2em] mt-1">Universal Academic Equity</p>
                   </div>
                </div>
              </div>
              <p className="text-center text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest italic">
                All contributions are archived for infrastructure audits.
              </p>
            </div>
          </div>

          <div className="mt-20 p-10 bg-gray-50 dark:bg-slate-800/50 rounded-[3.5rem] relative overflow-hidden border border-gray-100 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">💡</div>
            <div className="relative z-10 text-left">
              <h4 className="text-dare-purple font-black uppercase text-[10px] tracking-[0.3em] mb-4">Message from the Architect</h4>
              <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed italic">
                "darewast is architected to spread knowledge across over 20 subjects in 14 languages. 100% of these funds are strictly allocated as stated above to ensure that this hub, the AI tutors, and our global examination provider remain available 24/7 to every human with a mastery ambition."
              </p>
              <div className="mt-8 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-dare-purple text-white flex items-center justify-center font-black shadow-lg shadow-dare-purple/20 text-xs">AW</div>
                 <div>
                    <p className="text-gray-900 dark:text-white font-black text-[11px] uppercase tracking-widest leading-none">A. Widhi</p>
                    <p className="text-dare-purple font-black text-[8px] uppercase tracking-[0.2em] mt-1">Founder & Site Architect</p>
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
