
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel } from '../types';
import { generateMasteryExam } from '../services/geminiService';
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
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isProctored, setIsProctored] = useState(false);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const content = await generateMasteryExam(subject, language, level, user);
        setExam(content);
        setLoading(false);
        initCamera();
      } catch (err) {
        console.error("Exam generation failed", err);
      }
    };
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera();
    };
  }, [subject, language, level, user]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsProctored(true);
      }
    } catch (e) {
      console.warn("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  useEffect(() => {
    if (!loading && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timerRef.current);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [loading, timeLeft]);

  const handleSubmit = () => {
    const score = exam?.exercises.reduce((acc, ex, idx) => {
      const isCorrect = answers[idx]?.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim();
      return acc + (isCorrect ? 1 : 0);
    }, 0) || 0;
    onComplete(score, exam?.exercises.length || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-fadeIn">
        <div className="relative">
          <div className="w-28 h-28 border-[10px] border-dare-gold/10 border-t-dare-gold rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🏛️</div>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Entering Exam Hall</p>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing High-Rigor Proctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn grid lg:grid-cols-12 gap-10">
      <aside className="lg:col-span-4 space-y-6">
         <div className="bg-black rounded-[3rem] overflow-hidden aspect-video relative shadow-2xl border-4 border-white/5">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-50" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
               Live Proctoring Active
            </div>
            {!isProctored && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-[10px] font-black uppercase p-6 text-center">
                Camera Feed Encrypted / Disabled
              </div>
            )}
         </div>

         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Official Timer</p>
            <div className={`text-7xl font-mono font-black tracking-tighter ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="mt-10 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-dare-gold transition-all duration-1000" style={{ width: `${(Object.keys(answers).length / (exam?.exercises.length || 1)) * 100}%` }}></div>
            </div>
         </div>
      </aside>

      <main className="lg:col-span-8 space-y-10">
        <header className="p-10 bg-slate-900 text-white rounded-[3.5rem] border-b-[12px] border-dare-gold shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12">EXAM</div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Mastery Examination</h1>
            <p className="text-dare-gold font-black text-lg">{subject.name} • Level {level}</p>
          </div>
        </header>

        <div className="space-y-8 pb-32">
          {exam?.exercises.map((ex, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800 hover:border-dare-gold transition-all">
              <div className="flex items-start gap-6 mb-10">
                <span className="text-3xl font-black text-gray-200 dark:text-slate-800">0{i + 1}</span>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-tight">{ex.question}</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {ex.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [i]: opt })}
                    className={`p-6 text-left rounded-[2rem] border-2 transition-all font-bold text-lg ${
                      answers[i] === opt 
                      ? 'border-dare-gold bg-dare-gold/5 text-dare-gold shadow-lg' 
                      : 'border-gray-50 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 text-gray-500 hover:border-gray-200'
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
                    className="w-full p-6 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-gold rounded-[2rem] outline-none font-bold text-lg dark:text-white"
                  />
                )}
              </div>
            </div>
          ))}

          <button 
            onClick={() => { if(confirm("Submit all answers for official assessment?")) handleSubmit(); }}
            className="w-full py-8 bg-dare-gold text-slate-900 rounded-[3rem] font-black text-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Submit Formal Assessment →
          </button>
        </div>
      </main>
    </div>
  );
};

export default MasteryExamView;
