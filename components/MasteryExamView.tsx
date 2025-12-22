
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress } from '../types';
import { generateLesson } from '../services/geminiService';
import { translations } from '../translations';
import { LEVEL_METADATA } from '../constants';

interface Props {
  subject: Subject;
  language: Language;
  level: MasteryLevel;
  user: User;
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

const MasteryExamView: React.FC<Props> = ({ subject, language, level, user, onComplete, onBack }) => {
  const [exam, setExam] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProctored, setIsProctored] = useState(false);
  // Fixed: Replaced NodeJS.Timeout with any to resolve "Cannot find namespace 'NodeJS'" in browser environments
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const content = await generateLesson(subject, language, level, 12, user, null, undefined, true);
        setExam(content);
        setLoading(false);
        initProctoring();
      } catch (err) {
        console.error("Exam generation failed", err);
      }
    };
    fetchExam();
    return () => stopProctoring();
  }, [subject, language, level, user]);

  const initProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsProctored(true);
      }
    } catch (e) {
      console.warn("Proctoring camera access denied. Proceeding without feed.");
    }
  };

  const stopProctoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && !loading) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, loading]);

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);
    stopProctoring();
    const score = exam?.exercises.reduce((acc, ex, idx) => {
      const isCorrect = answers[idx]?.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim();
      return acc + (isCorrect ? 1 : 0);
    }, 0) || 0;
    onComplete(score, exam?.exercises.length || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-dare-gold/20 border-t-dare-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">📝</div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
            {t('generatingLesson')}
          </p>
          <p className="text-gray-500 font-bold">Synthesizing Formal Mastery assessment nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fadeIn grid lg:grid-cols-12 gap-8">
      {/* Exam Sidebar (Proctoring & Timer) */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 order-2 lg:order-1">
         <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-dare-gold/30 aspect-video relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-60" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
               <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
               Live Proctoring Active
            </div>
            <div className="absolute inset-0 border-[10px] border-white/5 pointer-events-none"></div>
            {!isProctored && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-xs font-bold text-center p-6">
                Camera Feed Disabled
              </div>
            )}
         </div>

         <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Examination Timer</p>
            <div className={`text-7xl font-mono font-black tracking-tighter ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50 dark:border-slate-800 space-y-4">
               <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Progress</span>
                  <span className="text-[10px] font-black text-dare-gold">{Object.keys(answers).length}/{exam?.exercises.length}</span>
               </div>
               <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-dare-gold" style={{ width: `${(Object.keys(answers).length / (exam?.exercises.length || 1)) * 100}%` }}></div>
               </div>
            </div>
         </div>
         
         <div className="p-6 bg-dare-gold/5 border border-dare-gold/20 rounded-[2.5rem]">
            <p className="text-[10px] font-black text-dare-gold uppercase tracking-widest mb-4">Official Score Scaling</p>
            <div className="space-y-2">
               {[
                 { range: "10,0", label: t('gradeSuperior') },
                 { range: "8,0 - 9,9", label: t('gradeUp') },
                 { range: "6,0 - 7,9", label: t('gradeUpperMiddle'), highlight: true },
                 { range: "4,0 - 5,9", label: t('gradeMiddle') },
                 { range: "2,0 - 3,9", label: t('gradeLowerMiddle') },
                 { range: "0,0 - 1,9", label: t('gradeLow') },
               ].map(tier => (
                 <div key={tier.range} className={`flex justify-between items-center px-2 py-1 rounded-lg ${tier.highlight ? 'bg-dare-gold/10 ring-1 ring-dare-gold/30' : ''}`}>
                    <span className={`text-[9px] font-bold font-mono ${tier.highlight ? 'text-dare-gold' : 'text-gray-500'}`}>{tier.range}</span>
                    <span className={`text-[9px] font-black uppercase ${tier.highlight ? 'text-dare-gold' : 'text-gray-400'}`}>{tier.label} {tier.highlight ? '★' : ''}</span>
                 </div>
               ))}
            </div>
            <p className="text-[8px] text-gray-400 font-bold mt-4 italic text-center">★ Benchmark for Global Acceptance</p>
         </div>
      </aside>

      {/* Exam Content */}
      <main className="lg:col-span-8 space-y-12 order-1 lg:order-2">
        <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 border-b-[12px] border-dare-gold relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black rotate-12">EXAM</div>
          <div className="relative z-10 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{t('startMasteryExam')} {level}</h1>
            <p className="text-dare-gold font-black text-lg tracking-tight">{subject.name} • {LEVEL_METADATA[level].equivalency}</p>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t('examHallSubtitle')}</p>
          </div>
        </div>

        <div className="space-y-10 pb-20">
          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-200 dark:border-amber-900/30 text-center">
             <p className="text-amber-800 dark:text-amber-200 font-bold uppercase tracking-widest text-xs">⚠️ {t('minPassingScore')}</p>
          </div>

          {exam?.exercises.map((ex, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800 hover:border-dare-gold transition-all group">
              <div className="flex items-start gap-6 mb-8">
                <span className="text-3xl font-black text-gray-200 dark:text-slate-800 group-hover:text-dare-gold transition-colors">0{i + 1}</span>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-tight">
                  {ex.question}
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {ex.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [i]: opt })}
                    className={`p-6 text-left rounded-[2rem] border-2 transition-all font-bold text-lg ${
                      answers[i] === opt 
                      ? 'border-dare-gold bg-dare-gold/5 text-dare-gold shadow-lg scale-[1.02]' 
                      : 'border-gray-50 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-500 hover:border-gray-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                )) || (
                  <input 
                    type="text"
                    value={answers[i] || ''}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    placeholder="Type official response..."
                    className="w-full p-6 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-gold rounded-[2rem] outline-none font-bold text-lg dark:text-white transition-all shadow-inner"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="pt-10 flex flex-col items-center gap-6">
            <button 
              onClick={handleSubmit}
              className="w-full py-8 bg-dare-gold text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all outline-none focus-visible:ring-8 focus-visible:ring-dare-gold/30"
            >
              Submit Official Assessment →
            </button>
            <button 
              onClick={() => { if(confirm("Abandon current assessment? Progress will be lost.")) onBack(); }}
              className="text-gray-400 font-black uppercase tracking-widest text-xs hover:text-rose-500 transition-colors"
            >
              Withdraw from Hall
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MasteryExamView;
