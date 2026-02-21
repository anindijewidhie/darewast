
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Subject, Language, LessonContent, User, MasteryLevel, UserProgress, SubjectProgress, LearningStyle, MediaItem } from '../types';
import { generateLesson, recognizeHandwriting } from '../services/geminiService';
import { translations } from '../translations';
import AITutor from './AITutor';
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
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [visibleHints, setVisibleHints] = useState<Set<number>>(new Set());
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(user.preferredLearningStyle || 'Unified');
  const [activeTimelineStep, setActiveTimelineStep] = useState<number | null>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

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

  const handleCheckAnswer = (idx: number, ans: string) => {
    setUserAnswers(prev => ({ ...prev, [idx]: ans }));
    const correct = ans.toLowerCase().trim() === lesson?.exercises[idx].correctAnswer.toLowerCase().trim();
    if (correct) setCheckedIndices(prev => new Set(prev).add(idx));
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
    <div className="max-w-7xl mx-auto py-12 px-6 animate-fadeIn grid lg:grid-cols-12 gap-12 relative">
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
        <header className="bg-slate-900 p-12 md:p-24 rounded-[5rem] text-white shadow-2xl relative overflow-hidden border-4 border-white/10 group">
           <div className="absolute top-0 right-0 p-12 opacity-10 text-[20rem] rotate-12 group-hover:scale-110 transition-transform duration-1000">{subject.icon}</div>
           <div className="relative z-10 space-y-16">
              <div className="flex flex-wrap gap-4">
                 {['Unified', 'Visual', 'Auditory', 'Reading', 'Kinesthetic'].map(s => (
                   <button key={s} onClick={() => setLearningStyle(s as any)} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${learningStyle === s ? 'bg-dare-teal text-slate-950 shadow-2xl scale-110' : 'bg-slate-950/50 backdrop-blur-md text-slate-500 border-2 border-white/10 hover:border-white/30'}`}>{s}</button>
                 ))}
              </div>
              <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase font-display">{lesson?.title}</h1>
           </div>
        </header>

        <section className="bg-dare-purple p-12 md:p-24 rounded-[5.5rem] shadow-2xl border-[8px] border-white/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-16 opacity-10 text-[15rem] font-black text-white group-hover:rotate-6 transition-transform duration-1000">LOGIC</div>
           <h3 className="text-xs font-black text-white uppercase tracking-[0.7em] mb-20 opacity-60">{t('concept')}</h3>
           <div className="text-5xl md:text-7xl font-black text-white leading-[1.1] italic mb-24 tracking-tighter font-display">"{renderExplanationWithPronunciation(currentAdaptation || '')}"</div>
           
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
             <div key={i} className={`p-16 md:p-24 rounded-[5.5rem] bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border-[6px] border-black/5 dark:border-white/5 transition-all ${checkedIndices.has(i) ? 'border-dare-teal dark:border-dare-teal shadow-[0_40px_80px_rgba(83,205,186,0.2)] bg-white dark:bg-slate-950' : 'shadow-2xl'}`}>
               <div className="flex justify-between items-start mb-20">
                 <span className="text-[10rem] font-black text-black/5 dark:text-white/5 leading-none font-display">{(i+1).toString().padStart(2, '0')}</span>
                 <button onClick={() => handleToggleHint(i)} className={`text-[11px] font-black uppercase px-10 py-4 rounded-2xl transition-all flex items-center gap-4 ${visibleHints.has(i) ? 'bg-dare-gold text-slate-950 shadow-2xl scale-110' : 'bg-black/5 dark:bg-slate-800 text-slate-600 dark:text-white border border-black/5 dark:border-white/10'}`}>
                    <span>{visibleHints.has(i) ? 'Dismiss' : 'Neural Hint'}</span>
                    <span className="text-2xl">💡</span>
                 </button>
               </div>
               <h4 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-24 leading-[1.1] tracking-tighter uppercase font-display">{renderExplanationWithPronunciation(ex.question)}</h4>
               
               {visibleHints.has(i) && (
                 <div className="mb-24 p-14 bg-dare-gold text-slate-950 rounded-[4rem] border-4 border-white/40 animate-fadeIn shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black rotate-12">HINT</div>
                    <div className="flex items-start gap-8 relative z-10">
                       <span className="text-7xl">💡</span>
                       <div className="space-y-3">
                          <p className="text-[11px] font-black uppercase tracking-widest opacity-60">Axiomatic Insight Node</p>
                          <p className="text-3xl font-black italic leading-tight">"{ex.hint || 'Analyze the core logic modeling of the previous node.'}"</p>
                       </div>
                    </div>
                 </div>
               )}

               <div className="grid gap-8">
                  {ex.options?.map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => handleCheckAnswer(i, opt)} 
                      disabled={checkedIndices.has(i)} 
                      className={`p-14 text-left rounded-[3.5rem] border-4 transition-all font-black text-3xl md:text-4xl flex justify-between items-center group ${checkedIndices.has(i) && userAnswers[i] === opt ? 'bg-dare-teal text-slate-950 border-white shadow-2xl scale-[1.02]' : (checkedIndices.has(i) ? 'opacity-10 border-black/5 dark:border-white/5' : 'border-black/5 dark:border-white/10 text-slate-900 dark:text-white bg-black/5 dark:bg-slate-950 hover:border-dare-teal dark:hover:border-dare-teal hover:bg-white dark:hover:bg-slate-900')}`}
                    >
                      <span className="tracking-tight">{opt}</span>
                      <span className={`transition-all duration-500 ${checkedIndices.has(i) && userAnswers[i] === opt ? 'opacity-100 scale-125 translate-x-0' : 'opacity-0 scale-50 translate-x-4'}`}>✓</span>
                    </button>
                  ))}
               </div>
             </div>
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
