
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress, SubjectProgress, LearningStyle, MediaItem } from '../types';
import { generateLesson, recognizeHandwriting, generateVisualAid } from '../services/geminiService';
import { translations } from '../translations';
import AITutor from './AITutor';
import ExerciseRenderer from './ExerciseRenderer';
import HandwritingCanvas from './HandwritingCanvas';
import CreativeStudio from './CreativeStudio';

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

const PronounceWord: React.FC<{ word: string; phonetic: string }> = ({ word, phonetic }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <span 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span className="border-b-4 border-white text-white font-black transition-all hover:bg-white/20 px-1 rounded-sm">
        {word}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-6 py-3 bg-dare-gold text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl z-[50] whitespace-nowrap animate-scale-in border-4 border-white/30">
          <span className="opacity-60 mr-4">IPA:</span>
          {phonetic}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent border-t-dare-gold"></span>
        </span>
      )}
    </span>
  );
};

const LessonView: React.FC<Props> = ({ subject, language, level, lessonNumber, user, progress, initialLesson, onComplete, onBack, onUpdateUser, onUpdateProgress }) => {
  const [activeLesson] = useState(lessonNumber);
  const [lesson, setLesson] = useState<LessonContent | null>(initialLesson || null);
  const [loading, setLoading] = useState(!initialLesson);
  const [loadingStep, setLoadingStep] = useState(0);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [visibleHints, setVisibleHints] = useState<Set<number>>(new Set());
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(user.preferredLearningStyle || 'Unified');
  const [visualAidUrl, setVisualAidUrl] = useState<string | null>(null);
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number | null>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showVisualAid, setShowVisualAid] = useState(true);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const loadingMessages = useMemo(() => [
    "Consulting Academic Registry...",
    "Aligning Cultural DNA...",
    "Calibrating Difficulty (ZPD)...",
    "Synthesizing Trinity Logic Nodes...",
    "Anchoring Interactive Textbook..."
  ], []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [loading, loadingMessages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isCelebrating) setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCelebrating]);

  useEffect(() => {
    if (!lesson && !loading) {
      const fetchLesson = async () => {
        setLoading(true);
        try {
          const content = await generateLesson(subject, language, level, activeLesson, user, progress);
          setLesson(content);
        } catch (err) { console.error("Synthesis failed", err); } finally { setLoading(false); }
      };
      fetchLesson();
    }
  }, [lesson, loading, subject, language, level, activeLesson, user, progress]);

  useEffect(() => {
    if (lesson?.adaptations.visualMapDescription && !visualAidUrl && !loadingVisual) {
      const fetchVisual = async () => {
        setLoadingVisual(true);
        try {
          const url = await generateVisualAid(lesson.adaptations.visualMapDescription);
          setVisualAidUrl(url);
        } catch (err) {
          console.error("Visual synthesis failed", err);
        } finally {
          setLoadingVisual(false);
        }
      };
      fetchVisual();
    }
  }, [lesson, visualAidUrl, loadingVisual]);

  const handleStyleChange = (style: LearningStyle) => {
    setLearningStyle(style);
    onUpdateUser({ preferredLearningStyle: style });
  };

  const handleCheckAnswer = (idx: number) => {
    setCheckedIndices(prev => new Set(prev).add(idx));
  };

  const handleToggleHint = (idx: number) => {
    const isShowing = visibleHints.has(idx);
    const newHints = new Set(visibleHints);
    if (isShowing) {
      newHints.delete(idx);
    } else {
      newHints.add(idx);
      const currentHints = progress?.[subject.id]?.hintsUsed || 0;
      onUpdateProgress(subject.id, { hintsUsed: currentHints + 1 });
    }
    setVisibleHints(newHints);
  };

  const concludeLesson = () => {
    if (!lesson) return;
    const score = checkedIndices.size;
    const xpEarned = (score * 25) + 50;
    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));
    const currentTotalMins = progress?.[subject.id]?.totalMinutesSpent || 0;
    const currentDailyMins = progress?.[subject.id]?.dailyMinutesSpent || 0;
    onUpdateProgress(subject.id, { 
      totalMinutesSpent: currentTotalMins + minutesSpent,
      dailyMinutesSpent: currentDailyMins + minutesSpent
    });
    onComplete(score, activeLesson, xpEarned);
  };

  const renderExplanationWithPronunciation = (text: string) => {
    if (!lesson?.phoneticMap || Object.keys(lesson.phoneticMap).length === 0) return text;
    const sortedKeys = Object.keys(lesson.phoneticMap).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sortedKeys.join('|')})\\b`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      const matchKey = sortedKeys.find(key => key.toLowerCase() === lowerPart);
      if (matchKey) {
        return <PronounceWord key={i} word={part} phonetic={lesson.phoneticMap![matchKey]} />;
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-16 animate-fadeIn p-6 bg-slate-950">
        <div className="relative group">
          <div className="w-48 h-48 border-[20px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform">🧪</div>
          <div className="absolute -inset-8 border-4 border-dare-teal/20 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-dare-teal animate-fadeIn">
            {loadingMessages[loadingStep]}
          </h2>
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs">
              {t('generatingLesson')}
            </p>
            <div className="h-3 w-80 bg-slate-900 rounded-full overflow-hidden border-2 border-white/10">
               <div 
                 className="h-full bg-gradient-to-r from-dare-teal to-dare-purple transition-all duration-1000" 
                 style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
               ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentAdaptation = learningStyle === 'Unified' ? lesson?.explanation 
    : learningStyle === 'Visual' ? lesson?.adaptations.visualMapDescription
    : learningStyle === 'Auditory' ? lesson?.adaptations.auditoryScript
    : learningStyle === 'Kinesthetic' ? lesson?.adaptations.kinestheticActivity
    : learningStyle === 'Reading' ? lesson?.adaptations.readingDeepDive : lesson?.explanation;

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fadeIn grid lg:grid-cols-12 gap-8 md:gap-12 relative">
      <div className="absolute inset-0 pattern-grid opacity-[0.02] dark:opacity-[0.04] pointer-events-none"></div>
      
      {isCelebrating && (
        <div className="fixed inset-0 z-[400] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-4xl w-full bg-dare-gold rounded-[5rem] p-24 text-center shadow-2xl border-[10px] border-white/40 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-6 bg-slate-950 animate-pulse"></div>
            <div className="relative inline-block mb-16">
               <div className="w-64 h-64 bg-slate-950 text-white rounded-[4rem] flex items-center justify-center text-[12rem] shadow-2xl relative z-10 animate-bounce border-4 border-white/20">🏆</div>
            </div>
            <div className="space-y-6 mb-24 relative z-10">
              <h2 className="text-7xl md:text-9xl font-black text-slate-950 tracking-tighter leading-none uppercase font-display">Node Anchored!</h2>
              <p className="text-slate-950 font-black uppercase tracking-[0.8em] text-lg opacity-60">Level {level} • Logic Synthesized</p>
            </div>
            <button 
              onClick={concludeLesson}
              className="w-full py-14 bg-slate-950 text-white rounded-[4rem] font-black text-5xl shadow-2xl hover:scale-[1.03] active:scale-95 transition-all group relative overflow-hidden"
            >
              Anchor Academic DNA <span className="inline-block group-hover:translate-x-6 transition-transform ml-8">→</span>
            </button>
          </div>
        </div>
      )}

      <aside className="lg:col-span-3 space-y-10 lg:sticky lg:top-32 h-fit relative z-10">
        <button onClick={onBack} className="w-full py-7 bg-dare-gold text-slate-950 font-black uppercase text-xs tracking-[0.3em] rounded-[2.5rem] border-4 border-white/30 hover:bg-slate-950 hover:text-white transition-all shadow-2xl">← Return Dashboard</button>
        
        <button 
          onClick={() => setIsTutorOpen(true)} 
          className="w-full py-7 bg-dare-teal text-slate-950 font-black uppercase text-xs tracking-[0.3em] rounded-[2.5rem] border-4 border-white/30 hover:bg-slate-950 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4"
        >
          <span>🧠</span> Summon AI Tutor
        </button>
        
        <div className="bg-dare-teal p-10 rounded-[4.5rem] shadow-2xl border-4 border-white/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black group-hover:rotate-12 transition-transform duration-1000">META</div>
           <p className="text-[11px] font-black text-slate-950 uppercase tracking-[0.5em] mb-10 relative z-10">Metadata Path</p>
           <div className="space-y-6 relative z-10">
              <div className="p-6 bg-slate-950/20 backdrop-blur-md text-slate-950 rounded-3xl border-2 border-white/20 shadow-inner">
                <p className="text-[10px] font-black uppercase mb-2 opacity-60">Style Node</p>
                <p className="text-xl font-black uppercase tracking-tight">{learningStyle}</p>
              </div>
              <div className="p-6 bg-slate-950/20 backdrop-blur-md text-slate-950 rounded-3xl border-2 border-white/20 shadow-inner">
                <p className="text-[10px] font-black uppercase mb-2 opacity-60">Mastery Grade</p>
                <p className="text-xl font-black uppercase tracking-tight">LVL {level} • Node {activeLesson}</p>
              </div>
              <div className="p-6 bg-slate-950/20 backdrop-blur-md text-slate-950 rounded-3xl border-2 border-white/20 shadow-inner">
                <p className="text-[10px] font-black uppercase mb-2 opacity-60">Difficulty</p>
                <p className={`text-xl font-black uppercase tracking-tight ${progress?.[subject.id]?.difficulty === 'Hard' ? 'text-rose-700' : (progress?.[subject.id]?.difficulty === 'Easy' ? 'text-emerald-700' : 'text-slate-950')}`}>
                  {progress?.[subject.id]?.difficulty || 'Medium'}
                </p>
              </div>
           </div>
        </div>
      </aside>

      <main className="lg:col-span-9 space-y-20 relative z-10">
        <header className="bg-slate-900 p-8 sm:p-12 md:p-24 rounded-[3rem] sm:rounded-[5rem] text-white shadow-2xl relative overflow-hidden border-4 border-white/10 group">
           <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 text-[10rem] sm:text-[20rem] rotate-12 group-hover:scale-110 transition-transform duration-1000">{subject.icon}</div>
           <div className="relative z-10 space-y-10 sm:space-y-16">
              <div className="flex flex-wrap gap-3 sm:gap-4">
                 {['Unified', 'Visual', 'Auditory', 'Reading', 'Kinesthetic'].map(s => (
                   <button key={s} onClick={() => handleStyleChange(s as any)} className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${learningStyle === s ? 'bg-dare-teal text-slate-950 shadow-2xl scale-110' : 'bg-slate-950/50 backdrop-blur-md text-slate-500 border-2 border-white/10 hover:border-white/30'}`}>{s}</button>
                 ))}
              </div>
              <h1 className="text-4xl sm:text-7xl md:text-[10rem] font-black tracking-tighter leading-[1] sm:leading-[0.8] uppercase font-display">{lesson?.title}</h1>
           </div>
        </header>

        <section className="bg-dare-purple p-8 sm:p-12 md:p-24 rounded-[3rem] sm:rounded-[5.5rem] shadow-2xl border-[6px] sm:border-[8px] border-white/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 sm:p-16 opacity-10 text-[10rem] sm:text-[15rem] font-black text-white group-hover:rotate-6 transition-transform duration-1000">LOGIC</div>
           <h3 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.5em] sm:tracking-[0.7em] mb-12 sm:mb-20 opacity-60">{t('concept')}</h3>
           <div className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-[1.2] sm:leading-[1.1] italic mb-16 sm:mb-24 tracking-tighter font-display">"{renderExplanationWithPronunciation(currentAdaptation || '')}"</div>
           
           {learningStyle === 'Visual' && (
             <div className="mb-24 space-y-8">
               <div className="flex justify-between items-center mb-6">
                 <h4 className="text-xs font-black text-white uppercase tracking-[0.4em] opacity-60">Visual Synthesis</h4>
                 <button 
                   onClick={() => setShowVisualAid(!showVisualAid)}
                   className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all shadow-lg flex items-center gap-2"
                 >
                   <span>{showVisualAid ? '👁️' : '🕶️'}</span>
                   {showVisualAid ? 'Hide Visual Aid' : 'Show Visual Aid'}
                 </button>
               </div>

               {showVisualAid && (
                 <div className="bg-slate-950/40 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl relative group animate-fadeIn">
                   {loadingVisual ? (
                     <div className="aspect-video flex items-center justify-center bg-slate-900 animate-pulse">
                       <div className="text-center space-y-4">
                         <div className="w-16 h-16 border-4 border-dare-teal/20 border-t-dare-teal rounded-full animate-spin mx-auto"></div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-dare-teal">Synthesizing Visual Node...</p>
                       </div>
                     </div>
                   ) : visualAidUrl ? (
                     <img 
                       src={visualAidUrl} 
                       alt="Visual Aid" 
                       className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="aspect-video flex items-center justify-center bg-slate-900">
                       <p className="text-white/40 font-black uppercase tracking-widest text-xs">Visual synthesis unavailable</p>
                     </div>
                   )}
                   <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 to-transparent">
                     <p className="text-white text-sm font-bold italic opacity-80">"{lesson?.adaptations.visualMapDescription}"</p>
                   </div>
                 </div>
               )}
             </div>
           )}
           
           {lesson?.timelineSteps && (
             <div className="space-y-12 pt-24 border-t-4 border-white/10">
                {lesson.timelineSteps.map((step, idx) => (
                  <div key={idx} onClick={() => setActiveTimelineStep(idx)} className={`p-14 rounded-[4rem] cursor-pointer transition-all border-[6px] ${activeTimelineStep === idx ? 'border-white bg-slate-950 shadow-2xl scale-[1.03]' : 'border-transparent bg-white/5 opacity-50 hover:opacity-100 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-8 mb-8">
                       <span className={`text-sm font-black ${activeTimelineStep === idx ? 'text-dare-teal' : 'text-white'} uppercase tracking-[0.6em]`}>Node 0{idx+1}</span>
                       <h5 className="font-black uppercase tracking-tighter text-white text-5xl font-display">{step.title}</h5>
                    </div>
                    {activeTimelineStep === idx && <p className="text-slate-300 font-bold text-4xl leading-relaxed animate-fadeIn">{renderExplanationWithPronunciation(step.detail)}</p>}
                  </div>
                ))}
             </div>
           )}
        </section>

        <section className="space-y-20 relative z-10">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.8em] text-center">{t('exercises')}</h3>
           {lesson?.exercises.map((ex, i) => (
             <ExerciseRenderer
               key={i}
               exercise={ex}
               index={i}
               language={language}
               isCompleted={checkedIndices.has(i)}
               onCorrect={() => handleCheckAnswer(i)}
               showHint={visibleHints.has(i)}
               onToggleHint={() => handleToggleHint(i)}
               onHintUsed={() => {}}
             />
           ))}
        </section>

        <button onClick={() => setIsCelebrating(true)} className="w-full py-20 bg-dare-teal text-slate-950 rounded-[6rem] font-black text-6xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative border-[10px] border-white/30 uppercase tracking-tighter font-display">
          Finalize Academic Node <span className="inline-block group-hover:translate-x-10 transition-transform ml-10">🏆</span>
        </button>
      </main>

      {isTutorOpen && <AITutor user={user} language={language} context={lesson?.title || subject.name} onClose={() => setIsTutorOpen(false)} />}
    </div>
  );
};

export default LessonView;
