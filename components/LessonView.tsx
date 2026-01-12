
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress, MediaItem, SubjectProgress, PronunciationEntry } from '../types';
import { generateLesson } from '../services/geminiService';
import { translations } from '../translations';
import { LEVEL_METADATA } from '../constants';
import AITutor from './AITutor';

interface Props {
  subject: Subject;
  language: Language;
  level: MasteryLevel;
  lessonNumber: number;
  user: User;
  progress: UserProgress | null;
  initialLesson?: LessonContent | null;
  onComplete: (score: number, currentLesson: number, xpEarned: number) => void;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateProgress: (subjectId: string, data: Partial<SubjectProgress>) => void;
}

const SpeakerIcon = ({ active = false, paused = false, className = "w-5 h-5" }: { active?: boolean; paused?: boolean; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    {active && !paused && (
      <path className="animate-pulse" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" strokeWidth="1.5" strokeLinecap="round" />
    )}
  </svg>
);

const LANG_BCP47: Record<string, string> = {
  'English': 'en-US', 'Indonesian': 'id-ID', 'Traditional Chinese': 'zh-TW', 'Simplified Chinese': 'zh-CN',
  'Japanese': 'ja-JP', 'Korean': 'ko-KR', 'Arabic': 'ar-SA', 'Spanish': 'es-ES', 'French': 'fr-FR',
  'Portuguese': 'pt-PT', 'Russian': 'ru-RU', 'Hindi': 'hi-IN', 'Bengali': 'bn-IN', 'Urdu': 'ur-PK'
};

const DEFAULT_LESSON_TIME = 1200; // 20 minutes

const LessonView: React.FC<Props> = ({ subject, language, level, lessonNumber, user, progress, initialLesson, onComplete, onBack, onUpdateProgress }) => {
  const [activeLesson, setActiveLesson] = useState(lessonNumber);
  const [lesson, setLesson] = useState<LessonContent | null>(initialLesson || null);
  const [loading, setLoading] = useState(!initialLesson);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [textInputs, setTextInputs] = useState<Record<number, string>>({});
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [visibleHints, setVisibleHints] = useState<Set<number>>(new Set());
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [xpPool, setXpPool] = useState(0);
  const [isReading, setIsReading] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'media'>('concept');
  const [completedMedia, setCompletedMedia] = useState<Set<string>>(new Set());
  const [isFinishing, setIsFinishing] = useState(false);
  const [activePronunciation, setActivePronunciation] = useState<PronunciationEntry | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isValidatingIdx, setIsValidatingIdx] = useState<number | null>(null);
  const [expandedPointIdx, setExpandedPointIdx] = useState<number | null>(0);

  // Lesson Timer State
  const [timeLeft, setTimeLeft] = useState(DEFAULT_LESSON_TIME);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;
  const saveKey = `darewast-save-${user.username}-${subject.id}-${level}-${activeLesson}`;

  const loadingMessages = useMemo(() => [
    "Aligning Academic DNA...",
    "Synthesizing Knowledge Chapters...",
    "Calibrating Difficulty Spikes...",
    "Adapting to Mastery Level...",
    "Bridging Disciplinary Gaps...",
    "Optimizing Cognitive Load...",
    "Constructing Interdisciplinary Bridges..."
  ], []);

  useEffect(() => {
    let interval: any;
    if (loading || isFinishing) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, isFinishing, loadingMessages]);

  // Lesson Countdown Logic
  useEffect(() => {
    if (loading || isFinishing || isTimerPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isFinishing, isTimerPaused]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setTimeLeft(DEFAULT_LESSON_TIME);
    setIsTimerPaused(false);
  };

  const toggleHint = (i: number) => {
    const next = new Set(visibleHints);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setVisibleHints(next);
  };

  const handleCheckTextAnswer = async (i: number) => {
    const ans = textInputs[i] || '';
    setIsValidatingIdx(i);
    // Simulate AI "Chapter Logic Validation"
    await new Promise(r => setTimeout(r, 800));
    setUserAnswers({ ...userAnswers, [i]: ans });
    setCheckedIndices(prev => new Set(prev).add(i));
    setIsValidatingIdx(null);
  };

  const handleFinishLesson = async () => {
    setIsFinishing(true);
    await new Promise(r => setTimeout(r, 2000));
    
    let score = 0;
    lesson?.exercises.forEach((ex, i) => {
      const userAns = userAnswers[i] || '';
      if (userAns.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim()) {
        score++;
      }
    });
    
    const earnedXp = Math.round((score / (lesson?.exercises.length || 1)) * xpPool);
    onComplete(score, activeLesson, earnedXp);
    setIsFinishing(false);
  };

  const playSpeech = (text: string, id: string) => {
    if (isReading === id) { 
      if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); } 
      else { window.speechSynthesis.pause(); setIsPaused(true); } 
      return; 
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_BCP47[language] || 'en-US';
    utterance.onstart = () => { setIsReading(id); setIsPaused(false); };
    utterance.onend = () => { setIsReading(null); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const loadContent = useCallback(async () => {
    if (initialLesson) return;
    setLoading(true);
    try {
      const content = await generateLesson(subject, language, level, activeLesson, user, progress);
      setLesson(content);
      setXpPool(content.exercises.length * 100);
      const saved = localStorage.getItem(saveKey);
      if (saved) {
        const data = JSON.parse(saved);
        setUserAnswers(data.userAnswers || {});
        setTextInputs(data.textInputs || {});
        setCheckedIndices(new Set(data.checkedIndices || []));
        setCompletedMedia(new Set(data.completedMedia || []));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [subject, language, level, activeLesson, user, progress, initialLesson, saveKey]);

  useEffect(() => { loadContent(); return () => window.speechSynthesis.cancel(); }, [loadContent]);

  const toggleMediaCompletion = (id: string, type: MediaItem['type']) => {
    const next = new Set(completedMedia);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCompletedMedia(next);
  };

  const themeColor = useMemo(() => {
    switch (subject.category) {
      case 'Literacy': return '#53CDBA'; case 'Numeracy': return '#CCB953'; case 'Science': return '#4D96FF';
      case 'Humanities': return '#FF9F43'; case 'Tech': return '#B953CC'; default: return '#53CDBA';
    }
  }, [subject.category]);

  const progressPercent = lesson ? Math.round((checkedIndices.size / (lesson.exercises.length || 1)) * 100) : 0;

  const renderExplanation = useMemo(() => {
    if (!lesson?.explanation) return null;
    if (!lesson?.pronunciationGuide || lesson.pronunciationGuide.length === 0) {
      return <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{lesson.explanation}</p>;
    }

    const words = lesson.pronunciationGuide.map(g => g.word);
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = lesson.explanation.split(regex);

    return (
      <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          const guide = lesson.pronunciationGuide?.find(g => g.word.toLowerCase() === part.toLowerCase());
          if (guide) {
            return (
              <span 
                key={i} 
                onClick={() => setActivePronunciation(guide)}
                className="relative inline-block cursor-pointer group"
              >
                <span className="text-dare-teal font-black border-b-2 md:border-b-4 border-dare-teal/30 hover:border-dare-teal transition-all">
                  {part}
                </span>
                <span className="absolute -top-1 -right-1 flex h-2 md:h-3 w-2 md:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dare-teal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 md:h-3 w-2 md:w-3 bg-dare-teal"></span>
                </span>
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  }, [lesson, setActivePronunciation]);

  if (loading || isFinishing) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-10 animate-fadeIn overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 border-[8px] md:border-[12px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin"></div>
          <div className="absolute inset-3 md:inset-4 border-[8px] md:border-[12px] border-dare-gold/10 border-b-dare-gold rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl group-hover:scale-110 transition-transform">🧬</div>
        </div>
        <div className="text-center max-w-sm px-6 relative z-10">
          <p className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter mb-4 animate-pulse">
            {loadingMessages[loadingMsgIdx]}
          </p>
          <div className="flex justify-center gap-1.5 mb-6">
            {loadingMessages.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === loadingMsgIdx ? 'w-8 bg-dare-teal' : 'w-2 bg-gray-200 dark:bg-slate-800'}`}></div>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-relaxed text-center">
            Architected by A. Widhi • Universal Mastery Protocol
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fadeIn px-3 md:px-4 relative">
      {isTutorOpen && <AITutor user={user} language={language} context={lesson?.explanation || ''} onClose={() => setIsTutorOpen(false)} />}
      
      {activePronunciation && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 md:p-6 bg-slate-950/40 backdrop-blur-sm animate-fadeIn" onClick={() => setActivePronunciation(null)}>
           <div 
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/20 max-w-sm w-full animate-fadeIn"
            onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mb-1">Pronunciation Guide</p>
                    <h4 className="text-3xl md:text-4xl font-black dark:text-white tracking-tighter">{activePronunciation.word}</h4>
                 </div>
                 <button onClick={() => playSpeech(activePronunciation.word, `pronounce-${activePronunciation.word}`)} className="w-12 h-12 md:w-14 md:h-14 bg-dare-teal/10 text-dare-teal rounded-2xl flex items-center justify-center text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all">
                    🔊
                 </button>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phonetic IPA</p>
                    <p className="text-lg md:text-xl font-mono text-gray-700 dark:text-gray-300">/{activePronunciation.phonetic}/</p>
                 </div>
                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phonic Breakdown</p>
                    <p className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 italic">"{activePronunciation.guide}"</p>
                 </div>
              </div>
              <button 
                onClick={() => setActivePronunciation(null)}
                className="w-full mt-6 md:mt-8 py-3 md:py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
              >
                Got it
              </button>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 md:mb-10">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-teal font-black uppercase tracking-widest text-[10px] md:text-xs transition-all">← Abort Session</button>
        <button onClick={() => setIsTutorOpen(true)} className="px-3 py-1.5 md:px-5 md:py-2 bg-white dark:bg-slate-900 border-2 border-dare-teal/30 text-dare-teal rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest md:tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
          📞 Request A.I. Support
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/10 overflow-hidden relative">
        <header className="relative h-[250px] md:h-[450px] flex items-end p-6 md:p-12 overflow-hidden text-white">
           <div className="absolute inset-0 z-0">
              <img 
                src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070`} 
                className="w-full h-full object-cover grayscale opacity-40 mix-blend-overlay scale-105"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              <div 
                className="absolute inset-0 opacity-40 animate-pulse" 
                style={{ background: `radial-gradient(circle at 70% 30%, ${themeColor}33 0%, transparent 70%)` }}
              ></div>
           </div>

           <div className="relative z-10 space-y-4 md:space-y-6 w-full">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-5xl shadow-2xl border border-white/20">
                    {subject.icon}
                 </div>
                 <div>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-80 mb-1">Module: {subject.name}</p>
                    <div className="flex gap-2">
                       <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-white/10">Level {level}</span>
                       <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-white/10">Chapter {activeLesson}/12</span>
                    </div>
                 </div>
              </div>
              <h1 className="text-3xl md:text-7xl font-black tracking-tighter leading-[1] md:leading-[0.9] drop-shadow-2xl">
                {lesson?.title}
              </h1>
           </div>
        </header>

        <div className="sticky top-0 z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 md:px-12 py-3 md:py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
           <div className="flex gap-2 md:gap-4 w-full md:w-auto">
             <button onClick={() => setActiveTab('concept')} className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'concept' ? 'bg-dare-teal text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>{t('concept')}</button>
             <button onClick={() => setActiveTab('media')} className={`flex-1 md:flex-none px-3 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'media' ? 'bg-dare-teal text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>{t('mediaHub')}</button>
           </div>
           
           <div className="flex items-center gap-3 md:gap-8 w-full md:w-auto">
             {/* Timer Component */}
             <div className="flex items-center gap-2 md:gap-3 bg-gray-50 dark:bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <button 
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-lg transition-all text-[10px] md:text-base ${isTimerPaused ? 'bg-dare-gold text-white' : 'bg-dare-teal text-white'}`}
                  aria-label={isTimerPaused ? "Resume Timer" : "Pause Timer"}
                >
                  {isTimerPaused ? '▶️' : '⏸️'}
                </button>
                <div className="flex flex-col min-w-[50px] md:min-w-[60px]">
                  <span className={`text-xs md:text-base font-mono font-black tabular-nums transition-colors leading-none ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <button onClick={handleResetTimer} className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-gray-400 hover:text-dare-purple text-left leading-none mt-0.5">Reset</button>
                </div>
             </div>

             {/* Mastery Progress */}
             <div className="flex items-center gap-3 md:gap-4 flex-1 md:flex-none">
               <div className="flex-1 md:w-48 h-1.5 md:h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ease-out`} style={{ width: `${progressPercent}%`, backgroundColor: themeColor }}></div>
               </div>
               <span className="text-sm md:text-xl font-black dark:text-white shrink-0">{progressPercent}%</span>
             </div>
           </div>
        </div>

        <div className="p-6 md:p-12 space-y-16 md:space-y-24">
          {activeTab === 'concept' ? (
            <>
              <section className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-1">Foundational Theory</h2>
                    <p className="text-[8px] md:text-[9px] font-bold text-dare-teal uppercase tracking-widest">Interactive guide active • Click teal words</p>
                  </div>
                  <button 
                    onClick={() => playSpeech(lesson?.explanation || '', 'explanation')} 
                    className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl transition-all font-black text-[8px] md:text-[10px] uppercase tracking-widest ${isReading === 'explanation' ? 'bg-dare-teal text-white scale-105 shadow-xl' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-dare-teal'}`}
                  >
                    <SpeakerIcon active={isReading === 'explanation'} paused={isPaused} />
                    <span className="hidden xs:inline">{isReading === 'explanation' ? (isPaused ? 'Resume' : 'Pause') : 'Synthesis Voice'}</span>
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border-2 border-transparent hover:border-dare-teal transition-all shadow-inner">
                  {renderExplanation}
                </div>
              </section>

              {lesson?.timelinePoints && (
                <section className="space-y-8 md:space-y-12">
                   <h2 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">The Logic Chain</h2>
                   <div className="relative pl-8 md:pl-12 border-l-2 md:border-l-4 border-dashed border-gray-100 dark:border-slate-800 space-y-8 md:space-y-10">
                      {lesson.timelinePoints.map((point, idx) => {
                        const isExpanded = expandedPointIdx === idx;
                        return (
                          <div 
                            key={idx} 
                            className="relative group cursor-pointer"
                            onClick={() => setExpandedPointIdx(isExpanded ? null : idx)}
                            role="button"
                            aria-expanded={isExpanded}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setExpandedPointIdx(isExpanded ? null : idx)}
                          >
                             <div 
                                className={`absolute -left-[30px] md:-left-[44px] top-0 w-10 h-10 md:w-16 md:h-16 bg-white dark:bg-slate-900 border-2 md:border-4 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center text-xl md:text-3xl shadow-xl transition-all duration-500 z-10 ${isExpanded ? 'scale-110' : 'border-gray-100 dark:border-slate-800'}`}
                                style={{ borderColor: isExpanded ? themeColor : undefined }}
                              >
                                {point.icon}
                                {isExpanded && (
                                  <div className="absolute inset-0 rounded-[1rem] md:rounded-[1.5rem] animate-ping opacity-20" style={{ backgroundColor: themeColor }}></div>
                                )}
                             </div>
                             <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-500 ${isExpanded ? 'bg-white dark:bg-slate-800 shadow-2xl' : 'bg-gray-50 dark:bg-slate-800/30 border-transparent hover:border-gray-200 dark:hover:border-slate-700'}`} style={{ borderColor: isExpanded ? `${themeColor}40` : undefined }}>
                                <div className="flex justify-between items-center">
                                   <h3 className={`text-lg md:text-xl font-black tracking-tight transition-all duration-300 ${isExpanded ? 'dark:text-white translate-x-2' : 'text-gray-400'}`} style={{ color: isExpanded ? undefined : 'inherit' }}>
                                      {point.title}
                                   </h3>
                                   <span className={`text-xs transition-transform duration-500 ${isExpanded ? 'rotate-180 opacity-100' : 'opacity-20'}`}>▼</span>
                                </div>
                                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                   <div className="p-4 md:p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        {point.detail}
                                      </p>
                                   </div>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </section>
              )}

              <section className="space-y-8 md:space-y-12">
                <h2 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.5em]">Mastery Validation</h2>
                <div className="space-y-8 md:space-y-12">
                  {lesson?.exercises.map((ex, i) => {
                    const isChecked = checkedIndices.has(i);
                    const isHintVisible = visibleHints.has(i);
                    const isValidating = isValidatingIdx === i;
                    
                    return (
                      <div key={i} className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all duration-500 relative ${isChecked ? 'bg-emerald-50/20 border-emerald-500/30' : 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}>
                        <div className="flex justify-between items-start mb-6 md:mb-8 gap-4">
                           <div className="flex-1">
                              <p className="text-[8px] md:text-[9px] font-black text-dare-purple uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3">Validation Protocol #{i+1}</p>
                              <h3 className="text-lg md:text-2xl font-black text-gray-800 dark:text-white leading-tight">{ex.question}</h3>
                           </div>
                           {!isChecked && ex.hint && (
                             <button 
                               onClick={() => toggleHint(i)} 
                               className={`shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isHintVisible ? 'bg-dare-gold text-white shadow-lg rotate-3 scale-105' : 'bg-white dark:bg-slate-900 text-dare-gold border border-dare-gold/20 hover:bg-dare-gold/5'}`}
                             >
                               <span>💡</span>
                               <span className="hidden xs:inline">{t('hint')}</span>
                             </button>
                           )}
                        </div>
                        
                        {isHintVisible && !isChecked && (
                          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-dashed border-dare-gold/40 rounded-[1.5rem] md:rounded-[2rem] animate-fadeIn relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-20 md:w-24 h-20 md:h-24 bg-dare-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                             <button 
                               onClick={() => toggleHint(i)}
                               className="absolute top-3 md:top-4 right-3 md:right-4 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-dare-gold/10 text-dare-gold hover:bg-dare-gold hover:text-white transition-all z-10"
                               aria-label="Dismiss Hint"
                             >
                               ✕
                             </button>
                             <p className="text-xs md:text-sm font-bold text-amber-800 dark:text-amber-200 italic leading-relaxed pr-8 md:pr-10 relative z-0">
                               "Insight: {ex.hint}"
                             </p>
                          </div>
                        )}

                        <div className="grid gap-3 md:gap-4">
                          {ex.options ? (
                            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                              {ex.options.map(opt => (
                                <button 
                                  key={opt} 
                                  disabled={isChecked || isValidating} 
                                  onClick={async () => {
                                    if (opt === ex.correctAnswer) {
                                      setIsValidatingIdx(i);
                                      await new Promise(r => setTimeout(r, 800));
                                      setUserAnswers({...userAnswers, [i]: opt});
                                      setCheckedIndices(prev => new Set(prev).add(i));
                                      setIsValidatingIdx(null);
                                    } else {
                                      alert("Logic mismatch. Review the concept and try again.");
                                    }
                                  }}
                                  className={`p-4 md:p-6 text-left rounded-[1.5rem] md:rounded-[2rem] border-2 font-bold transition-all relative flex justify-between items-center text-sm md:text-lg ${isChecked && opt === ex.correctAnswer ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 hover:border-dare-teal'}`}
                                >
                                  <span>{opt}</span>
                                  {isValidating && opt === ex.correctAnswer && <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="text" 
                                disabled={isChecked || isValidating} 
                                value={isChecked ? userAnswers[i] : (textInputs[i] || '')} 
                                onChange={(e) => setTextInputs({ ...textInputs, [i]: e.target.value })} 
                                placeholder="Formal Response Required..." 
                                className={`w-full p-4 md:p-6 bg-white dark:bg-slate-950 rounded-[1.5rem] md:rounded-[2rem] border-2 outline-none font-bold text-base md:text-lg ${isChecked ? 'border-emerald-500 text-emerald-600' : 'border-gray-100 focus:border-dare-teal shadow-inner'}`} 
                              />
                              {!isChecked && (
                                <button 
                                  onClick={() => handleCheckTextAnswer(i)} 
                                  disabled={isValidating}
                                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 px-4 py-2 md:px-8 md:py-3 bg-dare-teal text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
                                >
                                  {isValidating ? <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                                  {isValidating ? 'Validating' : 'Verify'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="animate-fadeIn grid sm:grid-cols-2 gap-6 md:gap-8">
               {lesson?.mediaResources?.map((res) => (
                 <div key={res.id} className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-dare-teal transition-all group shadow-sm">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-slate-800 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                      {res.type === 'ebook' ? '📖' : res.type === 'video' ? '🎬' : '🎙️'}
                    </div>
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">{res.type}</p>
                    <h3 className="text-lg md:text-xl font-black dark:text-white mb-4 md:mb-6 leading-tight line-clamp-2">{res.title}</h3>
                    <button 
                      onClick={() => toggleMediaCompletion(res.id, res.type as any)}
                      className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${completedMedia.has(res.id) ? 'bg-emerald-500 text-white' : 'bg-dare-teal text-white shadow-xl'}`}
                    >
                      {completedMedia.has(res.id) ? '✓ Resource Mastered' : 'Engage Resource'}
                    </button>
                 </div>
               ))}
            </section>
          )}

          {checkedIndices.size === (lesson?.exercises?.length || 0) && (
            <button 
              onClick={handleFinishLesson} 
              className="w-full py-8 md:py-10 bg-gradient-to-r from-dare-teal via-dare-purple to-dare-gold text-white rounded-[2rem] md:rounded-[3rem] font-black text-xl md:text-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Finalize Mastery Chapter 🎓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
