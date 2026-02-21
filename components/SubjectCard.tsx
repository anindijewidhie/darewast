
import React, { useState } from 'react';
import { Subject, SubjectProgress, DifficultyLevel } from '../types';
import { LEVEL_METADATA } from '../constants';

interface Props {
  subject: Subject;
  progress: SubjectProgress;
  onClick: () => void;
  onOpenSpecialization: () => void;
  onPlacementTest: () => void;
  onLevelAssessment: () => void;
  onExamPrep: () => void;
  onUpdateDifficulty: (difficulty: DifficultyLevel) => void;
}

const SubjectCard: React.FC<Props> = ({ 
  subject, progress, onClick, onOpenSpecialization, onPlacementTest, 
  onLevelAssessment, onExamPrep, onUpdateDifficulty 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { level, lessonNumber, isFastTrack, difficulty = 'Medium' } = progress;

  const themeConfig = React.useMemo(() => {
    switch (subject.category) {
      case 'Literacy': return { bg: 'bg-dare-teal', text: 'text-slate-950', glow: 'shadow-dare-teal/40' };
      case 'Numeracy': return { bg: 'bg-dare-gold', text: 'text-slate-950', glow: 'shadow-dare-gold/40' };
      case 'Natural Science': return { bg: 'bg-emerald-600', text: 'text-white', glow: 'shadow-emerald-600/40' };
      case 'Social Science': return { bg: 'bg-dare-purple', text: 'text-white', glow: 'shadow-dare-purple/40' };
      case 'Computer Science': return { bg: 'bg-indigo-700', text: 'text-white', glow: 'shadow-indigo-700/40' };
      case 'Music': return { bg: 'bg-rose-600', text: 'text-white', glow: 'shadow-rose-600/40' };
      case 'Dance': return { bg: 'bg-pink-600', text: 'text-white', glow: 'shadow-pink-600/40' };
      case 'Design': return { bg: 'bg-amber-600', text: 'text-white', glow: 'shadow-amber-600/40' };
      case 'Craft': return { bg: 'bg-orange-700', text: 'text-white', glow: 'shadow-orange-700/40' };
      case 'Mind Sports': return { bg: 'bg-cyan-700', text: 'text-white', glow: 'shadow-cyan-700/40' };
      default: return { bg: 'bg-dare-gold', text: 'text-slate-950', glow: 'shadow-dare-gold/40' };
    }
  }, [subject.category]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative flex flex-col p-10 ${themeConfig.bg} border-4 rounded-[4rem] transition-all duration-500 overflow-hidden h-full cursor-pointer ${isHovered ? `border-white scale-[1.03] shadow-2xl ${themeConfig.glow}` : 'border-white/20 shadow-xl'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
      
      <header className="flex justify-between items-start mb-10 relative z-10">
        <div className="relative group">
           <div className={`w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-white/20`}>
              <span className="drop-shadow-2xl">{subject.icon}</span>
           </div>
           {isFastTrack && (
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center text-xl shadow-2xl animate-pulse border-2 border-white">⚡</div>
           )}
        </div>

        <div className="flex flex-col items-end gap-3">
           <span className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${isHovered ? `bg-slate-950 text-white border-slate-950 shadow-2xl` : `bg-white/20 text-slate-950 border-white/30 backdrop-blur-sm`}`}>
              LVL {level}
           </span>
           {progress.additionalLanguages && progress.additionalLanguages.length > 0 && (
             <div className="px-3 py-1 bg-dare-purple text-white rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 animate-pulse shadow-lg shadow-dare-purple/20">
               Multilingual Mode
             </div>
           )}
           <div className="flex gap-1 bg-white/20 backdrop-blur-sm p-1 rounded-xl border border-white/20">
              {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  onClick={(e) => { e.stopPropagation(); onUpdateDifficulty(d); }}
                  className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-lg transition-all ${difficulty === d ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-950 hover:bg-white/20'}`}
                >
                  {d}
                </button>
              ))}
           </div>
           <button onClick={(e) => { e.stopPropagation(); onOpenSpecialization(); }} className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-[9px] font-black text-slate-950 uppercase tracking-widest rounded-xl hover:bg-slate-950 hover:text-white transition-all border border-white/20">
              DNA Mapping
           </button>
        </div>
      </header>
      
      <div className="flex-1 space-y-4 relative z-10 mb-10">
        <h3 className={`text-4xl font-black ${themeConfig.text} tracking-tighter leading-none uppercase font-display`}>{subject.name}</h3>
        <p className={`text-base ${themeConfig.text} opacity-90 font-bold leading-relaxed line-clamp-3 italic`}>"{subject.description}"</p>
      </div>

      <div className="space-y-4 relative z-10 mb-10">
         <div className={`flex justify-between items-center text-[10px] font-black ${themeConfig.text} opacity-70 uppercase tracking-widest`}>
            <span>Grid Mastery</span>
            <span>{lessonNumber}/12 Chapters</span>
         </div>
         <div className="h-5 w-full bg-white/20 rounded-full overflow-hidden shadow-inner p-1 border border-white/20">
            <div className="h-full bg-slate-950 rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${(lessonNumber / 12) * 100}%` }}></div>
         </div>
      </div>

      <footer className="mt-auto pt-8 border-t-2 border-slate-950/10 flex items-center justify-between relative z-10">
        <div className="text-left">
           <p className={`text-[10px] font-black ${themeConfig.text} opacity-60 uppercase tracking-widest mb-1`}>Official Node</p>
           <p className={`text-sm font-black uppercase tracking-[0.2em] ${themeConfig.text}`}>{subject.category}</p>
        </div>
        <div className={`w-16 h-16 bg-slate-950 text-white rounded-3xl flex items-center justify-center text-3xl shadow-2xl transition-all ${isHovered ? 'scale-110 rotate-12' : ''}`}>→</div>
      </footer>

      {/* Hover Action Layer */}
      <div className={`absolute inset-x-10 bottom-36 flex gap-4 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); onPlacementTest(); }} className="flex-1 py-5 bg-white rounded-3xl text-[10px] font-black uppercase tracking-widest border-2 border-white text-slate-950 hover:bg-slate-950 hover:text-white transition-all shadow-2xl">Placement</button>
        <button onClick={(e) => { e.stopPropagation(); onExamPrep(); }} className="flex-1 py-5 bg-slate-950 rounded-3xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-950 text-white hover:bg-white hover:text-slate-950 transition-all shadow-2xl">Exam Prep</button>
      </div>
    </div>
  );
};

export default SubjectCard;
