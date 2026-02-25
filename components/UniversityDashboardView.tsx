
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, EducationTrack, SubjectCategory } from '../types';
import { SUBJECTS, LEVEL_METADATA } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onStartLesson: (sub: Subject) => void;
  onStartPrep: (sub: Subject) => void;
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateProgress: (subjectId: string, data: Partial<UserProgress[string]>) => void;
  onTrackChange: (track: EducationTrack) => void;
  onBackToStandard: () => void;
  onOpenPlacement: (sub: Subject) => void;
  onOpenAssessment: (sub: Subject) => void;
  // Added onOpenSpecialization to the Props interface
  onOpenSpecialization: (sub: Subject) => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string, curriculum: string) => Promise<Subject | undefined>;
  onDeleteSubject: (subjectId: string) => void;
}

const UniversityDashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartPrep, onUpdateUser, onUpdateProgress, onTrackChange, onBackToStandard,
  onOpenPlacement, onOpenAssessment, 
  // Destructured onOpenSpecialization from props
  onOpenSpecialization,
  dynamicSubjects, onCreateSubject, onDeleteSubject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [subjectQuery, setSubjectQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  // Fix: Updated categories list to include 'Moral and Ethics' instead of 'Ethics' to match type definition
  const categories: (SubjectCategory | 'All')[] = [
    'All', 'Physics', 'Chemistry', 'Biology', 'Astronomy', 'Natural Geography', 'Social Geography', 'History', 'Economics', 'Sociology', 'Psychology', 'Philosophy', 'Anthropology', 'Religion', 'Moral and Ethics', 'Operating Systems', 'Basic Software', 'Specialized Software', 'Programming', 'AI', 'Music Theory', 'Musical Instrument Performance', 'Vocal Music', 'Mind Sports'
  ];

  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory);
  }, [selectedCategory, dynamicSubjects]);

  const handleCreateSubject = async () => {
    if (!subjectQuery.trim()) return;
    setIsCreating(true);
    try {
      const newSub = await onCreateSubject(subjectQuery, "University Research Standards");
      if (newSub) {
        setSubjectQuery('');
        onStartLesson(newSub);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      {/* Academic Branding Header */}
      <header className="bg-slate-900 dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-dare-purple shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black">UNIVERSITY</div>
        <div className="absolute top-4 left-10 flex items-center gap-2">
           <div className="w-3 h-3 bg-dare-purple rounded-full animate-pulse shadow-[0_0_10px_rgba(185,83,204,0.5)]"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-dare-purple">24/7 Global Scholar Access</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-dare-purple/10 via-transparent to-dare-teal/10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-purple/20 text-dare-purple rounded-full text-xs font-black uppercase tracking-widest border border-dare-purple/40 backdrop-blur-md">
               🏛️ Distance University: Academy • Undergrad • Graduate
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Advanced Global Campus
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
              Synthesize any academic syllabus instantly. Our campus covers all disciplines for high-rigor research and graduate-level foundations.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => onTrackChange('Standard')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10"
              >
                ← Master Independent Foundations
              </button>
            </div>
          </div>
          <div className="w-72 h-72 bg-white/5 rounded-[4rem] flex items-center justify-center text-9xl shadow-inner border border-white/10 backdrop-blur-3xl animate-pulse-slow">
             🎓
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <h2 className="text-3xl font-black dark:text-white tracking-tighter">Academic Research Modules</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-dare-purple border-dare-purple text-white shadow-lg shadow-dare-purple/20' : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-dare-purple/40'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-8">
              {/* Fix: Add isPlaced fallback property */}
              {filteredSubjects.map(sub => (
                <SubjectCard 
                  key={sub.id}
                  subject={sub}
                  progress={progress[sub.id] || { level: 'A', lessonNumber: 1, isPlaced: false }}
                  onClick={() => onStartLesson(sub)}
                  // Use onOpenSpecialization prop instead of empty function
                  onOpenSpecialization={() => onOpenSpecialization(sub)}
                  onPlacementTest={() => onOpenPlacement(sub)}
                  onLevelAssessment={() => onOpenAssessment(sub)}
                  onExamPrep={() => onStartPrep(sub)}
                  onUpdateDifficulty={(d) => onUpdateProgress(sub.id, { difficulty: d })}
                  onDelete={sub.isUserGenerated ? () => setSubjectToDelete(sub) : undefined}
                />
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-dare-purple/5 rounded-full blur-3xl"></div>
              <h3 className="text-xs font-black text-dare-purple uppercase tracking-[0.3em] mb-6">Syllabus Synthesis Lab</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Academic Query</p>
                    <input 
                      type="text" 
                      placeholder="e.g. Quantum Electrodynamics (Graduate)"
                      value={subjectQuery}
                      onChange={e => setSubjectQuery(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-dare-purple transition-all mb-3"
                    />
                    <button 
                      onClick={handleCreateSubject}
                      disabled={isCreating || !subjectQuery.trim()}
                      className="w-full py-4 bg-dare-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-dare-purple/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isCreating ? 'Synthesizing...' : 'Generate research chapters'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
      `}} />

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

export default UniversityDashboardView;
