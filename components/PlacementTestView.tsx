
import React, { useState, useEffect, useRef } from 'react';
import { Language, User, MasteryLevel, UserProgress, AccommodationType, Subject } from '../types';
import { generatePlacementTest, analyzeTestResults } from '../services/geminiService';
import { translations } from '../translations';
import { SUBJECTS, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  user: User | null;
  subject?: Subject; // Subject-specific test
  // Added 'relearn' to testType to support Relearn Hub functionality
  testType?: 'placement' | 'assessment' | 'relearn';
  onComplete: (recommendedProgress: UserProgress) => void;
  onCancel: () => void;
}

// Minimal Audio System for Test Feedback
const useTestAudio = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const init = () => { if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)(); };
  const play = (freqs: number[], type: OscillatorType = 'sine', duration = 0.1) => {
    init();
    const ctx = audioCtx.current!;
    const time = ctx.currentTime;
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(time); osc.stop(time + duration);
    });
  };
  return {
    tick: () => play([1000], 'sine', 0.03),
    select: () => play([600, 800], 'sine', 0.1),
    finish: () => play([523, 659, 783, 1046], 'triangle', 0.4),
  };
};

const PlacementTestView: React.FC<Props> = ({ language, user, subject, testType = 'placement', onComplete, onCancel }) => {
  const sounds = useTestAudio();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [masteryInsight, setMasteryInsight] = useState<string>('');
  const [accommodation, setAccommodation] = useState<AccommodationType>(user?.accessibility?.iddSupport ? 'idd' : 'none');
  const [finalLevel, setFinalLevel] = useState<MasteryLevel>('A');
  const [finalScore, setFinalScore] = useState(0);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const getThemeColor = () => {
    if (!subject) return 'dare-teal';
    switch (subject.category) {
      case 'Literacy': return 'dare-teal';
      case 'Numeracy': return 'dare-gold';
      case 'Science': return 'blue-500';
      case 'Humanities': return 'orange-500';
      case 'Tech': return 'dare-purple';
      case 'Music': return 'pink-500';
      case 'Ethics': return 'emerald-500';
      default: return 'dare-teal';
    }
  };

  const themeColor = getThemeColor();

  const startTest = async () => {
    sounds.select();
    setLoading(true);
    try {
      // Corrected call to match updated signature in geminiService
      const data = await generatePlacementTest(language, user, accommodation, subject, testType as 'placement' | 'assessment' | 'relearn');
      setQuestions(data.questions);
      setCurrentIndex(0);
    } catch (err) {
      alert("Failed to load test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (ans: string) => {
    sounds.tick();
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      processFinalResults(newAnswers);
    }
  };

  const processFinalResults = async (finalAnswers: string[]) => {
    setFinished(true);
    setAnalyzing(true);
    sounds.finish();
    
    let score = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === questions[i].correctAnswer) score++;
    });
    setFinalScore(score);

    // Level Calculation Logic
    let recommended: MasteryLevel = 'A';
    if (score >= 10) recommended = 'Q';
    else if (score >= 8) recommended = 'N';
    else if (score >= 6) recommended = 'K';
    else if (score >= 4) recommended = 'E';
    else if (score >= 2) recommended = 'C';
    setFinalLevel(recommended);

    try {
      // Corrected call to analyzeTestResults which is now implemented in geminiService
      const insight = await analyzeTestResults(subject || SUBJECTS[0], score, questions.length, recommended, language, user);
      setMasteryInsight(insight);
    } catch (e) {
      setMasteryInsight("Your performance shows a clear understanding of fundamental concepts, providing a solid springboard for advanced mastery.");
    } finally {
      setAnalyzing(false);
    }
  };

  const commitResults = () => {
    sounds.select();
    let newProgress: UserProgress;
    if (subject) {
        newProgress = { [subject.id]: { level: finalLevel, lessonNumber: 1 } };
    } else {
        newProgress = SUBJECTS.reduce((acc, sub) => ({
            ...acc,
            [sub.id]: { level: finalLevel, lessonNumber: 1 }
        }), {} as UserProgress);
    }
    onComplete(newProgress);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn text-center">
        <div className="relative">
          <div className={`w-24 h-24 border-8 border-${themeColor}/20 border-t-${themeColor} rounded-full animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🔬</div>
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Calibrating Lab</h2>
          <p className="text-gray-500 font-bold">Synthesizing a diagnostic session tailored to your profile...</p>
        </div>
      </div>
    );
  }

  // Render finished state with results
  if (finished) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-full h-4 bg-${themeColor}`}></div>
          <div className="p-12 md:p-20 text-center space-y-12">
            <div className="space-y-4">
              <div className={`w-24 h-24 bg-${themeColor}/10 text-${themeColor} rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl animate-bounce`}>✨</div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">Assessment Concluded</h2>
              <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Diagnostic Mastery Summary</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-slate-800 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-700 relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Accuracy Score</p>
                <p className={`text-6xl font-black text-${themeColor}`}>{Math.round((finalScore / questions.length) * 100)}%</p>
                <p className="text-xs font-bold text-gray-500 mt-2">{finalScore} / {questions.length} Correct</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Placed Entry Level</p>
                <p className="text-6xl font-black text-gray-900 dark:text-white">Level {finalLevel}</p>
                <p className="text-xs font-bold text-gray-500 mt-2">{LEVEL_METADATA[finalLevel].equivalency}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-slate-700 text-left relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-2 h-full bg-${themeColor} opacity-50`}></div>
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">AI Mastery Insight</h4>
               {analyzing ? (
                 <div className="flex items-center gap-4 py-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-3/4"></div>
                       <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-1/2"></div>
                    </div>
                 </div>
               ) : (
                 <p className="text-xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                   "{masteryInsight}"
                 </p>
               )}
            </div>

            <button 
              onClick={commitResults}
              className={`w-full py-8 bg-${themeColor} text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-${themeColor}/50`}
            >
              Start Your {subject?.name || 'Academic'} Journey →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render intro state
  if (currentIndex === -1) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-12 animate-fadeIn">
        <div className="space-y-4">
          <div className={`w-24 h-24 bg-${themeColor}/10 text-${themeColor} rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl`}>🎯</div>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Diagnostic Mastery Setup</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Initialize your profile calibration. This session detects your optimal entry point into the darewast Global Knowledge Base.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl text-left space-y-8">
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-4 block">Personalize Assessment Accessibility</label>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setAccommodation('none')} className={`py-4 rounded-xl text-xs font-black transition-all ${accommodation === 'none' ? 'bg-dare-teal text-white' : 'bg-gray-50 text-gray-400'}`}>Standard Mode</button>
                 <button onClick={() => setAccommodation('idd')} className={`py-4 rounded-xl text-xs font-black transition-all ${accommodation === 'idd' ? 'bg-dare-teal text-white' : 'bg-gray-50 text-gray-400'}`}>IDD Support</button>
              </div>
           </div>
           
           <button 
            onClick={startTest}
            className={`w-full py-6 bg-${themeColor} text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all`}
           >
            Begin Calibration →
           </button>
        </div>

        <button onClick={onCancel} className="text-gray-400 font-black uppercase tracking-widest text-xs hover:text-rose-500 transition-colors">Abandon Session</button>
      </div>
    );
  }

  // Render active testing state
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="mb-10 space-y-4">
         <div className="flex justify-between items-end">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
            <p className={`text-xl font-black text-${themeColor}`}>{progressPercent}% Complete</p>
         </div>
         <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full bg-${themeColor} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-2 h-full bg-${themeColor}`}></div>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-10 leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="grid gap-4">
          {currentQuestion.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="p-6 text-left rounded-[2rem] border-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 hover:border-dare-teal hover:bg-white dark:hover:bg-slate-800 transition-all font-bold text-lg dark:text-white group flex justify-between items-center"
            >
              <span>{opt}</span>
              <span className="opacity-0 group-hover:opacity-100 text-dare-teal transition-opacity">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementTestView;
