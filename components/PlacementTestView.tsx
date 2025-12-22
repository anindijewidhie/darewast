
import React, { useState, useEffect, useRef } from 'react';
import { Language, User, MasteryLevel, UserProgress, AccommodationType, Subject } from '../types';
import { generatePlacementTest, analyzeTestResults } from '../services/geminiService';
import { translations } from '../translations';
import { SUBJECTS, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  user: User | null;
  subject?: Subject; // Subject-specific test
  testType?: 'placement' | 'assessment';
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
      // Fixed: Explicitly cast testType to satisfy the union type requirement of generatePlacementTest
      const data = await generatePlacementTest(language, user, accommodation, subject, testType as 'placement' | 'assessment');
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

  if (currentIndex === -1) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/20 overflow-hidden relative">
          {/* Header */}
          <div className={`p-12 md:p-20 text-center relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-${themeColor} opacity-5`}></div>
            <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${themeColor} rounded-full blur-[100px] opacity-10`}></div>
            
            <div className="relative z-10 space-y-8">
              <div className={`w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto shadow-2xl border border-gray-100 dark:border-slate-700`}>
                {subject?.icon || '🎯'}
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                  {subject ? subject.name : 'Universal'} <br/>
                  <span className={`text-${themeColor}`}>{testType === 'placement' ? 'Placement Lab' : 'Mastery Scan'}</span>
                </h2>
                <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  {testType === 'placement' 
                    ? 'Verify your current knowledge to skip fundamental entry levels.'
                    : 'A comprehensive diagnostic of your mastery within the current curriculum nodes.'}
                </p>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Adaptive Sensory Support</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'none', label: 'Standard', icon: '👤' },
                    { id: 'dyslexia', label: 'Dyslexia', icon: '🔤' },
                    { id: 'visual', label: 'Visual+', icon: '👁️' },
                    { id: 'adhd', label: 'Focus Boost', icon: '⚡' },
                    { id: 'idd', label: 'Cognitive+', icon: '🧩' },
                    { id: 'hearing', label: 'Audio Focus', icon: '👂' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => { sounds.tick(); setAccommodation(item.id as AccommodationType); }}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 group ${
                        accommodation === item.id 
                        ? `border-${themeColor} bg-${themeColor}/5 text-${themeColor} shadow-lg scale-105` 
                        : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-12 space-y-6">
                <button 
                  onClick={startTest}
                  className={`w-full py-8 bg-${themeColor} text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  Initialize Diagnostic Session
                </button>
                <button 
                  onClick={onCancel}
                  className="text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                >
                  ← Return to Academic Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className={`max-w-4xl mx-auto py-12 px-4 animate-fadeIn ${accommodation === 'dyslexia' ? 'font-accessible' : ''}`}>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
        <div className="flex-1 w-full max-w-md">
           <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
              <span className={`text-[10px] font-black text-${themeColor} uppercase tracking-widest`}>Lab Status: Optimal</span>
           </div>
           <div className="h-3 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
              <div 
                className={`h-full bg-${themeColor} rounded-full transition-all duration-700 shadow-lg`}
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
           </div>
        </div>
        <div className="flex gap-4">
           {accommodation !== 'none' && (
             <div className={`px-4 py-2 bg-${themeColor}/10 border border-${themeColor}/20 rounded-2xl flex items-center gap-2`}>
                <span className="text-xl">🛠️</span>
                <span className={`text-[10px] font-black uppercase text-${themeColor}`}>{accommodation} Mode</span>
             </div>
           )}
           <button onClick={onCancel} className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-all text-gray-400">✕</button>
        </div>
      </div>

      <div className={`bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[4rem] shadow-2xl border border-white/20 relative overflow-hidden ${accommodation === 'visual' ? `border-8 border-${themeColor}` : ''} ${accommodation === 'idd' ? 'border-8 border-dare-purple' : ''}`}>
        <div className="relative z-10 space-y-12">
          <header className="space-y-4">
            <p className={`text-[11px] font-black text-${themeColor} uppercase tracking-[0.4em]`}>Mastery Probe: {currentQ.difficulty}</p>
            <h3 className={`font-black text-gray-900 dark:text-white leading-tight ${accommodation === 'visual' ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
              {currentQ.question}
            </h3>
          </header>

          <div className={`grid gap-4 ${accommodation === 'adhd' ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {currentQ.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`w-full text-left border-2 border-transparent hover:border-${themeColor} rounded-[2.5rem] transition-all font-bold shadow-sm group ${
                  accommodation === 'visual' ? 'p-10 text-3xl' : 'p-8 text-xl'
                } ${
                  accommodation === 'dyslexia' || accommodation === 'idd' ? 'bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-white' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-800'
                } ${accommodation === 'idd' ? 'border-gray-200 dark:border-slate-700' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-2xl text-${themeColor}`}>→</span>
                </div>
              </button>
            ))}
          </div>
          
          {accommodation === 'adhd' && (
            <div className="flex items-center justify-center gap-3 py-4 animate-pulse">
               <div className="w-2 h-2 bg-dare-teal rounded-full"></div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Shield Active</p>
               <div className="w-2 h-2 bg-dare-teal rounded-full"></div>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] px-8">Diagnostic Data Stream: Institutional Grade</p>
    </div>
  );
};

export default PlacementTestView;
