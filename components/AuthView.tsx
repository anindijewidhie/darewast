
import React, { useState, useEffect } from 'react';
import { User, Language, EducationTrack, DistanceSchoolType, LearningStyle, EducationalStage } from '../types';
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
  const [distanceType, setDistanceType] = useState<DistanceSchoolType>('6-3-3');
  const [degreeDuration, setDegreeDuration] = useState<number>(4);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<LearningStyle>('Unified');
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

  const isAcademicUni = track === 'University' || track === 'DistanceUniversity';

  useEffect(() => {
    if (isAcademicUni) {
      setDegreeDuration(4);
    }
  }, [track, isAcademicUni]);

  const calculateAge = (bDay: string) => {
    if (!bDay) return 18;
    const birth = new Date(bDay);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getStageFromTrack = (track: EducationTrack, age: number): EducationalStage => {
    if (track.includes('University') || age >= 18) return 'University';
    if (age < 6) return 'Preschool';
    if (age < 12) return 'Primary';
    if (age < 15) return 'Middle';
    return 'High';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(birthDate);

    if ((track.includes('University') || track.includes('Uni')) && age < 18) {
      alert(t('under18Restriction'));
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    
    onLogin({
      name: name || "Scholar",
      username: username || "scholar_1",
      email: email,
      birthDate: birthDate || "2000-01-01",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'seed'}`,
      age: age,
      isMinor: age < 18,
      stage: getStageFromTrack(track, age),
      dailyGoal: 30,
      timeSpentToday: 0,
      contributions: 0,
      streak: 0,
      points: 0,
      badges: [],
      track: track,
      distanceSchoolType: track === 'DistanceSchool' ? distanceType : undefined,
      degreeDuration: track.includes('University') ? degreeDuration : undefined,
      studentNumber: studentNumber,
      institutionName: institutionName,
      xp: 0,
      level: 1,
      rank: 'Scholar',
      preferredLearningStyle,
      studyHistory: {}
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setResetSent(true);
    setIsSubmitting(false);
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
    <div className="fixed inset-0 z-[100] bg-dare-paper dark:bg-slate-950 flex animate-fadeIn overflow-y-auto">
      <div className="grid lg:grid-cols-2 w-full min-h-screen">
        <div className="hidden lg:flex flex-col justify-center p-20 bg-dare-teal text-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-10 text-[15rem] font-black">DARE</div>
          <div className="relative z-10 space-y-10">
            <h2 className="text-8xl font-black leading-[0.8] tracking-tighter uppercase font-display">Master <br/>Every <br/>Logic Node.</h2>
            <p className="text-2xl font-bold max-w-md italic opacity-80 leading-relaxed">"A comprehensive 24/7 academic grid designed for universal sovereignty."</p>
            <div className="p-8 bg-white/20 backdrop-blur-md text-slate-950 rounded-[3rem] border-4 border-white/30 shadow-2xl">
               <p className="text-base font-black leading-relaxed">
                 Safe Haven Mode enabled. High-rigor institutional tracks and vocational practical mastery fully supported.
               </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-[120px]"></div>
        </div>

        <div className="flex flex-col items-center justify-center p-12 relative">
          <button onClick={onBack} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all font-black text-3xl">✕</button>

          <div className="w-full max-w-lg bg-dare-gold p-14 rounded-[4.5rem] shadow-2xl border-[6px] border-white/40 animate-fadeIn text-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 pattern-grid opacity-20"></div>
            <div className="relative z-10">
              {view === 'forgot-password' ? (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md text-slate-950 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner border-2 border-white/30">🔐</div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase mb-2 font-display">{t('resetPassword')}</h2>
                    <p className="text-slate-950 opacity-60 font-black uppercase text-[10px] tracking-widest">Mastery Recovery Protocol</p>
                  </div>

                  {resetSent ? (
                    <div className="p-10 bg-white/20 backdrop-blur-md text-slate-950 rounded-[3rem] border-4 border-white/30 text-center animate-fadeIn shadow-2xl">
                      <p className="text-2xl font-black mb-4 uppercase tracking-tighter leading-none font-display">Transmission <br/>Successful</p>
                      <p className="text-sm font-bold opacity-70 leading-relaxed mb-10">{t('resetLinkSent')}</p>
                      <button 
                        onClick={() => { setView('sign-in'); setResetSent(false); }}
                        className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl"
                      >
                        Back to Entrance
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-8">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-[0.4em] ml-6 mb-3">{t('emailAddress')}</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full p-5 bg-white/30 backdrop-blur-md text-slate-950 rounded-3xl outline-none font-black text-lg border-4 border-transparent focus:border-white transition-all shadow-inner placeholder-slate-600" 
                          required 
                        />
                      </div>
                      <button className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl">{t('sendResetLink')}</button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-12 text-center">
                    <h2 className="text-5xl font-black tracking-tighter leading-none uppercase mb-2 font-display">{view === 'sign-up' ? t('joinDarewast') : t('welcomeBack')}</h2>
                    <p className="text-slate-950 opacity-60 font-black uppercase text-[10px] tracking-[0.4em]">Unified Academic Entrance</p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    {view === 'sign-up' && (
                      <div className="bg-white/20 backdrop-blur-md p-2 rounded-[2.5rem] grid grid-cols-3 gap-2 mb-6 border-2 border-white/20">
                        {tracks.slice(0, 3).map(t => (
                          <button key={t.id} type="button" onClick={() => setTrack(t.id)} className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${track === t.id ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-800 hover:bg-white/20'}`}>{t.label}</button>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="SCHOLAR_ID" className="w-full p-5 bg-white/30 backdrop-blur-md text-slate-950 rounded-3xl outline-none font-black text-lg border-4 border-transparent focus:border-white transition-all shadow-inner placeholder-slate-600 uppercase" required />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="EMAIL_TRANSMISSION" className="w-full p-5 bg-white/30 backdrop-blur-md text-slate-950 rounded-3xl outline-none font-black text-lg border-4 border-transparent focus:border-white transition-all shadow-inner placeholder-slate-600 uppercase" required />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="PASS_CODE" className="w-full p-5 bg-white/30 backdrop-blur-md text-slate-950 rounded-3xl outline-none font-black text-lg border-4 border-transparent focus:border-white transition-all shadow-inner placeholder-slate-600 uppercase" required />
                    </div>
                    
                    <button className="w-full py-8 bg-slate-950 text-white rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.2em] hover:scale-[1.03] transition-all shadow-2xl mt-4">
                      {view === 'sign-up' ? 'Initialize' : 'Authorize'}
                    </button>
                  </form>

                  <p className="text-center text-sm font-black text-slate-800 mt-10 uppercase tracking-widest">
                    {view === 'sign-up' ? 'Authorized?' : 'New Node?'}{' '}
                    <button onClick={() => setView(view === 'sign-up' ? 'sign-in' : 'sign-up')} className="text-slate-950 font-black hover:underline underline-offset-4 decoration-4">
                      {view === 'sign-up' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
