
import React, { useState, useMemo } from 'react';
import { User, UserProgress, SubjectProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS, USAGE_LIMITS } from '../constants';
import { getPalette } from '../constants/palettes';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';
import SpecializationModal from './SpecializationModal';
import { RadarChart } from './RadarChart';
import DailyGoalChart from './DailyGoalChart';
import LearningVelocityChart from './LearningVelocityChart';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onStartLesson: (sub: Subject) => void;
  onStartExam: (sub: Subject) => void;
  onStartPrep: (sub: Subject) => void;
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateProgress: (subjectId: string, data: Partial<UserProgress[string]>) => void;
  onTrackChange: (track: EducationTrack) => void;
  onLogout: () => void;
  onOpenConverter: () => void;
  onOpenPlacementGlobal: () => void;
  onOpenPlacement: (sub: Subject) => void;
  onOpenAssessment: (sub: Subject) => void;
  onOpenCombination: () => void;
  onOpenLeaderboard: () => void;
  onOpenFastTrack: () => void;
  onOpenExamHall: () => void;
  onOpenRelearn: () => void;
  onOpenStruggleAnalytics?: () => void;
  onOpenTransition: () => void;
  onOpenCreditTransfer: () => void;
  onOpenSpecialization: (sub: Subject) => void;
  onOpenHandwriting: () => void;
  onOpenGuardianReport: () => void; 
  onOpenFlashcards?: () => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string) => Promise<Subject | undefined>;
  onDeleteSubject: (subjectId: string) => void;
}

const DashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartExam, onStartPrep, 
  onUpdateUser, onUpdateProgress, onTrackChange, onLogout, onOpenConverter, onOpenPlacementGlobal,
  onOpenPlacement, onOpenAssessment, onOpenCombination, onOpenLeaderboard, onOpenFastTrack, onOpenExamHall,
  onOpenRelearn, onOpenStruggleAnalytics, onOpenTransition, onOpenCreditTransfer, 
  onOpenSpecialization, onOpenHandwriting, onOpenGuardianReport, onOpenFlashcards,
  dynamicSubjects, onCreateSubject, onDeleteSubject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [specializingSubject, setSpecializingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = [
    'All', 'Literacy', 'Numeracy', 'Physics', 'Chemistry', 'Biology', 'Astronomy', 
    'Natural Geography', 'Social Geography', 'History', 'Economics', 'Sociology', 
    'Psychology', 'Philosophy', 'Anthropology', 'Religion', 'Moral and Ethics', 
    'Operating Systems', 'Basic Software', 'Specialized Software', 'Programming', 'AI', 'Music Theory', 
    'Musical Instrument Performance', 'Vocal Music', 'Dance', 'Design', 'Crafting', 'Mind Sports'
  ];
  
  const filteredSubjects = useMemo(() => {
    return [...SUBJECTS, ...dynamicSubjects]
      .filter(sub => {
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        if (!matchesCategory) return false;
        const term = searchQuery.toLowerCase().trim();
        return !term || sub.name.toLowerCase().includes(term) || sub.description.toLowerCase().includes(term);
      });
  }, [searchQuery, selectedCategory, dynamicSubjects]);

  const quotaLimit = user.stage ? USAGE_LIMITS[user.stage] : 60;
  const maxUsageSubject = useMemo(() => {
    const entries = Object.entries(progress) as [string, SubjectProgress][];
    if (entries.length === 0) return null;
    return entries.reduce((max, curr) => (curr[1].dailyMinutesSpent || 0) > (max[1].dailyMinutesSpent || 0) ? curr : max);
  }, [progress]);

  const highestUsage = maxUsageSubject ? (maxUsageSubject[1].dailyMinutesSpent || 0) : 0;
  const usagePercent = Math.min(100, (highestUsage / quotaLimit) * 100);
  const subjectName = maxUsageSubject ? (SUBJECTS.find(s => s.id === maxUsageSubject[0])?.name || 'Active Subject') : 'Subjects';

  const palette = getPalette(user.dashboardPalette);

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 pb-32 relative">
      <header className="py-8 md:py-24 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12 border-b border-black/5 dark:border-white/10 mb-12 md:mb-20 relative z-10">
        <div className="space-y-4 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 flex-wrap">
             <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase font-display">Dasbor</h1>
             <div className="flex items-center gap-2 flex-wrap">
               {user.isMinor && (
                 <div className="px-4 py-1.5 bg-rose-600 text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg shadow-rose-600/20">
                   Minor Mode Active
                 </div>
               )}
               <div 
                 className="px-3.5 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg flex items-center gap-1.5"
                 style={{ backgroundColor: `${palette.primaryHex}25`, color: palette.primaryHex }}
               >
                 <span>{palette.icon}</span>
                 <span>{palette.name} Palette</span>
               </div>
             </div>
          </div>
          <p className="font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[9px] sm:text-[10px] md:text-xs" style={{ color: palette.primaryHex }}>
            Academic DNA Registry • {user.name} • <span style={{ color: palette.secondaryHex }}>{user.rank} LVL {user.level}</span>
          </p>
        </div>
        
        {!user.accessibility?.focusMode && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4 w-full lg:w-auto">
            {[
              { id: 'assessment', icon: '🎯', action: onOpenPlacementGlobal, color: 'bg-dare-teal', label: 'Assess' },
              { id: 'fusion', icon: '⚛️', action: onOpenCombination, color: 'bg-dare-teal', label: 'Fusion' },
              { id: 'struggle', icon: '🔍', action: onOpenStruggleAnalytics, color: 'bg-rose-500', label: 'Gaps' },
              { id: 'exam', icon: '🏛️', action: onOpenExamHall, color: 'bg-dare-gold', label: 'Hall' },
              { id: 'relearn', icon: '🩹', action: onOpenRelearn, color: 'bg-dare-purple', label: 'Restore' },
              { id: 'transition', icon: '🌉', action: onOpenTransition, color: 'bg-dare-teal', label: 'Bridge' },
            ].map(tool => (
              <button 
                key={tool.id} 
                onClick={tool.action} 
                className="flex flex-col items-center gap-2 md:gap-3 p-3 sm:p-5 md:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-white/10 dark:bg-white/5 border-2 border-black/5 dark:border-white/10 hover:border-dare-teal dark:hover:border-dare-teal transition-all group shadow-xl backdrop-blur-md"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">{tool.icon}</div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-dare-teal transition-colors">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {user.age >= 6 && user.age <= 7 && !user.transitionProgram && (
        <div className="mb-16 p-10 bg-gradient-to-r from-pink-600 to-rose-600 rounded-[4rem] border-4 border-white/20 shadow-2xl animate-float flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
           <div className="flex items-center gap-8 relative z-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-white/20">✨</div>
              <div>
                 <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter font-display">Wink Smart Learning Transition</h2>
                 <p className="text-white/90 font-bold text-lg max-w-xl">You are in the ideal age range (6-7) to bridge your Wink mastery to darewast!</p>
              </div>
           </div>
           <button 
             onClick={onOpenTransition}
             className="px-12 py-5 bg-white text-rose-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl relative z-10"
           >
             Start Transition Hub
           </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-16 items-start relative z-10">
        <div className={`${user.accessibility?.focusMode ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-16`}>
          {/* Daily Study Goal Progress Bar (Recharts) */}
          <DailyGoalChart 
            user={user}
            progress={progress}
            quotaLimit={quotaLimit}
            dynamicSubjects={dynamicSubjects}
            onUpdateUser={onUpdateUser}
          />

          {/* Learning Velocity Trend Chart (Recharts) */}
          <LearningVelocityChart
            user={user}
            progress={progress}
          />

          {/* Spaced Repetition Flashcards Widget */}
          <div className="p-8 sm:p-12 bg-slate-950 text-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl border-4 border-white/10 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-emerald-500/30">
                  ⚡
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30 mb-2">
                    Spaced Repetition Flashcards
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black uppercase font-display tracking-tight text-white">
                    Interactive Memory Flashcards
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 max-w-xl">
                    Automated concept extraction from completed lessons with SuperMemo SM-2 memory scheduling for permanent mastery.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenFlashcards}
                className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span>🧠 Practice Flashcards ({user.flashcards?.length || 3} Cards)</span>
              </button>
            </div>
          </div>

          {/* Curriculum Struggle & Re-Learning Quick Tracker Widget */}
          <div className="p-8 sm:p-12 bg-slate-950 text-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl border-4 border-white/10 relative overflow-hidden group hover:border-rose-500/50 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-rose-500/30">
                  🔍
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-rose-500/20 text-rose-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/30 mb-2">
                    Curriculum Struggle Analytics
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black uppercase font-display tracking-tight text-white">
                    Identify & Restore Learning Gaps
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 max-w-xl">
                    Heatmap visualization of concepts where friction occurred, with quick links to adaptive re-learning modules.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenStruggleAnalytics}
                className="w-full md:w-auto px-8 py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span>📊 View Gap Heatmap</span>
              </button>
            </div>
          </div>

          {/* Main Grid Header */}
          <div className="bg-dare-gold p-8 sm:p-12 rounded-[3rem] sm:rounded-[4.5rem] border-4 border-white/30 shadow-2xl space-y-8 sm:space-y-10">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tighter font-display">Academic Grid Analysis</h2>
                <div className="relative group max-w-sm w-full">
                  <input 
                    type="text" 
                    placeholder="Search logic nodes..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-12 sm:pl-14 pr-6 sm:pr-8 py-4 sm:py-5 bg-white/20 backdrop-blur-md text-slate-950 rounded-2xl sm:rounded-3xl outline-none font-black text-lg sm:text-xl placeholder-slate-700 transition-all border-2 border-white/30 focus:border-white shadow-2xl" 
                  />
                  <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-xl sm:text-2xl opacity-60">🔍</div>
                </div>
             </div>
             <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === cat ? 'bg-slate-950 text-white border-slate-950 shadow-2xl scale-105' : 'bg-white/20 border-white/30 text-slate-900 hover:bg-slate-950 hover:text-white backdrop-blur-sm'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* Subject Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filteredSubjects.map(sub => (
              <SubjectCard 
                key={sub.id} 
                subject={sub} 
                progress={progress[sub.id] || { level: 'A', lessonNumber: 1, isPlaced: false, dailyMinutesSpent: 0 }} 
                onClick={() => onStartLesson(sub)} 
                onOpenSpecialization={() => setSpecializingSubject(sub)} 
                onPlacementTest={() => onOpenPlacement(sub)} 
                onLevelAssessment={() => onOpenAssessment(sub)} 
                onExamPrep={() => onStartPrep(sub)} 
                onUpdateDifficulty={(d) => onUpdateProgress(sub.id, { difficulty: d })}
                onDelete={sub.isUserGenerated ? () => setSubjectToDelete(sub) : undefined}
              />
            ))}
          </div>
        </div>

          {!user.accessibility?.focusMode && (
            <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-12">
              <div className="glass-card p-12 rounded-[4.5rem] shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-dare-teal/5 to-transparent opacity-50"></div>
                <h3 className="text-[11px] font-black text-dare-teal uppercase tracking-[0.6em] mb-12 relative z-10">Academic DNA Grid</h3>
                <div className="relative z-10">
                  <RadarChart progress={progress} subjects={SUBJECTS.slice(0, 10)} />
                </div>
                <div className="mt-12 space-y-5 relative z-10">
                  <button onClick={onOpenPlacementGlobal} className="w-full py-7 bg-dare-teal text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-4 border-white/30">
                    Diagnostic Placement
                  </button>
                  <button onClick={onOpenConverter} className="w-full py-6 bg-white/10 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:text-dare-teal transition-all border-2 border-black/5 dark:border-white/10 backdrop-blur-sm">
                    Grade Alignment Matrix
                  </button>
                </div>
              </div>

              <div className="p-12 bg-dare-purple/20 backdrop-blur-md text-slate-900 dark:text-white rounded-[4.5rem] shadow-2xl border-4 border-white/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 text-[12rem] font-black group-hover:rotate-12 transition-transform duration-1000">DAREWAST</div>
                 <p className="text-[10px] font-black text-dare-purple uppercase tracking-[0.5em] mb-4">darewast Proprietary Method</p>
                 <p className="text-2xl font-black leading-tight italic relative z-10 font-display">
                   "An inclusive, culturally sensitive pedagogical system delivering personalized curricula and methods tailored for all learning styles."
                 </p>
                 <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                   <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider">🌏 Inclusive</span>
                   <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider">🎯 Personalized</span>
                   <span className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider">🧠 All Styles</span>
                 </div>
              </div>
            </aside>
          )}
      </div>
      {specializingSubject && (
        <SpecializationModal 
          subject={specializingSubject}
          language={language}
          initialSelected={progress[specializingSubject.id]?.specializations || []}
          initialAdditionalLanguages={progress[specializingSubject.id]?.additionalLanguages || []}
          onClose={() => setSpecializingSubject(null)}
          onSave={(specs, langs) => {
            onUpdateProgress(specializingSubject.id, { specializations: specs, additionalLanguages: langs });
            setSpecializingSubject(null);
          }}
        />
      )}

      {subjectToDelete && (
        <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 text-center shadow-2xl border-4 border-rose-500/20">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-bounce">⚠️</div>
            <h3 className="text-3xl font-black mb-4 dark:text-white tracking-tighter uppercase">Confirm Deletion</h3>
            <p className="text-gray-500 font-bold mb-10 leading-relaxed italic">
              Are you sure you want to remove <span className="text-rose-500">"{subjectToDelete.name}"</span> from your Academic Grid? This action will permanently erase all progress associated with this node.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSubjectToDelete(null)}
                className="py-5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteSubject(subjectToDelete.id);
                  setSubjectToDelete(null);
                }}
                className="py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Delete Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
