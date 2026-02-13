
import React from 'react';
import { Subject, Language } from '../types';
import { translations } from '../translations';

interface Props {
  subject: Subject;
  language: Language;
  onSelect: (method: 'placement' | 'assessment' | 'scan') => void;
  onBack: () => void;
}

const DiagnosticGateView: React.FC<Props> = ({ subject, language, onSelect, onBack }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-fadeIn text-center">
      <div className="bg-dare-gold p-16 rounded-[4.5rem] border-4 border-white/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black text-slate-950 uppercase rotate-12">GATE</div>
        
        <div className="relative z-10 space-y-6">
          <div className="w-24 h-24 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl animate-float">
            {subject.icon}
          </div>
          <h2 className="text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">Diagnostic Initialization</h2>
          <p className="text-slate-900/70 text-xl font-bold max-w-2xl mx-auto italic">
            "Before entering the 24/7 Mastery Grid for {subject.name}, we must calibrate your current academic coordinates."
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-16 text-left">
            <button 
              onClick={() => onSelect('placement')}
              className="p-8 bg-slate-950 text-white rounded-[3rem] border-4 border-white/10 hover:border-white shadow-xl transition-all group flex flex-col justify-between h-full"
            >
              <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">🎯</span>
              <div>
                <h4 className="text-xl font-black uppercase mb-2">Placement Test</h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">Take our 10-question AI diagnostic to determine your exact entry level.</p>
              </div>
            </button>

            <button 
              onClick={() => onSelect('assessment')}
              className="p-8 bg-dare-purple text-white rounded-[3rem] border-4 border-white/20 hover:border-white shadow-xl transition-all group flex flex-col justify-between h-full"
            >
              <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">🔬</span>
              <div>
                <h4 className="text-xl font-black uppercase mb-2">AI Assessment</h4>
                <p className="text-xs text-white/70 font-bold leading-relaxed">Real-time mastery check to verify foundational skill retention.</p>
              </div>
            </button>

            <button 
              onClick={() => onSelect('scan')}
              className="p-8 bg-dare-teal text-slate-950 rounded-[3rem] border-4 border-white/20 hover:border-white shadow-xl transition-all group flex flex-col justify-between h-full md:col-span-2"
            >
              <div className="flex items-center gap-6">
                <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
                <div>
                  <h4 className="text-xl font-black uppercase mb-1">Scan Transcript or Certificate</h4>
                  <p className="text-xs text-slate-900/60 font-bold leading-relaxed">Automatically map your external credits from report cards.</p>
                </div>
              </div>
            </button>
          </div>

          <button 
            onClick={onBack}
            className="mt-12 text-slate-950 font-black uppercase text-xs tracking-widest hover:text-rose-700 transition-colors"
          >
            Abort Mastery Initialization
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticGateView;
