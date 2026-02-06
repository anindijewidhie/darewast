
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, SubjectCategory, EducationTrack } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';
import SubjectCard from './SubjectCard';
import { RadarChart } from './RadarChart';

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
  onOpenRelearn: () => void;
  onOpenTransition: () => void;
  onOpenCreditTransfer: () => void;
  onOpenSpecialization: (sub: Subject) => void;
  dynamicSubjects: Subject[];
  onCreateSubject: (query: string) => Promise<Subject | undefined>;
}

const MasteryAnalytics: React.FC<{ history: Record<string, number>; dailyGoal: number }> = ({ history, dailyGoal }) => {
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        value: history[key] || 0,
        fullDate: key
      });
    }
    return days;
  }, [history]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return Object.entries(history).reduce((acc, [date, mins]) => {
      const d = new Date(date);
      // Fix: Cast mins to number to avoid 'unknown' type error in some TypeScript configurations
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return acc + (mins as number);
      return acc;
    }, 0);
  }, [history]);

  const maxVal = Math.max(dailyGoal, ...last7Days.map(d => d.value));

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-8">
         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Mastery Analytics</h3>
         <div className="px-3 py-1 bg-dare-teal/10 text-dare-teal rounded-lg text-[9px] font-black uppercase">Institutional Grade</div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <div className="flex items-end justify-between h-40 gap-2">
            {last7Days.map((day, i) => {
              const height = (day.value / maxVal) * 100;
              const isGoalMet = day.value >= dailyGoal;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                  <div className="relative w-full flex justify-center h-full items-end">
                    <div 
                      className={`w-full max-w-[20px] rounded-t-lg transition-all duration-1000 ${isGoalMet ? 'bg-dare-teal shadow-[0_0_15px_rgba(83,205,186,0.3)]' : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-dare-teal/40'}`}
                      style={{ height: `${Math.max(4, height)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.value}m
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black ${day.fullDate === new Date().toISOString().split('T')[0] ? 'text-dare-teal' : 'text-gray-400'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-4 space-y-4">
           <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Yield</p>
              <p className="text-2xl font-black dark:text-white leading-none">{(monthlyTotal / 60).toFixed(1)} <span className="text-xs font-bold text-gray-500">HRS</span></p>
           </div>
           <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Weekly Avg</p>
              <p className="text-2xl font-black dark:text-white leading-none">
                {Math.round(last7Days.reduce((a, b) => a + b.value, 0) / 7)} <span className="text-xs font-bold text-gray-500">MINS/D</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView: React.FC<Props> = ({ 
  user, progress, language, onStartLesson, onStartExam, onStartPrep, 
  onUpdateUser, onUpdateProgress, onTrackChange, onLogout, onOpenConverter, onOpenPlacementGlobal,
  onOpenPlacement, onOpenAssessment, onOpenCombination, onOpenLeaderboard, onOpenFastTrack, onOpenExamHall,
  onOpenRelearn, onOpenTransition, onOpenCreditTransfer, 
  onOpenSpecialization,
  dynamicSubjects, onCreateSubject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'All'>('All');
  const [isCreating, setIsCreating] = useState(false);
  
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const categories: (SubjectCategory | 'All')[] = ['All', 'Literacy', 'Numeracy', 'Science', 'Humanities', 'Tech', 'Music', 'Arts', 'Sports', 'Ethics'];
  const allAvailableSubjects = [...SUBJECTS, ...dynamicSubjects];

  const filteredSubjects = useMemo(() => {
    return allAvailableSubjects
      .filter(sub => {
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        if (!matchesCategory) return false;
        const term = searchQuery.toLowerCase().trim();
        return !term || sub.name.toLowerCase().includes(term) || sub.description.toLowerCase().includes(term);
      });
      // subjects are arranged according to official classifications by default from SUBJECTS array
  }, [searchQuery, selectedCategory, dynamicSubjects]);

  const currentDay = new Date().getDay();
  const activeDays = user.masterySchedule?.activeDays || [1, 2, 3, 4, 5];
  const isStudyDay = activeDays.includes(currentDay);
  const isMonday = currentDay === 1;

  const nextMonday = useMemo(() => {
    const today = new Date();
    const diff = (today.getDay() === 0 ? 1 : 8 - today.getDay());
    const result = new Date(today);
    result.setDate(today.getDate() + diff);
    return result.toLocaleDateString(language === 'Indonesian' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [language]);

  const handleCreateNew = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newSub = await onCreateSubject(searchQuery);
      if (newSub) { setSearchQuery(''); onStartLesson(newSub); }
    } finally { setIsCreating(false); }
  };

  const isEligibleForTransition = [5, 6, 11, 12, 13].includes(user.age);
  const studyGoal = user.dailyGoal || 30;
  const todayKey = new Date().toISOString().split('T')[0];
  const timeSpentToday = user.studyHistory?.[todayKey] || 0;
  const timeProgressPercent = Math.min(100, Math.round((timeSpentToday / studyGoal) * 100));

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-2 md:px-4 pb-24">
      <header className="py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 border-b border-gray-100 dark:border-slate-800 mb-8 md:mb-12">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{t('masteryHub')}</h1>
          <p className="text-dare-teal font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[9px]">{t('hello') || 'Hello'}, {user.name} • {user.rank}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          {[
            { id: 'fusion', icon: '⚛️', action: onOpenCombination, color: 'dare-teal', tooltip: t('combineLessons') },
            { id: 'relearn', icon: '🩹', action: onOpenRelearn, color: 'rose-500', tooltip: t('relearnLab') },
            { id: 'exam', icon: '🏛️', action: onOpenExamHall, color: 'dare-gold', tooltip: t('examHall') },
            { id: 'credits', icon: '📜', action: onOpenCreditTransfer, color: 'blue-600', tooltip: t('creditTransfer') },
          ].map(tool => (
            <button key={tool.id} onClick={tool.action} title={tool.tooltip} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg flex items-center justify-center text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all group">
              <span className="group-hover:rotate-12 transition-transform">{tool.icon}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {/* Real-time Presence Tracker Widget */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 flex items-center gap-6 relative overflow-hidden group">
               <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="36" className="fill-none stroke-gray-100 dark:stroke-slate-800" strokeWidth="8" />
                    <circle cx="40" cy="40" r="36" className="fill-none stroke-dare-teal transition-all duration-1000" strokeWidth="8" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - timeProgressPercent / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl">⏱️</span></div>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('timeSpentToday')}</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-3xl font-black dark:text-white tracking-tighter">{timeSpentToday}</h4>
                    <span className="text-xs font-black text-gray-500 uppercase">/ {studyGoal} {t('minutesShort')}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    {t('activeTracking')}
                  </div>
               </div>
               {timeProgressPercent >= 100 && <div className="absolute top-0 right-0 p-4 animate-bounce">✨</div>}
            </div>

            <div className={`${isMonday ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'} p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl text-white flex flex-col items-start justify-between gap-6 relative overflow-hidden group`}>
               <div className="absolute right-0 top-0 p-8 opacity-10 text-6xl font-black rotate-12">{isMonday ? 'REFRESH' : '365'}</div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">{isMonday ? t('mondayRefresh') : t('institutionalCycle')}</p>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">{isMonday ? t('materialsUpdated') : t('yearRoundEnrollment')}</h3>
               </div>
               <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 relative z-10 w-full">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-0.5">{t('nextModuleStart')}</p>
                  <p className="text-xs font-black italic">{nextMonday}</p>
               </div>
            </div>

            {isEligibleForTransition && (
              <button onClick={onOpenTransition} className="bg-dare-purple p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl text-white flex flex-col items-start justify-between gap-6 relative overflow-hidden group hover:scale-[1.02] transition-all text-left">
                <div className="absolute right-0 top-0 p-8 opacity-10 text-6xl font-black rotate-12">BRIDGE</div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">{t('transitionHub')}</p>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">{user.transitionProgram ? t('enrolledTransition') : t('transitionProgramTitle')}</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 relative z-10 w-full flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest">{user.transitionProgram ? t('reviewBridge') : t('beginBridging')}</p>
                    <span className="text-xl">→</span>
                </div>
              </button>
            )}

            {!isStudyDay && (
              <div className="sm:col-span-2 p-8 bg-indigo-950 rounded-[2.5rem] border-2 border-indigo-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 text-7xl font-black uppercase tracking-tighter">RECHARGE</div>
                 <div className="relative z-10">
                    <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] mb-2">{t('rechargeDay')}</p>
                    <h4 className="text-2xl font-black tracking-tight">{t('rechargeDesc')}</h4>
                    <p className="text-indigo-200/60 font-medium text-sm mt-1">{t('accessModulesMonday')}</p>
                 </div>
                 <button onClick={() => onOpenFastTrack()} className="relative z-10 px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all shrink-0">{t('launchExperience')} →</button>
              </div>
            )}
          </div>

          {/* Precision Analytics Chart Integration */}
          <MasteryAnalytics history={user.studyHistory || {}} dailyGoal={studyGoal} />

          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <input type="text" placeholder={t('searchSubjects')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} spellCheck={true} className="w-full pl-10 pr-4 py-2.5 md:pl-12 md:py-3 bg-gray-50 dark:bg-slate-800 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm dark:text-white transition-all focus:ring-2 focus:ring-dare-teal/20" />
              <div className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-base md:text-lg opacity-40">🔍</div>
            </div>
            <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedCategory === cat ? 'bg-dare-teal text-white' : 'text-gray-400 hover:bg-gray-50'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(sub => (
                <SubjectCard key={sub.id} subject={sub} progress={progress[sub.id] || { level: 'A', lessonNumber: 1 }} onClick={() => onStartLesson(sub)} onOpenSpecialization={() => onOpenSpecialization(sub)} onPlacementTest={() => onOpenPlacement(sub)} onLevelAssessment={() => onOpenAssessment(sub)} onExamPrep={() => onStartPrep(sub)} />
              ))
            ) : (
              <div className="sm:col-span-2 py-16 md:py-24 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] md:rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-slate-800 px-6">
                <p className="text-gray-400 font-bold mb-6 md:mb-8 text-base md:text-lg">{t('subjectNotFound')}</p>
                <button onClick={handleCreateNew} disabled={isCreating} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-dare-purple text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">{isCreating ? t('detecting') : `${t('initializeChapters')} "${searchQuery}"`}</button>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-6 md:space-y-8 pb-12 lg:pb-0">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 md:mb-8 text-center">{t('masteryMatrix')}</h3>
            <RadarChart progress={progress} subjects={allAvailableSubjects.slice(0, 8)} />
            <div className="mt-8 md:mt-12 space-y-2 md:space-y-3">
              <button onClick={onOpenPlacementGlobal} className="w-full py-3 md:py-4 bg-dare-gold text-slate-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl shadow-dare-gold/20 hover:scale-[1.02] transition-all">{t('placementTitle')}</button>
              <button onClick={onOpenConverter} className="w-full py-3 md:py-4 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-gray-100 transition-all">{t('gradeConverter')}</button>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 text-5xl md:text-7xl">🧬</div>
             <p className="text-[8px] md:text-[9px] font-black text-dare-teal uppercase tracking-[0.4em] mb-4">Academic DNA</p>
             <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center text-[10px] md:text-xs"><span className="text-slate-500 font-bold">{t('learningMethod')}:</span><span className="font-black text-white">{user.academicDNA?.method || 'Kumon-style'}</span></div>
                <div className="flex justify-between items-center text-[10px] md:text-xs"><span className="text-slate-500 font-bold">{t('curriculumEra')}:</span><span className="font-black text-white">{user.academicDNA?.era || 'Modern'}</span></div>
                <div className="flex justify-between items-center text-[10px] md:text-xs pt-2 border-t border-white/5"><span className="text-slate-500 font-bold">{t('educationTrack')}:</span><span className="font-black text-white">{user.track || 'Independent'}</span></div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardView;
