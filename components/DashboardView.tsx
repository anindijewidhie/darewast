
import React, { useState, useMemo } from 'react';
import { User, UserProgress, SubjectProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS, USAGE_LIMITS } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';
import SpecializationModal from './SpecializationModal';
import { RadarChart } from './RadarChart';

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
  onOpenTransition: () => void;
  onOpenCreditTransfer: () => void;
  onOpenSpecialization: (sub: Subject) => void;
  onOpenHandwriting: () => void;
  onOpenGuardianReport: () => void; 
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string) => Promise<Subject | undefined>;
}

const DashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartExam, onStartPrep, 
  onUpdateUser, onUpdateProgress, onTrackChange, onLogout, onOpenConverter, onOpenPlacementGlobal,
  onOpenPlacement, onOpenAssessment, onOpenCombination, onOpenLeaderboard, onOpenFastTrack, onOpenExamHall,
  onOpenRelearn, onOpenTransition, onOpenCreditTransfer, 
  onOpenSpecialization, onOpenHandwriting, onOpenGuardianReport,
  dynamicSubjects, onCreateSubject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [specializingSubject, setSpecializingSubject] = useState<Subject | null>(null);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = [
    'All', 'Literacy', 'Numeracy', 'Natural Science', 'Social Science', 'Moral and Ethics', 'Religion', 'Computer Science', 'Music', 'Dance', 'Design', 'Craft', 'Mind Sports'
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

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 pb-32 relative">
      <div className="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>
      
      <header className="py-12 md:py-24 flex flex-col lg:flex-row justify-between items-center gap-12 border-b border-black/5 dark:border-white/10 mb-20 relative z-10">
        <div className="space-y-4 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
             <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase font-display">Dasbor</h1>
             {user.isMinor && (
               <div className="px-5 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg shadow-rose-600/20">
                 Minor Mode Active
               </div>
             )}
          </div>
          <p className="text-dare-teal font-black uppercase tracking-[0.5em] text-[10px] md:text-xs">
            Academic DNA Registry • {user.name} • <span className="text-dare-gold">{user.rank} LVL {user.level}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6">
          {[
            { id: 'fusion', icon: '⚛️', action: onOpenCombination, color: 'bg-dare-teal', label: 'Fusion' },
            { id: 'exam', icon: '🏛️', action: onOpenExamHall, color: 'bg-dare-gold', label: 'Hall' },
            { id: 'relearn', icon: '🩹', action: onOpenRelearn, color: 'bg-dare-purple', label: 'Restore' },
            { id: 'transition', icon: '🌉', action: onOpenTransition, color: 'bg-dare-teal', label: 'Bridge' },
            { id: 'handwriting', icon: '🖋️', action: onOpenHandwriting, color: 'bg-dare-teal', label: 'Ink' },
          ].map(tool => (
            <button 
              key={tool.id} 
              onClick={tool.action} 
              className="flex flex-col items-center gap-3 p-6 md:p-8 rounded-[3rem] bg-white/10 dark:bg-white/5 border-2 border-black/5 dark:border-white/10 hover:border-dare-teal dark:hover:border-dare-teal transition-all group shadow-xl backdrop-blur-md"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">{tool.icon}</div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-dare-teal transition-colors">{tool.label}</span>
            </button>
          ))}
        </div>
      </header>

      {user.age >= 6 && user.age <= 7 && !user.transitionProgram && (
        <div className="mb-16 p-10 bg-gradient-to-r from-pink-600 to-rose-600 rounded-[4rem] border-4 border-white/20 shadow-2xl animate-float flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
           <div className="absolute inset-0 bg-white/10 pattern-grid opacity-20"></div>
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
        <div className="lg:col-span-8 space-y-16">
          {/* Daily Usage Monitor */}
          <div className="p-12 bg-dare-teal text-slate-950 rounded-[4.5rem] border-4 border-white/30 shadow-2xl space-y-10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 text-[12rem] font-black group-hover:scale-110 transition-transform duration-1000">QUOTA</div>
             <div className="flex justify-between items-end relative z-10">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-60">Mastery Health Node</h3>
                  <p className="text-sm font-black uppercase tracking-widest">{user.stage} Protocol: {quotaLimit} Min / Subject</p>
                </div>
                <div className="text-right">
                  <p className={`text-6xl md:text-8xl font-black tracking-tighter ${usagePercent > 90 ? 'text-rose-700 animate-pulse' : ''}`}>
                    {Math.floor(highestUsage)} <span className="text-2xl opacity-50">/ {quotaLimit}</span>
                  </p>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">FOCUSED: {subjectName}</p>
                </div>
             </div>
             <div className="h-8 w-full bg-slate-950/10 rounded-full overflow-hidden shadow-inner relative z-10 p-1.5 border border-white/20">
                <div className={`h-full rounded-full transition-all duration-1000 shadow-lg ${usagePercent > 90 ? 'bg-rose-600' : 'bg-slate-950'}`} style={{ width: `${usagePercent}%` }}></div>
             </div>
             <div className="flex justify-between items-center relative z-10">
                <p className="text-xs font-black uppercase opacity-60 italic tracking-wide">"Cognitive balance verified via Trinity metrics."</p>
                {user.isMinor && (
                  <button onClick={onOpenGuardianReport} className="px-8 py-3 bg-slate-950/20 backdrop-blur-md text-slate-950 hover:bg-slate-950 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl border border-white/20">Parent Portal</button>
                )}
             </div>
          </div>

          {/* Main Grid Header */}
          <div className="bg-dare-gold p-12 rounded-[4.5rem] border-4 border-white/30 shadow-2xl space-y-10">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter font-display">Academic Grid Analysis</h2>
                <div className="relative group max-w-sm w-full">
                  <input 
                    type="text" 
                    placeholder="Search logic nodes..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-14 pr-8 py-5 bg-white/20 backdrop-blur-md text-slate-950 rounded-3xl outline-none font-black text-xl placeholder-slate-700 transition-all border-2 border-white/30 focus:border-white shadow-2xl" 
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-60">🔍</div>
                </div>
             </div>
             <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === cat ? 'bg-slate-950 text-white border-slate-950 shadow-2xl scale-105' : 'bg-white/20 border-white/30 text-slate-900 hover:bg-slate-950 hover:text-white backdrop-blur-sm'}`}
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
              />
            ))}
          </div>
        </div>

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
             <div className="absolute top-0 right-0 p-12 opacity-10 text-[12rem] font-black group-hover:rotate-12 transition-transform duration-1000">TRINITY</div>
             <p className="text-[10px] font-black text-dare-purple uppercase tracking-[0.5em] mb-10">Pedagogical Framework</p>
             <p className="text-3xl font-black leading-tight italic relative z-10 font-display">
               "Mastery is synthesized by fusing calculation speed, systematic modeling, and critical reasoning into a singular cognitive architecture."
             </p>
          </div>
        </aside>
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
    </div>
  );
};

export default DashboardView;
