
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserProgress, Language, MasteryLevel, SubjectProgress, CurriculumEra, LearningMethod, CurriculumStyle, PaymentPreferences, MasterySchedule, LearningStyle } from '../types';
import { SUBJECTS, MASTERY_LEVEL_ORDER, LEARNING_DURATIONS } from '../constants';
import { translations } from '../translations';
import { RadarChart } from './RadarChart';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onBack: () => void;
  onUpdateGoal: (goal: number) => void;
  onUpdateUser: (data: Partial<User>) => void;
  onOpenConverter: () => void;
  onOpenGuardianReport: () => void;
  onOpenAccessibility: () => void;
  onOpenMethodCombination: () => void;
}

const StreakMastery: React.FC<{ streak: number }> = ({ streak }) => {
  const weekDay = streak % 7 === 0 && streak > 0 ? 7 : streak % 7;
  
  return (
    <div className="mt-8 pt-8 border-t border-black/10 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-white/20 dark:bg-black/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative group">
              <span className="animate-bounce">🔥</span>
           </div>
           <div className="text-left text-slate-900">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Consistency Grid</p>
              <h4 className="text-2xl font-black leading-none tracking-tighter">Mastery Streak</h4>
           </div>
        </div>
        <div className="bg-white/20 px-5 py-2.5 rounded-[1.2rem] text-center shadow-xl border border-white/40">
           <p className="text-2xl font-black text-slate-950 leading-none">{streak}</p>
           <p className="text-[7px] font-black text-slate-950/60 uppercase tracking-widest mt-0.5">Days</p>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2.5">
        {[...Array(7)].map((_, i) => {
          const isActive = weekDay > i;
          return (
            <div key={i} className={`h-6 rounded-xl transition-all duration-700 border-2 ${isActive ? 'bg-white border-white shadow-lg' : 'bg-white/10 dark:bg-white/5 border-transparent opacity-20'}`}></div>
          );
        })}
      </div>
    </div>
  );
};

const ProfileView: React.FC<Props> = ({ user, progress, language, darkMode, onToggleDarkMode, onLogout, onBack, onUpdateGoal, onUpdateUser, onOpenConverter, onOpenGuardianReport, onOpenAccessibility, onOpenMethodCombination }) => {
  const t = (key: string) => translations[language][key] || translations['English'][key] || key;
  const eras = ['Ancient', 'Medieval', 'Renaissance', 'Enlightenment', 'Industrial', 'Modern', 'Contemporary', 'Future'];
  
  return (
    <div className="max-w-6xl mx-auto py-12 animate-fadeIn px-4">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-gold flex items-center transition-all font-bold group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dare-gold p-12 rounded-[3.5rem] shadow-2xl border-4 border-white/30 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black text-white">USER</div>
            <div className={`w-36 h-36 rounded-[2.5rem] bg-white/40 mx-auto mb-8 overflow-hidden border-4 border-white shadow-2xl relative z-10`}>
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-1 relative z-10">{user.name}</h2>
            <p className="text-slate-900/60 font-black relative z-10">@{user.username}</p>
            
            <div className="mt-10 pt-10 border-t border-black/10">
                <p className="text-5xl font-black text-slate-950">{user.xp}</p>
                <p className="text-[10px] font-black text-slate-950/50 uppercase tracking-widest">Lifetime XP Yield</p>
            </div>

            <StreakMastery streak={user.streak} />

            <button onClick={onLogout} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black mt-12 text-xs uppercase tracking-widest transition-all hover:bg-white hover:text-slate-950 shadow-xl">{t('signOut')}</button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-dare-teal p-12 rounded-[4rem] shadow-2xl border-4 border-white/20 text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 text-[15rem] font-black text-white">DNA</div>
             <h3 className="text-3xl font-black text-slate-900 mb-2 relative z-10">Universal Academic DNA 🧬</h3>
             <p className="text-slate-950/60 text-xs font-bold mb-12 uppercase tracking-widest relative z-10">Supports all methods & curricula from any era</p>
             
             <div className="space-y-12 relative z-10">
                <section>
                  <label className="text-[11px] font-black text-slate-950/60 uppercase tracking-widest block mb-6">Temporal Framework (Eras)</label>
                  <div className="flex flex-wrap gap-2">
                    {eras.map(e => (
                      <button key={e} onClick={() => onUpdateUser({ academicDNA: { ...user.academicDNA!, era: e }})} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all ${user.academicDNA?.era === e ? 'bg-slate-950 text-white shadow-2xl scale-110' : 'bg-white/20 text-slate-900 border-2 border-white/40 hover:bg-white/40'}`}>{e}</button>
                    ))}
                  </div>
                </section>

                <section>
                   <label className="text-[11px] font-black text-slate-950/60 uppercase tracking-widest block mb-6">Daily Mastery Goal</label>
                   <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                     {LEARNING_DURATIONS.map(mins => (
                        <button 
                          key={mins}
                          onClick={() => onUpdateGoal(mins)}
                          className={`px-4 py-4 rounded-2xl text-xs font-black uppercase transition-all border-4 ${user.dailyGoal === mins ? 'border-white bg-slate-950 text-white shadow-2xl' : 'border-white/20 bg-white/10 text-slate-900 hover:bg-white/30'}`}
                        >
                           {mins}m
                        </button>
                     ))}
                   </div>
                </section>

                <section>
                   <label className="text-[11px] font-black text-slate-950/60 uppercase tracking-widest block mb-6">Appearance</label>
                   <button 
                     onClick={onToggleDarkMode}
                     className={`w-full py-4 rounded-2xl text-xs font-black uppercase transition-all border-4 flex items-center justify-center gap-3 ${darkMode ? 'border-white bg-slate-950 text-white shadow-2xl' : 'border-white/20 bg-white/10 text-slate-900 hover:bg-white/30'}`}
                   >
                     <span>{darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}</span>
                   </button>
                </section>

                <section>
                   <label className="text-[11px] font-black text-slate-950/60 uppercase tracking-widest block mb-6">Educational Tier</label>
                   <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                     {['Preschool', 'Primary', 'Middle', 'High', 'University'].map(stage => (
                        <button 
                          key={stage}
                          onClick={() => onUpdateUser({ stage: stage as any })}
                          className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-4 ${user.stage === stage ? 'border-slate-950 bg-slate-950 text-white shadow-2xl' : 'border-white/20 bg-white/10 text-slate-900 hover:bg-white/30'}`}
                        >
                           {stage}
                        </button>
                     ))}
                   </div>
                </section>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
