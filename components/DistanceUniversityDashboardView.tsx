
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, EducationTrack, SubjectCategory } from '../types';
import { SUBJECTS } from '../constants';
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

const DistanceUniversityDashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartPrep, onTrackChange,
  onOpenPlacement, onOpenAssessment,
  onOpenSpecialization,
  dynamicSubjects, onCreateSubject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  // Fix: Added missing 'const' keyword for translator function
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  // Fix: Updated categories list to include 'Moral and Ethics' instead of 'Ethics' to align with SubjectCategory type
  const categories: (SubjectCategory | 'All')[] = ['All', 'Natural Science', 'Computer Science', 'Social Science', 'Moral and Ethics'];
  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  // Academic Universities are strictly 4 years
  const degreeDuration = 4;

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory);
  }, [selectedCategory, dynamicSubjects]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      <header className="bg-slate-950 dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-blue-600 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black">ACAD</div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-dare-purple/40 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/40 backdrop-blur-md">
                  🏛️ Academic University Path
               </div>
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                  📜 Full {degreeDuration}-Year Research Track
               </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              {t('globalDistanceAcademy') || 'Global Distance Academy'}
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
               Academic university programs strictly follow a four-year cycle (Levels Q-T) of high-rigor research and graduate-level foundations.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => onTrackChange('Standard')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10"
              >
                ← {t('returnToHub') || 'Return to Academic Hub'}
              </button>
            </div>
          </div>
          <div className="w-72 h-72 bg-white/5 rounded-[4rem] flex items-center justify-center text-9xl shadow-inner border border-white/10 backdrop-blur-3xl animate-pulse">
             🏛️
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <h2 className="text-3xl font-black dark:text-white tracking-tighter">{t('academicDepartments') || 'Academic Departments'}</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-blue-600/40'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-8">
              {filteredSubjects.map(sub => (
                <SubjectCard 
                  key={sub.id}
                  subject={sub}
                  progress={progress[sub.id] || { level: 'A', lessonNumber: 1, isPlaced: false }}
                  onClick={() => onStartLesson(sub)}
                  onOpenSpecialization={() => onOpenSpecialization(sub)}
                  onPlacementTest={() => onOpenPlacement(sub)}
                  onLevelAssessment={() => onOpenAssessment(sub)}
                  onExamPrep={() => onStartPrep(sub)}
                />
              ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl">📜</div>
                 <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">{t('institutionalProgress') || 'Institutional Progress'}</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase">{t('degreeCompletion') || 'Degree Completion'}</span>
                       <span className="text-[10px] font-black text-blue-600">{t('year') || 'Year'} 1 {t('of')} {degreeDuration}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600" style={{ width: `${(1 / degreeDuration) * 100}%` }}></div>
                    </div>
                 </div>
                 <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{t('academicStatus') || 'Academic Status'}</p>
                    <p className="text-xs font-bold dark:text-white">{t('undergradCandidate')}</p>
                    <p className="text-[9px] text-gray-500">{t('masteryNodesVerified')}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceUniversityDashboardView;
