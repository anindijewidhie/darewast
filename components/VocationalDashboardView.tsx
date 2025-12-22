
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, EducationTrack, SubjectCategory } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';

interface Props {
  track: EducationTrack;
  user: User;
  progress: UserProgress;
  language: Language;
  onStartLesson: (sub: Subject) => void;
  onUpdateUser: (data: Partial<User>) => void;
  onUpdateProgress: (subjectId: string, data: Partial<UserProgress[string]>) => void;
  onTrackChange: (track: EducationTrack) => void;
  onBackToStandard: () => void;
  // Add missing placement and assessment callback definitions
  onOpenPlacement: (sub: Subject) => void;
  onOpenAssessment: (sub: Subject) => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string, curriculum: string) => Promise<Subject | undefined>;
}

const VocationalDashboardView: React.FC<Props> = ({ 
  track, user, progress, language, onStartLesson, onTrackChange,
  // Destructure the missing callbacks from props
  onOpenPlacement, onOpenAssessment,
  dynamicSubjects, onCreateSubject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const isDistance = track.includes('Distance');
  const isUni = track.includes('University');

  const themeColor = isUni ? 'emerald' : 'blue';
  const icon = isUni ? '🛠️' : '🔧';
  const label = `${isDistance ? 'Distance ' : ''}Vocational ${isUni ? 'University' : 'School'}`;

  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];
  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects.filter(sub => selectedCategory === 'All' || sub.category === selectedCategory || sub.category === 'Vocational');
  }, [selectedCategory, dynamicSubjects]);

  const handleCreate = async () => {
    if (!query.trim()) return;
    setIsCreating(true);
    try {
      const sub = await onCreateSubject(query, `${label} Practical Path`);
      if (sub) {
        setQuery('');
        onStartLesson(sub);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn pb-20 px-4">
      <header className={`bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 rounded-[3.5rem] p-10 md:p-16 border-b-8 border-${themeColor}-900 shadow-2xl relative overflow-hidden text-white`}>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black">SKILLS</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest border border-white/40">
               {icon} darewast for {label}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Practical Mastery Hub
            </h1>
            <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
              Real-world skills, industry standards, and technical certification. Our {label.toLowerCase()} is open 24/7 for career-focused scholars.
            </p>
            <div className="pt-4 flex gap-3 justify-center md:justify-start">
               <button onClick={() => onTrackChange('Standard')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/20">
                ← Return to Hub
              </button>
            </div>
          </div>
          <div className="w-64 h-64 bg-white/10 rounded-[4rem] flex items-center justify-center text-9xl shadow-inner border border-white/20 backdrop-blur-md animate-pulse">
             {icon}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Workshop Modules</h2>
              <div className="flex gap-2">
                 {['All', 'Vocational', 'Tech', 'Science'].map(cat => (
                   <button key={cat} onClick={() => setSelectedCategory(cat as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedCategory === cat ? `bg-${themeColor}-600 border-${themeColor}-600 text-white` : 'border-gray-100 dark:border-slate-800 text-gray-400'}`}>
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
                  // Pass required callbacks to SubjectCard
                  onPlacementTest={() => onOpenPlacement(sub)}
                  onLevelAssessment={() => onOpenAssessment(sub)}
                />
              ))}
           </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">Practical Specialization</h3>
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Skill to Master</p>
                 <input 
                    type="text" 
                    placeholder="e.g. Industrial Automation"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full p-3 mb-3 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-700 rounded-xl font-bold outline-none"
                 />
                 <button 
                    onClick={handleCreate}
                    disabled={isCreating || !query.trim()}
                    className={`w-full py-4 bg-${themeColor}-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-${themeColor}-600/20`}
                 >
                    {isCreating ? 'Synthesizing Path...' : 'Generate module'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VocationalDashboardView;
