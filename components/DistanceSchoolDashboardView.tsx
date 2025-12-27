
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
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string, curriculum: string) => Promise<Subject | undefined>;
}

const DistanceSchoolDashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartPrep, onUpdateUser, onUpdateProgress, onTrackChange, onBackToStandard,
  onOpenPlacement, onOpenAssessment,
  dynamicSubjects, onCreateSubject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = ['All', 'Literacy', 'Numeracy', 'Science', 'Humanities'];
  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory);
  }, [selectedCategory, dynamicSubjects]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      <header className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-amber-700 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black">CAMPUS</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest border border-white/40">
               🏫 Distance Primary - High School
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Global Distance Campus
            </h1>
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Full-time distance institution for K-12 scholars. Integrated curricula, small-step mastery, and adaptive support for all disabilities.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
              <button onClick={() => onTrackChange('Standard')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition-all">
                ← Return to Hub
              </button>
            </div>
          </div>
          <div className="w-64 h-64 bg-white/10 rounded-[3rem] flex items-center justify-center text-8xl shadow-inner border border-white/20 backdrop-blur-md">
             🌍
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Cohort Modules</h2>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-100 dark:border-slate-800 text-gray-400'}`}>
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
                  onExamPrep={() => onStartPrep(sub)}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceSchoolDashboardView;
