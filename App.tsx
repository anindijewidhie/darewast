
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Language, UserProgress, SubjectProgress, View, User, MasteryLevel, Certificate as CertificateType, AccessibilitySettings, LessonContent, EducationTrack, SubjectCategory, TransitionProgram } from './types';
import { SUBJECTS, MASTERY_LEVEL_ORDER, LANGUAGES, LEVEL_METADATA, UNIVERSAL_RICH_MEDIA } from './constants';
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
import ProfileView from './components/ProfileView';
import LessonCombinationView from './components/LessonCombinationView';
import MethodCombinationView from './components/MethodCombinationView';
import ContributorView from './components/ContributorView';
import FastTrackHubView from './components/FastTrackHubView';
import RelearnHubView from './components/RelearnHubView';
import TransitionHubView from './components/TransitionHubView';
import Certificate from './components/Certificate';
import MasteryExamView from './components/MasteryExamView';
import ExamPrepView from './components/ExamPrepView';
import ExamHallView from './components/ExamHallView';
import DonationView from './components/DonationView';
import { generateCustomSubject } from './services/geminiService';

const App: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<Language>('English');
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('darewast-user');
    if (!saved) return 'landing';
    const progress = JSON.parse(localStorage.getItem('darewast-progress') || '{}');
    const firstTrack = (Object.values(progress as UserProgress)[0] as SubjectProgress | undefined)?.track || 'Standard';
    
    if (firstTrack === 'School') return 'school-dashboard';
    if (firstTrack === 'University') return 'university-dashboard';
    if (firstTrack === 'DistanceSchool') return 'distance-school-dashboard';
    if (firstTrack === 'DistanceUniversity') return 'distance-university-dashboard';
    if (firstTrack === 'VocationalSchool') return 'vocational-school-dashboard';
    if (firstTrack === 'VocationalUniversity') return 'vocational-university-dashboard';
    if (firstTrack === 'DistanceVocationalSchool') return 'distance-vocational-school-dashboard';
    if (firstTrack === 'DistanceVocationalUniversity') return 'distance-vocational-university-dashboard';
    return 'dashboard';
  });
  
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
    const baseProgress = SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub.id]: { level: 'A', lessonNumber: 1, track: 'Standard' } }), {});
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

  const handleUpdateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const handleUpdateProgress = (subjectId: string, data: Partial<SubjectProgress>) => {
    setProgress(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], ...data }
    }));
  };

  const handleCreateDynamicSubject = async (query: string, curriculum?: string) => {
    if (!user) return;
    const track = (Object.values(progress) as SubjectProgress[])[0]?.track || 'Standard';
    const metadata = await generateCustomSubject(query, track, selectedLang);
    const newSubject: Subject = {
      id: `dynamic-${Date.now()}`,
      name: metadata.name || query,
      icon: metadata.icon || '📚',
      category: (metadata.category as SubjectCategory) || 'Custom',
      description: metadata.description || 'User-generated lesson module.',
      suggestedSubTopics: metadata.suggestedSubTopics,
      isUserGenerated: true,
      targetCurriculum: curriculum,
      richMediaConfig: UNIVERSAL_RICH_MEDIA
    };
    
    setDynamicSubjects(prev => [...prev, newSubject]);
    handleUpdateProgress(newSubject.id, { level: 'A', lessonNumber: 1, track });
    return newSubject;
  };

  const handleTrackChange = (track: EducationTrack) => {
    const newProgress = { ...progress };
    Object.keys(newProgress).forEach(id => {
      newProgress[id] = { ...newProgress[id], track };
    });
    setProgress(newProgress);
    
    if (track === 'School') setCurrentView('school-dashboard');
    else if (track === 'University') setCurrentView('university-dashboard');
    else if (track === 'DistanceSchool') setCurrentView('distance-school-dashboard');
    else if (track === 'DistanceUniversity') setCurrentView('distance-university-dashboard');
    else if (track === 'VocationalSchool') setCurrentView('vocational-school-dashboard');
    else if (track === 'VocationalUniversity') setCurrentView('vocational-university-dashboard');
    else if (track === 'DistanceVocationalSchool') setCurrentView('distance-vocational-school-dashboard');
    else if (track === 'DistanceVocationalUniversity') setCurrentView('distance-vocational-university-dashboard');
    else setCurrentView('dashboard');
  };

  const handleLessonComplete = (score: number, lessonNum: number, xpEarned: number) => {
    if (!user || !activeSubject) return;
    
    let newXp = user.xp + xpEarned;
    let newLevel = user.level;
    const xpPerLevel = 1000;
    if (newXp >= xpPerLevel) {
      newLevel += Math.floor(newXp / xpPerLevel);
      newXp %= xpPerLevel;
    }

    handleUpdateUser({ xp: newXp, level: newLevel });

    const currentSubjectProgress = progress[activeSubject.id];
    const metadata = LEVEL_METADATA[currentSubjectProgress.level];
    const totalExercises = activeSubject.richMediaConfig?.exercisesPerLesson || 5;

    if (activeLesson?.isRelearn || activeLesson?.isTransition) {
        const tenPointScore = parseFloat(((score / totalExercises) * 10).toFixed(1));
        const cert: CertificateType = {
          userName: user.name,
          subjectName: activeLesson.isTransition ? `${activeSubject.name} (Bridge)` : `${activeSubject.name} (${activeLesson.relearnStage})`,
          level: currentSubjectProgress.level,
          date: new Date().toLocaleDateString(),
          verificationId: activeLesson.isTransition ? `TRANS-BRIDGE-${Date.now()}` : `RELEARN-RESTORE-${Date.now()}`,
          programType: activeLesson.isTransition ? 'transition' : 'relearn',
          score: tenPointScore,
          gradeDescription: getGradeTier(tenPointScore)
        };
        setActiveCertificate(cert);
        setCurrentView('certificate');
        setActiveLesson(null);
        return;
    }

    if (lessonNum < metadata.lessonsCount) {
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
          ...prev[activeSubject.id], 
          lessonNumber: lessonNum + 1,
          lastScore: { ...prev[activeSubject.id].lastScore, correct: score, total: totalExercises }
        }
      }));
    } else {
      setCurrentView('mastery-exam');
    }
  };

  const getGradeTier = (score: number): string => {
    if (score >= 10.0) return translations[selectedLang].gradeSuperior || 'Superior';
    if (score >= 8.0) return translations[selectedLang].gradeUp || 'Up Tier';
    if (score >= 6.0) return translations[selectedLang].gradeUpperMiddle || 'Upper Middle Tier';
    if (score >= 4.0) return translations[selectedLang].gradeMiddle || 'Middle Tier';
    if (score >= 2.0) return translations[selectedLang].gradeLowerMiddle || 'Lower Middle Tier';
    return translations[selectedLang].gradeLow || 'Low Tier';
  };

  const handleExamComplete = (score: number, total: number) => {
    if (!user || !activeSubject) return;
    
    const tenPointScore = parseFloat(((score / total) * 10).toFixed(1));
    const gradeTier = getGradeTier(tenPointScore);
    const passThreshold = 6.0;

    const currentSubjectProgress = progress[activeSubject.id];

    const cert: CertificateType = {
      userName: user.name,
      subjectName: activeSubject.name,
      level: currentSubjectProgress.level,
      date: new Date().toLocaleDateString(),
      verificationId: `DARE-CERT-${Date.now()}`,
      programType: currentSubjectProgress.isFastTrack ? 'fast-track' : 'regular',
      score: tenPointScore,
      gradeDescription: gradeTier
    };
    
    setActiveCertificate(cert);

    if (tenPointScore >= passThreshold) {
      const currentIndex = MASTERY_LEVEL_ORDER.indexOf(currentSubjectProgress.level);
      if (currentIndex < MASTERY_LEVEL_ORDER.length - 1) {
        const nextLevel = MASTERY_LEVEL_ORDER[currentIndex + 1];
        setProgress(prev => ({
          ...prev,
          [activeSubject.id]: { 
            ...prev[activeSubject.id], 
            level: nextLevel, 
            lessonNumber: 1,
            lastScore: { correct: score, total: total, tenPointScale: tenPointScore, gradeTier: gradeTier }
          }
        }));
      }
      setCurrentView('certificate');
    } else {
      alert(`Final Score: ${tenPointScore}/10 (${gradeTier}). Mastery gap detected. Progress requires ≥ 6.0.`);
      setCurrentView('dashboard');
    }
  };

  const getActiveDashboard = () => {
    const dashboardProps = {
        user: user!,
        progress,
        language: selectedLang,
        onStartLesson: (s: Subject) => { setActiveSubject(s); setCurrentView('lesson'); },
        onStartPrep: (s: Subject) => { setActiveSubject(s); setCurrentView('exam-prep'); },
        onUpdateUser: handleUpdateUser,
        onUpdateProgress: handleUpdateProgress,
        onTrackChange: handleTrackChange,
        onBackToStandard: () => setCurrentView('dashboard'),
        dynamicSubjects,
        onCreateSubject: handleCreateDynamicSubject,
        onOpenPlacement: (s: Subject) => { setActiveSubject(s); setCurrentView('subject-placement'); },
        onOpenAssessment: (s: Subject) => { setActiveSubject(s); setCurrentView('subject-assessment'); },
        onOpenFastTrack: () => setCurrentView('fast-track-hub'),
        onOpenRelearn: () => setCurrentView('relearn-hub'),
        onOpenTransition: () => setCurrentView('transition-hub')
    };

    switch (currentView) {
      case 'school-dashboard':
        return <SchoolDashboardView {...dashboardProps} />;
      case 'university-dashboard':
        return <UniversityDashboardView {...dashboardProps} />;
      case 'distance-school-dashboard':
        return <DistanceSchoolDashboardView {...dashboardProps} />;
      case 'distance-university-dashboard':
        return <DistanceUniversityDashboardView {...dashboardProps} />;
      case 'vocational-school-dashboard':
      case 'vocational-university-dashboard':
      case 'distance-vocational-school-dashboard':
      case 'distance-vocational-university-dashboard':
        return <VocationalDashboardView track={progress[Object.keys(progress)[0]]?.track || 'VocationalSchool'} {...dashboardProps} />;
      default:
        return <DashboardView 
                  {...dashboardProps} 
                  onStartExam={(s) => { setActiveSubject(s); setCurrentView('mastery-exam'); }} 
                  onLogout={() => { setUser(null); setCurrentView('landing'); }} 
                  onOpenConverter={() => setCurrentView('grade-converter')} 
                  onOpenPlacementGlobal={() => setCurrentView('placement-test')} 
                  onOpenCombination={() => setCurrentView('lesson-combination')} 
                  onOpenLeaderboard={() => {}} 
                  onOpenExamHall={() => setCurrentView('exam-hall')}
                />;
    }
  };

  const t = (key: string) => translations[selectedLang][key] || translations['English'][key] || key;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      <nav className="px-2 py-3 md:px-8 md:py-6 flex justify-between items-center sticky top-0 z-[100] backdrop-blur-2xl border-b border-white/10">
        <div className="flex items-center gap-1.5 md:gap-4 cursor-pointer group" onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-dare-teal rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-base md:text-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-dare-teal/20">d</div>
          <span className="text-lg md:text-3xl font-black tracking-tighter">darewast</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <button 
            onClick={() => setCurrentView('donation')}
            className="px-2 py-2 md:px-4 md:py-2 bg-dare-gold/10 text-dare-gold rounded-xl font-black text-[7px] md:text-[10px] uppercase tracking-widest border border-dare-gold/20 hover:bg-dare-gold hover:text-white transition-all shadow-sm flex items-center gap-1 md:gap-2"
          >
            <span className="hidden xs:inline">💖</span> {t('donate')}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 md:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm md:text-xl"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <div className="relative group">
            <select 
              value={selectedLang} 
              onChange={e => setSelectedLang(e.target.value as Language)} 
              className="bg-white/5 border border-white/10 rounded-xl px-1.5 py-2 md:px-4 md:py-2 text-[8px] md:text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white/10 transition-all focus:ring-2 focus:ring-dare-teal/50 appearance-none pr-4 md:pr-8"
            >
              {LANGUAGES.map(l => <option key={l} value={l} className="dark:bg-slate-900 text-slate-900 dark:text-white">{l}</option>)}
            </select>
            <div className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] md:text-[10px] opacity-40">▼</div>
          </div>
          
          {user ? (
            <button onClick={() => setCurrentView('profile')} className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden border-2 border-dare-teal shadow-xl hover:scale-105 transition-all">
              <img src={user.avatar} alt="User" />
            </button>
          ) : (
            <button onClick={() => setCurrentView('auth')} className="px-3 py-2 md:px-8 md:py-3 bg-dare-teal text-white rounded-xl md:rounded-2xl font-black text-[8px] md:text-xs uppercase tracking-widest shadow-lg shadow-dare-teal/20">{t('signIn')}</button>
          )}
        </div>
      </nav>

      <main className="p-3 md:p-8">
        {currentView === 'landing' && <LandingView language={selectedLang} onJoin={() => setCurrentView('auth')} onPlacementTest={() => setCurrentView('placement-test')} onOpenConverter={() => setCurrentView('grade-converter')} onDashboard={() => setCurrentView('dashboard')} onDonate={() => setCurrentView('donation')} onContribute={() => setCurrentView('contributor')} />}
        {currentView === 'auth' && <AuthView language={selectedLang} onLogin={u => { setUser(u); handleTrackChange(u.track || 'Standard'); }} onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />}
        
        {user && ['dashboard', 'school-dashboard', 'university-dashboard', 'distance-school-dashboard', 'distance-university-dashboard', 'vocational-school-dashboard', 'vocational-university-dashboard', 'distance-vocational-school-dashboard', 'distance-vocational-university-dashboard'].includes(currentView) && getActiveDashboard()}

        {currentView === 'lesson' && user && <LessonView subject={activeSubject!} language={selectedLang} level={progress[activeSubject!.id].level} lessonNumber={progress[activeSubject!.id].lessonNumber} user={user} progress={progress} initialLesson={activeLesson} onComplete={handleLessonComplete} onBack={() => { handleTrackChange(progress[activeSubject!.id].track || 'Standard'); setActiveLesson(null); }} onUpdateUser={handleUpdateUser} onUpdateProgress={handleUpdateProgress} />}
        {currentView === 'profile' && user && <ProfileView user={user} progress={progress} language={selectedLang} onLogout={() => { setUser(null); setCurrentView('landing'); }} onBack={() => setCurrentView('dashboard')} onUpdateGoal={g => handleUpdateUser({ dailyGoal: g })} onUpdateUser={handleUpdateUser} onOpenConverter={() => setCurrentView('grade-converter')} onOpenGuardianReport={() => {}} onOpenAccessibility={() => setCurrentView('accessibility')} onOpenMethodCombination={() => setCurrentView('method-combination')} />}
        
        {(currentView === 'placement-test' || currentView === 'subject-placement' || currentView === 'subject-assessment' || currentView === 'relearn-placement') && (
            <PlacementTestView 
                language={selectedLang} 
                user={user} 
                subject={activeSubject || undefined}
                testType={currentView === 'relearn-placement' ? 'relearn' : (currentView === 'subject-assessment' ? 'assessment' : 'placement')}
                onCancel={() => handleTrackChange((Object.values(progress)[0] as SubjectProgress).track || 'Standard')} 
                onComplete={p => { 
                    const merged = { ...progress, ...p };
                    setProgress(merged); 
                    handleTrackChange((Object.values(merged)[0] as SubjectProgress).track || 'Standard'); 
                }} 
            />
        )}
        
        {currentView === 'fast-track-hub' && user && (
          <FastTrackHubView 
            user={user} 
            progress={progress} 
            language={selectedLang} 
            onBack={() => handleTrackChange((Object.values(progress)[0] as SubjectProgress).track || 'Standard')} 
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {currentView === 'relearn-hub' && user && (
          <RelearnHubView 
            user={user} 
            language={selectedLang} 
            onBack={() => handleTrackChange((Object.values(progress)[0] as SubjectProgress).track || 'Standard')} 
            onLaunchRelearn={(lesson) => { setActiveLesson(lesson); setCurrentView('lesson'); }}
            onOpenRelearnPlacement={() => setCurrentView('relearn-placement')}
          />
        )}

        {currentView === 'transition-hub' && user && (
          <TransitionHubView 
            user={user} 
            language={selectedLang} 
            onBack={() => setCurrentView('dashboard')}
            onEnroll={(program) => handleUpdateUser({ transitionProgram: program })}
            onStartLesson={(sub, isTrans) => { setActiveSubject(sub); setActiveLesson({ isTransition: isTrans } as any); setCurrentView('lesson'); }}
          />
        )}

        {currentView === 'mastery-exam' && user && activeSubject && (
          <MasteryExamView 
            subject={activeSubject}
            language={selectedLang}
            level={progress[activeSubject.id].level}
            user={user}
            onComplete={handleExamComplete}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'exam-prep' && user && activeSubject && (
          <ExamPrepView 
            subject={activeSubject}
            language={selectedLang}
            user={user}
            onComplete={() => setCurrentView('dashboard')}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'exam-hall' && user && (
          <ExamHallView 
            user={user}
            progress={progress}
            language={selectedLang}
            onStartExam={(s) => { setActiveSubject(s); setCurrentView('mastery-exam'); }}
            onStartPrep={(s) => { setActiveSubject(s); setCurrentView('exam-prep'); }}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'certificate' && activeCertificate && (
          <Certificate 
            certificate={activeCertificate} 
            language={selectedLang} 
            onClose={() => setCurrentView('dashboard')}
          />
        )}
        
        {currentView === 'grade-converter' && <GradeConverterView language={selectedLang} onBack={() => setCurrentView('dashboard')} onApply={(lvl) => { Object.keys(progress).forEach(id => handleUpdateProgress(id, { level: lvl })); setCurrentView('dashboard'); }} />}

        {currentView === 'donation' && <DonationView language={selectedLang} onBack={() => setCurrentView(user ? 'dashboard' : 'landing')} />}
      </main>
    </div>
  );
};

export default App;
