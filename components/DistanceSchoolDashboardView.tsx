
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, EducationTrack, SubjectCategory, DistanceSchoolType } from '../types';
import { SUBJECTS, DISTANCE_SCHOOL_MAPS, getInstitutionalGrade } from '../constants';
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
  onOpenSpecialization: (sub: Subject) => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string, curriculum: string) => Promise<Subject | undefined>;
}

const DistanceSchoolDashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartPrep, onTrackChange,
  onOpenPlacement, onOpenAssessment,
  onOpenSpecialization,
  dynamicSubjects
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const schoolType: DistanceSchoolType = user.distanceSchoolType || '6-3-3';
  const schoolMap = DISTANCE_SCHOOL_MAPS[schoolType];

  const categories: (SubjectCategory | 'All')[] = ['All', 'Literacy', 'Numeracy', 'Science', 'Humanities'];
  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory);
  }, [selectedCategory, dynamicSubjects]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      <header className="bg-amber-600 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-amber-800 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black">{schoolType}</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/40">
                  🏫 Institutional Type {schoolType}
               </div>
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/40">
                  🗓️ Semester-Aware 24/7 Grid
               </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Global Distance Campus
            </h1>
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Master your institutional curriculum with adaptive semesters. Each Semester (A/B) consists of 12 related academic chapters.
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
                  <button key={cat} onClick={() => setSelectedCategory(cat as any)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-100 dark:border-slate-800 text-gray-400'}`}>
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-6">
              {filteredSubjects.map(sub => {
                const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
                const gradeLabel = getInstitutionalGrade(schoolType, subProg.level);
                return (
                  <div key={sub.id} className="relative group">
                    <div className="absolute -top-3 -left-3 z-20 px-3 py-1 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl border border-amber-500">
                      Semester {gradeLabel}
                    </div>
                    <SubjectCard 
                      subject={sub} 
                      progress={subProg} 
                      onClick={() => onStartLesson(sub)} 
                      onOpenSpecialization={() => onOpenSpecialization(sub)} 
                      onPlacementTest={() => onOpenPlacement(sub)}
                      onLevelAssessment={() => onOpenAssessment(sub)}
                      onExamPrep={() => onStartPrep(sub)}
                    />
                  </div>
                );
              })}
           </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
           <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl text-amber-600">🏛️</div>
              <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-6">Type {schoolType} Structure</h3>
              <div className="space-y-3">
                 {schoolMap.map((stage, idx) => (
                   <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stage.stage} Stage</p>
                        <p className="text-sm font-black dark:text-white">Grades 1 - {stage.grades}</p>
                      </div>
                      <span className="text-xl opacity-30">{stage.stage === 'Early' ? '🧩' : stage.stage === 'Primary' ? '✏️' : '📐'}</span>
                   </div>
                 ))}
                 <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Mastery Cycle Legend</p>
                    <ul className="text-xs space-y-2 font-bold text-amber-800 dark:text-amber-300">
                       <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          One Semester = 12 Chapters
                       </li>
                       <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Suffix A = Semester 1
                       </li>
                       <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Suffix B = Semester 2
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default DistanceSchoolDashboardView;
