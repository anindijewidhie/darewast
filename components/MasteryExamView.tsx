
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel } from '../types';
import { generateMasteryExam } from '../services/geminiService';
import { translations } from '../translations';

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
  const [prepVerified, setPrepVerified] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [examResult, setExamResult] = useState<{ skillPoints: number; passed: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const content = await generateMasteryExam(subject, language, level, user);
        setExam(content);
        setLoading(false);
        initCamera();
      } catch (err) { console.error("Generation failed", err); }
    };
    fetchExam();
    return () => stopCamera();
  }, [subject, language, level, user]);

  useEffect(() => {
    if (!loading && timeLeft > 0 && prepVerified && !examResult) {
      const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && !examResult) handleSubmit();
  }, [loading, timeLeft, prepVerified, examResult]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { console.warn("Camera denied."); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
  };

  const handleSubmit = () => {
    const total = exam?.exercises.length || 1;
    const correct = exam?.exercises.reduce((acc, ex, idx) => acc + (answers[idx] === ex.correctAnswer ? 1 : 0), 0) || 0;
    setExamResult({ skillPoints: Math.round((correct / total) * 100), passed: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-fadeIn bg-slate-950 text-white">
        <div className="w-32 h-32 border-[12px] border-dare-gold/10 border-t-dare-gold rounded-full animate-spin"></div>
        <p className="text-4xl font-black uppercase tracking-tighter">Entering Exam Hall...</p>
      </div>
    );
  }

  if (examResult) {
    const isElite = examResult.skillPoints >= 60;
    return (
      <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center p-6 animate-fadeIn">
        <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[4rem] p-16 text-center shadow-2xl border-4 border-dare-gold">
           <div className={`w-32 h-32 ${isElite ? 'bg-dare-gold' : 'bg-dare-teal'} text-white rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl mx-auto mb-10`}>{isElite ? '💎' : '🏅'}</div>
           <h2 className="text-5xl font-black dark:text-white tracking-tighter mb-4">Exam Concluded</h2>
           <div className="grid grid-cols-2 gap-10 my-12">
              <div className="p-10 bg-gray-50 dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mastery Index</p>
                <p className="text-7xl font-black text-dare-gold">{examResult.skillPoints} <span className="text-xl">SP</span></p>
              </div>
              <div className="p-10 bg-gray-50 dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registry Tier</p>
                <p className="text-3xl font-black dark:text-white uppercase leading-tight">{examResult.skillPoints >= 80 ? 'High Career' : (examResult.skillPoints >= 60 ? 'Standard Elite' : 'Foundational')}</p>
              </div>
           </div>
           <button onClick={() => onComplete(Math.round((examResult.skillPoints/100)*(exam?.exercises.length || 10)), exam?.exercises.length || 10)} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl">Finalize Accreditation →</button>
        </div>
      </div>
    );
  }

  if (!prepVerified) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 animate-fadeIn text-center">
        <div className="bg-slate-950 p-16 rounded-[4rem] border-4 border-dare-gold shadow-2xl space-y-10">
           <div className="w-24 h-24 bg-dare-gold/10 text-dare-gold rounded-full flex items-center justify-center text-5xl mx-auto animate-pulse">⚖️</div>
           <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Hall Authentication</h2>
           <p className="text-slate-400 text-xl leading-relaxed">Initializing High-Rigor Verification for <strong>Level {level}</strong>. <br/> Minimum Elite Pass Floor: <strong>60 Skill Points</strong>.</p>
           <button onClick={() => setPrepVerified(true)} className="w-full py-8 bg-dare-gold text-slate-950 rounded-[2.5rem] font-black text-2xl shadow-xl shadow-dare-gold/20 hover:scale-[1.02] transition-all">Accept Proctoring & Start</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fadeIn grid lg:grid-cols-12 gap-10">
      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
         <div className="bg-black rounded-[3rem] overflow-hidden aspect-video relative shadow-2xl border-4 border-dare-gold/20">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-40" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Live Proctoring</div>
         </div>
         <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-center text-white">
            <p className="text-[10px] font-black text-dare-gold uppercase tracking-[0.4em] mb-4">Official Timer</p>
            <div className={`text-7xl font-mono font-black ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : ''}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
         </div>
         <div className="p-8 bg-dare-gold text-slate-950 rounded-[3rem] shadow-xl"><p className="text-[9px] font-black uppercase tracking-widest mb-1">Rigor Target: 60+ SP</p><p className="text-xs font-bold leading-relaxed">High-stakes career readiness requires maintaining focus and logic under strict temporal constraints.</p></div>
      </aside>

      <main className="lg:col-span-8 space-y-10">
        <header className="p-10 bg-slate-950 text-white rounded-[4rem] border-b-[12px] border-dare-gold shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-[8rem] font-black">EXAM</div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Mastery Examination</h1>
          <p className="text-dare-gold font-black uppercase tracking-widest text-sm">{subject.name} • Lvl {level} • Question {currentIdx + 1}/{exam?.exercises.length}</p>
        </header>

        <div className="p-12 md:p-16 bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-slate-800 relative min-h-[500px] flex flex-col justify-between" key={currentIdx}>
           <div>
              <h3 className="text-3xl md:text-5xl font-black dark:text-white leading-[1.1] tracking-tight mb-16">{exam?.exercises[currentIdx]?.question}</h3>
              <div className="grid gap-4">
                 {exam?.exercises[currentIdx]?.options?.map(opt => (
                   <button key={opt} onClick={() => setAnswers({...answers, [currentIdx]: opt})} className={`p-8 text-left rounded-[2rem] border-2 transition-all font-bold text-xl ${answers[currentIdx] === opt ? 'border-dare-gold bg-dare-gold/5 text-dare-gold shadow-xl scale-[1.01]' : 'border-gray-50 dark:border-slate-800 dark:text-white hover:border-gray-200'}`}>{opt}</button>
                 ))}
              </div>
           </div>
           
           <div className="flex justify-between items-center gap-6 mt-16">
              <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))} disabled={currentIdx === 0} className="px-10 py-5 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest disabled:opacity-30">Previous</button>
              {currentIdx < (exam?.exercises.length || 0) - 1 ? (
                <button onClick={() => setCurrentIdx(p => p+1)} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-dare-gold hover:text-slate-950 transition-all">Next Task →</button>
              ) : (
                <button onClick={() => handleSubmit()} className="flex-1 py-5 bg-dare-gold text-slate-950 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl animate-pulse">Finalize Accreditation 🏆</button>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default MasteryExamView;
