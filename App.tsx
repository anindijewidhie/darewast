
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
import SpecializationModal from './components/SpecializationModal';
import ContributorView from './components/ContributorView';
import FastTrackHubView from './components/FastTrackHubView';
import RelearnHubView from './components/RelearnHubView';
import TransitionHubView from './components/TransitionHubView';
import CreditTransferView from './components/CreditTransferView';
import WeekendEnrichmentHub from './components/WeekendEnrichmentHub';
import Certificate from './components/Certificate';
import MasteryExamView from './components/MasteryExamView';
import ExamPrepView from './components/ExamPrepView';
import ExamHallView from './components/ExamHallView';
import DonationView from './components/DonationView';
import LevelCompletionHub from './components/LevelCompletionHub';
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
  const [isSpecializationModalOpen, setIsSpecializationModalOpen] = useState(false);
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

  const handleTrackChange = (track: EducationTrack) => {
    const newProgress = { ...progress };
    Object.keys(newProgress).forEach(id => {
      newProgress[id] = { ...newProgress[id], track };
    });
    setProgress(newProgress);
    handleUpdateUser({ track });
    
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

  const handleCreateDynamicSubject = async (query: string, curriculum?: string) => {
    if (!user) return undefined;
    try {
      const data = await generateCustomSubject(query, user.track || 'Standard', selectedLang);
      const newSub: Subject = {
        id: `custom-${Date.now()}`,
        name: data.name || query,
        category: (data.category as SubjectCategory) || 'Custom',
        icon: data.icon || '📚',
        description: data.description || 'Custom generated subject',
        suggestedSubTopics: data.subtopics || [],
        isUserGenerated: true,
        targetCurriculum: curriculum || data.targetCurriculum,
        richMediaConfig: UNIVERSAL_RICH_MEDIA
      };
      
      setDynamicSubjects(prev => [...prev, newSub]);
      
      setProgress(prev => ({
        ...prev,
        [newSub.id]: { 
          level: 'A', 
          lessonNumber: 1, 
          track: user.track || 'Standard' 
        }
      }));

      return newSub;
    } catch (err) {
      console.error("Custom Subject Synthesis Error:", err);
      return undefined;
    }
  };

  const handleStartLesson = (sub: Subject, isTrans: boolean = false) => {
    const day = new Date().getDay();
    const activeDays = user?.masterySchedule?.activeDays || [1, 2, 3, 4, 5];
    const isStudyDay = activeDays.includes(day);

    setActiveSubject(sub);
    
    if (!isStudyDay) {
        setCurrentView('weekend-enrichment' as any);
    } else {
        setActiveLesson(isTrans ? ({ isTransition: true } as any) : null);
        setCurrentView('lesson');
    }
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
    const totalExercises = activeSubject.richMediaConfig?.exercisesPerLesson || 4;

    const skillPoints = Math.round((score / totalExercises) * 100);

    if (activeLesson?.isRelearn || activeLesson?.isTransition) {
        const cert: CertificateType = {
          userName: user.name,
          subjectName: activeLesson.isTransition ? `${activeSubject.name} (Bridge)` : `${activeSubject.name} (${activeLesson.relearnStage})`,
          level: currentSubjectProgress.level,
          date: new Date().toLocaleDateString(),
          verificationId: activeLesson.isTransition ? `TRANS-BRIDGE-${Date.now()}` : `RELEARN-RESTORE-${Date.now()}`,
          programType: activeLesson.isTransition ? 'transition' : 'relearn',
          score: skillPoints,
          gradeDescription: getGradeTier(skillPoints)
        };
        setActiveCertificate(cert);
        setCurrentView('certificate');
        setActiveLesson(null);
        return;
    }

    if (lessonNum < metadata.chaptersCount) {
      setProgress(prev => ({
        ...prev,
        [activeSubject.id]: { 
          ...prev[activeSubject.id], 
          lessonNumber: lessonNum + 1,
          lastScore: { ...prev[activeSubject.id].lastScore, correct: score, total: totalExercises, skillPoints: skillPoints }
        }
      }));
    } else {
      setCurrentView('level-completion-hub');
    }
  };

  const getGradeTier = (skillPoints: number): string => {
    if (skillPoints >= 100) return t('superiorSkillPoint');
    if (skillPoints >= 80) return t('highSkillPoint');
    if (skillPoints >= 60) return t('mediumHighSkillPoint');
    if (skillPoints >= 40) return t('mediumSkillPoint');
    if (skillPoints >= 20) return t('lowMediumSkillPoint');
    return t('lowSkillPoint');
  };

  const handleExamComplete = (score: number, total: number) => {
    if (!user || !activeSubject) return;
    
    const skillPoints = Math.round((score / total) * 100);
    const gradeTier = getGradeTier(skillPoints);
    const passThreshold = 60; 

    const currentSubjectProgress = progress[activeSubject.id];

    const cert: CertificateType = {
      userName: user.name,
      subjectName: activeSubject.name,
      level: currentSubjectProgress.level,
      date: new Date().toLocaleDateString(),
      verificationId: `DARE-CERT-${Date.now()}`,
      programType: currentSubjectProgress.isFastTrack ? 'fast-track' : 'regular',
      score: skillPoints,
      gradeDescription: gradeTier
    };
    
    setActiveCertificate(cert);

    if (skillPoints >= passThreshold) {
      const currentIndex = MASTERY_LEVEL_ORDER.indexOf(currentSubjectProgress.level);
      
      let nextLevel: MasteryLevel | null = null;

      if (currentSubjectProgress.level === 'P') {
        const choice = confirm("Level P Mastery Achieved! Would you like to continue to University Level Lessons (Level Q)?");
        nextLevel = choice ? 'Q' : 'Beyond P';
      } else if (currentSubjectProgress.level === 'T') {
        alert("Level T Mastery Achieved! Enrolling in Beyond T maintenance protocol.");
        nextLevel = 'Beyond T';
      } else if (currentSubjectProgress.level === 'Beyond P' || currentSubjectProgress.level === 'Beyond T') {
        nextLevel = currentSubjectProgress.level;
      } else if (currentIndex < MASTERY_LEVEL_ORDER.length - 1) {
        nextLevel = MASTERY_LEVEL_ORDER[currentIndex + 1];
      }

      if (nextLevel) {
        setProgress(prev => ({
          ...prev,
          [activeSubject.id]: { 
            ...prev[activeSubject.id], 
            level: nextLevel as MasteryLevel, 
            lessonNumber: 1,
            lastScore: { correct: score, total: total, skillPoints: skillPoints, gradeTier: gradeTier }
          }
        }));
      }
      setCurrentView('certificate');
    } else {
      alert(`Skill Point Index: ${skillPoints} / 100. Institutional acceptance requires ≥ 60 Skill Points.`);
      setCurrentView('dashboard');
    }
  };

  const t = (key: string) => (translations[selectedLang]?.[key]) || (translations['English']?.[key]) || key;

  const dashboardProps = {
    user: user!,
    progress,
    language: selectedLang,
    onStartLesson: handleStartLesson,
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
    onOpenTransition: () => setCurrentView('transition-hub'),
    onOpenCreditTransfer: () => setCurrentView('credit-transfer'),
    onOpenSpecialization: (s: Subject) => { setActiveSubject(s); setIsSpecializationModalOpen(true); }
  };

  const getActiveDashboard = () => {
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
                  onStartExam={(s) => { setActiveSubject(s); setCurrentView('level-completion-hub'); }} 
                  onLogout={() => { setUser(null); setCurrentView('landing'); }} 
                  onOpenConverter={() => setCurrentView('grade-converter')} 
                  onOpenPlacementGlobal={() => setCurrentView('placement-test')} 
                  onOpenCombination={() => setCurrentView('lesson-combination')} 
                  onOpenLeaderboard={() => {}} 
                  onOpenExamHall={() => setCurrentView('exam-hall')}
                />;
    }
  };

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
            💖 {t('donate')}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 md:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm md:text-xl"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <div className="relative group">
            <select 
              value={selectedLang} 
              onChange={e => setSelectedLang(e.target.value as Language)} 
              className="bg-white/5 border border-white/10 rounded-xl px-1.5 py-2 md:px-4 md:py-2 text-[8px] md:text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white/10 transition-all appearance-none pr-4 md:pr-8"
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
        
        {currentView === 'level-completion-hub' && user && activeSubject && (
           <LevelCompletionHub 
              subject={activeSubject}
              language={selectedLang}
              level={progress[activeSubject.id].level}
              user={user}
              onComplete={handleExamComplete}
              onBack={() => setCurrentView('dashboard')}
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
            onStartLesson={(sub, isTrans) => handleStartLesson(sub, isTrans)}
          />
        )}

        {currentView === 'credit-transfer' && user && (
          <CreditTransferView 
            user={user} 
            progress={progress} 
            language={selectedLang} 
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {(currentView as any) === 'weekend-enrichment' && user && activeSubject && (
          <WeekendEnrichmentHub
            user={user}
            subject={activeSubject}
            lesson={null} 
            language={selectedLang}
            onBack={() => setCurrentView('dashboard')}
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
            onStartExam={(s) => { setActiveSubject(s); setCurrentView('level-completion-hub'); }}
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

        {isSpecializationModalOpen && activeSubject && (
          <SpecializationModal 
            subject={activeSubject} 
            language={selectedLang} 
            initialSelected={progress[activeSubject.id]?.specializations || []}
            initialSecondaryLanguage={progress[activeSubject.id]?.secondaryLanguage}
            onClose={() => setIsSpecializationModalOpen(false)}
            onSave={(specs, secLang) => {
              handleUpdateProgress(activeSubject.id, { specializations: specs, secondaryLanguage: secLang });
              setIsSpecializationModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
