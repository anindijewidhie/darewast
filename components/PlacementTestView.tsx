import React, { useState, useEffect } from 'react';
import { 
  Language, User, MasteryLevel, UserProgress, Subject, 
  EducationalStage, EducationTrack, LearningStyle, LearningMethod 
} from '../types';
import { generatePlacementTest, analyzeCurriculumMethodAssessment, analyzeTestResults } from '../services/geminiService';
import { translations } from '../translations';
import { SUBJECTS, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  user: User | null;
  subject?: Subject; 
  testType?: 'placement' | 'assessment' | 'relearn' | 'transfer' | 'curriculum-method';
  onComplete: (recommendedProgress: UserProgress) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  onCancel: () => void;
}

interface AssessmentBlueprint {
  summaryDiagnosis: string;
  recommendedStage: EducationalStage;
  recommendedTrack: EducationTrack;
  recommendedStyle: LearningStyle;
  recommendedMethod: LearningMethod;
  suggestedDailyMinutes: number;
  subjectLevels: Record<string, MasteryLevel>;
  strengths: string[];
  areasForGrowth: string[];
  pedagogicalInsights: string[];
}

const PlacementTestView: React.FC<Props> = ({ 
  language, 
  user, 
  subject: initialSubject, 
  testType = 'assessment', 
  onComplete, 
  onUpdateUser,
  onCancel 
}) => {
  const [activeMode, setActiveMode] = useState<'curriculum-method' | 'subject-placement'>(
    testType === 'placement' && initialSubject ? 'subject-placement' : 'curriculum-method'
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(initialSubject || SUBJECTS[0]);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [finished, setFinished] = useState(false);

  const [blueprint, setBlueprint] = useState<AssessmentBlueprint | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState<MasteryLevel>('C');

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const startTest = async () => {
    setLoading(true);
    setFinished(false);
    setAnswers([]);
    try {
      const data = await generatePlacementTest(
        language, 
        user, 
        'none', 
        activeMode === 'subject-placement' ? selectedSubject : undefined, 
        activeMode
      );
      setQuestions(data.questions || []);
      setCurrentIndex(0);
    } catch (err) {
      alert("Diagnostic synthesis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (ans: string) => {
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      processResults(newAnswers);
    }
  };

  const processResults = async (finalAnswers: string[]) => {
    setAnalyzing(true);
    let correctCount = 0;
    finalAnswers.forEach((ans, i) => {
      if (questions[i]?.correctAnswer && ans === questions[i].correctAnswer) {
        correctCount++;
      }
    });
    setFinalScore(correctCount);

    try {
      if (activeMode === 'curriculum-method') {
        const result = await analyzeCurriculumMethodAssessment(
          user,
          language,
          questions,
          finalAnswers,
          selectedSubject
        );
        setBlueprint(result);
      } else {
        // Subject placement mode
        const recommendedLevel: MasteryLevel = 
          correctCount >= 9 ? 'Q' : 
          correctCount >= 7 ? 'M' : 
          correctCount >= 5 ? 'G' : 
          correctCount >= 3 ? 'D' : 'A';
        setFinalLevel(recommendedLevel);

        const summaryMsg = await analyzeTestResults(
          selectedSubject || SUBJECTS[0],
          correctCount,
          questions.length,
          recommendedLevel,
          language,
          user
        );

        setBlueprint({
          summaryDiagnosis: summaryMsg,
          recommendedStage: user?.stage || 'Middle',
          recommendedTrack: user?.track || 'Standard',
          recommendedStyle: user?.preferredLearningStyle || 'Unified',
          recommendedMethod: 'darewast-Unified',
          suggestedDailyMinutes: user?.dailyGoal || 30,
          subjectLevels: {
            [selectedSubject?.id || 'math']: recommendedLevel
          },
          strengths: ["Targeted domain competence", "Demonstrated conceptual fluency"],
          areasForGrowth: ["Advanced structural speed", "Multi-concept abstraction"],
          pedagogicalInsights: ["Continue incremental daily practice in textbook mode."]
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
      setFinished(true);
    }
  };

  const handleApplyBlueprint = () => {
    if (!blueprint) return;

    // 1. Update User Profile if callback provided
    if (onUpdateUser) {
      onUpdateUser({
        stage: blueprint.recommendedStage,
        track: blueprint.recommendedTrack,
        preferredLearningStyle: blueprint.recommendedStyle,
        dailyGoal: blueprint.suggestedDailyMinutes,
        academicDNA: {
          era: user?.academicDNA?.era || 'Contemporary',
          method: blueprint.recommendedMethod,
          curriculumStyle: 'darewast-Universal'
        }
      });
    }

    // 2. Build UserProgress object for subjects
    const newProgress: UserProgress = {};
    if (activeMode === 'curriculum-method') {
      SUBJECTS.forEach(sub => {
        const lvl = blueprint.subjectLevels[sub.id] || 'C';
        newProgress[sub.id] = {
          level: lvl,
          lessonNumber: 1,
          isPlaced: true
        };
      });
    } else {
      const targetSubId = selectedSubject?.id || 'math';
      newProgress[targetSubId] = {
        level: finalLevel,
        lessonNumber: 1,
        isPlaced: true
      };
    }

    onComplete(newProgress);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn text-center p-6">
        <div className="w-24 h-24 border-[10px] border-dare-teal/20 border-t-dare-teal rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-display">
            Synthesizing Diagnostic Questions...
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Calibrating Kumon Fluency, Sakamoto Logic & Eye Level Inquiry
          </p>
        </div>
      </div>
    );
  }

  // Analyzing Screen
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-8 animate-fadeIn text-center p-6">
        <div className="relative">
          <div className="w-28 h-28 border-[12px] border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
        </div>
        <div className="space-y-3 max-w-md">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-display">
            Formulating AI Diagnostic Blueprint...
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Evaluating sensory learning preferences, academic stage, and subject baseline coordinates.
          </p>
        </div>
      </div>
    );
  }

  // Diagnostic Results Screen (Report Card)
  if (finished && blueprint) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 animate-fadeIn space-y-10 pb-32">
        {/* Top Header */}
        <div className="bg-slate-950 text-white rounded-[3.5rem] sm:rounded-[5rem] p-10 sm:p-16 border-4 border-white/10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 pointer-events-none">
            DIAGNOSTIC
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-dare-teal/20 text-dare-teal rounded-full text-xs font-black uppercase tracking-[0.4em] border border-dare-teal/30">
              <span>🎯 Diagnostic Concluded</span>
              <span>•</span>
              <span>darewast AI Calibration</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none font-display">
              {t('diagnosticBlueprint')}
            </h1>

            {/* AI Summary Diagnosis */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
              <span className="text-[10px] font-black text-dare-teal uppercase tracking-widest block">
                🤖 AI Overarching Diagnosis
              </span>
              <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                "{blueprint.summaryDiagnosis}"
              </p>
            </div>
          </div>

          {/* Core Recommended Blueprint Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t('recommendedTrackLabel')}
              </span>
              <p className="text-lg sm:text-xl font-black text-dare-teal mt-1">
                {blueprint.recommendedTrack}
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t('recommendedStageLabel')}
              </span>
              <p className="text-lg sm:text-xl font-black text-dare-gold mt-1">
                {blueprint.recommendedStage} Stage
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t('recommendedStyleLabel')}
              </span>
              <p className="text-lg sm:text-xl font-black text-dare-purple mt-1">
                {blueprint.recommendedStyle}
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {t('suggestedDailyGoalLabel')}
              </span>
              <p className="text-lg sm:text-xl font-black text-rose-400 mt-1">
                {blueprint.suggestedDailyMinutes} Mins / Day
              </p>
            </div>
          </div>
        </div>

        {/* Subject Level Calibrations Section */}
        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black dark:text-white uppercase font-display tracking-tight">
              {t('subjectCalibrationsLabel')}
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Recommended starting coordinates across all darewast core domains
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {SUBJECTS.map(sub => {
              const recLevel = blueprint.subjectLevels[sub.id] || 'C';
              const meta = LEVEL_METADATA[recLevel] || LEVEL_METADATA['C'];

              return (
                <div 
                  key={sub.id} 
                  className="p-5 bg-gray-50 dark:bg-slate-800/60 rounded-3xl border-2 border-gray-100 dark:border-slate-800 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    {sub.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black dark:text-white uppercase tracking-wider line-clamp-1">
                      {sub.name}
                    </h4>
                    <span className="inline-block px-2.5 py-0.5 bg-dare-teal/20 text-dare-teal font-black text-xs rounded-lg mt-1 border border-dare-teal/30">
                      Lvl {recLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Diagnostic Insights: Strengths, Growth, & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 space-y-4">
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <span>✅</span> Demonstrated Strengths
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {blueprint.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-amber-500/10 rounded-[2.5rem] border border-amber-500/20 space-y-4">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <span>🎯</span> Areas For Growth
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {blueprint.areasForGrowth.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 bg-dare-purple/10 rounded-[2.5rem] border border-dare-purple/20 space-y-4">
            <h4 className="text-xs font-black text-dare-purple uppercase tracking-widest flex items-center gap-2">
              <span>💡</span> Pedagogical Advice
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {blueprint.pedagogicalInsights.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-dare-purple font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleApplyBlueprint}
            className="flex-1 py-6 px-8 bg-dare-teal text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>🚀</span> {t('applyBlueprint')}
          </button>

          <button
            onClick={startTest}
            className="py-6 px-8 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>🔄</span> Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  // Question Card Screen
  if (currentIndex >= 0 && questions.length > 0) {
    const q = questions[currentIndex];
    const pillar = q?.pillar || q?.category || 'General Diagnostic';

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fadeIn space-y-8">
        <div className="bg-slate-950 text-white rounded-[3.5rem] p-10 md:p-16 border-4 border-white/10 shadow-2xl space-y-8">
          {/* Header Progress */}
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-dare-teal/20 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-teal/30">
              <span>⚡ {pillar}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Question {currentIndex + 1} / {questions.length}
              </span>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-dare-teal transition-all duration-500" 
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white font-display">
              {q?.question}
            </h3>
            {q?.explanation && (
              <p className="text-xs text-slate-400 font-medium italic">
                {q.explanation}
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid gap-4 pt-4">
            {q?.options?.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className="p-6 text-left rounded-[2rem] border-2 border-white/10 bg-white/5 hover:bg-white hover:text-slate-950 transition-all font-bold text-sm sm:text-base flex items-center justify-between group shadow-lg"
              >
                <span className="pr-4">{opt}</span>
                <span className="w-8 h-8 rounded-full border border-white/20 group-hover:border-slate-950/40 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-slate-950 transition-colors shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Intro Landing Screen
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-fadeIn space-y-12">
      <div className="bg-slate-950 text-white p-12 sm:p-16 md:p-20 rounded-[4rem] border-4 border-white/10 shadow-2xl relative overflow-hidden space-y-10 text-center">
        <div className="w-24 h-24 bg-dare-teal/20 text-dare-teal rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner border border-dare-teal/30">
          🎯
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none font-display">
            {activeMode === 'curriculum-method' 
              ? t('curriculumAssessmentTitle')
              : t('subjectPlacementTitle')}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            {activeMode === 'curriculum-method'
              ? t('curriculumAssessmentSubtitle')
              : t('subjectPlacementSubtitle')}
          </p>
        </div>

        {/* Mode Selector Switch */}
        <div className="inline-flex p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveMode('curriculum-method')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeMode === 'curriculum-method'
                ? 'bg-dare-teal text-slate-950 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧩 Full Curriculum & Method Assessment
          </button>
          <button
            onClick={() => setActiveMode('subject-placement')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeMode === 'subject-placement'
                ? 'bg-dare-teal text-slate-950 shadow-lg scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📐 Subject Placement Test
          </button>
        </div>

        {/* Subject Selector (If Subject Mode) */}
        {activeMode === 'subject-placement' && (
          <div className="max-w-md mx-auto space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Select Target Subject
            </label>
            <select
              value={selectedSubject?.id || SUBJECTS[0].id}
              onChange={e => {
                const found = SUBJECTS.find(s => s.id === e.target.value);
                setSelectedSubject(found);
              }}
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-sm font-bold text-white outline-none cursor-pointer"
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <button
            onClick={startTest}
            className="flex-1 py-6 bg-dare-teal text-slate-950 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Begin Diagnostic Session →
          </button>

          <button
            onClick={onCancel}
            className="py-6 px-8 bg-white/10 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestView;
