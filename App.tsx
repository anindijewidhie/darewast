
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Subject, Language, UserProgress, SubjectProgress, View, User, MasteryLevel, Certificate as CertificateType, LessonContent, EducationTrack, SubjectCategory, EducationalStage } from './types';
import { SUBJECTS, MASTERY_LEVEL_ORDER, LEVEL_METADATA, UNIVERSAL_RICH_MEDIA, USAGE_LIMITS } from './constants';
import { translations } from './translations';
import LessonView from './components/LessonView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import SchoolDashboardView from './components/SchoolDashboardView';
import UniversityDashboardView from './components/UniversityDashboardView';
import DistanceSchoolDashboardView from './components/DistanceSchoolDashboardView';
import DistanceUniversityDashboardView from './components/DistanceUniversityDashboardView';
import VocationalDashboardView from './components/VocationalDashboardView';
import LandingView from './components/LandingView';
import GradeConverterView from './components/GradeConverterView';
import PlacementTestView from './components/PlacementTestView';
import DiagnosticGateView from './components/DiagnosticGateView';
import ProfileView from './components/ProfileView';
import LessonCombinationView from './components/LessonCombinationView';
import MethodCombinationView from './components/MethodCombinationView';
import SpecializationModal from './components/SpecializationModal';
import FastTrackHubView from './components/FastTrackHubView';
import RelearnHubView from './components/RelearnHubView';
import TransitionHubView from './components/TransitionHubView';
import CreditTransferView from './components/CreditTransferView';
import WeekendEnrichmentHub from './components/WeekendEnrichmentHub';
import Certificate from './components/Certificate';
import ExamPrepView from './components/ExamPrepView';
import ExamHallView from './components/ExamHallView';
import DonationView from './components/DonationView';
import ContributorView from './components/ContributorView';
import LevelCompletionHub from './components/LevelCompletionHub';
import AccessibilityView from './components/AccessibilityView';
import LanguageSelector from './components/LanguageSelector';
import MasteryExamView from './components/MasteryExamView';
import HandwritingHubView from './components/HandwritingHubView';
import GuardianReportView from './components/GuardianReportView';
import { generateCustomSubject } from './services/geminiService';

const AppInternal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang, setSelectedLang] = useState<Language>('English');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('darewast-user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('darewast-dynamic-subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('darewast-progress');
    const baseProgress = SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub.id]: { level: 'A', lessonNumber: 1, track: 'Standard', isPlaced: false, dailyMinutesSpent: 0 } }), {});
    return saved ? { ...baseProgress, ...JSON.parse(saved) } : baseProgress;
  });

  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<CertificateType | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darewast-darkmode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (user) localStorage.setItem('darewast-user', JSON.stringify(user));
    else localStorage.removeItem('darewast-user');
    localStorage.setItem('darewast-progress', JSON.stringify(progress));
    localStorage.setItem('darewast-dynamic-subjects', JSON.stringify(dynamicSubjects));
    localStorage.setItem('darewast-darkmode', JSON.stringify(darkMode));
  }, [user, progress, dynamicSubjects, darkMode]);

  const handleUpdateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const handleUpdateProgress = useCallback((subjectId: string, data: Partial<SubjectProgress>) => {
    setProgress(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], ...data }
    }));
  }, []);

  const checkUsageLimit = useCallback((subjectId: string) => {
    if (!user || !user.stage) return true;
    const limit = USAGE_LIMITS[user.stage];
    const subjectProgress = progress[subjectId];
    if (subjectProgress && (subjectProgress.dailyMinutesSpent || 0) >= limit) {
      alert(`Daily learning quota of ${limit} minutes reached for ${activeSubject?.name || 'this subject'} (${user.stage} Mode). Quotas are enforced per subject to ensure health-balanced mastery.`);
      return false;
    }
    return true;
  }, [user, progress, activeSubject]);

  const handleTrackChange = useCallback((track: EducationTrack) => {
    const newProgress = { ...progress };
    Object.keys(newProgress).forEach(id => {
      newProgress[id] = { ...newProgress[id], track };
    });
    setProgress(newProgress);
    handleUpdateUser({ track });
    navigate('/dashboard');
  }, [progress, handleUpdateUser, navigate]);

  const handleCreateDynamicSubject = useCallback(async (query: string, curriculum?: string) => {
    try {
      const res = await generateCustomSubject(query, user?.track || 'Standard', selectedLang);
      const newSubject: Subject = {
        id: `dynamic-${Date.now()}`,
        name: res.name || query,
        category: (res.category as SubjectCategory) || 'Custom',
        icon: res.icon || '📚',
        description: res.description || '',
        explanation: res.explanation || res.description || '',
        suggestedSubTopics: res.subtopics || [],
        isUserGenerated: true,
        targetCurriculum: curriculum,
        richMediaConfig: UNIVERSAL_RICH_MEDIA
      };
      setDynamicSubjects(prev => [...prev, newSubject]);
      return newSubject;
    } catch (e) {
      console.error("Failed to create dynamic subject", e);
      return undefined;
    }
  }, [user?.track, selectedLang]);

  const handleStartLesson = (sub: Subject, isTrans: boolean = false) => {
    if (!checkUsageLimit(sub.id)) return;
    const subProg = progress[sub.id];
    setActiveSubject(sub);
    if (!subProg?.isPlaced && !isTrans) { navigate('/diagnostic-gate'); return; }
    setActiveLesson(isTrans ? ({ isTransition: true } as any) : null);
    navigate('/lesson');
  };

  const handleLessonComplete = (score: number, lessonNum: number, xpEarned: number) => {
    if (!user || !activeSubject) return;
    const totalExercises = activeSubject.richMediaConfig?.exercisesPerLesson || 4;
    const skillPoints = Math.round((score / totalExercises) * 100);
    const currentSubjectProgress = progress[activeSubject.id];
    const metadata = LEVEL_METADATA[currentSubjectProgress.level];

    // Simulate roughly 15 mins spent per lesson node completion
    const lessonTimeSpent = 15;
    const newTotalTime = (user.timeSpentToday || 0) + lessonTimeSpent;
    const newSubjectTime = (currentSubjectProgress.dailyMinutesSpent || 0) + lessonTimeSpent;

    if (lessonNum < metadata.chaptersCount) {
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
          ...prev[activeSubject.id], 
          lessonNumber: lessonNum + 1,
          dailyMinutesSpent: newSubjectTime,
          lastScore: { correct: score, total: totalExercises, skillPoints: skillPoints }
        }
      }));
      handleUpdateUser({ xp: (user.xp || 0) + xpEarned, timeSpentToday: newTotalTime });
      navigate('/dashboard');
    } else {
      handleUpdateUser({ timeSpentToday: newTotalTime });
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
            ...prev[activeSubject.id], 
            dailyMinutesSpent: newSubjectTime 
        }
      }));
      navigate('/level-completion-hub');
    }
  };

  const handleExamComplete = (score: number, total: number) => {
    if (!user || !activeSubject) return;
    const skillPoints = Math.round((score / total) * 100);
    const passThreshold = 60; 
    
    // Simulate 30 mins spent for exam hall session
    const examTimeSpent = 30;
    const newTotalTime = (user.timeSpentToday || 0) + examTimeSpent;
    const currentSubjectProgress = progress[activeSubject.id];
    const newSubjectTime = (currentSubjectProgress.dailyMinutesSpent || 0) + examTimeSpent;

    if (skillPoints >= passThreshold) {
      const currentIndex = MASTERY_LEVEL_ORDER.indexOf(currentSubjectProgress.level);
      const nextLevel = currentIndex < MASTERY_LEVEL_ORDER.length - 1 ? MASTERY_LEVEL_ORDER[currentIndex + 1] : currentSubjectProgress.level;
      
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
          ...prev[activeSubject.id], 
          level: nextLevel as MasteryLevel, 
          lessonNumber: 1,
          dailyMinutesSpent: newSubjectTime,
          lastScore: { correct: score, total: total, skillPoints: skillPoints }
        }
      }));
      
      const cert: CertificateType = {
        subjectName: activeSubject.name,
        level: currentSubjectProgress.level,
        date: new Date().toLocaleDateString(),
        userName: user.name,
        verificationId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        programType: 'regular',
        score: skillPoints,
        gradeDescription: skillPoints >= 90 ? 'Superior Mastery' : (skillPoints >= 75 ? 'Distinction' : 'Credit')
      };
      
      setActiveCertificate(cert);
      handleUpdateUser({ timeSpentToday: newTotalTime });
      navigate('/certificate');
    } else {
      alert(`Mastery Verification Unsuccessful. Skill Point Index: ${skillPoints} SP. The minimum passing threshold is 60 SP.`);
      handleUpdateUser({ timeSpentToday: newTotalTime });
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
            ...prev[activeSubject.id], 
            dailyMinutesSpent: newSubjectTime 
        }
      }));
      navigate('/dashboard');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-[#FDFCFB] text-slate-900'} transition-colors duration-700 selection:bg-dare-teal/30`} style={{ fontSize: user?.accessibility?.textScale ? `${user.accessibility.textScale}rem` : '1rem' }}>
      {!user?.accessibility?.focusMode && (
        <nav className="px-4 py-4 md:px-12 md:py-8 flex justify-between items-center sticky top-0 z-[100] backdrop-blur-2xl border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer group" onClick={() => navigate(user ? '/dashboard' : '/')}>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-dare-teal rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl md:text-3xl group-hover:rotate-12 transition-all shadow-xl shadow-dare-teal/20 border-2 border-white/30">d</div>
            <span className="text-xl md:text-4xl font-black tracking-tighter font-display text-slate-900 dark:text-white">darewast</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 mr-2 border-r border-black/5 dark:border-white/10 pr-4">
               {user && (
                 <button onClick={() => navigate('/dashboard')} className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${location.pathname === '/dashboard' ? 'bg-dare-teal text-slate-950 shadow-xl border-2 border-white/20' : 'text-dare-teal hover:bg-dare-teal/10'}`}>Dashboard</button>
               )}
               <button onClick={() => navigate('/donate')} className="px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-dare-gold hover:bg-dare-gold/10 transition-all">Donate</button>
               <button onClick={() => navigate('/contribute')} className="px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-dare-purple hover:bg-dare-purple/10 transition-all">Contribute</button>
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-3 md:p-4 rounded-2xl bg-white/20 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:scale-110 transition-all text-lg md:text-2xl shadow-inner"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <LanguageSelector selected={selectedLang} onSelect={setSelectedLang} />
            {user ? (
              <button onClick={() => navigate('/profile')} className="w-10 h-10 md:w-14 md:h-14 rounded-2xl overflow-hidden border-2 border-dare-teal shadow-2xl hover:scale-105 transition-transform">
                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="px-6 py-3 md:px-10 md:py-4 bg-dare-teal text-slate-950 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest shadow-2xl border-2 border-white/30 hover:scale-105 active:scale-95 transition-all">Sign In</button>
            )}
          </div>
        </nav>
      )}

      <main className="px-4 py-6 md:px-8 md:py-12 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<LandingView language={selectedLang} onJoin={() => navigate('/auth')} onPlacementTest={() => navigate('/placement')} onOpenConverter={() => navigate('/grade-converter')} onDashboard={() => navigate('/dashboard')} onDonate={() => navigate('/donate')} onContribute={() => navigate('/contribute')} />} />
          <Route path="/auth" element={<AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/dashboard'); }} onBack={() => navigate(user ? '/dashboard' : '/')} />} />
          <Route path="/donate" element={<DonationView language={selectedLang} onBack={() => navigate(user ? '/dashboard' : '/')} />} />
          <Route path="/contribute" element={user ? <ContributorView user={user} language={selectedLang} onBack={() => navigate('/dashboard')} onSuccess={() => { handleUpdateUser({ contributions: (user.contributions || 0) + 1 }); navigate('/dashboard'); }} onUpdateUser={handleUpdateUser} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/contribute'); }} onBack={() => navigate('/')} />} />
          <Route path="/dashboard" element={user ? (
            user.track === 'School' ? <SchoolDashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onBackToStandard={() => handleTrackChange('Standard')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenSpecialization={() => {}} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} /> :
            user.track === 'University' ? <UniversityDashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onBackToStandard={() => handleTrackChange('Standard')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenSpecialization={() => {}} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} /> :
            user.track === 'DistanceSchool' ? <DistanceSchoolDashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onBackToStandard={() => handleTrackChange('Standard')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenSpecialization={() => {}} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} /> :
            user.track === 'DistanceUniversity' ? <DistanceUniversityDashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onBackToStandard={() => handleTrackChange('Standard')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenSpecialization={() => {}} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} /> :
            user.track?.includes('Vocational') ? <VocationalDashboardView track={user.track} user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onBackToStandard={() => handleTrackChange('Standard')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenSpecialization={() => {}} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} /> :
            <DashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartExam={handleExamComplete as any} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onLogout={() => setUser(null)} onOpenConverter={() => navigate('/grade-converter')} onOpenPlacementGlobal={() => navigate('/placement')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenCombination={() => navigate('/lesson-combination')} onOpenLeaderboard={() => {}} onOpenFastTrack={() => navigate('/fast-track-hub')} onOpenExamHall={() => navigate('/exam-hall')} onOpenRelearn={() => navigate('/relearn-hub')} onOpenTransition={() => navigate('/transition-hub')} onOpenCreditTransfer={() => navigate('/credit-transfer')} onOpenSpecialization={() => {}} onOpenHandwriting={() => navigate('/handwriting-hub')} onOpenGuardianReport={() => navigate('/guardian-report')} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} />
          ) : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/dashboard'); }} onBack={() => navigate('/')} />} />
          <Route path="/guardian-report" element={user ? <GuardianReportView user={user} progress={progress} language={selectedLang} onBack={() => navigate('/dashboard')} onSent={() => navigate('/dashboard')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/guardian-report'); }} onBack={() => navigate('/')} />} />
          <Route path="/lesson" element={user ? <LessonView subject={activeSubject!} language={selectedLang} level={progress[activeSubject!.id].level} lessonNumber={progress[activeSubject!.id].lessonNumber} user={user} progress={progress} initialLesson={activeLesson} onComplete={handleLessonComplete} onBack={() => navigate('/dashboard')} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/lesson'); }} onBack={() => navigate('/')} />} />
          <Route path="/profile" element={user ? <ProfileView user={user} progress={progress} language={selectedLang} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onLogout={() => { setUser(null); navigate('/'); }} onBack={() => navigate('/dashboard')} onUpdateGoal={g => handleUpdateUser({ dailyGoal: g })} onUpdateUser={handleUpdateUser} onOpenConverter={() => navigate('/grade-converter')} onOpenGuardianReport={() => navigate('/guardian-report')} onOpenAccessibility={() => navigate('/accessibility')} onOpenMethodCombination={() => navigate('/method-combination')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/profile'); }} onBack={() => navigate('/')} />} />
          <Route path="/accessibility" element={user ? <AccessibilityView user={user} language={selectedLang} onBack={() => navigate('/profile')} onUpdate={handleUpdateUser} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/accessibility'); }} onBack={() => navigate('/')} />} />
          <Route path="/placement" element={<PlacementTestView language={selectedLang} user={user} onComplete={(p) => { Object.keys(p).forEach(id => handleUpdateProgress(id, p[id])); navigate('/dashboard'); }} onCancel={() => navigate('/dashboard')} />} />
          <Route path="/grade-converter" element={<GradeConverterView language={selectedLang} onBack={() => navigate('/dashboard')} onApply={(lvl) => { navigate('/dashboard'); }} />} />
          <Route path="/exam-hall" element={user ? (checkUsageLimit('general') ? <ExamHallView user={user} progress={progress} language={selectedLang} onBack={() => navigate('/dashboard')} onStartExam={sub => { setActiveSubject(sub); navigate('/mastery-exam'); }} onStartPrep={() => {}} /> : <DashboardView user={user} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartExam={handleExamComplete as any} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onLogout={() => setUser(null)} onOpenConverter={() => navigate('/grade-converter')} onOpenPlacementGlobal={() => navigate('/placement')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenCombination={() => navigate('/lesson-combination')} onOpenLeaderboard={() => {}} onOpenFastTrack={() => navigate('/fast-track-hub')} onOpenExamHall={() => navigate('/exam-hall')} onOpenRelearn={() => navigate('/relearn-hub')} onOpenTransition={() => navigate('/transition-hub')} onOpenCreditTransfer={() => navigate('/credit-transfer')} onOpenSpecialization={() => {}} onOpenHandwriting={() => navigate('/handwriting-hub')} onOpenGuardianReport={() => navigate('/guardian-report')} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} />) : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/exam-hall'); }} onBack={() => navigate('/')} />} />
          <Route path="/mastery-exam" element={user && activeSubject ? <MasteryExamView subject={activeSubject} language={selectedLang} level={progress[activeSubject.id].level} user={user} progress={progress} onComplete={handleExamComplete} onBack={() => navigate('/exam-hall')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/exam-hall'); }} onBack={() => navigate('/')} />} />
          <Route path="/handwriting-hub" element={user ? <HandwritingHubView user={user} language={selectedLang} onBack={() => navigate('/dashboard')} onUpdateUser={handleUpdateUser} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/handwriting-hub'); }} onBack={() => navigate('/')} />} />
          <Route path="/lesson-combination" element={user ? <LessonCombinationView user={user} language={selectedLang} onBack={() => navigate('/dashboard')} onLaunch={(l) => { setActiveLesson(l); navigate('/lesson'); }} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/lesson-combination'); }} onBack={() => navigate('/')} />} />
          <Route path="/method-combination" element={user ? <MethodCombinationView user={user} language={selectedLang} onBack={() => navigate('/profile')} onApply={(m) => { handleUpdateUser({ academicDNA: { ...user.academicDNA!, hybridMethods: m } }); navigate('/profile'); }} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/method-combination'); }} onBack={() => navigate('/')} />} />
          <Route path="/fast-track-hub" element={user ? <FastTrackHubView user={user} progress={progress} language={selectedLang} onBack={() => navigate('/dashboard')} onUpdateProgress={handleUpdateProgress} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/fast-track-hub'); }} onBack={() => navigate('/')} />} />
          <Route path="/relearn-hub" element={user ? <RelearnHubView user={user} language={selectedLang} onBack={() => navigate('/dashboard')} onLaunchRelearn={(l) => { setActiveLesson(l); navigate('/lesson'); }} onOpenRelearnPlacement={() => navigate('/placement')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/relearn-hub'); }} onBack={() => navigate('/')} />} />
          <Route path="/transition-hub" element={user ? <TransitionHubView user={user} language={selectedLang} onBack={() => navigate('/dashboard')} onEnroll={(p) => handleUpdateUser({ transitionProgram: p })} onStartLesson={handleStartLesson} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/transition-hub'); }} onBack={() => navigate('/')} />} />
          <Route path="/credit-transfer" element={user ? <CreditTransferView user={user} progress={progress} language={selectedLang} onBack={() => navigate('/dashboard')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/credit-transfer'); }} onBack={() => navigate('/')} />} />
          <Route path="/level-completion-hub" element={user && activeSubject ? <LevelCompletionHub subject={activeSubject} language={selectedLang} level={progress[activeSubject.id].level} user={user} onComplete={handleExamComplete} onBack={() => navigate('/dashboard')} /> : <AuthView language={selectedLang} onLogin={u => { setUser(u); navigate('/dashboard'); }} onBack={() => navigate('/')} />} />
          <Route path="/certificate" element={activeCertificate ? <Certificate certificate={activeCertificate} language={selectedLang} onClose={() => { setActiveCertificate(null); navigate('/dashboard'); }} /> : <DashboardView user={user!} progress={progress} language={selectedLang} onStartLesson={handleStartLesson} onStartExam={handleExamComplete as any} onStartPrep={() => {}} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} onTrackChange={handleTrackChange} onLogout={() => setUser(null)} onOpenConverter={() => navigate('/grade-converter')} onOpenPlacementGlobal={() => navigate('/placement')} onOpenPlacement={() => {}} onOpenAssessment={() => {}} onOpenCombination={() => navigate('/lesson-combination')} onOpenLeaderboard={() => {}} onOpenFastTrack={() => navigate('/fast-track-hub')} onOpenExamHall={() => navigate('/exam-hall')} onOpenRelearn={() => navigate('/relearn-hub')} onOpenTransition={() => navigate('/transition-hub')} onOpenCreditTransfer={() => navigate('/credit-transfer')} onOpenSpecialization={() => {}} onOpenHandwriting={() => navigate('/handwriting-hub')} onOpenGuardianReport={() => navigate('/guardian-report')} dynamicSubjects={dynamicSubjects} onCreateSubject={handleCreateDynamicSubject} />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppInternal />
    </HashRouter>
  );
};

export default App;
