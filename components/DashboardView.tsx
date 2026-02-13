
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS, USAGE_LIMITS } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';
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
    const entries = Object.entries(progress);
    if (entries.length === 0) return null;
    return entries.reduce((max, curr) => (curr[1].dailyMinutesSpent || 0) > (max[1].dailyMinutesSpent || 0) ? curr : max);
  }, [progress]);

  const highestUsage = maxUsageSubject ? (maxUsageSubject[1].dailyMinutesSpent || 0) : 0;
  const usagePercent = Math.min(100, (highestUsage / quotaLimit) * 100);
  const subjectName = maxUsageSubject ? (SUBJECTS.find(s => s.id === maxUsageSubject[0])?.name || 'Active Subject') : 'Subjects';

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 pb-32">
      <header className="py-12 md:py-20 flex flex-col lg:flex-row justify-between items-center gap-10 border-b border-white/10 mb-16">
        <div className="space-y-3 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase">Dasbor</h1>
             {user.isMinor && (
               <div className="px-4 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                 Minor Mode Active
               </div>
             )}
          </div>
          <p className="text-dare-teal font-black uppercase tracking-[0.4em] text-xs">
            Academic DNA Registry • {user.name} • <span className="text-dare-gold">{user.rank} LVL {user.level}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'fusion', icon: '⚛️', action: onOpenCombination, color: 'bg-dare-teal', label: 'Fusion' },
            { id: 'exam', icon: '🏛️', action: onOpenExamHall, color: 'bg-dare-gold', label: 'Hall' },
            { id: 'relearn', icon: '🩹', action: onOpenRelearn, color: 'bg-dare-purple', label: 'Restore' },
            { id: 'handwriting', icon: '🖋️', action: onOpenHandwriting, color: 'bg-slate-900', label: 'Ink' },
          ].map(tool => (
            <button 
              key={tool.id} 
              onClick={tool.action} 
              className={`flex flex-col items-center gap-2 p-6 rounded-[2.5rem] bg-slate-900 border-4 border-white/10 hover:border-dare-teal transition-all group shadow-2xl`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{tool.icon}</div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{tool.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* Daily Usage Monitor - Solid Teal */}
          <div className="p-10 bg-dare-teal text-slate-950 rounded-[4rem] border-4 border-white/30 shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10 text-[10rem] font-black">QUOTA</div>
             <div className="flex justify-between items-end relative z-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] mb-2">Mastery Health Node</h3>
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-70">{user.stage} Protocol: {quotaLimit} Min / Subject</p>
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-black ${usagePercent > 90 ? 'text-rose-700 animate-pulse' : ''}`}>
                    {Math.floor(highestUsage)} <span className="text-xl opacity-60">/ {quotaLimit}</span>
                  </p>
                  <p className="text-[9px] font-black uppercase opacity-60">FOCUSED: {subjectName}</p>
                </div>
             </div>
             <div className="h-6 w-full bg-slate-950/20 rounded-full overflow-hidden shadow-inner relative z-10 p-1">
                <div className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-rose-600' : 'bg-slate-950'}`} style={{ width: `${usagePercent}%` }}></div>
             </div>
             <div className="flex justify-between items-center relative z-10">
                <p className="text-[10px] font-black uppercase opacity-60 italic">"Cognitive balance verified via Trinity metrics."</p>
                {user.isMinor && (
                  <button onClick={onOpenGuardianReport} className="px-6 py-2 bg-slate-950 text-white hover:bg-white hover:text-slate-950 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Parent Portal</button>
                )}
             </div>
          </div>

          {/* Main Grid Header - Solid Gold */}
          <div className="bg-dare-gold p-10 rounded-[4rem] border-4 border-white/30 shadow-2xl space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Academic Grid Analysis</h2>
                <div className="relative group max-w-sm w-full">
                  <input 
                    type="text" 
                    placeholder="Search logic nodes..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-slate-950 text-white rounded-2xl outline-none font-black text-lg placeholder-slate-600 transition-all border-2 border-transparent focus:border-white shadow-xl" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-40">🔍</div>
                </div>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === cat ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white/10 border-white/20 text-slate-900 hover:bg-slate-950 hover:text-white'}`}
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
                onOpenSpecialization={() => onOpenSpecialization(sub)} 
                onPlacementTest={() => onOpenPlacement(sub)} 
                onLevelAssessment={() => onOpenAssessment(sub)} 
                onExamPrep={() => onStartPrep(sub)} 
              />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-10">
          <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-dare-teal text-center relative overflow-hidden">
            <h3 className="text-[11px] font-black text-dare-teal uppercase tracking-[0.5em] mb-12">Academic DNA Grid</h3>
            <RadarChart progress={progress} subjects={SUBJECTS.slice(0, 10)} />
            <div className="mt-12 space-y-4">
              <button onClick={onOpenPlacementGlobal} className="w-full py-6 bg-dare-teal text-slate-950 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                Diagnostic Placement
              </button>
              <button onClick={onOpenConverter} className="w-full py-5 bg-slate-950 text-slate-400 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:text-white transition-all border-2 border-white/10">
                Grade Alignment Matrix
              </button>
            </div>
          </div>

          <div className="p-12 bg-dare-purple text-white rounded-[4rem] shadow-2xl border-4 border-white/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 text-[10rem] font-black">TRINITY</div>
             <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8">Pedagogical Framework</p>
             <p className="text-2xl font-black leading-tight italic text-white relative z-10">
               "Mastery is synthesized by fusing calculation speed, systematic modeling, and critical reasoning into a singular cognitive architecture."
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardView;
