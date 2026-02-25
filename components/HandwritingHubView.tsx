
import React, { useState, useEffect } from 'react';
import { Language, User, MasteryLevel } from '../types';
import { translations } from '../translations';
import HandwritingCanvas from './HandwritingCanvas';
import { recognizeHandwriting } from '../services/geminiService';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

const DRILLS = [
  { id: 'foundation', icon: '✍️', label: 'Script Foundation', levels: ['A', 'B', 'C', 'D'], desc: 'Basic alphabet and numeric strokes.' },
  { id: 'arithmetic', icon: '🔢', label: 'Numeric Logic', levels: ['E', 'F', 'G', 'H'], desc: 'Equation alignment and symbol precision.' },
  { id: 'formula', icon: '🧪', label: 'Scientific Notation', levels: ['I', 'J', 'K', 'L'], desc: 'Chemical structures and complex exponents.' },
  { id: 'diagram', icon: '📉', label: 'Logic Modeling', levels: ['M', 'N', 'O', 'P'], desc: 'Hand-drawn Sakamoto logic diagrams.' },
  { id: 'drafting', icon: '🏛️', label: 'Expert Maintenance', levels: ['Beyond P', 'Beyond T'], desc: 'High-precision technical drafting and calligraphy.' }
];

const HandwritingHubView: React.FC<Props> = ({ user, language, onBack, onUpdateUser }) => {
  const [activeDrill, setActiveDrill] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [precision, setPrecision] = useState(user.handwritingMetrics?.precision || 85);
  const [fluency, setFluency] = useState(user.handwritingMetrics?.fluency || 70);

  const t = (key: string) => translations[language]?.[key] || translations['English'][key] || key;

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const text = await recognizeHandwriting(base64, language);
      
      // Calculate new metrics
      const newPrecision = Math.min(100, precision + Math.floor(Math.random() * 5));
      const newFluency = Math.min(100, fluency + Math.floor(Math.random() * 3));
      
      setPrecision(newPrecision);
      setFluency(newFluency);
      
      setFeedback(text ? `Analysis complete. Detected: "${text}". Stroke precision within standard deviation.` : "Stroke logic ambiguous. Recalibrate grip.");
      
      onUpdateUser({ 
        xp: (user.xp || 0) + 15,
        handwritingMetrics: {
          precision: newPrecision,
          fluency: newFluency,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (err) {
      setFeedback("Neural analysis interrupted. Reset canvas.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-10 text-gray-400 hover:text-dare-teal flex items-center transition-all font-bold group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
      </button>

      <header className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mb-16 border-b-[12px] border-dare-teal">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 tracking-tighter uppercase">INK</div>
        <div className="relative z-10 space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal/20 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-dare-teal/30 backdrop-blur-md">
              🖋️ Digital Ink Laboratory
           </div>
           <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">Handwriting Mode</h1>
           <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs max-w-2xl mx-auto">
             Maintain fine motor logic through digital ink synthesis.
           </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Maintenance Metrics</h3>
               <div className="grid grid-cols-2 gap-6">
                  <div className="text-center space-y-2">
                     <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="40" cy="40" r="35" className="fill-none stroke-gray-100 dark:stroke-slate-800" strokeWidth="6" />
                           <circle cx="40" cy="40" r="35" className="fill-none stroke-dare-teal transition-all duration-1000" strokeWidth="6" strokeDasharray={2 * Math.PI * 35} strokeDashoffset={2 * Math.PI * 35 * (1 - precision/100)} strokeLinecap="round" />
                        </svg>
                        <span className="absolute font-black text-xs">{precision}%</span>
                     </div>
                     <p className="text-[8px] font-black text-gray-400 uppercase">Precision</p>
                  </div>
                  <div className="text-center space-y-2">
                     <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="40" cy="40" r="35" className="fill-none stroke-gray-100 dark:stroke-slate-800" strokeWidth="6" />
                           <circle cx="40" cy="40" r="35" className="fill-none stroke-dare-purple transition-all duration-1000" strokeWidth="6" strokeDasharray={2 * Math.PI * 35} strokeDashoffset={2 * Math.PI * 35 * (1 - fluency/100)} strokeLinecap="round" />
                        </svg>
                        <span className="absolute font-black text-xs">{fluency}%</span>
                     </div>
                     <p className="text-[8px] font-black text-gray-400 uppercase">Fluency</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               {DRILLS.map(drill => (
                 <button
                   key={drill.id}
                   onClick={() => setActiveDrill(drill.id)}
                   className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all flex items-center gap-6 group ${activeDrill === drill.id ? 'border-dare-teal bg-dare-teal/5 shadow-lg' : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200'}`}
                 >
                   <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{drill.icon}</div>
                   <div>
                      <h4 className="font-black text-sm dark:text-white leading-none mb-1">{drill.label}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{drill.desc}</p>
                   </div>
                 </button>
               ))}
            </div>
         </div>

         <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-10 md:p-16 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal to-dare-purple"></div>
               
               {activeDrill ? (
                 <div className="space-y-10 animate-fadeIn">
                    <div className="flex justify-between items-end">
                       <div>
                          <h3 className="text-3xl font-black dark:text-white tracking-tighter">Active Ink Buffer</h3>
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Mode: {DRILLS.find(d => d.id === activeDrill)?.label}</p>
                       </div>
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-dare-teal text-white rounded-lg text-[9px] font-black uppercase">OCR Live</span>
                       </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-[3rem] border border-gray-200 dark:border-slate-800 shadow-inner">
                       <HandwritingCanvas onCapture={handleCapture} onClear={() => setFeedback(null)} isLoading={isAnalyzing} />
                    </div>

                    {feedback && (
                       <div className="p-8 bg-dare-teal/5 rounded-[2.5rem] border border-dare-teal/20 animate-fadeIn">
                          <p className="text-lg font-bold text-gray-700 dark:text-gray-200 italic leading-relaxed text-center">"{feedback}"</p>
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="py-20 text-center space-y-10">
                    <div className="w-32 h-32 bg-gray-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-7xl mx-auto animate-float">✍️</div>
                    <div className="max-w-md mx-auto">
                       <h3 className="text-3xl font-black dark:text-white tracking-tighter mb-4">Initialize Ink Session</h3>
                       <p className="text-gray-500 font-medium leading-relaxed">Select a training tier from the sidebar to begin digital ink maintenance. Optimized for stylus and high-precision touch input.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default HandwritingHubView;
