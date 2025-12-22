
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS, MASTERY_LEVEL_ORDER } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';
import { RadarChart } from './RadarChart';
import SpecializationModal from './SpecializationModal';

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
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string) => Promise<Subject | undefined>;
}

const DashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartExam, onStartPrep, 
  onUpdateUser, onUpdateProgress, onTrackChange, onLogout, onOpenConverter, onOpenPlacementGlobal,
  onOpenPlacement, onOpenAssessment, onOpenCombination, onOpenLeaderboard, onOpenFastTrack, onOpenExamHall,
  dynamicSubjects, onCreateSubject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [specializingSubject, setSpecializingSubject] = useState<Subject | null>(null);
  const [showTrackHub, setShowTrackHub] = useState(false);
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
        if (!term) return true;

        const nameMatch = sub.name.toLowerCase().includes(term);
        const descMatch = sub.description.toLowerCase().includes(term);
        const subTopicMatch = sub.suggestedSubTopics?.some(topic => 
          topic.toLowerCase().includes(term)
        );

        return nameMatch || descMatch || subTopicMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory, dynamicSubjects]);

  const handleStartSubject = (sub: Subject) => {
    const subProg = progress[sub.id];
    if (sub.availableSpecializations && (!subProg || !subProg.specializations || subProg.specializations.length === 0)) {
      setSpecializingSubject(sub);
    } else {
      onStartLesson(sub);
    }
  };

  const handleCreateNew = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newSub = await onCreateSubject(searchQuery);
      if (newSub) {
        setSearchQuery('');
        handleStartSubject(newSub);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveSpecializations = (specializations: string[], secondaryLanguage?: Language) => {
    if (specializingSubject) {
      onUpdateProgress(specializingSubject.id, { 
        specializations, 
        secondaryLanguage 
      });
      const currentSub = specializingSubject;
      setSpecializingSubject(null);
      onStartLesson(currentSub);
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto px-4 pb-20">
      {specializingSubject && (
        <SpecializationModal 
          subject={specializingSubject}
          language={language}
          initialSelected={progress[specializingSubject.id]?.specializations || []}
          initialSecondaryLanguage={progress[specializingSubject.id]?.secondaryLanguage}
          onClose={() => setSpecializingSubject(null)}
          onSave={handleSaveSpecializations}
        />
      )}

      {/* Institutional Track Modal */}
      {showTrackHub && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl font-black">🏢</div>
               <h3 className="text-3xl font-black mb-2">{t('supplementalTracks')}</h3>
               <p className="text-white/80 font-medium">Align darewast with your external academic commitments.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
               <div className="grid sm:grid-cols-3 gap-6">
                  <button 
                    onClick={() => onTrackChange('Standard')}
                    className="p-8 rounded-[2.5rem] border-2 border-transparent bg-gray-50 dark:bg-slate-800 hover:border-dare-teal transition-all text-center space-y-4 group"
                  >
                     <div className="w-16 h-16 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform">🎯</div>
                     <div>
                        <h4 className="font-black dark:text-white uppercase tracking-widest text-xs">{t('standardMode')}</h4>
                        <p className="text-xs text-gray-500 mt-2">Independent Kumon-style mastery.</p>
                     </div>
                  </button>
                  
                  <button 
                    onClick={() => onTrackChange('School')}
                    className="p-8 rounded-[2.5rem] border-2 border-transparent bg-gray-50 dark:bg-slate-800 hover:border-dare-gold transition-all text-center space-y-4 group"
                  >
                     <div className="w-16 h-16 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform">🎒</div>
                     <div>
                        <h4 className="font-black dark:text-white uppercase tracking-widest text-xs">{t('schoolMode')}</h4>
                        <p className="text-xs text-gray-500 mt-2">Reinforce homework and K-12 curricula.</p>
                     </div>
                  </button>
                  
                  <button 
                    onClick={() => onTrackChange('University')}
                    className="p-8 rounded-[2.5rem] border-2 border-transparent bg-gray-50 dark:bg-slate-800 hover:border-dare-purple transition-all text-center space-y-4 group"
                  >
                     <div className="w-16 h-16 bg-dare-purple/10 text-dare-purple rounded-3xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform">🏛️</div>
                     <div>
                        <h4 className="font-black dark:text-white uppercase tracking-widest text-xs">{t('uniMode')}</h4>
                        <p className="text-xs text-gray-500 mt-2">Deepen undergraduate foundations.</p>
                     </div>
                  </button>
               </div>

               <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Integration Logic</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    When School or University tracks are active, our AI transitions from primary instructor to "Supplemental Assistant". 
                    Lessons will specifically aim to bridge classroom gaps, clarify complex lecture topics, and provide focused drills relevant to academic standards.
                  </p>
               </div>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800 text-center">
               <button onClick={() => setShowTrackHub(false)} className="text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Header Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-dare-teal/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div>
             <p className="text-[10px] font-black text-dare-teal uppercase tracking-[0.2em] mb-1">Mastery Experience</p>
             <h3 className="text-4xl font-black text-gray-900 dark:text-white">{user.xp.toLocaleString()} <span className="text-lg text-gray-400 font-bold">XP</span></h3>
          </div>
          <div className="text-4xl">⚡</div>
        </div>
        
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-dare-gold/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div>
             <p className="text-[10px] font-black text-dare-gold uppercase tracking-[0.2em] mb-1">Current Level</p>
             <h3 className="text-4xl font-black text-gray-900 dark:text-white">{user.level} <span className="text-lg text-gray-400 font-bold">{user.rank}</span></h3>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        <div onClick={onOpenLeaderboard} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl flex items-center justify-between group overflow-hidden relative cursor-pointer hover:border-dare-purple/40 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-dare-purple/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div>
             <p className="text-[10px] font-black text-dare-purple uppercase tracking-[0.2em] mb-1">Global Standing</p>
             <h3 className="text-4xl font-black text-gray-900 dark:text-white">Top 3%</h3>
          </div>
          <div className="text-4xl">🌐</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-10">
          {/* Search & Methodology */}
          <div className="space-y-6">
            <div className="relative group">
              <input 
                type="text"
                placeholder={t('searchSubjects')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-16 py-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-white/20 focus:border-dare-teal rounded-[2.5rem] shadow-2xl outline-none text-xl font-bold dark:text-white transition-all"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-gray-400">🔍</div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dare-teal text-xl"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    selectedCategory === cat 
                      ? 'bg-dare-teal text-white border-dare-teal shadow-lg shadow-dare-teal/20' 
                      : 'bg-white/40 dark:bg-white/5 border-white/20 text-gray-500 hover:border-dare-teal/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fusion, Institutional Hubs, Fast Track & Exam Hall */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <div 
               onClick={onOpenCombination}
               className="p-6 rounded-[2.5rem] bg-gradient-to-br from-dare-teal/5 to-dare-purple/5 border-2 border-dashed border-white/30 backdrop-blur-md flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-[1.01] transition-all group"
             >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl group-hover:rotate-[360deg] transition-all duration-700">⚛️</div>
                <h3 className="text-xs font-black text-gray-900 dark:text-white">Fusion</h3>
             </div>
             
             <div 
               onClick={() => setShowTrackHub(true)}
               className="p-6 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 border-2 border-dashed border-white/30 backdrop-blur-md flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-[1.01] transition-all group"
             >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-all">🏫</div>
                <h3 className="text-xs font-black text-gray-900 dark:text-white">Institutions</h3>
             </div>

             <div 
               onClick={onOpenFastTrack}
               className="p-6 rounded-[2.5rem] bg-rose-500/5 border-2 border-dashed border-rose-500/30 backdrop-blur-md flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-[1.01] transition-all group"
             >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl group-hover:animate-pulse">⚡</div>
                <h3 className="text-xs font-black text-rose-500">Fast Track</h3>
             </div>

             <div 
               onClick={onOpenExamHall}
               className="p-6 rounded-[2.5rem] bg-dare-gold/5 border-2 border-dashed border-dare-gold/30 backdrop-blur-md flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-[1.01] transition-all group"
             >
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-all">📝</div>
                <h3 className="text-xs font-black text-dare-gold">{t('examHall')}</h3>
             </div>
          </div>

          {filteredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredSubjects.map(sub => (
                <SubjectCard 
                  key={sub.id} 
                  subject={sub} 
                  progress={progress[sub.id] || { level: 'A', lessonNumber: 1 }} 
                  onClick={() => handleStartSubject(sub)}
                  onOpenSpecialization={() => setSpecializingSubject(sub)}
                  onPlacementTest={() => onOpenPlacement(sub)}
                  onLevelAssessment={() => onOpenAssessment(sub)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/40 dark:bg-white/5 rounded-[3rem] border border-white/20 border-dashed">
              <div className="text-6xl mb-4">🏜️</div>
              <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">No subjects found</h3>
              <p className="text-gray-500 font-medium mt-2 mb-8">Try adjusting your filters or generate this subject instantly.</p>
              
              <button 
                onClick={handleCreateNew}
                disabled={isCreating || !searchQuery.trim()}
                className="px-10 py-5 bg-dare-teal text-white rounded-[2rem] font-black text-xl shadow-xl shadow-dare-teal/20 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50"
              >
                {isCreating ? 'Synthesizing Curriculum...' : `Generate "${searchQuery}" Now`}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Mastery Radar</h3>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-center">Skill Distribution</p>
            <RadarChart progress={progress} subjects={allAvailableSubjects.slice(0, 10)} />
            
            <div className="mt-12 space-y-4">
               <button onClick={onOpenPlacementGlobal} className="w-full py-5 bg-dare-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-dare-gold/20 hover:scale-105 active:scale-95 transition-all">Re-Assess Placement</button>
               <button onClick={onOpenConverter} className="w-full py-5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Grade Converter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
