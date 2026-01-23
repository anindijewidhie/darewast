
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

const DEFAULT_LESSON_TIME = 1800; // 30 minutes

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
  const [activePronunciation, setActivePronunciation] = useState<PronunciationEntry | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isValidatingIdx, setIsValidatingIdx] = useState<number | null>(null);
  const [essayResults, setEssayResults] = useState<Record<number, EssayGradingResult>>({});

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState(30);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);
  const lastUpdateRef = useRef<number>(Date.now());
  
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  const syncTimeHistory = useCallback((currentElapsed: number) => {
    const minutesToAdd = Math.floor(currentElapsed / 60);
    if (minutesToAdd < 1) return;

    const currentHistory = { ...(user.studyHistory || {}) };
    const todayMinutes = (currentHistory[todayKey] || 0);
    
    onUpdateUser({ 
      timeSpentToday: (user.timeSpentToday || 0) + minutesToAdd,
      studyHistory: {
        ...currentHistory,
        [todayKey]: todayMinutes + minutesToAdd
      }
    });

    onUpdateProgress(subject.id, {
      totalMinutesSpent: (progress?.[subject.id]?.totalMinutesSpent || 0) + minutesToAdd
    });

    setElapsedSeconds(currentElapsed % 60);
  }, [todayKey, user.studyHistory, user.timeSpentToday, subject.id, progress, onUpdateUser, onUpdateProgress]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (elapsedSeconds >= 60) {
        syncTimeHistory(elapsedSeconds);
      }
    }, 60000);
    return () => clearInterval(heartbeat);
  }, [elapsedSeconds, syncTimeHistory]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setSessionActive(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (sessionActive && !loading && !isFinishing) {
        const now = Date.now();
        const delta = Math.floor((now - lastUpdateRef.current) / 1000);
        if (delta >= 1) {
          setElapsedSeconds(prev => prev + delta);
          lastUpdateRef.current = now;
        }
      } else {
        lastUpdateRef.current = Date.now();
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [sessionActive, loading, isFinishing]);

  const initialTime = progress?.[subject.id]?.fastTrackDuration ? progress[subject.id].fastTrackDuration * 60 : DEFAULT_LESSON_TIME;
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
    "Ensuring Rigorous Achievement...",
    "Tuning Adaptive Challenges...",
    "Architecting Knowledge Nodes...",
    "Cross-referencing Global Standards..."
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

  useEffect(() => {
    if (loading || isFinishing || isTimerPaused || !sessionActive) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, isFinishing, isTimerPaused, sessionActive]);

  useEffect(() => {
    if (!lesson && !loading) {
      const fetchLesson = async () => {
        setLoading(true);
        try {
          const content = await generateLesson(subject, language, level, activeLesson, user, progress);
          setLesson(content);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLesson();
    }
  }, [lesson, loading, subject, language, level, activeLesson, user, progress]);

  const handleSpeech = (text: string) => {
    if (isReading === text) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_BCP47[language] || 'en-US';
    utterance.onstart = () => setIsReading(text);
    utterance.onend = () => { setIsReading(null); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const handleValidateEssay = async (idx: number, question: string) => {
    const ans = textInputs[idx];
    if (!ans?.trim()) return;

    setIsValidatingIdx(idx);
    try {
      const result = await gradeEssay(question, ans, lesson?.explanation || '', language);
      setEssayResults(prev => ({ ...prev, [idx]: result }));
      if (result.passed) {
        setCheckedIndices(prev => new Set(prev).add(idx));
        setXpPool(prev => prev + 50);
      }
    } catch (err) {
      alert(t('errorGenerating'));
    } finally {
      setIsValidatingIdx(null);
    }
  };

  const checkAnswer = (idx: number, ans: string) => {
    const ex = lesson?.exercises[idx];
    if (!ex) return;

    if (ex.correctAnswer === ans) {
      setCheckedIndices(prev => new Set(prev).add(idx));
      setUserAnswers(prev => ({ ...prev, [idx]: ans }));
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
    setIsFinishing(true);
    setTimeout(() => {
      const correctCount = checkedIndices.size;
      onComplete(correctCount, activeLesson, xpPool);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-fadeIn p-6 text-center">
        <div className="relative">
          <div className="w-48 h-48 border-[12px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">
            {isFinishing ? '✅' : '🔬'}
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {isFinishing ? 'Mastery Verified' : t('generatingLesson')}
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">
              {isFinishing ? 'Finalizing chapter credentials...' : loadingMessages[loadingMsgIdx]}
            </p>
            {!isFinishing && (
              <div className="px-4 py-1.5 bg-dare-teal/10 text-dare-teal rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-dare-teal/20 self-center">
                Calibrating difficulty for age {user.age} • History: {progress?.[subject.id]?.lastScore?.skillPoints || 0}SP
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn space-y-10">
      <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all">←</button>
          <div>
            <h3 className="text-sm font-black text-dare-teal uppercase tracking-widest leading-none mb-1">{subject.name}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Level {level} • Chapter {activeLesson}/12 {institutionalGrade && `• ${institutionalGrade}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Session Pool</p>
              <p className="text-xl font-black text-dare-gold leading-none">+{xpPool} XP</p>
           </div>
           <div className={`px-4 py-2 rounded-2xl bg-slate-900 text-white font-mono font-black ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : ''}`}>
             {formatTime(timeLeft)}
           </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <nav className="flex border-b border-gray-100 dark:border-slate-800">
           {(['concept', 'media'] as const).map(tab => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-6 font-black uppercase text-xs tracking-[0.3em] transition-all ${activeTab === tab ? 'text-dare-teal border-b-4 border-dare-teal bg-dare-teal/5' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
             >
                {tab === 'concept' ? t('concept') : t('mediaHub')}
             </button>
           ))}
        </nav>

        <div className="p-8 md:p-12 space-y-12">
          {activeTab === 'concept' ? (
            <div className="space-y-10 animate-fadeIn">
               <div className="flex justify-between items-start gap-6">
                  <div className="space-y-4 flex-1">
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">{lesson.title}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{lesson.explanation}</p>
                  </div>
                  <button onClick={() => setIsTutorOpen(true)} className="w-20 h-20 bg-dare-teal rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl shadow-dare-teal/20 hover:scale-105 active:scale-95 transition-all">
                    <span className="text-2xl mb-1">🧠</span>
                    <span className="text-[8px] font-black uppercase">Tutor</span>
                  </button>
               </div>

               <section className="space-y-6">
                  <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-2xl w-fit">
                    {(['Unified', 'Visual', 'Auditory', 'Reading', 'Kinesthetic'] as LearningStyle[]).map(style => (
                      <button 
                        key={style}
                        onClick={() => setLearningStyle(style)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${learningStyle === style ? 'bg-white dark:bg-slate-700 text-dare-teal shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">🧬</div>
                     <div className="relative z-10 space-y-4">
                        <h4 className="text-xs font-black text-dare-teal uppercase tracking-[0.4em]">Adaptation Node: {learningStyle}</h4>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-200 leading-relaxed italic">
                           {learningStyle === 'Visual' && lesson.adaptations.visualMapDescription}
                           {learningStyle === 'Auditory' && lesson.adaptations.auditoryScript}
                           {learningStyle === 'Kinesthetic' && lesson.adaptations.kinestheticActivity}
                           {learningStyle === 'Reading' && lesson.adaptations.readingDeepDive}
                           {learningStyle === 'Unified' && lesson.explanation}
                        </p>
                        <div className="flex justify-end pt-4">
                           <button 
                            onClick={() => handleSpeech(learningStyle === 'Unified' ? lesson.explanation : (learningStyle === 'Visual' ? lesson.adaptations.visualMapDescription : (learningStyle === 'Auditory' ? lesson.adaptations.auditoryScript : (learningStyle === 'Kinesthetic' ? lesson.adaptations.kinestheticActivity : lesson.adaptations.readingDeepDive))))}
                            className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${isReading ? 'bg-dare-teal text-white animate-pulse' : 'bg-white dark:bg-slate-700 text-gray-400 hover:text-dare-teal shadow-sm'}`}
                           >
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
                       const result = essayResults[idx];

                       return (
                         <div key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all ${isChecked ? 'border-emerald-500 bg-emerald-50/5' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'}`}>
                            <div className="flex items-start gap-6 mb-8">
                               <span className="w-10 h-1 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-gray-400">{idx + 1}</span>
                               <h4 className="text-xl font-black text-gray-800 dark:text-white leading-tight">{ex.question}</h4>
                            </div>

                            {ex.isEssay ? (
                              <div className="space-y-4">
                                 <textarea 
                                    value={textInputs[idx] || ''}
                                    onChange={e => setTextInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                                    disabled={isChecked}
                                    placeholder="Synthesize your narrative response..."
                                    className="w-full p-6 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-teal rounded-[2rem] outline-none font-bold text-lg dark:text-white transition-all min-h-[160px]"
                                 />
                                 {result && (
                                   <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 space-y-4">
                                      <div className="grid grid-cols-3 gap-4">
                                         <div className="text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Clarity</p>
                                            <p className="text-xl font-black text-dare-teal">{result.clarity}%</p>
                                         </div>
                                         <div className="text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Coherence</p>
                                            <p className="text-xl font-black text-dare-gold">{result.coherence}%</p>
                                         </div>
                                         <div className="text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Relevance</p>
                                            <p className="text-xl font-black text-dare-purple">{result.relevance}%</p>
                                         </div>
                                      </div>
                                      <p className="text-sm font-bold text-gray-500 italic">"{result.feedback}"</p>
                                   </div>
                                 )}
                                 {!isChecked && (
                                   <button 
                                      onClick={() => handleValidateEssay(idx, ex.question)}
                                      disabled={isValidatingIdx === idx || !textInputs[idx]?.trim()}
                                      className="w-full py-4 bg-dare-teal text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                   >
                                      {isValidatingIdx === idx ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Validate Narrative'}
                                   </button>
                                 )}
                              </div>
                            ) : (
                              <div className="grid sm:grid-cols-2 gap-3">
                                 {ex.options?.map(opt => (
                                   <button 
                                      key={opt}
                                      disabled={isChecked}
                                      onClick={() => checkAnswer(idx, opt)}
                                      className={`p-5 text-left rounded-2xl border-2 transition-all font-bold text-sm ${isChecked ? (opt === ex.correctAnswer ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : 'opacity-40 grayscale') : (wrong.has(opt) ? 'border-rose-500 bg-rose-500 text-white opacity-60' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:border-dare-teal hover:bg-white dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300')}`}
                                   >
                                      {opt}
                                   </button>
                                 ))}
                              </div>
                            )}

                            {visibleHints.has(idx) && !isChecked && (
                               <div className="mt-6 p-4 bg-dare-gold/10 rounded-2xl border border-dare-gold/20 flex items-start gap-3 animate-fadeIn">
                                  <span className="text-xl">💡</span>
                                  <p className="text-xs font-bold text-dare-gold leading-relaxed italic">{ex.hint}</p>
                               </div>
                            )}

                            {!isChecked && !visibleHints.has(idx) && (
                               <div className="mt-6 flex justify-end">
                                  <button 
                                    onClick={() => setVisibleHints(prev => new Set(prev).add(idx))}
                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-dare-gold transition-colors"
                                  >
                                    Need a hint? (-5 XP)
                                  </button>
                               </div>
                            )}
                         </div>
                       );
                     })}
                  </div>
               </section>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-12">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black tracking-tighter">Media Enrichment Hub</h2>
                  <p className="text-gray-500 font-medium">Supplementary resources to deepen your cognitive nodes.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lesson.mediaResources?.map(media => {
                    const isDone = completedMedia.has(media.id);
                    const isPodcast = media.type === 'podcast';
                    const durationOptions = isPodcast ? PODCAST_DURATIONS : [5, 10, 15, 30];
                    return (
                      <button 
                        key={media.id}
                        className={`p-8 rounded-[2.5rem] border-2 text-left flex items-center gap-6 transition-all group ${isDone ? 'border-emerald-500 bg-emerald-50/5 opacity-60' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-dare-teal'}`}
                      >
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                           {media.type === 'video' ? '🎬' : media.type === 'ebook' ? '📖' : media.type === 'blog' ? '📑' : (isPodcast ? '🎙️' : '🧩')}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDone ? 'text-emerald-500' : 'text-gray-400'}`}>{media.type}</p>
                            <h4 className="font-black text-lg dark:text-white leading-tight truncate">{media.title}</h4>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">
                                {isDone ? 'Completed Verification' : `${durationOptions[Math.floor(Math.random() * durationOptions.length)]} mins estimated study`}
                            </p>
                         </div>
                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                           ✓
                         </div>
                      </button>
                    );
                  })}
               </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800">
           <button 
              onClick={handleFinish}
              disabled={checkedIndices.size === 0}
              className="w-full py-8 bg-dare-teal text-white rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
              Verify Chapter Mastery →
           </button>
        </div>
      </div>

      {isTutorOpen && (
        <AITutor 
          user={user} 
          language={language} 
          context={lesson.explanation} 
          onClose={() => setIsTutorOpen(false)} 
        />
      )}
    </div>
  );
};

export default LessonView;
