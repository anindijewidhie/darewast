
import React, { useState } from 'react';
import { Subject, SubjectProgress } from '../types';
import { LEVEL_METADATA } from '../constants';

interface Props {
  subject: Subject;
  progress: SubjectProgress;
  onClick: () => void;
  onOpenSpecialization: () => void;
  onPlacementTest: () => void;
  onLevelAssessment: () => void;
  onExamPrep: () => void;
}

const SubjectCard: React.FC<Props> = ({ subject, progress, onClick, onOpenSpecialization, onPlacementTest, onLevelAssessment, onExamPrep }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { level, lessonNumber, isFastTrack, specializations, track } = progress;
  const metadata = LEVEL_METADATA[level];

  // Semester Aware: Now Level itself is the semester A or B
  const isSemesterAware = track?.includes('DistanceSchool') || track?.includes('University');

  const themeColor = React.useMemo(() => {
    switch (subject.category) {
      case 'Literacy': return 'dare-teal'; case 'Numeracy': return 'dare-gold'; case 'Science': return 'blue-400';
      case 'Humanities': return 'orange-400'; case 'Tech': return 'dare-purple'; default: return 'gray-400';
    }
  }, [subject.category]);

  const hexColor = React.useMemo(() => {
    switch (subject.category) {
      case 'Literacy': return '#53CDBA'; case 'Numeracy': return '#CCB953'; case 'Science': return '#60A5FA';
      case 'Humanities': return '#FB923C'; case 'Tech': return '#B953CC'; default: return '#94A3B8';
    }
  }, [subject.category]);

  const isOptional = metadata.type === 'optional';
  const isMaintenance = metadata.type === 'maintenance';

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative flex flex-col p-6 md:p-8 bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 overflow-hidden h-full cursor-pointer ${isHovered ? 'border-dare-teal shadow-2xl -translate-y-2' : 'border-gray-100 dark:border-slate-800 shadow-sm'}`}
    >
      {/* Dynamic Background Element */}
      <div className={`absolute -top-10 -right-10 w-32 md:w-40 h-32 md:h-40 rounded-full blur-[60px] md:blur-[80px] transition-opacity duration-1000 ${isHovered ? 'opacity-30' : 'opacity-5'}`} style={{ backgroundColor: hexColor }}></div>

      <header className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
        <div className="relative group">
           <div className={`absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20 dark:opacity-10 rounded-[1.2rem] md:rounded-[1.5rem] blur-sm`}></div>
           <div className={`w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-slate-800 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl shadow-[0_8px_16px_rgba(0,0,0,0.08),inset_0_-4px_8px_rgba(0,0,0,0.05)] border border-white/20 dark:border-slate-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
              <span className="drop-shadow-lg">{subject.icon}</span>
           </div>
           {isFastTrack && (
              <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px] shadow-lg animate-pulse border-2 border-white dark:border-slate-900">
                ⚡
              </div>
           )}
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="flex flex-col gap-1 items-end">
              <div className="flex gap-1.5">
                {isOptional && (
                  <span className="px-2 py-0.5 rounded-lg bg-dare-purple/10 text-dare-purple text-[7px] font-black uppercase tracking-widest border border-dare-purple/20">
                    Advanced Research
                  </span>
                )}
                {isMaintenance && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Maintenance Mode
                  </span>
                )}
                <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-colors ${isHovered ? 'bg-dare-teal text-white border-dare-teal' : `bg-${themeColor}/10 text-${themeColor} border-${themeColor}/20`}`}>
                    {level}
                </span>
              </div>
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{metadata.duration}</p>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); onOpenSpecialization(); }}
             className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${specializations?.length ? 'bg-dare-purple text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-dare-purple'}`}
           >
             🧬 DNA {specializations?.length ? `(${specializations.length})` : ''}
           </button>
        </div>
      </header>
      
      <div className="flex-1 space-y-2 md:space-y-3 relative z-10 mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight leading-none group-hover:text-dare-teal transition-colors">{subject.name}</h3>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2">
          {subject.description}
        </p>
        {specializations && specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {specializations.map(s => (
              <span key={s} className="text-[7px] font-black px-1.5 py-0.5 bg-dare-purple/5 text-dare-purple border border-dare-purple/10 rounded uppercase">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isMaintenance && (
        <div className="mb-6 md:mb-8 space-y-2 relative z-10">
           <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>{isOptional ? 'Syllabus Depth' : 'Mandatory Mastery'}</span>
              <span>{lessonNumber}/12 Chapters</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000`} style={{ width: `${(lessonNumber / 12) * 100}%`, backgroundColor: hexColor }}></div>
           </div>
        </div>
      )}

      <footer className="mt-auto pt-4 md:pt-6 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between relative z-10">
        <div className="text-left">
           <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Equivalency</p>
           <p className="text-[10px] md:text-xs font-bold dark:text-white line-clamp-1">{metadata.equivalency}</p>
        </div>
        <div 
          className="w-10 h-10 md:w-12 md:h-12 bg-dare-teal text-white rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl shadow-xl shadow-dare-teal/20 group-hover:scale-110 active:scale-95 transition-all"
        >
          →
        </div>
      </footer>

      <div className={`absolute inset-x-6 md:inset-x-8 bottom-20 md:bottom-24 flex gap-2 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); onPlacementTest(); }} className="flex-1 py-1.5 md:py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700 hover:bg-dare-gold hover:text-white transition-all shadow-xl">🎯 Placement</button>
        <button onClick={(e) => { e.stopPropagation(); onExamPrep(); }} className="flex-1 py-1.5 md:py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700 hover:bg-dare-purple hover:text-white transition-all shadow-xl">📝 Exam Prep</button>
      </div>
    </div>
  );
};

export default SubjectCard;
