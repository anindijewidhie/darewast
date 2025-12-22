
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress, MediaItem, SubjectProgress, ScheduledSession, TimelinePoint } from '../types';
import { generateLesson, generateMotivationalQuote, generateThemeSuggestions } from '../services/geminiService';
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
      <>
        <path className="animate-pulse" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1" className="animate-ping" fill="currentColor" />
      </>
    )}
  </svg>
);

const LANG_BCP47: Record<string, string> = {
  'English': 'en-US', 'Indonesian': 'id-ID', 'Traditional Chinese': 'zh-TW', 'Simplified Chinese': 'zh-CN',
  'Japanese': 'ja-JP', 'Korean': 'ko-KR', 'Arabic': 'ar-SA', 'Spanish': 'es-ES', 'French': 'fr-FR',
  'Portuguese': 'pt-PT', 'Russian': 'ru-RU', 'Hindi': 'hi-IN', 'Bengali': 'bn-IN', 'Urdu': 'ur-PK'
};

// Pure Web Audio API Sound System
const useAudioSystem = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  const init = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playOsc = (freqs: number[], type: OscillatorType = 'sine', duration: number = 0.1, gainVal: number = 0.1) => {
    init();
    const ctx = audioCtx.current!;
    let time = ctx.currentTime;
    
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
      time += duration * 0.8;
    });
  };

  return {
    click: () => playOsc([800], 'sine', 0.05, 0.05),
    correct: () => playOsc([523.25, 659.25], 'sine', 0.15, 0.1),
    incorrect: () => playOsc([220.00, 196.00], 'square', 0.2, 0.05),
    complete: () => playOsc([523.25, 659.25, 783.99, 1046.50], 'triangle', 0.2, 0.1),
  };
};

// Particle component for celebration
const CelebrationParticles: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
    color: ['#53CDBA', '#CCB953', '#B953CC', '#FF6B6B', '#4D96FF'][Math.floor(Math.random() * 5)]
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-60 animate-celebrate"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const InteractiveTimeline: React.FC<{ points: TimelinePoint[], themeColor: string }> = ({ points, themeColor }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const sounds = useAudioSystem();

  return (
    <div className="mt-12 space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <span className={`w-12 h-1 bg-${themeColor} rounded-full`}></span>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Concept Roadmap</h2>
      </div>

      <div className="relative pl-12 md:pl-20 py-4">
        <div className={`absolute left-[23px] md:left-[39px] top-0 bottom-0 w-1 bg-gray-100 dark:bg-slate-800 rounded-full`}></div>
        <div className="space-y-12">
          {points.map((point, idx) => (
            <div key={idx} className="relative group">
              <button 
                onClick={() => {
                  sounds.click();
                  setExpandedId(expandedId === idx ? null : idx);
                }}
                className={`absolute left-[-42px] md:left-[-58px] top-0 w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl shadow-xl transition-all z-10 
                  ${expandedId === idx 
                    ? `bg-${themeColor} text-white scale-110 shadow-${themeColor}/30` 
                    : 'bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-2 border-gray-100 dark:border-slate-700'
                  }`}
              >
                {point.icon}
              </button>

              <div 
                onClick={() => {
                  sounds.click();
                  setExpandedId(expandedId === idx ? null : idx);
                }}
                className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer 
                  ${expandedId === idx 
                    ? `border-${themeColor} bg-${themeColor}/5 shadow-lg` 
                    : 'border-transparent bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-black transition-colors ${expandedId === idx ? `text-${themeColor}` : 'text-gray-800 dark:text-gray-100'}`}>
                    {point.title}
                  </h3>
                  <span className={`text-2xl transition-transform duration-300 ${expandedId === idx ? 'rotate-180 opacity-100 text-' + themeColor : 'opacity-20'}`}>
                    ↓
                  </span>
                </div>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedId === idx ? 'max-h-96 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-lg">
                    {point.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LessonView: React.FC<Props> = ({ subject, language, level, lessonNumber, user, progress, initialLesson, onComplete, onBack, onUpdateUser, onUpdateProgress }) => {
  const sounds = useAudioSystem();
  const [activeLesson, setActiveLesson] = useState(lessonNumber);
  const [lesson, setLesson] = useState<LessonContent | null>(initialLesson || null);
  const [loading, setLoading] = useState(!initialLesson);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [textInputs, setTextInputs] = useState<Record<number, string>>({});
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [visibleHints, setVisibleHints] = useState<Set<number>>(new Set());
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [xpPool, setXpPool] = useState(0);
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeSuggestions, setThemeSuggestions] = useState<{icon: string, name: string}[]>([]);
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleDuration, setScheduleDuration] = useState(30);

  const [isReading, setIsReading] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'media'>('concept');
  const [completedMedia, setCompletedMedia] = useState<Set<string>>(new Set());
  
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{ score: number; total: number; xp: number; quote: string } | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const saveKey = `darewast-save-${user.username}-${subject.id}-${level}-${activeLesson}`;

  useEffect(() => {
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const filteredVoices = useMemo(() => {
    const langCode = LANG_BCP47[language] || 'en-US';
    const langPrefix = langCode.split('-')[0];
    return voices.filter(v => v.lang.startsWith(langPrefix));
  }, [voices, language]);

  const playSpeech = (text: string, id: string) => {
    sounds.click();
    if (isReading === id) {
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
    setIsPaused(false);
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = LANG_BCP47[language] || 'en-US';
    utterance.lang = langCode;
    utterance.rate = speechRate;
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => { setIsReading(id); setIsPaused(false); };
    utterance.onend = () => { setIsReading(null); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const loadContent = useCallback(async (ignoreCache = false) => {
    if (initialLesson && !ignoreCache && lesson === initialLesson) return;
    setLoading(true);
    try {
      const content = await generateLesson(subject, language, level, activeLesson, user, progress);
      setLesson(content);
      setUserAnswers({});
      setTextInputs({});
      setCheckedIndices(new Set());
      setVisibleHints(new Set());
      setCompletedMedia(new Set());
      setXpPool(content.exercises.length * 100);
      const saved = localStorage.getItem(saveKey);
      if (saved && !ignoreCache) {
        const data = JSON.parse(saved);
        setUserAnswers(data.userAnswers || {});
        setTextInputs(data.textInputs || {});
        setCheckedIndices(new Set(data.checkedIndices || []));
        setCompletedMedia(new Set(data.completedMedia || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [subject, language, level, activeLesson, user, progress, initialLesson, lesson, saveKey]);

  useEffect(() => {
    if (!initialLesson) loadContent();
    else if (initialLesson) {
      setXpPool(initialLesson.exercises.length * 100);
      restoreProgress();
    }
    return () => window.speechSynthesis.cancel();
  }, [loadContent, initialLesson]);

  const handleApplyTheme = async (themeName: string) => {
    sounds.click();
    setIsThemeLoading(true);
    onUpdateProgress(subject.id, { currentTheme: themeName });
    setIsThemeModalOpen(false);
    loadContent(true);
    setIsThemeLoading(false);
  };

  const openThemeModal = async () => {
    sounds.click();
    setIsThemeModalOpen(true);
    if (themeSuggestions.length === 0) {
      const suggestions = await generateThemeSuggestions(user, language);
      setThemeSuggestions(suggestions);
    }
  };

  const handleSaveProgress = () => {
    sounds.click();
    const data = {
      userAnswers,
      textInputs,
      checkedIndices: Array.from(checkedIndices),
      completedMedia: Array.from(completedMedia)
    };
    localStorage.setItem(saveKey, JSON.stringify(data));
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleSaveSchedule = () => {
    sounds.click();
    const newSession: ScheduledSession = {
      id: Date.now().toString(),
      subjectId: subject.id,
      subjectName: subject.name,
      date: scheduleDate,
      time: scheduleTime,
      duration: scheduleDuration
    };
    const existing = user.scheduledSessions || [];
    onUpdateUser({ scheduledSessions: [...existing, newSession] });
    setIsScheduleModalOpen(false);
    alert(`Success! Study session scheduled for ${subject.name}.`);
  };

  const restoreProgress = useCallback(() => {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserAnswers(data.userAnswers || {});
        setTextInputs(data.textInputs || {});
        setCheckedIndices(new Set(data.checkedIndices || []));
        setCompletedMedia(new Set(data.completedMedia || []));
      } catch (e) { console.error(e); }
    }
  }, [saveKey]);

  const handleFinishLesson = async () => {
    if (!lesson) return;
    sounds.complete();
    setIsFinishing(true);
    const correctCount = lesson.exercises.reduce((acc, ex, idx) => {
      const isCorrect = userAnswers[idx]?.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim();
      return acc + (isCorrect ? 1 : 0);
    }, 0);
    const finalXP = Math.floor((correctCount / (lesson.exercises.length || 1)) * xpPool) + (completedMedia.size * 25);
    localStorage.removeItem(saveKey);
    try {
      const quote = await generateMotivationalQuote(subject.name, correctCount, lesson.exercises.length, language);
      setResultsData({ score: correctCount, total: lesson.exercises.length, xp: finalXP, quote });
      setShowResults(true);
    } catch (err) {
      setResultsData({ score: correctCount, total: lesson.exercises.length, xp: finalXP, quote: "Every effort brings you closer to mastery." });
      setShowResults(true);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCommitResults = () => {
    sounds.click();
    if (resultsData) onComplete(resultsData.score, activeLesson, resultsData.xp);
  };

  const handleCheckTextAnswer = (index: number) => {
    const value = textInputs[index] || '';
    if (!value.trim()) return;
    const isCorrect = value.toLowerCase().trim() === lesson?.exercises[index].correctAnswer.toLowerCase().trim();
    if (isCorrect) sounds.correct(); else sounds.incorrect();
    setUserAnswers(prev => ({ ...prev, [index]: value }));
    setCheckedIndices(prev => new Set(prev).add(index));
  };

  const handleEditAnswer = (index: number) => {
    sounds.click();
    setCheckedIndices(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const toggleMediaCompletion = (id: string, type: MediaItem['type']) => {
    sounds.click();
    const next = new Set(completedMedia);
    let isNowCompleted = false;
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      isNowCompleted = true;
    }
    setCompletedMedia(next);

    const currentProg = progress?.[subject.id] || { level: 'A', lessonNumber: 1 };
    const mediaProg = currentProg.mediaProgress || {
      completedEbooks: [], completedBlogs: [], completedPodcasts: [], completedVideos: [], completedSongs: []
    };

    const keyMap: Record<MediaItem['type'], keyof NonNullable<SubjectProgress['mediaProgress']>> = {
      ebook: 'completedEbooks',
      blog: 'completedBlogs',
      podcast: 'completedPodcasts',
      video: 'completedVideos',
      song: 'completedSongs'
    };

    const categoryKey = keyMap[type];
    let categoryList = [...(mediaProg[categoryKey] as string[])];
    
    if (isNowCompleted) {
      if (!categoryList.includes(id)) categoryList.push(id);
    } else {
      categoryList = categoryList.filter(mid => mid !== id);
    }

    onUpdateProgress(subject.id, {
      mediaProgress: {
        ...mediaProg,
        [categoryKey]: categoryList
      }
    });
  };

  const handlePlayVideo = (media: MediaItem) => {
    sounds.click();
    setActiveVideo(media);
  };

  const toggleHint = (index: number) => {
    sounds.click();
    const next = new Set(visibleHints);
    if (next.has(index)) next.delete(index); else next.add(index);
    setVisibleHints(next);
  };

  const getThemeColor = () => {
    switch (subject.category) {
      case 'Literacy': return 'dare-teal';
      case 'Numeracy': return 'dare-gold';
      case 'Science': return 'blue-400';
      case 'Humanities': return 'orange-400';
      case 'Tech': return 'dare-purple';
      case 'Music': return 'pink-400';
      case 'Ethics': return 'emerald-400';
      default: return 'dare-teal';
    }
  };

  const themeColor = getThemeColor();
  const progressPercent = lesson ? Math.round((checkedIndices.size / (lesson.exercises.length || 1)) * 100) : 0;

  // Adaptive Rigor calculation for UI feedback
  const getRigorStatus = () => {
    const subProg = progress?.[subject.id];
    if (!subProg?.lastScore) return "Optimal";
    const ratio = subProg.lastScore.correct / (subProg.lastScore.total || 1);
    if (ratio >= 0.9) return "Advanced Rigor";
    if (ratio >= 0.7) return "Steady Mastery";
    if (ratio >= 0.5) return "Supportive Sync";
    return "Foundation Focus";
  };

  if (loading || isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn">
        <div className="w-20 h-20 border-8 border-dare-teal border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest animate-pulse">
            {isFinishing ? 'Calculating Mastery...' : 'Personalizing Curricula'}
          </p>
          <p className="text-gray-500 font-bold mt-2">
            {isFinishing ? 'Analyzing your progress nodes...' : 'Calibrating cognitive age & cultural background...'}
          </p>
        </div>
      </div>
    );
  }

  if (showResults && resultsData) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn">
        <CelebrationParticles />
        <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_0_100px_rgba(83,205,186,0.3)] border border-white/20 overflow-hidden text-center p-12 md:p-20 group">
          <div className="absolute inset-0 bg-gradient-to-br from-dare-teal/10 via-dare-purple/10 to-dare-gold/10 opacity-30 group-hover:opacity-50 transition-opacity"></div>
          
          <div className="relative z-10 space-y-12">
            <div className="animate-pop">
              <div className="w-32 h-32 bg-gradient-to-br from-dare-teal to-dare-gold rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-8 shadow-2xl animate-bounce-slow">🎓</div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple animate-gradient-x">
                  Level Up!
                </span>
              </h2>
              <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-sm mt-4">Curriculum Mastery Node Synchronized</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-xl hover:scale-105 transition-transform">
                <p className="text-[10px] font-black text-dare-gold uppercase tracking-widest mb-1">XP Earned</p>
                <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">+{resultsData.xp}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-xl hover:scale-105 transition-transform">
                <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mb-1">Score</p>
                <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">{resultsData.score}/{resultsData.total}</p>
              </div>
              <div className="hidden md:block bg-gray-50 dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-xl hover:scale-105 transition-transform">
                <p className="text-[10px] font-black text-dare-purple uppercase tracking-widest mb-1">Streak</p>
                <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">{user.streak + 1}</p>
              </div>
            </div>

            <div className="py-12 px-10 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-[4rem] border border-white/20 shadow-inner max-w-2xl mx-auto relative overflow-hidden group/quote">
              <div className="absolute top-0 left-0 w-2 h-full bg-dare-teal opacity-50 group-hover/quote:h-0 transition-all duration-700"></div>
              <p className="text-2xl md:text-3xl font-serif italic text-gray-700 dark:text-gray-200 leading-relaxed drop-shadow-sm">
                "{resultsData.quote}"
              </p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-dare-teal animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-dare-gold animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-dare-purple animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            <button 
              onClick={handleCommitResults}
              className="w-full max-w-xl py-10 bg-gradient-to-r from-dare-teal via-dare-purple to-dare-gold text-white rounded-[3.5rem] font-black text-3xl shadow-[0_20px_50px_rgba(83,205,186,0.4)] hover:scale-[1.03] active:scale-95 transition-all outline-none group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                Manifest Mastery →
              </span>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHybrid = lesson?.isHybrid || subject.id === 'hybrid';
  const hasRichMedia = !!subject.richMediaConfig;

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fadeIn px-4 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes choicePop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1.02); } }
        @keyframes choiceShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes celebrate {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg) scale(0.2); opacity: 0; }
        }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .animate-celebrate { animation: celebrate linear infinite; }
        .animate-pop { animation: choicePop 0.3s ease-out forwards; }
        .animate-shake { animation: choiceShake 0.2s ease-in-out 2; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .hint-bubble::before { content: ''; position: absolute; top: -10px; right: 20px; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid #CCB953; opacity: 0.1; }
        .dark .hint-bubble::before { border-bottom-color: #CCB953; opacity: 0.2; }
      `}} />

      {isTutorOpen && <AITutor user={user} language={language} context={lesson?.explanation || ''} onClose={() => setIsTutorOpen(false)} />}
      
      {activeVideo && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-fadeIn">
          <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(83,205,186,0.2)] border border-white/10 overflow-hidden flex flex-col relative group">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all z-20"
            >
              ✕
            </button>
            <div className="flex-1 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-dare-teal/10 via-black to-dare-purple/10"></div>
              <div className="relative z-10 text-center space-y-6">
                 <div className="w-24 h-24 bg-dare-teal/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                   <span className="text-5xl">📺</span>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-3xl font-black text-white">{activeVideo.title}</h3>
                   <p className="text-dare-teal font-black uppercase text-xs tracking-widest">Synthetic Instruction Stream</p>
                 </div>
                 <div className="flex justify-center gap-1.5 h-12 items-center">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="w-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${40 + Math.random() * 60}%` }}></div>
                    ))}
                 </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
                 <div className="flex items-center gap-6">
                    <button className="text-white text-3xl">▶</button>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                       <div className="absolute left-0 top-0 h-full w-1/3 bg-dare-teal shadow-[0_0_10px_#53CDBA]"></div>
                    </div>
                    <div className="text-white font-mono text-xs opacity-60">12:45 / 45:00</div>
                 </div>
              </div>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Module Source</p>
                <p className="text-xl font-black dark:text-white">{activeVideo.title}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    toggleMediaCompletion(activeVideo.id, 'video');
                    setActiveVideo(null);
                  }}
                  className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${completedMedia.has(activeVideo.id) ? 'bg-gray-100 text-gray-400' : 'bg-dare-teal text-white shadow-xl shadow-dare-teal/20 hover:scale-105'}`}
                >
                  {completedMedia.has(activeVideo.id) ? '✓ Marked Learned' : '✓ Mark as Learned'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col">
            <div className="p-8 bg-gradient-to-r from-dare-teal to-emerald-500 text-white relative">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">📅</div>
               <h3 className="text-2xl font-black mb-1">Schedule Study Session</h3>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Study Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold text-lg dark:text-white shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold text-lg dark:text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration (mins)</label>
                  <select value={scheduleDuration} onChange={e => setScheduleDuration(parseInt(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold text-lg dark:text-white shadow-inner">
                    <option value={15}>15 Minutes</option><option value={30}>30 Minutes</option><option value={45}>45 Minutes</option><option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveSchedule} className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-lg shadow-xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all">Save Session</button>
              <button onClick={() => setIsScheduleModalOpen(false)} className="w-full py-4 text-gray-400 font-black uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isThemeModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 bg-gradient-to-r from-dare-gold to-dare-purple text-white relative">
               <h3 className="text-3xl font-black mb-2">{t('chooseTheme')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {themeSuggestions.map(theme => (
                  <button key={theme.name} onClick={() => handleApplyTheme(theme.name)} className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl hover:bg-dare-gold/10 border-2 border-transparent hover:border-dare-gold transition-all group">
                    <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">{theme.icon}</span>
                    <span className="text-xs font-black uppercase tracking-widest dark:text-white">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800">
               <button onClick={() => setIsThemeModalOpen(false)} className="w-full py-4 text-gray-400 font-black uppercase text-xs tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-teal font-black uppercase tracking-widest text-xs transition-colors">← Exit session</button>
        <div className="flex items-center gap-3">
           <div className="px-4 py-1.5 bg-dare-purple/10 border border-dare-purple/20 text-dare-purple rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-dare-purple rounded-full animate-pulse"></span>
              {getRigorStatus()}
           </div>
           <button onClick={() => setIsScheduleModalOpen(true)} className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-dare-gold/40 text-dare-gold rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">📅 Schedule</button>
           <button onClick={() => setIsTutorOpen(true)} className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-dare-teal/40 text-dare-teal rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">📞 Call Tutor</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden relative">
        <header className={`p-10 text-white relative ${isHybrid ? 'bg-gradient-to-r from-dare-teal via-dare-purple to-dare-gold animate-gradient-x' : 'bg-dare-teal'}`}>
           <div className="relative z-10 flex items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl shadow-2xl">{subject.icon}</div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">{level} Mastery</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Lesson {activeLesson}</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight">{lesson?.title}</h1>
                </div>
              </div>
           </div>
           {hasRichMedia && (
             <div className="relative z-10 mt-8 flex gap-2">
               <button onClick={() => setActiveTab('concept')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'concept' ? 'bg-white text-dare-teal' : 'bg-white/20 text-white'}`}>{t('concept')}</button>
               <button onClick={() => setActiveTab('media')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'media' ? 'bg-white text-dare-teal' : 'bg-white/20 text-white'}`}>{t('mediaHub')}</button>
             </div>
           )}
        </header>

        <div className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-12 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-6 flex-1">
             <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                <div className={`h-full bg-${themeColor} transition-all duration-1000 ease-out`} style={{ width: `${progressPercent}%`, backgroundColor: themeColor === 'dare-teal' ? '#53CDBA' : themeColor === 'dare-gold' ? '#CCB953' : themeColor === 'dare-purple' ? '#B953CC' : undefined }}></div>
             </div>
             <div className="flex flex-col items-end min-w-[80px]">
                <span className={`text-xl font-black leading-none text-${themeColor}`}>{progressPercent}%</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mastery</span>
             </div>
           </div>
        </div>

        <div className="p-12 space-y-20">
          {activeTab === 'concept' ? (
            <>
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Lecture & Insight</h2>
                  <button onClick={() => playSpeech(lesson?.explanation || '', 'explanation')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm ${isReading === 'explanation' ? 'bg-dare-teal text-white scale-105' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                    <SpeakerIcon active={isReading === 'explanation'} paused={isPaused} />
                    <span>{isReading === 'explanation' ? (isPaused ? 'Resume' : 'Pause') : 'Read Aloud'}</span>
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-10 rounded-[3rem] border border-transparent hover:border-dare-teal transition-all shadow-inner">
                  <p className="text-2xl font-medium text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{lesson?.explanation}</p>
                </div>
                {lesson?.timelinePoints && lesson.timelinePoints.length > 0 && (
                  <InteractiveTimeline points={lesson.timelinePoints} themeColor={getThemeColor()} />
                )}
              </section>

              {lesson?.examples && lesson.examples.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-12">{t('examples')}</h2>
                  <div className="grid gap-6">
                    {lesson.examples.map((ex, idx) => (
                      <div key={idx} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 hover:border-dare-gold transition-all flex items-start justify-between gap-8">
                        <div className="flex items-start gap-4 flex-1">
                          <span className="text-dare-gold font-black text-xl">0{idx + 1}.</span>
                          <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{ex}</p>
                        </div>
                        <button onClick={() => playSpeech(ex, `example-${idx}`)} className={`p-4 rounded-2xl transition-all ${isReading === `example-${idx}` ? 'bg-dare-gold text-white scale-110' : 'bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-dare-gold'}`}><SpeakerIcon active={isReading === `example-${idx}`} paused={isPaused} /></button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section id="exercises-section">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-12">{t('exercises')}</h2>
                <div className="space-y-12">
                  {lesson?.exercises.map((ex, i) => {
                    const isChecked = checkedIndices.has(i);
                    const isHintVisible = visibleHints.has(i);
                    const userAns = userAnswers[i] || '';
                    const isCorrectGlobal = userAns.toLowerCase().trim() === ex.correctAnswer.toLowerCase().trim();
                    const qId = `q-${i}`;
                    const hintId = `hint-${i}`;
                    const expId = `exp-${i}`;
                    return (
                      <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all duration-500 relative ${isChecked ? (isCorrectGlobal ? 'bg-emerald-50/30 border-emerald-200 dark:border-emerald-900/30' : 'bg-rose-50/30 border-rose-200 dark:border-rose-900/30') : 'bg-gray-50 dark:bg-slate-800/50 border-transparent hover:border-gray-200'}`}>
                        <div className="flex justify-between items-start gap-6 mb-8">
                           <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-dare-purple uppercase tracking-[0.2em]">Problem #{i+1}</span>
                                {!isChecked && ex.hint && (
                                  <button onClick={() => toggleHint(i)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isHintVisible ? 'bg-dare-gold text-white border-dare-gold' : 'bg-white dark:bg-slate-900 text-dare-gold border-dare-gold/40'}`}><span>💡</span> {t('hint')}</button>
                                )}
                              </div>
                              <div className="flex items-start gap-4">
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white flex-1">{ex.question}</h3>
                                <button onClick={() => playSpeech(ex.question, qId)} className={`p-3 rounded-2xl transition-all ${isReading === qId ? 'bg-dare-purple text-white scale-110' : 'bg-white dark:bg-slate-900 text-gray-400'}`}><SpeakerIcon active={isReading === qId} paused={isPaused} /></button>
                              </div>
                           </div>
                        </div>

                        {isHintVisible && !isChecked && ex.hint && (
                          <div className="mb-8 p-6 bg-amber-50/80 dark:bg-amber-900/10 border-2 border-dare-gold/30 border-dashed rounded-[2.5rem] animate-fadeIn hint-bubble relative">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="text-xl">🕵️‍♂️</span>
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 italic flex-1 leading-relaxed">{ex.hint}</p>
                                <button onClick={() => playSpeech(ex.hint || '', hintId)} className={`p-2 rounded-xl transition-all ml-2 ${isReading === hintId ? 'bg-dare-gold text-white scale-110' : 'text-dare-gold hover:bg-dare-gold/10'}`}><SpeakerIcon active={isReading === hintId} paused={isPaused} className="w-4 h-4" /></button>
                              </div>
                              <button onClick={() => toggleHint(i)} className="w-8 h-8 rounded-full flex items-center justify-center text-amber-400 hover:bg-amber-100 transition-all font-black text-sm">✕</button>
                            </div>
                          </div>
                        )}

                        {ex.options ? (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {ex.options.map(opt => {
                              const isOptionSelected = userAns === opt;
                              const isOptionCorrect = opt === ex.correctAnswer;
                              let btnClass = 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-dare-teal';
                              if (isChecked) {
                                if (isOptionCorrect) btnClass = 'bg-emerald-500 border-emerald-600 text-white animate-pop shadow-lg z-10';
                                else if (isOptionSelected) btnClass = 'bg-rose-500 border-rose-600 text-white animate-shake shadow-lg z-10';
                                else btnClass = 'bg-gray-50 dark:bg-slate-800 opacity-40 border-transparent';
                              }
                              return (
                                <button key={opt} disabled={isChecked} onClick={() => { if (opt === ex.correctAnswer) sounds.correct(); else sounds.incorrect(); setUserAnswers({...userAnswers, [i]: opt}); setCheckedIndices(prev => new Set(prev).add(i)); }} className={`p-6 text-left rounded-[2rem] border-2 font-bold text-lg transition-all ${btnClass}`}>{opt}</button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="relative">
                            <input type="text" disabled={isChecked} value={isChecked ? userAns : (textInputs[i] || '')} onChange={(e) => setTextInputs({ ...textInputs, [i]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && !isChecked && handleCheckTextAnswer(i)} placeholder="Type answer..." className={`w-full p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 outline-none font-bold text-lg ${isChecked ? (isCorrectGlobal ? 'border-emerald-500' : 'border-rose-500') : 'border-gray-100 focus:border-dare-teal'}`} />
                            {!isChecked && <button onClick={() => handleCheckTextAnswer(i)} className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-dare-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest">Check</button>}
                          </div>
                        )}
                        {isChecked && (
                          <div className="mt-8 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 animate-fadeIn space-y-4">
                            <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-widest text-dare-teal">Tutor Insight</p><button onClick={() => handleEditAnswer(i)} className="text-[10px] font-black text-gray-400 hover:text-dare-teal transition-all">✎ {t('editAnswer')}</button></div>
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100"><p className="text-[9px] font-black text-emerald-600 uppercase mb-1">{t('correctAnswerLabel')}</p><p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{ex.correctAnswer}</p></div>
                            <div className="flex items-start gap-4">
                              <p className="text-lg font-medium text-gray-600 dark:text-gray-300 italic flex-1 leading-relaxed">{ex.explanation}</p>
                              <button onClick={() => playSpeech(ex.explanation, expId)} className={`p-3 rounded-2xl transition-all shadow-sm ${isReading === expId ? 'bg-dare-teal text-white scale-110' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-dare-teal border border-gray-100 dark:border-slate-800'}`} title="Listen to explanation"><SpeakerIcon active={isReading === expId} paused={isPaused} className="w-5 h-5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="animate-fadeIn">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-12">{t('mediaHub')}</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                   {lesson?.mediaResources?.map((res) => {
                      const isComplete = completedMedia.has(res.id);
                      return (
                        <div 
                          key={res.id} 
                          className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 group ${isComplete ? 'bg-dare-teal/5 border-dare-teal shadow-lg' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 hover:border-dare-gold'}`}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                  {res.type === 'ebook' ? '📖' : res.type === 'blog' ? '📰' : res.type === 'podcast' ? '🎙️' : res.type === 'video' ? '📺' : '🎵'}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase text-gray-400">{res.type}</p>
                                  <p className="font-bold dark:text-white line-clamp-1">{res.title}</p>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isComplete ? 'bg-dare-teal text-white' : 'bg-gray-100 dark:bg-slate-700 text-transparent'}`}>✓</div>
                           </div>
                           
                           <div className="flex gap-2">
                              {res.type === 'video' && (
                                <button 
                                  onClick={() => handlePlayVideo(res)}
                                  className="flex-1 py-3 bg-dare-gold text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  ▶ Watch
                                </button>
                              )}
                              <button 
                                onClick={() => toggleMediaCompletion(res.id, res.type)}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${isComplete ? 'bg-white dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700' : 'bg-dare-teal text-white border-dare-teal shadow-md hover:scale-[1.02]'}`}
                              >
                                {isComplete ? 'Learned' : 'Mark Learned'}
                              </button>
                           </div>
                        </div>
                      );
                   })}
                </div>
            </section>
          )}

          {checkedIndices.size === (lesson?.exercises?.length || 0) && (
            <button onClick={handleFinishLesson} className="w-full py-8 bg-gradient-to-r from-dare-teal via-dare-purple to-dare-gold text-white rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all">
              Master Lesson {activeLesson} 🎓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
