
import React, { useState } from 'react';
import { User, Language, EducationTrack } from '../types';
import { translations } from '../translations';

interface Props {
  onLogin: (user: User) => void;
  onBack: () => void;
  language: Language;
  initialMode?: 'sign-in' | 'sign-up';
}

const AuthView: React.FC<Props> = ({ onLogin, onBack, language, initialMode = 'sign-in' }) => {
  const [view, setView] = useState<'sign-in' | 'sign-up' | 'forgot-password'>(initialMode);
  const [track, setTrack] = useState<EducationTrack>('Standard');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const calculateAge = (bDay: string) => {
    if (!bDay) return 18;
    const birth = new Date(bDay);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    
    const age = calculateAge(birthDate);
    onLogin({
      name: name || "Scholar",
      username: username || "scholar_1",
      email: email,
      birthDate: birthDate || "2000-01-01",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'seed'}`,
      age: age,
      isMinor: age < 13,
      dailyGoal: 30,
      timeSpentToday: 0,
      contributions: 0,
      streak: 0,
      points: 0,
      badges: [],
      track: track,
      studentNumber: studentNumber,
      institutionName: institutionName,
      xp: 0,
      level: 1,
      rank: 'Scholar'
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to send reset link
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setResetSent(true);
  };

  const tracks: { id: EducationTrack; label: string; cat: 'Indie' | 'Academic' | 'Vocational' }[] = [
    { id: 'Standard', label: 'Independent', cat: 'Indie' },
    { id: 'School', label: 'K-12 School', cat: 'Academic' },
    { id: 'University', label: 'University', cat: 'Academic' },
    { id: 'DistanceSchool', label: 'Distance K-12', cat: 'Academic' },
    { id: 'DistanceUniversity', label: 'Distance Uni', cat: 'Academic' },
    { id: 'VocationalSchool', label: 'Vocational School', cat: 'Vocational' },
    { id: 'VocationalUniversity', label: 'Vocational Uni', cat: 'Vocational' },
    { id: 'DistanceVocationalSchool', label: 'Distance Voc-School', cat: 'Vocational' },
    { id: 'DistanceVocationalUniversity', label: 'Distance Voc-Uni', cat: 'Vocational' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex animate-fadeIn overflow-y-auto">
      <div className="grid lg:grid-cols-2 w-full min-h-screen">
        <div className="hidden lg:flex flex-col justify-center p-12 bg-dare-teal text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-10 text-9xl font-black">DARE</div>
          <div className="relative z-10">
            <h2 className="text-6xl font-black mb-6">Master <br/>Every Skill.</h2>
            <p className="text-xl opacity-90 max-w-md">9 specialized branches covering academic, distance, and vocational mastery 24/7.</p>
          </div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 relative">
          <button onClick={onBack} className="absolute top-8 right-8 text-gray-400 hover:text-dare-teal transition-colors font-black text-xl">✕</button>

          <div className="w-full max-w-md animate-fadeIn">
            {view === 'forgot-password' ? (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-dare-purple/10 text-dare-purple rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">🔐</div>
                  <h2 className="text-4xl font-black dark:text-white mb-2">{t('resetPassword')}</h2>
                  <p className="text-gray-500 font-medium">Enter your email and we'll send you a recovery link.</p>
                </div>

                {resetSent ? (
                  <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 text-center animate-fadeIn">
                    <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg mb-2">Check your inbox!</p>
                    <p className="text-emerald-500/80 text-sm font-bold leading-relaxed">{t('resetLinkSent')}</p>
                    <button 
                      onClick={() => { setView('sign-in'); setResetSent(false); }}
                      className="mt-6 px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">{t('emailAddress')}</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="name@institution.edu" 
                        className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-purple rounded-2xl outline-none dark:text-white font-bold transition-all" 
                        required 
                      />
                    </div>
                    
                    <button 
                      disabled={isSubmitting} 
                      className="w-full py-5 bg-dare-purple text-white rounded-2xl font-black text-xl hover:shadow-xl hover:shadow-dare-purple/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : t('sendResetLink')}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setView('sign-in')}
                      className="w-full py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {t('cancelReturn')}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="mb-10 text-center">
                  <h2 className="text-4xl font-black dark:text-white mb-2">{view === 'sign-up' ? t('joinDarewast') : t('welcomeBack')}</h2>
                  <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Unified Academic Hub</p>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-center">Select Educational Path</p>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-slate-900 p-2 rounded-2xl">
                    {tracks.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setTrack(t.id)}
                        className={`py-2 px-1 rounded-xl text-[8px] font-black uppercase transition-all ${track === t.id ? 'bg-white dark:bg-slate-800 text-dare-teal shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-500'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {['DistanceSchool', 'DistanceVocationalSchool'].includes(track) && (
                    <p className="mt-3 text-[9px] text-rose-500 font-bold text-center italic animate-pulse">Distance schooling recommended for Primary to High School only.</p>
                  )}
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {view === 'sign-up' && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1">{t('fullName')}</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none dark:text-white font-bold transition-all" required />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1">{t('username')}</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none dark:text-white font-bold transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1">{t('emailAddress')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none dark:text-white font-bold transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1">{t('password')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none dark:text-white font-bold transition-all" required />
                  </div>
                  
                  {view === 'sign-in' && (
                    <div className="flex justify-end px-2">
                      <button 
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="text-xs font-black text-dare-teal uppercase tracking-widest hover:underline"
                      >
                        {t('forgotPassword')}
                      </button>
                    </div>
                  )}

                  <button disabled={isSubmitting} className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-xl hover:shadow-xl hover:shadow-dare-teal/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSubmitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : (view === 'sign-up' ? t('signUp') : t('signIn'))}
                  </button>
                </form>

                <p className="text-center text-sm font-bold text-gray-500 mt-8">
                  {view === 'sign-up' ? t('alreadyAccount') : t('noAccount')}{' '}
                  <button onClick={() => setView(view === 'sign-up' ? 'sign-in' : 'sign-up')} className="text-dare-teal font-black hover:underline">
                    {view === 'sign-up' ? t('signIn') : t('signUp')}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
