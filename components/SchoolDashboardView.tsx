
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
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateProgress: (subjectId: string, data: Partial<UserProgress[string]>) => void;
  onTrackChange: (track: EducationTrack) => void;
  onBackToStandard: () => void;
  onOpenPlacement: (sub: Subject) => void;
  onOpenAssessment: (sub: Subject) => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string, curriculum: string) => Promise<Subject | undefined>;
}

const SchoolDashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onUpdateUser, onUpdateProgress, onTrackChange, onBackToStandard,
  onOpenPlacement, onOpenAssessment, dynamicSubjects, onCreateSubject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [curriculumInput, setCurriculumInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = ['All', 'Literacy', 'Numeracy', 'Science', 'Humanities'];

  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory);
  }, [selectedCategory, dynamicSubjects]);

  const handleCreateSubject = async () => {
    if (!curriculumInput.trim()) return;
    setIsCreating(true);
    try {
      const newSub = await onCreateSubject(curriculumInput, "Standard School Curriculum");
      if (newSub) {
        setCurriculumInput('');
        onStartLesson(newSub);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      <header className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-dare-gold shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black">SCHOOL</div>
        <div className="absolute top-4 left-10 flex items-center gap-2">
           <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">24/7 Campus Live</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-gold/10 text-dare-gold rounded-full text-xs font-black uppercase tracking-widest border border-dare-gold/20">
               🎒 Primary - High School Support
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
              Adaptive K-12 Campus
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-2xl leading-relaxed">
              Synthesized lessons for primary through secondary levels. Sync homework and master foundational academic standards 24/7.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
              <button 
                onClick={() => onTrackChange('Standard')}
                className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                ← Independent Path
              </button>
            </div>
          </div>
          <div className="w-64 h-64 bg-gray-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-8xl shadow-inner border border-gray-100 dark:border-slate-700 animate-float">
             🏫
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Academic Modules</h2>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-dare-gold border-dare-gold text-white' : 'border-gray-100 dark:border-slate-800 text-gray-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-6">
              {filteredSubjects.map(sub => (
                <SubjectCard 
                    key={sub.id} 
                    subject={sub} 
                    progress={progress[sub.id] || { level: 'A', lessonNumber: 1 }} 
                    onClick={() => onStartLesson(sub)} 
                    onOpenSpecialization={() => {}} 
                    onPlacementTest={() => onOpenPlacement(sub)}
                    onLevelAssessment={() => onOpenAssessment(sub)}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboardView;
