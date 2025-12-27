
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS } from '../constants';
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
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string) => Promise<Subject | undefined>;
}

const DashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartExam, onStartPrep, 
  onUpdateUser, onUpdateProgress, onTrackChange, onLogout, onOpenConverter, onOpenPlacementGlobal,
  onOpenPlacement, onOpenAssessment, onOpenCombination, onOpenLeaderboard, onOpenFastTrack, onOpenExamHall,
  onOpenRelearn, dynamicSubjects, onCreateSubject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [isCreating, setIsCreating] = useState(false);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = ['All', 'Literacy', 'Numeracy', 'Science', 'Humanities', 'Tech', 'Music', 'Ethics'];

  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects
      .filter(sub => {
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        if (!matchesCategory) return false;
        const term = searchQuery.toLowerCase().trim();
        return !term || sub.name.toLowerCase().includes(term) || sub.description.toLowerCase().includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory, dynamicSubjects]);

  const handleCreateNew = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newSub = await onCreateSubject(searchQuery);
      if (newSub) {
        setSearchQuery('');
        onStartLesson(newSub);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-2 md:px-4 pb-24">
      {/* 1. Header Bar */}
      <header className="py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 border-b border-gray-100 dark:border-slate-800 mb-8 md:mb-12">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            Mastery Hub
          </h1>
          <p className="text-dare-teal font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[9px]">Hello, {user.name} • {user.rank}</p>
        </div>
        
        <div className="flex gap-2 md:gap-3">
          {[
            { id: 'fusion', icon: '⚛️', action: onOpenCombination, color: 'dare-teal' },
            { id: 'relearn', icon: '🩹', action: onOpenRelearn, color: 'rose-500' },
            { id: 'exam', icon: '🏛️', action: onOpenExamHall, color: 'dare-gold' },
          ].map(tool => (
            <button 
              key={tool.id} 
              onClick={tool.action}
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg flex items-center justify-center text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all group"
            >
              <span className="group-hover:rotate-12 transition-transform">{tool.icon}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* 2. Main Grid */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <input 
                type="text"
                placeholder={t('searchSubjects')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:pl-12 md:py-3 bg-gray-50 dark:bg-slate-800 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm dark:text-white transition-all focus:ring-2 focus:ring-dare-teal/20"
              />
              <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-base md:text-lg opacity-40">🔍</div>
            </div>
            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedCategory === cat ? 'bg-dare-teal text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(sub => (
                <SubjectCard 
                  key={sub.id} 
                  subject={sub} 
                  progress={progress[sub.id] || { level: 'A', lessonNumber: 1 }} 
                  onClick={() => onStartLesson(sub)}
                  onOpenSpecialization={() => {}}
                  onPlacementTest={() => onOpenPlacement(sub)}
                  onLevelAssessment={() => onOpenAssessment(sub)}
                  onExamPrep={() => onStartPrep(sub)}
                />
              ))
            ) : (
              <div className="sm:col-span-2 py-16 md:py-24 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] md:rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-slate-800 px-6">
                <p className="text-gray-400 font-bold mb-6 md:mb-8 text-base md:text-lg">Subject "{searchQuery}" not in local database.</p>
                <button 
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-dare-purple text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Creating Module...' : `Initialize "${searchQuery}"`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Stats Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-6 md:space-y-8 pb-12 lg:pb-0">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 md:mb-8 text-center">Your Mastery Matrix</h3>
            <RadarChart progress={progress} subjects={allAvailableSubjects.slice(0, 8)} />
            
            <div className="mt-8 md:mt-12 space-y-2 md:space-y-3">
              <button onClick={onOpenPlacementGlobal} className="w-full py-3 md:py-4 bg-dare-gold text-slate-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl shadow-dare-gold/20 hover:scale-[1.02] transition-all">Placement Diagnostic</button>
              <button onClick={onOpenConverter} className="w-full py-3 md:py-4 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-gray-100 transition-all">Level Mapping Tool</button>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 text-5xl md:text-7xl">🧬</div>
             <p className="text-[8px] md:text-[9px] font-black text-dare-teal uppercase tracking-[0.4em] mb-4">Academic DNA</p>
             <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center text-[10px] md:text-xs">
                   <span className="text-slate-500 font-bold">Method:</span>
                   <span className="font-black text-white">{user.academicDNA?.method || 'Kumon-style'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] md:text-xs">
                   <span className="text-slate-500 font-bold">Era:</span>
                   <span className="font-black text-white">{user.academicDNA?.era || 'Modern'}</span>
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardView;
