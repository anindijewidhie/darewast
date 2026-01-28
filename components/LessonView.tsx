
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress, MediaItem, SubjectProgress, PronunciationEntry, LearningStyle, ScheduledSession, EssayGradingResult } from '../types';
import { generateLesson, gradeEssay } from '../services/geminiService';
import { translations } from '../translations';
import { LEVEL_METADATA, getInstitutionalGrade, PODCAST_DURATIONS } from '../constants';
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

const DEFAULT_LESSON_TIME = 1800; 

const LessonView: React.FC<Props> = ({ subject, language, level, lessonNumber, user, progress, initialLesson, onComplete, onBack, onUpdateUser, onUpdateProgress }) => {
  const [activeLesson, setActiveLesson] = useState(lessonNumber);
  const [lesson, setLesson] = useState<LessonContent | null>(initialLesson || null);
  const [loading, setLoading] = useState(!initialLesson);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [textInputs, setTextInputs] = useState<Record<number, string>>({});
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, Set<string>>>({});
  const [visibleHints, setVisibleHints] = useState<Set<number>>(new Set());
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [xpPool, setXpPool] = useState(0);
  const [isReading, setIsReading] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'media'>('concept');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(user.preferredLearningStyle || 'Unified');
  
  const [completedMedia, setCompletedMedia] = useState<Set<string>>(() => {
    const existing = progress?.[subject.id]?.mediaProgress;
    if (!existing) return new Set();
    return new Set([
      ...(existing.completedEbooks || []),
      ...(existing.completedBlogs || []),
      ...(existing.completedPodcasts || []),
      ...(existing.completedVideos || []),
      ...(existing.completedSongs || []),
      ...(existing.completedWorks || []),
      ...(existing.completedDanceMoves || []),
      ...(existing.completedSimulations || []),
    ]);
  });
  
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);
  const lastUpdateRef = useRef<number>(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Persistence Key
  const saveKey = useMemo(() => `darewast-lesson-resume-${user.username}-${subject.id}-${level}-${activeLesson}`, [user.username, subject.id, level, activeLesson]);

  const syncTimeHistory = useCallback((currentElapsed: number) => {
    const minutesToAdd = Math.floor(currentElapsed / 60);
    if (minutesToAdd < 1) return;
    const currentHistory = { ...(user.studyHistory || {}) };
    const todayMinutes = (currentHistory[todayKey] || 0);
    onUpdateUser({ 
      timeSpentToday: (user.timeSpentToday || 0) + minutesToAdd,
      studyHistory: { ...currentHistory, [todayKey]: todayMinutes + minutesToAdd }
    });
    onUpdateProgress(subject.id, { totalMinutesSpent: (progress?.[subject.id]?.totalMinutesSpent || 0) + minutesToAdd });
    setElapsedSeconds(currentElapsed % 60);
  }, [todayKey, user.studyHistory, user.timeSpentToday, subject.id, progress, onUpdateUser, onUpdateProgress]);

  useEffect(() => {
    const heartbeat = setInterval(() => { if (elapsedSeconds >= 60) syncTimeHistory(elapsedSeconds); }, 60000);
    return () => clearInterval(heartbeat);
  }, [elapsedSeconds, syncTimeHistory]);

  useEffect(() => {
    const handleVisibilityChange = () => setSessionActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(() => {
      if (sessionActive && !loading && !isFinishing) {
        const now = Date.now();
        const delta = Math.floor((now - lastUpdateRef.current) / 1000);
        if (delta >= 1) {
          setElapsedSeconds(prev => prev + delta);
          lastUpdateRef.current = now;
        }
      } else { lastUpdateRef.current = Date.now(); }
    }, 1000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [sessionActive, loading, isFinishing]);

  const initialTime = useMemo(() => progress?.[subject.id]?.fastTrackDuration ? progress[subject.id].fastTrackDuration! * 60 : DEFAULT_LESSON_TIME, [progress, subject.id]);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const institutionalGrade = useMemo(() => {
    if (user.track?.includes('DistanceSchool')) {
      return getInstitutionalGrade(user.distanceSchoolType || '6-3-3', level);
    }
    return null;
  }, [user.track, user.distanceSchoolType, level]);

  const loadingMessages = useMemo(() => [
    "Aligning Academic DNA...",
    "Synthesizing Knowledge Chapters...",
    "Calibrating Cognitive Load...",
    "Adapting Difficulty Nodes...",
    "Architecting Knowledge Nodes..."
  ], []);

  useEffect(() => {
    if (loading || isFinishing) {
      const interval = setInterval(() => setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length), 2500);
      return () => clearInterval(interval);
    }
  }, [loading, isFinishing, loadingMessages]);

  useEffect(() => {
    if (loading || isFinishing || isTimerPaused || !sessionActive) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, isFinishing, isTimerPaused, sessionActive]);

  useEffect(() => {
    if (timeLeft === 0 && !isFinishing && !loading) {
      handleFinish();
    }
  }, [timeLeft, isFinishing, loading]);

  useEffect(() => {
    if (!lesson && !loading) {
      const fetchLesson = async () => {
        setLoading(true);
        try {
          const content = await generateLesson(subject, language, level, activeLesson, user, progress);
          setLesson(content);

          // After lesson is loaded, check for saved progress
          const saved = localStorage.getItem(saveKey);
          if (saved) {
            try {
              const data = JSON.parse(saved);
              setUserAnswers(data.userAnswers || {});
              setTextInputs(data.textInputs || {});
              setCheckedIndices(new Set(data.checkedIndices || []));
              setXpPool(data.xpPool || 0);
              setTimeLeft(data.timeLeft ?? initialTime);
              setVisibleHints(new Set(data.visibleHints || []));
              
              const restoredAttempts: Record<number, Set<string>> = {};
              if (data.wrongAttempts) {
                Object.keys(data.wrongAttempts).forEach(k => {
                  restoredAttempts[Number(k)] = new Set(data.wrongAttempts[k]);
                });
              }
              setWrongAttempts(restoredAttempts);
            } catch (e) {
              console.error("Failed to restore lesson node state:", e);
            }
          }
        } catch (err) { console.error(err); } finally { setLoading(false); }
      };
      fetchLesson();
    }
  }, [lesson, loading, subject, language, level, activeLesson, user, progress, saveKey, initialTime]);

  const handleSpeech = (text: string) => {
    if (isReading === text) {
      if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
      else { window.speechSynthesis.pause(); setIsPaused(true); }
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_BCP47[language] || 'en-US';
    utterance.onstart = () => setIsReading(text);
    utterance.onend = () => { setIsReading(null); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const checkAnswer = (idx: number, ans: string) => {
    const ex = lesson?.exercises[idx];
    if (!ex) return;
    setUserAnswers(prev => ({ ...prev, [idx]: ans }));
    if (ex.correctAnswer === ans) {
      setCheckedIndices(prev => new Set(prev).add(idx));
      setXpPool(prev => prev + 25);
    } else {
      setWrongAttempts(prev => {
        const next = new Set(prev[idx] || []);
        next.add(ans);
        return { ...prev, [idx]: next };
      });
    }
  };

  const handleShortAnswerCheck = (idx: number) => {
    const ex = lesson?.exercises[idx];
    const ans = textInputs[idx]?.trim();
    if (!ex || !ans) return;
    if (ans.toLowerCase() === ex.correctAnswer.toLowerCase()) {
      setCheckedIndices(prev => new Set(prev).add(idx));
      setXpPool(prev => prev + 25);
    } else {
      setWrongAttempts(prev => {
        const next = new Set(prev[idx] || []);
        next.add(ans);
        return { ...prev, [idx]: next };
      });
    }
  };

  const handleFinish = () => {
    // Clear saved progress on successful mastery verification
    localStorage.removeItem(saveKey);
    setIsFinishing(true);
    setTimeout(() => onComplete(checkedIndices.size, activeLesson, xpPool), 2000);
  };

  const handleSaveProgress = () => {
    setIsSaving(true);
    const simplifiedWrongAttempts: Record<number, string[]> = {};
    Object.keys(wrongAttempts).forEach(k => {
      simplifiedWrongAttempts[Number(k)] = Array.from(wrongAttempts[Number(k)]);
    });

    const dataToSave = {
      userAnswers,
      textInputs,
      checkedIndices: Array.from(checkedIndices),
      wrongAttempts: simplifiedWrongAttempts,
      visibleHints: Array.from(visibleHints),
      xpPool,
      timeLeft,
      timestamp: Date.now()
    };

    localStorage.setItem(saveKey, JSON.stringify(dataToSave));
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleMediaCompletion = (item: MediaItem) => {
    setCompletedMedia(prev => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    const existing = progress?.[subject.id]?.mediaProgress || {
      completedEbooks: [], completedBlogs: [], completedPodcasts: [],
      completedVideos: [], completedSongs: [], completedWorks: [],
      completedDanceMoves: [], completedSimulations: []
    };

    const mediaProgress = { ...existing };
    const mid = item.id;

    if (item.type === 'ebook') mediaProgress.completedEbooks = [...new Set([...mediaProgress.completedEbooks, mid])];
    else if (item.type === 'blog') mediaProgress.completedBlogs = [...new Set([...mediaProgress.completedBlogs, mid])];
    else if (item.type === 'podcast') mediaProgress.completedPodcasts = [...new Set([...mediaProgress.completedPodcasts, mid])];
    else if (item.type === 'video') mediaProgress.completedVideos = [...new Set([...mediaProgress.completedVideos, mid])];
    else if (item.type === 'song') mediaProgress.completedSongs = [...new Set([...mediaProgress.completedSongs, mid])];
    else if (item.type === 'work') mediaProgress.completedWorks = [...new Set([...mediaProgress.completedWorks, mid])];
    else if (item.type === 'danceMove') mediaProgress.completedDanceMoves = [...new Set([...mediaProgress.completedDanceMoves, mid])];
    else if (item.type === 'simulation') mediaProgress.completedSimulations = [...new Set([...mediaProgress.completedSimulations, mid])];

    onUpdateProgress(subject.id, { mediaProgress });
    setXpPool(prev => prev + 50); 
    setActiveMediaItem(null);
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const timeProgressPercent = Math.min(100, Math.round((timeLeft / initialTime) * 100));

  if (loading || isFinishing) {
    return (
      <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fadeIn overflow-hidden">
        {/* World-Class Synthesis Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dare-teal/30 rounded-full animate-spin-slow"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dare-purple/20 rounded-full animate-spin-slow [animation-direction:reverse]"></div>
           <div className="absolute inset-0 pattern-grid-lg opacity-40"></div>
        </div>

        <div className="relative z-10 space-y-12 max-w-2xl">
          <div className="relative group">
            {/* Multi-layered Synthesis Loader */}
            <div className={`w-40 h-40 md:w-56 md:h-56 border-[12px] md:border-[16px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin shadow-[0_0_50px_rgba(83,205,186,0.3)]`}></div>
            <div className="absolute inset-4 md:inset-6 border-[8px] md:border-[10px] border-dare-purple/10 border-b-dare-purple rounded-full animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-6xl md:text-8xl animate-pulse filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                 {isFinishing ? '⚖️' : (loadingMsgIdx % 2 === 0 ? '🔬' : '🧠')}
               </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
               <div className="w-2 h-2 bg-dare-teal rounded-full animate-pulse"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-dare-teal">
                 {isFinishing ? 'Verification Phase' : 'Synthesis Sequence'}
               </p>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              {isFinishing ? 'Mastery Anchored' : t('generatingLesson')}
            </h2>
            
            <div className="h-1.5 w-64 md:w-96 bg-white/10 rounded-full mx-auto overflow-hidden">
               <div className="h-full bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-[loadingBar_5s_ease-in-out_infinite]"></div>
            </div>
            
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] h-4">
              {isFinishing ? 'Synchronizing global mastery credentials...' : loadingMessages[loadingMsgIdx]}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 opacity-40">
             <div className="space-y-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-dare-teal transition-all duration-1000 w-${loadingMsgIdx > 0 ? 'full' : '1/2'}`}></div></div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white">Logic</p>
             </div>
             <div className="space-y-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-dare-gold transition-all duration-1000 w-${loadingMsgIdx > 2 ? 'full' : (loadingMsgIdx > 0 ? '1/2' : '0')}`}></div></div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white">Structure</p>
             </div>
             <div className="space-y-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-dare-purple transition-all duration-1000 w-${loadingMsgIdx > 4 ? 'full' : (loadingMsgIdx > 2 ? '1/2' : '0')}`}></div></div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white">Media</p>
             </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
          .animate-spin-slow { animation: spin 10s linear infinite; }
        `}} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn space-y-10 relative">
      <header className="sticky top-[4.5rem] z-50 flex flex-col sm:flex-row justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 gap-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-slate-800">
           <div className={`h-full transition-all duration-1000 ${timeLeft < 300 ? 'bg-rose-500 animate-pulse' : 'bg-dare-teal'}`} style={{ width: `${timeProgressPercent}%` }} />
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onBack} className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-dare-teal hover:text-white transition-all text-sm">←</button>
          <div>
            <h3 className="text-sm font-black text-dare-teal uppercase tracking-widest leading-none mb-1">{subject.name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level {level} • Chapter {activeLesson}/12 {institutionalGrade && `• ${institutionalGrade}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Session Pool</p>
              <p className="text-xl font-black text-dare-gold leading-none">+{xpPool} XP</p>
           </div>
           
           <div className={`px-5 py-2.5 rounded-2xl bg-slate-950 text-white font-mono font-black flex items-center gap-3 transition-all border-2 ${timeLeft < 300 ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-105' : 'border-white/10'}`}>
              <div className="flex flex-col items-center">
                <span className={`w-2 h-2 rounded-full mb-0.5 ${isTimerPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <p className="text-[7px] uppercase tracking-tighter opacity-50">{isTimerPaused ? 'PAUSED' : 'LIVE'}</p>
              </div>
              <span className="text-2xl min-w-[80px] text-center">{formatTime(timeLeft)}</span>
              <div className="flex gap-2 border-l border-white/20 pl-3">
                <button onClick={() => setIsTimerPaused(!isTimerPaused)} className="hover:text-dare-teal transition-all text-lg" title={isTimerPaused ? 'Resume' : 'Pause'}>
                  {isTimerPaused ? '▶️' : '⏸️'}
                </button>
              </div>
           </div>

           <button 
            onClick={handleSaveProgress}
            disabled={isSaving}
            className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center transition-all ${isSaving ? 'text-dare-teal border-dare-teal animate-pulse' : 'text-gray-400 hover:text-dare-teal hover:border-dare-teal'}`}
            title={t('saveProgress')}
           >
             {isSaving ? '⏳' : '💾'}
           </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <nav className="flex border-b border-gray-100 dark:border-slate-800">
           {(['concept', 'media'] as const).map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-6 font-black uppercase text-xs tracking-[0.3em] transition-all ${activeTab === tab ? 'text-dare-teal border-b-4 border-dare-teal bg-dare-teal/5' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>{tab === 'concept' ? t('concept') : t('mediaHub')}</button>
           ))}
        </nav>

        <div className="p-8 md:p-12 space-y-12">
          {activeTab === 'concept' ? (
            <div className="space-y-10 animate-fadeIn">
               {lesson && (
                 <>
                  <div className="flex flex-col gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-dare-teal/10 text-dare-teal rounded-full text-[9px] font-black uppercase tracking-widest border border-dare-teal/20">Validated Academic Node</div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-tight">{lesson.title}</h2>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{lesson.explanation}</p>
                  </div>

                  <section className="space-y-6">
                    <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl w-fit">
                      {(['Unified', 'Visual', 'Auditory', 'Reading', 'Kinesthetic'] as LearningStyle[]).map(style => (
                        <button key={style} onClick={() => setLearningStyle(style)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${learningStyle === style ? 'bg-white dark:bg-slate-700 text-dare-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{style}</button>
                      ))}
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="relative z-10 space-y-4 font-accessible">
                        <h4 className="text-xs font-black text-dare-teal uppercase tracking-[0.4em]">Adaptation Node: {learningStyle}</h4>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-200 leading-relaxed italic">
                           {learningStyle === 'Visual' && lesson.adaptations.visualMapDescription}
                           {learningStyle === 'Auditory' && lesson.adaptations.auditoryScript}
                           {learningStyle === 'Kinesthetic' && lesson.adaptations.kinestheticActivity}
                           {learningStyle === 'Reading' && lesson.adaptations.readingDeepDive}
                           {learningStyle === 'Unified' && lesson.explanation}
                        </p>
                        <div className="flex justify-end pt-4">
                           <button onClick={() => handleSpeech(learningStyle === 'Unified' ? lesson.explanation : (learningStyle === 'Visual' ? lesson.adaptations.visualMapDescription : (learningStyle === 'Auditory' ? lesson.adaptations.auditoryScript : (learningStyle === 'Kinesthetic' ? lesson.adaptations.kinestheticActivity : lesson.adaptations.readingDeepDive))))} className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${isReading ? 'bg-dare-teal text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-gray-400 hover:text-dare-teal shadow-sm'}`}>
                             <SpeakerIcon active={!!isReading} paused={isPaused} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{isReading ? 'Reading Live' : 'Listen'}</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">{t('exercises')}</h3>
                    <div className="space-y-6">
                      {lesson.exercises.map((ex, idx) => {
                        const isChecked = checkedIndices.has(idx);
                        const wrong = wrongAttempts[idx] || new Set();
                        const selectedAnswer = userAnswers[idx];

                        return (
                          <div key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all ${isChecked ? 'border-emerald-500 bg-emerald-50/5' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'}`}>
                            <div className="flex items-start gap-6 mb-8">
                               <span className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-gray-400 shrink-0">{idx + 1}</span>
                               <h4 className="text-xl font-black text-gray-800 dark:text-white leading-tight">{ex.question}</h4>
                            </div>

                            {ex.options && ex.options.length > 0 ? (
                              <div className="grid sm:grid-cols-2 gap-3">
                                 {ex.options.map(opt => {
                                   const isCorrect = opt === ex.correctAnswer;
                                   const isSelfSelected = selectedAnswer === opt;
                                   return (
                                     <button key={opt} disabled={isChecked} onClick={() => checkAnswer(idx, opt)}
                                        className={`p-5 text-left rounded-2xl border-2 transition-all font-bold text-sm 
                                          ${isChecked 
                                            ? (isCorrect ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : (isSelfSelected ? 'border-rose-500 bg-rose-500 text-white opacity-60' : 'opacity-40 grayscale')) 
                                            : (wrong.has(opt) ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:border-dare-teal text-gray-600 dark:text-gray-300')
                                          }`}
                                     >{opt}</button>
                                   );
                                 })}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="relative">
                                  <input type="text" value={textInputs[idx] || ''} onChange={e => setTextInputs(prev => ({ ...prev, [idx]: e.target.value }))} disabled={isChecked} placeholder="Type your answer..." spellCheck={true}
                                    className={`w-full p-5 bg-gray-50 dark:bg-slate-950 border-2 rounded-2xl outline-none font-bold text-lg dark:text-white transition-all 
                                      ${isChecked ? 'border-emerald-500 bg-emerald-50/5' : (wrong.has(textInputs[idx] || '') ? 'border-rose-500 bg-rose-50/5' : 'border-transparent focus:border-dare-teal')}`}
                                  />
                                  {isChecked && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl">✅</span>}
                                </div>
                                {!isChecked && (
                                  <button onClick={() => handleShortAnswerCheck(idx)} disabled={!textInputs[idx]?.trim()} className="w-full py-4 bg-dare-teal text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50">Check Answer</button>
                                )}
                              </div>
                            )}

                            {isChecked && (
                              <div className="mt-6 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 animate-fadeIn">
                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Explanation</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">"{ex.explanation}"</p>
                              </div>
                            )}

                            {!isChecked && visibleHints.has(idx) && (
                               <div className="mt-6 p-4 bg-dare-gold/10 rounded-2xl border border-dare-gold/20 flex items-start gap-3 animate-fadeIn">
                                  <span className="text-xl">💡</span>
                                  <p className="text-xs font-bold text-dare-gold leading-relaxed italic">{ex.hint}</p>
                               </div>
                            )}
                            {!isChecked && !visibleHints.has(idx) && (
                               <div className="mt-6 flex justify-end">
                                  <button onClick={() => { setVisibleHints(prev => new Set(prev).add(idx)); setXpPool(prev => Math.max(0, prev - 5)); }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-dare-gold transition-colors">Need a hint? (-5 XP)</button>
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                 </>
               )}
            </div>
          ) : (
            <div className="animate-fadeIn space-y-12">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter">Media Enrichment Hub</h2>
                  <p className="text-gray-500 font-medium">Supplementary resources uniquely designed for this chapter node.</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {lesson?.mediaResources?.map(media => {
                    const isDone = completedMedia.has(media.id);
                    return (
                      <button key={media.id} onClick={() => setActiveMediaItem(media)} className={`p-8 rounded-[2.5rem] border-2 text-left flex items-center gap-6 transition-all group ${isDone ? 'border-emerald-500 bg-emerald-50/5 opacity-80' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-dare-teal'}`}>
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                           {media.type === 'video' ? '🎬' : media.type === 'ebook' ? '📖' : media.type === 'blog' ? '📑' : (media.type === 'podcast' ? '🎙️' : '🎵')}
                         </div>
                         <div className="flex-1">
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDone ? 'text-emerald-500' : 'text-gray-400'}`}>{media.type}</p>
                            <h4 className="font-black text-lg dark:text-white leading-tight">{media.title}</h4>
                         </div>
                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-transparent'}`}>✓</div>
                      </button>
                    );
                  })}
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800">
           <button onClick={handleFinish} disabled={checkedIndices.size === 0} className="w-full py-8 bg-dare-teal text-white rounded-[2.5rem] font-black text-3xl shadow-2xl hover:scale-[1.02] disabled:opacity-50 transition-all">Verify Chapter Mastery →</button>
        </div>
      </div>
      {activeMediaItem && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative">
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-dare-teal rounded-2xl flex items-center justify-center text-3xl shadow-xl">{activeMediaItem.type === 'video' ? '🎬' : '📖'}</div>
                  <div><p className="text-[10px] font-black uppercase text-dare-teal mb-1">Study Node Synthesis</p><h3 className="text-2xl font-black">{activeMediaItem.title}</h3></div>
               </div>
               <button onClick={() => setActiveMediaItem(null)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/30 text-2xl transition-all">✕</button>
            </div>
            <div className="p-10 flex-1 space-y-8 min-h-[300px] flex flex-col items-center justify-center text-center">
               <div className="w-24 h-24 rounded-full border-4 border-dare-teal/20 flex items-center justify-center animate-pulse"><div className="w-12 h-12 bg-dare-teal rounded-full"></div></div>
               <p className="text-gray-500 font-medium italic">"Synthesizing {activeMediaItem.type} content for level {level} chapter {activeLesson}..."</p>
            </div>
            <div className="p-10 bg-gray-50 dark:bg-slate-800 border-t border-gray-100">
               <button onClick={() => handleMediaCompletion(activeMediaItem)} className="w-full py-6 bg-dare-teal text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all">✓ {t('completeMedia')}</button>
            </div>
          </div>
        </div>
      )}
      {isTutorOpen && lesson && <AITutor user={user} language={language} context={lesson.explanation} onClose={() => setIsTutorOpen(false)} />}
    </div>
  );
};

export default LessonView;
