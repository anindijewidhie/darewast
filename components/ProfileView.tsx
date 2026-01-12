
import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, MasteryLevel, Subject, SubjectProgress, CurriculumEra, LearningMethod, PaymentPreferences } from '../types';
import { SUBJECTS, LEVEL_METADATA, MASTERY_LEVEL_ORDER } from '../constants';
import { translations } from '../translations';
import { RadarChart } from './RadarChart';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onLogout: () => void;
  onBack: () => void;
  onUpdateGoal: (goal: number) => void;
  onUpdateUser: (data: Partial<User>) => void;
  onOpenConverter: () => void;
  onOpenGuardianReport: () => void;
  onOpenAccessibility: () => void;
  onOpenMethodCombination: () => void;
}

const StreakVisualizer: React.FC<{ streak: number }> = ({ streak }) => {
  const milestones = [7, 30, 100, 365, 1000];
  const nextMilestone = milestones.find(m => m > streak) || milestones[milestones.length - 1];
  const prevMilestone = milestones[milestones.indexOf(nextMilestone) - 1] || 0;
  const progressPercentage = ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekProgress = streak % 7;
  const activeDaysCount = (streak > 0 && weekProgress === 0) ? 7 : weekProgress;

  return (
    <div className="mt-10 space-y-8 p-8 bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group text-left">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-dare-gold/5 rounded-full blur-[100px] group-hover:bg-dare-gold/10 transition-all duration-1000"></div>
      
      <div className="flex justify-between items-end relative z-10">
        <div className="flex flex-col items-start">
          <p className="text-[10px] font-black text-dare-gold uppercase tracking-[0.3em] mb-1">Study Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter animate-pulse">
              {streak}
            </span>
            <span className="text-sm font-black text-dare-gold uppercase tracking-widest">Days</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
            {streak >= nextMilestone / 2 ? '⚡' : '🔥'}
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Momentum: High</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <span>{prevMilestone}d Milestone</span>
          <span className="text-dare-gold">Next: {nextMilestone}d Shield</span>
        </div>
        <div className="relative h-6 bg-black/40 rounded-full border border-white/5 p-1 shadow-inner overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple rounded-full transition-all duration-1000 relative shadow-[0_0_20px_rgba(204,185,83,0.4)]"
            style={{ width: `${Math.max(6, progressPercentage)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] animate-[streakLiquidShine_3s_infinite] w-1/3 -translate-x-full"></div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 bg-white rounded-full blur-[2px] opacity-60 animate-bounce"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {days.map((day, i) => {
          const isActive = i < activeDaysCount;
          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <div 
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500 transform ${
                  isActive 
                  ? 'bg-white dark:bg-slate-800 border-2 border-dare-gold scale-110 shadow-lg shadow-dare-gold/20 -translate-y-1' 
                  : 'bg-white/5 border border-white/5 text-gray-700 opacity-40'
                }`}
              >
                {isActive ? '🔥' : '🧊'}
                {isActive && (
                  <div className="absolute -inset-1 bg-dare-gold/10 rounded-xl animate-ping opacity-30"></div>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-dare-gold' : 'text-gray-600'}`}>
                {day.charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes streakLiquidShine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          40%, 100% { transform: translateX(300%) skewX(-20deg); }
        }
      `}} />
    </div>
  );
};

const ProfileView: React.FC<Props> = ({ user, progress, language, onLogout, onBack, onUpdateGoal, onUpdateUser, onOpenConverter, onOpenGuardianReport, onOpenAccessibility, onOpenMethodCombination }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBirthDate, setEditBirthDate] = useState(user.birthDate);
  const [editCulturalBackground, setEditCulturalBackground] = useState(user.culturalBackground || '');
  const [editAvatarSeed, setEditAvatarSeed] = useState<string | null>(null);

  const [paymentPrefs, setPaymentPrefs] = useState<PaymentPreferences>(user.paymentPreferences || { withdrawalMethod: 'bank' });
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const handleUpdateDNA = (dna: Partial<User['academicDNA']>) => {
    onUpdateUser({ 
      academicDNA: { 
        ...(user.academicDNA || { era: 'Modern', method: 'Kumon-style' }), 
        ...dna,
        hybridMethods: undefined 
      } 
    });
  };

  const handleSavePayment = () => {
    setIsSavingPayment(true);
    setTimeout(() => {
      onUpdateUser({ paymentPreferences: paymentPrefs });
      setIsSavingPayment(false);
    }, 1000);
  };

  const eras: CurriculumEra[] = ['Modern', 'Legacy', 'Classical'];
  const methods: LearningMethod[] = ['Kumon-style', 'Montessori-inspired', 'Waldorf-aligned', 'Traditional-Rote', 'Inquiry-based'];

  const currentAvatar = editAvatarSeed 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${editAvatarSeed}`
    : user.avatar;

  const handleSave = () => {
    const age = new Date().getFullYear() - new Date(editBirthDate).getFullYear();
    onUpdateUser({ 
      name: editName, 
      username: editUsername, 
      birthDate: editBirthDate,
      culturalBackground: editCulturalBackground,
      avatar: currentAvatar,
      age: age,
      isMinor: age < 13
    });
    setIsEditing(false);
    setEditAvatarSeed(null);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditUsername(user.username);
    setEditBirthDate(user.birthDate);
    setEditCulturalBackground(user.culturalBackground || '');
    setEditAvatarSeed(null);
    setIsEditing(false);
  };

  const subjectsStarted = Object.keys(progress).filter(id => {
    const subProg = progress[id];
    return subProg.level !== 'A' || subProg.lessonNumber > 1;
  }).length;
  
  const totalLessonsCompleted = useMemo(() => {
    return Object.values(progress).reduce((acc: number, subProg: SubjectProgress) => {
        const lvlIdx = MASTERY_LEVEL_ORDER.indexOf(subProg.level);
        return acc + (lvlIdx * 12) + (subProg.lessonNumber - 1);
    }, 0);
  }, [progress]);

  const isSynergyActive = !!user.academicDNA?.hybridMethods;

  return (
    <div className="max-w-6xl mx-auto py-12 animate-fadeIn px-4">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-teal flex items-center dark:text-gray-500 transition-all font-bold group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
        <div className="flex gap-4">
          <button onClick={onOpenAccessibility} className="text-dare-teal font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
            ♿ {t('accessibility')}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-2 ${user.contributorRole === 'Professional' ? 'bg-dare-gold' : 'bg-dare-teal'}`}></div>
            
            <div className="relative inline-block mb-8 mt-4">
              <div className={`w-40 h-40 rounded-[3rem] p-1.5 shadow-2xl ${user.contributorRole === 'Professional' ? 'bg-gradient-to-br from-dare-gold to-yellow-600' : 'bg-gradient-to-br from-dare-teal to-emerald-400'}`}>
                <div 
                  className={`w-full h-full rounded-[2.8rem] bg-white dark:bg-slate-800 overflow-hidden relative ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditing && setEditAvatarSeed(Math.random().toString())}
                >
                  <img src={currentAvatar} alt={user.name} className={`w-full h-full object-cover transition-transform duration-500 ${isEditing ? 'hover:scale-110' : 'group-hover:scale-110'}`} />
                </div>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mb-8 text-left">
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-black outline-none border border-transparent focus:border-dare-teal"/>
                <input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-black outline-none border border-transparent focus:border-dare-teal"/>
                <input type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-black outline-none border border-transparent focus:border-dare-teal"/>
                <input value={editCulturalBackground} onChange={e => setEditCulturalBackground(e.target.value)} placeholder={t('culturalBackgroundPlaceholder')} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl font-black outline-none border border-transparent focus:border-dare-teal" />
                <div className="flex gap-2 pt-4">
                  <button onClick={handleSave} className="flex-1 py-4 bg-dare-teal text-white rounded-xl font-black shadow-lg shadow-dare-teal/20 active:scale-95 transition-all">Save</button>
                  <button onClick={handleCancelEdit} className="px-6 py-4 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-xl font-black">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-1">{user.name}</h2>
                <p className="text-dare-teal font-black text-lg tracking-tight">@{user.username}</p>
                {user.contributorRole === 'Professional' && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dare-gold/20">
                     <p className="text-[10px] font-black text-dare-gold uppercase tracking-widest mb-1">🎖️ Professional Role</p>
                     <p className="text-xs font-bold dark:text-white text-left">{user.professionalCredentials?.title}</p>
                     <p className="text-[10px] text-gray-400 text-left">{user.professionalCredentials?.institution}</p>
                     <div className="mt-2 inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase bg-dare-gold text-slate-900">
                        {user.professionalCredentials?.verificationStatus}
                     </div>
                  </div>
                )}
                <StreakVisualizer streak={user.streak} />
                <button onClick={() => setIsEditing(true)} className="text-xs font-black text-dare-teal hover:text-white hover:bg-dare-teal border-2 border-dare-teal/20 px-6 py-2 rounded-full uppercase tracking-widest mt-8 transition-all outline-none focus-visible:ring-4 focus-visible:ring-dare-teal/40">Edit Profile</button>
              </>
            )}
            
            <div className="grid grid-cols-2 gap-4 py-8 border-t border-gray-100 dark:border-slate-800 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-3xl">
                <p className="text-3xl font-black text-dare-gold mb-1">{subjectsStarted}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Subjects</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-3xl">
                <p className="text-3xl font-black text-dare-purple mb-1">{totalLessonsCompleted}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Chapters</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-800 text-left">
            <h3 className="text-xl font-black mb-6">Academic DNA 🧬</h3>
            <div className="space-y-8">
              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Curriculum Era</label>
                <div className="flex flex-wrap gap-2">
                  {eras.map(e => (
                    <button key={e} onClick={() => handleUpdateDNA({ era: e })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-4 focus-visible:ring-dare-teal/40 ${user.academicDNA?.era === e ? 'bg-dare-teal text-white shadow-md' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'}`}>{e}</button>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Learning Method</label>
                  <button onClick={onOpenMethodCombination} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none focus-visible:ring-4 focus-visible:ring-dare-purple/40 ${isSynergyActive ? 'bg-dare-purple text-white' : 'text-dare-purple hover:bg-dare-purple/10 border border-dare-purple/20'}`}>{isSynergyActive ? '🔬 Synergy Lab: Active' : '🔬 Synergy Lab'}</button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {methods.map(m => (
                    <button key={m} onClick={() => handleUpdateDNA({ method: m })} className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 outline-none focus-visible:ring-4 focus-visible:ring-dare-purple/40 ${!isSynergyActive && user.academicDNA?.method === m ? 'border-dare-purple bg-dare-purple/5 text-dare-purple shadow-md' : 'border-transparent bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'}`}>
                      <div className="flex justify-between items-center">
                        <span>{m}</span>
                        {!isSynergyActive && user.academicDNA?.method === m && <span className="text-[8px] bg-dare-purple text-white px-1.5 py-0.5 rounded uppercase">Active</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <button onClick={onLogout} className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black transition-all text-sm outline-none focus-visible:ring-4 focus-visible:ring-red-500/40">{t('signOut')}</button>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {user.contributorRole && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-left relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-black text-dare-gold">💰</div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('earningsDashboard')}</h3>
               <p className="text-gray-400 dark:text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest">Withdrawal Methods</p>
               
               <div className="grid md:grid-cols-12 gap-10">
                  <div className="md:col-span-4 space-y-4">
                    <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{t('estimatedWeekly')}</p>
                      <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">${user.weeklyStipend} <span className="text-sm font-bold">USD</span></p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <button 
                        onClick={() => setPaymentPrefs({...paymentPrefs, withdrawalMethod: 'bank'})}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all outline-none focus-visible:ring-4 focus-visible:ring-dare-gold/40 ${paymentPrefs.withdrawalMethod === 'bank' ? 'bg-dare-gold text-slate-900 shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-dare-gold border border-gray-100 dark:border-slate-700'}`}
                       >
                         🏦 {t('bankAccount')}
                       </button>
                       <button 
                        onClick={() => setPaymentPrefs({...paymentPrefs, withdrawalMethod: 'wallet'})}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all outline-none focus-visible:ring-4 focus-visible:ring-dare-purple/40 ${paymentPrefs.withdrawalMethod === 'wallet' ? 'bg-dare-purple text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-dare-purple border border-gray-100 dark:border-slate-700'}`}
                       >
                         📱 {t('eWallet')}
                       </button>
                    </div>
                  </div>

                  <div className="md:col-span-8 bg-gray-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700">
                    <div className="space-y-4">
                      {paymentPrefs.withdrawalMethod === 'bank' ? (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">{t('bankName')}</label>
                            <input 
                              value={paymentPrefs.bankName || ''} 
                              onChange={e => setPaymentPrefs({...paymentPrefs, bankName: e.target.value})}
                              placeholder="e.g. Bank of Knowledge" 
                              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-dare-gold rounded-2xl outline-none font-bold text-gray-700 dark:text-white transition-all focus-visible:ring-4 focus-visible:ring-dare-gold/40"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">{t('accountNumber')}</label>
                              <input 
                                value={paymentPrefs.accountNumber || ''} 
                                onChange={e => setPaymentPrefs({...paymentPrefs, accountNumber: e.target.value})}
                                placeholder="1234567890" 
                                className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-dare-gold rounded-2xl outline-none font-bold text-gray-700 dark:text-white transition-all focus-visible:ring-4 focus-visible:ring-dare-gold/40"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">{t('accountHolder')}</label>
                              <input 
                                value={paymentPrefs.accountHolder || ''} 
                                onChange={e => setPaymentPrefs({...paymentPrefs, accountHolder: e.target.value})}
                                placeholder="John Doe" 
                                className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-dare-gold rounded-2xl outline-none font-bold text-gray-700 dark:text-white transition-all focus-visible:ring-4 focus-visible:ring-dare-gold/40"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-fadeIn">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">{t('walletProvider')}</label>
                            <input 
                              value={paymentPrefs.walletProvider || ''} 
                              onChange={e => setPaymentPrefs({...paymentPrefs, walletProvider: e.target.value})}
                              placeholder="e.g. PayPal, GoPay, OVO" 
                              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-dare-purple rounded-2xl outline-none font-bold text-gray-700 dark:text-white transition-all focus-visible:ring-4 focus-visible:ring-dare-purple/40"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">{t('walletNumber')}</label>
                            <input 
                              value={paymentPrefs.walletNumber || ''} 
                              onChange={e => setPaymentPrefs({...paymentPrefs, walletNumber: e.target.value})}
                              placeholder="+62 812-3456-7890" 
                              className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-dare-purple rounded-2xl outline-none font-bold text-gray-700 dark:text-white transition-all focus-visible:ring-4 focus-visible:ring-dare-purple/40"
                            />
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={handleSavePayment}
                        disabled={isSavingPayment}
                        className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-dare-teal/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-dare-teal/40 disabled:opacity-50"
                      >
                        {isSavingPayment ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t('savePaymentInfo')}
                      </button>
                      <p className="text-[9px] text-gray-400 font-bold px-2 text-center italic leading-tight">
                        🔒 {t('paymentSecurity')}
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-left">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">My Progress</h3>
            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest">Mastery Overview</p>
            <RadarChart progress={progress} subjects={SUBJECTS} />
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-left">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-10 border-l-8 border-dare-teal pl-6">Subject Roadmap</h3>
            <div className="space-y-10">
              {SUBJECTS.map(sub => {
                const subProg = progress[sub.id] || { level: 'A', lessonNumber: 1 };
                const currentLevel = subProg.level;
                const currentLesson = subProg.lessonNumber;
                const currentIndex = MASTERY_LEVEL_ORDER.indexOf(currentLevel as any);
                
                return (
                  <div key={sub.id} className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sub.icon}</span>
                        <h4 className="font-black text-lg text-gray-900 dark:text-white">{sub.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-3 py-1 bg-dare-teal text-white rounded-full">Level {currentLevel} • {currentLesson}/12 Chapters</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-hide">
                      {MASTERY_LEVEL_ORDER.map((lvl, idx) => {
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                          <div key={lvl} className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isCompleted ? 'bg-dare-teal text-white' : isCurrent ? 'bg-white dark:bg-slate-800 border-2 border-dare-gold text-dare-gold scale-110 shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>{lvl}</div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
