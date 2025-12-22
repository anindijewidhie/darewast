
import React, { useState } from 'react';
import { Subject, MasteryLevel, SubjectProgress } from '../types';
import { LEVEL_METADATA } from '../constants';

interface Props {
  subject: Subject;
  progress: SubjectProgress;
  onClick: () => void;
  onOpenSpecialization: () => void;
  onPlacementTest: () => void;
  onLevelAssessment: () => void;
}

const SubjectCard: React.FC<Props> = ({ subject, progress, onClick, onOpenSpecialization, onPlacementTest, onLevelAssessment }) => {
  const [showTools, setShowTools] = useState(false);
  const level = progress.level;
  const lessonNumber = progress.lessonNumber;
  const currentTheme = progress.currentTheme;
  const track = progress.track || 'Standard';
  const specializations = progress.specializations || [];
  const secondaryLanguage = progress.secondaryLanguage;
  const isFastTrack = progress.isFastTrack || false;
  const metadata = LEVEL_METADATA[level];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Literacy': return 'dare-teal';
      case 'Numeracy': return 'dare-gold';
      case 'Science': return 'blue-400';
      case 'Humanities': return 'orange-400';
      case 'Tech': return 'dare-purple';
      case 'Music': return 'pink-400';
      case 'Ethics': return 'emerald-400';
      default: return 'gray-200';
    }
  };

  const themeColorClass = getCategoryColor(subject.category);

  // Calculate total items dynamically based on config
  const totalItems = subject.richMediaConfig ? (
    (subject.richMediaConfig.exercisesPerLesson * 12) +
    (subject.richMediaConfig.ebooks || 0) +
    (subject.richMediaConfig.blogs || 0) +
    (subject.richMediaConfig.podcasts || 0) +
    (subject.richMediaConfig.videos || 0) +
    (subject.richMediaConfig.songs || 0)
  ) : 0;

  return (
    <div 
      onMouseEnter={() => setShowTools(true)}
      onMouseLeave={() => setShowTools(false)}
      className={`group flex flex-col p-6 bg-white dark:bg-slate-900 border-b-4 border-${themeColorClass} rounded-2xl shadow-sm hover:shadow-xl transition-all text-left transform hover:-translate-y-2 active:translate-y-0 border-x border-t border-gray-100 dark:border-slate-800 relative overflow-hidden h-full`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="text-6xl font-black">{level}</span>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl group-hover:scale-110 transition-transform origin-left">{subject.icon}</div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {isFastTrack && (
              <span className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg shadow-rose-500/20 animate-pulse">
                ⚡ Fast Track
              </span>
            )}
            {subject.availableSpecializations && (
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenSpecialization(); }}
                className="w-8 h-8 bg-gray-50 dark:bg-slate-800 hover:bg-dare-teal hover:text-white rounded-xl flex items-center justify-center transition-all border border-gray-100 dark:border-slate-700 shadow-sm"
                title="Configure Academic DNA"
              >
                🧬
              </button>
            )}
            {(currentTheme || (subject.id === 'music-vocal' && secondaryLanguage)) && (
              <div className="flex flex-col items-end gap-1">
                {currentTheme && (
                  <span className="bg-dare-teal/10 text-dare-teal text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-dare-teal/20 animate-fadeIn">
                    ✨ {currentTheme}
                  </span>
                )}
                {subject.id === 'music-vocal' && secondaryLanguage && (
                  <span className="bg-pink-400/10 text-pink-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-pink-400/20 animate-fadeIn">
                    🎙️ {secondaryLanguage}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {track !== 'Standard' && (
             <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${track === 'School' ? 'bg-dare-gold/10 text-dare-gold border-dare-gold/20' : 'bg-dare-purple/10 text-dare-purple border-dare-purple/20'}`}>
                {track === 'School' ? '🎒 School Sync' : '🏛️ Uni Sync'}
             </span>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-black text-gray-900 dark:text-slate-100 mb-1">{subject.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 font-medium">{subject.description}</p>
      
      {/* Dynamic Rich Media Metrics */}
      {subject.richMediaConfig && (
        <div className="flex items-center gap-3 mb-4 py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
           <div className="flex -space-x-1">
             {(subject.richMediaConfig.ebooks || 0) > 0 && (
               <span className="w-5 h-5 rounded bg-dare-teal/20 flex items-center justify-center text-[10px]" title="E-books">📖</span>
             )}
             {(subject.richMediaConfig.blogs || 0) > 0 && (
               <span className="w-5 h-5 rounded bg-dare-gold/20 flex items-center justify-center text-[10px]" title="Blogs">📰</span>
             )}
             {(subject.richMediaConfig.podcasts || 0) > 0 && (
               <span className="w-5 h-5 rounded bg-dare-purple/20 flex items-center justify-center text-[10px]" title="Podcasts">🎙️</span>
             )}
             {(subject.richMediaConfig.videos || 0) > 0 && (
               <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]" title="Videos">📺</span>
             )}
             {(subject.richMediaConfig.songs || 0) > 0 && (
               <span className="w-5 h-5 rounded bg-pink-500/20 flex items-center justify-center text-[10px]" title="Songs">🎵</span>
             )}
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{totalItems} Total Items</p>
        </div>
      )}

      {/* Tools Overlay for Assessment/Placement */}
      <div className={`flex gap-2 mb-4 transition-all duration-300 ${showTools ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onPlacementTest(); }}
          className="flex-1 py-1.5 bg-dare-purple/10 hover:bg-dare-purple text-dare-purple hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-dare-purple/20 transition-all"
        >
          🎯 Placement
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onLevelAssessment(); }}
          className="flex-1 py-1.5 bg-dare-gold/10 hover:bg-dare-gold text-dare-gold hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-dare-gold/20 transition-all"
        >
          ⚖️ Assessment
        </button>
      </div>

      {/* Active Specializations Display */}
      {specializations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specializations.map(spec => (
            <span 
              key={spec} 
              className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-${themeColorClass}/10 text-${themeColorClass} border border-${themeColorClass}/20`}
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Suggested sub-topics as secondary badges */}
      {subject.suggestedSubTopics && specializations.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {subject.suggestedSubTopics.map(topic => (
            <span 
              key={topic} 
              className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-${themeColorClass}/5 text-${themeColorClass} border border-${themeColorClass}/10`}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <button 
        onClick={onClick}
        className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between w-full group/btn"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest leading-none">Level {level}</p>
            <span className="text-[8px] font-black bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500">
              {lessonNumber}/12
            </span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{metadata.equivalency}</p>
        </div>
        <span className="text-dare-teal font-black group-hover/btn:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
};

export default SubjectCard;
