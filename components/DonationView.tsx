
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
  rate: number;
  name: string;
  color: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar', color: '#53CDBA' },
  { code: 'IDR', symbol: 'Rp', rate: 16250, name: 'Indonesian Rupiah', color: '#CCB953' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', color: '#B953CC' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', color: '#4D96FF' },
  { code: 'JPY', symbol: '¥', rate: 156, name: 'Japanese Yen', color: '#FF6B6B' },
  { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar', color: '#EE5253' },
];

const INDIVIDUAL_AMOUNTS = [1, 2, 5, 10, 20, 50, 100];
const CORPORATE_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const DonationView: React.FC<Props> = ({ onBack, language }) => {
  const [donorType, setDonorType] = useState<'individual' | 'corporate'>('individual');
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(10);
  const [customValue, setCustomValue] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orgName, setOrgName] = useState('');

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const currentAmountDisplay = useMemo(() => {
    if (selectedAmount === 'custom') {
      const val = parseFloat(customValue);
      return isNaN(val) ? '-' : `${currency.symbol}${Math.round(val * currency.rate).toLocaleString()}`;
    }
    return `${currency.symbol}${Math.round(selectedAmount * currency.rate).toLocaleString()}`;
  }, [selectedAmount, customValue, currency]);

  const handleDonateAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        alert(`Redirecting to secure gateway for ${currentAmountDisplay} contribution via ${donorType} protocol...`);
    }, 1200);
  };

  const activeAmounts = donorType === 'individual' ? INDIVIDUAL_AMOUNTS : CORPORATE_AMOUNTS;

  return (
    <div className="max-w-7xl mx-auto py-12 animate-fadeIn px-4">
      <button onClick={onBack} className="mb-12 text-gray-500 hover:text-dare-teal flex items-center transition-all group font-bold">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Content Area */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-slate-950 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl border-4 border-white/5">
            <div className="absolute inset-0 pattern-grid-lg opacity-10"></div>
            <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12">FUND</div>
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal text-slate-950 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-white/30">
                Universal Academic Sovereignty
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                darewast <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-gradient-x">
                  Foundation
                </span>
              </h1>
              <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl">
                The darewast mission is sustained by direct synthesis from global sponsors. We support all currencies, banks, and e-wallet providers for universal contribution.
              </p>
            </div>
          </section>

          {/* Donor Type Selector */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-3 rounded-[3rem] inline-flex gap-3 border-4 border-white/5">
              <button 
                onClick={() => { setDonorType('individual'); setSelectedAmount(10); }}
                className={`px-10 py-4 rounded-[2.5rem] text-sm font-black uppercase tracking-widest transition-all ${donorType === 'individual' ? 'bg-dare-teal text-slate-950 shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Individual
              </button>
              <button 
                onClick={() => { setDonorType('corporate'); setSelectedAmount(1000); }}
                className={`px-10 py-4 rounded-[2.5rem] text-sm font-black uppercase tracking-widest transition-all ${donorType === 'corporate' ? 'bg-dare-purple text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Corporate / Entity
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fadeIn">
              {activeAmounts.map(amt => (
                <button 
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-8 rounded-[2.5rem] border-4 font-black transition-all ${selectedAmount === amt ? (donorType === 'individual' ? 'border-dare-teal bg-dare-teal text-slate-950' : 'border-dare-purple bg-dare-purple text-white') + ' shadow-2xl scale-105' : 'bg-slate-900 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  <span className="text-xs mr-1 opacity-60">$</span>
                  <span className="text-2xl">{amt >= 1000 ? (amt/1000) + 'k' : amt}</span>
                </button>
              ))}
              <button 
                onClick={() => setSelectedAmount('custom')}
                className={`py-8 rounded-[2.5rem] border-4 font-black text-lg transition-all ${selectedAmount === 'custom' ? 'border-dare-gold bg-dare-gold text-slate-950 shadow-2xl scale-105' : 'bg-slate-900 border-white/5 text-gray-400'}`}
              >
                Custom
              </button>
            </div>

            {donorType === 'corporate' && (
              <div className="animate-fadeIn">
                <input 
                  type="text" 
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Official Organization / Institution Name"
                  className="w-full p-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg border-4 border-white/5 focus:border-dare-purple outline-none transition-all shadow-inner uppercase tracking-widest"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 bg-slate-900 rounded-[3.5rem] border-4 border-white/5 shadow-xl space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Universal Support</h3>
              <p className="text-sm text-gray-400 font-bold leading-relaxed italic">
                "Our infrastructure integrates with all global banking networks and e-wallet providers to ensure frictionless mastery support for every nation."
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <span className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black text-dare-teal uppercase border border-dare-teal/20">All Currencies</span>
                <span className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black text-dare-gold uppercase border border-dare-gold/20">All Banks</span>
                <span className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black text-dare-purple uppercase border border-dare-purple/20">All Wallets</span>
              </div>
            </div>

            <div className="p-10 bg-slate-950 rounded-[3.5rem] border-4 border-white/5 shadow-xl flex flex-col justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-dare-teal/10 text-dare-teal rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner border border-dare-teal/20">🤝</div>
              <h4 className="text-lg font-black text-white uppercase">Sovereign Foundation</h4>
              <p className="text-sm text-gray-500 leading-relaxed italic">
                "darewast Foundation is an independent non-profit entity. All contributions fund direct content synthesis and contributor stipends."
              </p>
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 border-4 border-white/10 shadow-2xl space-y-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] text-center">Protocol Summary</h3>
              <div className="text-center">
                <p className="text-7xl font-black text-white tracking-tighter mb-2">{currentAmountDisplay}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-xl border border-white/10">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currency.color }}></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{currency.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <select 
                  value={currency.code}
                  onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                  className="w-full bg-slate-950 text-white p-5 rounded-[2rem] font-black text-xs uppercase outline-none appearance-none cursor-pointer border-4 border-white/5 focus:border-dare-teal transition-all text-center"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-950">{c.code} ({c.symbol})</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
              </div>

              {selectedAmount === 'custom' && (
                <div className="animate-fadeIn">
                  <input 
                    type="number" 
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                    placeholder="ENTER AMOUNT"
                    className="w-full p-6 bg-slate-950 text-white rounded-[2rem] font-black text-3xl text-center outline-none border-4 border-dare-gold focus:shadow-xl transition-all"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleDonateAction}
              disabled={isProcessing || (selectedAmount === 'custom' && !customValue)}
              className="w-full py-8 bg-white text-slate-950 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-30"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-slate-400 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>Authorize {donorType === 'corporate' ? 'Institutional' : 'Sovereign'} Grant <span className="group-hover:translate-x-2 transition-transform">→</span></>
              )}
            </button>

            <div className="pt-8 border-t border-white/10 text-center space-y-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Secure Payment Gateway</p>
              <div className="flex justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <span className="text-4xl">💳</span>
                <span className="text-4xl">🏦</span>
                <span className="text-4xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationView;
