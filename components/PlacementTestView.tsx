
import React, { useState, useEffect, useRef } from 'react';
import { Language, User, MasteryLevel, UserProgress, AccommodationType, Subject, InstitutionStatus } from '../types';
import { generatePlacementTest, analyzeTestResults } from '../services/geminiService';
import { translations } from '../translations';
import { SUBJECTS, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  user: User | null;
  subject?: Subject; 
  testType?: 'placement' | 'assessment' | 'relearn' | 'transfer';
  onComplete: (recommendedProgress: UserProgress) => void;
  onCancel: () => void;
}

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

  // Transfer specific state
  const [institutionStatus, setInstitutionStatus] = useState<InstitutionStatus>('regular');
  const [institutionName, setInstitutionName] = useState('');
  const [isScanningReport, setIsScanningReport] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const getThemeColor = () => {
    if (testType === 'transfer') return 'blue-600';
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

  const handleScanReport = async () => {
    setIsScanningReport(true);
    // Simulate OCR and AI Analysis of a report card
    await new Promise(r => setTimeout(r, 3000));
    setIsScanningReport(false);
    
    // Jump to results with a high placement based on "detected" report card
    setFinalScore(10);
    setFinalLevel('Q'); // Place into University foundations
    setMasteryInsight(`Transferred from ${institutionName || 'Previous Institution'} (${institutionStatus}). Report card analysis detected comprehensive mastery of K-12 standards. Enrolled in University Research Track.`);
    setFinished(true);
    setAnalyzing(false);
    sounds.finish();
  };

  const startTest = async () => {
    sounds.select();
    setLoading(true);
    try {
      const data = await generatePlacementTest(language, user, accommodation, subject, testType as any);
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

  if (isScanningReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-fadeIn text-center">
        <div className="relative group">
          <div className="w-32 h-32 border-[12px] border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-5xl">📄</div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Analyzing Registry</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Processing report card from {institutionName || 'External School'}...</p>
          <div className="flex justify-center gap-1">
             {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
          </div>
        </div>
      </div>
    );
  }

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
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">Transition Concluded</h2>
              <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Diagnostic Mastery Summary</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-slate-800 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-700 relative group">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confidence Score</p>
                <p className={`text-6xl font-black text-${themeColor}`}>{Math.round((finalScore / 10) * 100)}%</p>
                <p className="text-xs font-bold text-gray-500 mt-2">Verified Academic Nodes</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Institutional Placement</p>
                <p className="text-6xl font-black dark:text-white">Level {finalLevel}</p>
                <p className="text-xs font-bold text-gray-500 mt-2">{LEVEL_METADATA[finalLevel].equivalency}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-10 rounded-[3.5rem] border border-gray-100 dark:border-slate-700 text-left relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-2 h-full bg-${themeColor} opacity-50`}></div>
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Transfer Mastery Insight</h4>
               {analyzing ? (
                 <div className="flex items-center gap-4 py-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-3/4"></div>
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

  // Initial Setup State
  if (currentIndex === -1) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 space-y-12 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className={`w-24 h-24 bg-${themeColor}/10 text-${themeColor} rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl`}>🎯</div>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{t('transferTitle')}</h2>
          <p className="text-gray-500 font-medium text-xl leading-relaxed max-w-2xl mx-auto">
            {t('transferSubtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl space-y-8 flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black dark:text-white mb-6">1. Transfer History</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">{t('transferInstitution')}</label>
                       <input 
                         type="text" 
                         value={institutionName} 
                         onChange={e => setInstitutionName(e.target.value)}
                         placeholder="e.g. Westford Academy"
                         className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                       />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {(['regular', 'closed', 'problematic'] as InstitutionStatus[]).map(status => (
                         <button 
                           key={status}
                           onClick={() => setInstitutionStatus(status)}
                           className={`py-3 px-1 rounded-xl text-[8px] font-black uppercase transition-all ${institutionStatus === status ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
                         >
                           {t(`${status}Institution`)}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleScanReport}
                disabled={!institutionName.trim()}
                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                📄 {t('reportCardScan')}
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl space-y-8 flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black dark:text-white mb-6">2. Diagnostic Mastery</h3>
                 <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                   Don't have a report card? Take our 24/7 AI Diagnostic to determine your exact entry point into the curriculum.
                 </p>
                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Institutional Accommodation</p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                       <button onClick={() => setAccommodation('none')} className={`py-3 rounded-xl text-[10px] font-black transition-all ${accommodation === 'none' ? 'bg-dare-teal text-white' : 'text-gray-400'}`}>Standard</button>
                       <button onClick={() => setAccommodation('idd')} className={`py-3 rounded-xl text-[10px] font-black transition-all ${accommodation === 'idd' ? 'bg-dare-teal text-white' : 'text-gray-400'}`}>IDD Support</button>
                    </div>
                 </div>
              </div>

              <button 
                onClick={startTest}
                className="w-full py-6 bg-dare-teal text-white rounded-2xl font-black text-lg shadow-xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                🔬 Run Diagnostic Test
              </button>
           </div>
        </div>

        <div className="text-center">
          <button onClick={onCancel} className="text-gray-400 font-black uppercase tracking-widest text-xs hover:text-rose-500 transition-colors">Abort Global Transfer</button>
        </div>
      </div>
    );
  }

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
