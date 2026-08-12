import React, { useState, useMemo } from 'react';
import { User, UserProgress, Language, Subject, EducationalStage, StruggledTopic, SubjectCategory } from '../types';
import { SUBJECTS } from '../constants';
import { translations } from '../translations';
import { generateRelearnLesson } from '../services/geminiService';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onBack: () => void;
  onStartRelearnLesson: (subject: Subject, stage: EducationalStage, topicPrompt?: string, isFastTrack?: boolean) => void;
  onOpenRelearnHub: () => void;
}

interface DisplayGaps {
  id: string;
  subject: Subject;
  topic: string;
  subTopic?: string;
  stage: EducationalStage;
  failCount: number;
  lastStruggledDate: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  accuracyRate: number;
  aiDiagnosis: string;
}

const DEFAULT_GAPS: Array<{
  subjectId: string;
  topic: string;
  subTopic: string;
  stage: EducationalStage;
  failCount: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  accuracyRate: number;
  aiDiagnosis: string;
}> = [
  {
    subjectId: 'math',
    topic: 'Fractional Arithmetic & Uncommon Denominators',
    subTopic: 'Least Common Multiple Reduction',
    stage: 'Middle',
    failCount: 5,
    severity: 'critical',
    accuracyRate: 28,
    aiDiagnosis: 'Repeated friction when finding least common denominators before adding mixed fractions. Scholar drops carryover values.'
  },
  {
    subjectId: 'logic',
    topic: 'Deductive Proofs & Truth Tables',
    subTopic: 'Implication & Biconditional Equivalence',
    stage: 'High',
    failCount: 4,
    severity: 'critical',
    accuracyRate: 34,
    aiDiagnosis: 'Confusion between Material Implication (P → Q) and Negation rules during multi-step proofs.'
  },
  {
    subjectId: 'science',
    topic: 'Stoichiometry & Reaction Balancing',
    subTopic: 'Molar Mass Calculations',
    stage: 'High',
    failCount: 3,
    severity: 'high',
    accuracyRate: 42,
    aiDiagnosis: 'Difficulty converting grams to moles when polyatomic ions are involved in combustion equations.'
  },
  {
    subjectId: 'language',
    topic: 'Complex Syntactic Parsing & Dependent Clauses',
    subTopic: 'Subordinate Clause Alignment',
    stage: 'Middle',
    failCount: 3,
    severity: 'high',
    accuracyRate: 48,
    aiDiagnosis: 'Intermittent errors identifying relative pronouns vs. adverbial conjunctions in long passages.'
  },
  {
    subjectId: 'technology',
    topic: 'Algorithmic Control Flow & Recursion',
    subTopic: 'Base Condition Evaluation',
    stage: 'University',
    failCount: 2,
    severity: 'moderate',
    accuracyRate: 58,
    aiDiagnosis: 'Overlooks terminal stack frame returns in recursive loop definitions.'
  },
  {
    subjectId: 'art',
    topic: 'Spatial Foreshortening & Linear Perspective',
    subTopic: 'Two-Point Horizon Vanishing Points',
    stage: 'Primary',
    failCount: 2,
    severity: 'moderate',
    accuracyRate: 64,
    aiDiagnosis: 'Requires additional visual grid guide when projecting angled 3D geometries onto 2D canvas.'
  }
];

const StruggleAnalyticsView: React.FC<Props> = ({
  user,
  progress,
  language,
  onBack,
  onStartRelearnLesson,
  onOpenRelearnHub
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'failCount' | 'accuracyRate' | 'severity'>('failCount');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingGapId, setLoadingGapId] = useState<string | null>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  // Aggregate struggled topics across progress or defaults
  const allGaps: DisplayGaps[] = useMemo(() => {
    const list: DisplayGaps[] = [];

    SUBJECTS.forEach(sub => {
      const subProg = progress[sub.id];
      if (subProg && subProg.struggledTopics && subProg.struggledTopics.length > 0) {
        subProg.struggledTopics.forEach(st => {
          list.push({
            id: st.id || `${sub.id}-${st.topic}`,
            subject: sub,
            topic: st.topic,
            subTopic: st.subTopic,
            stage: st.stage || user.stage || 'Middle',
            failCount: st.failCount,
            lastStruggledDate: st.lastStruggledDate || new Date().toISOString().split('T')[0],
            severity: st.severity,
            accuracyRate: st.accuracyRate,
            aiDiagnosis: st.aiDiagnosis || `Friction detected in ${st.topic} with ${st.failCount} repeat attempts.`
          });
        });
      }
    });

    // If list is short, supplement with DEFAULT_GAPS so the UI has rich diagnostic heatmap
    if (list.length < 3) {
      DEFAULT_GAPS.forEach(def => {
        const matchingSubject = SUBJECTS.find(s => s.id === def.subjectId) || SUBJECTS[0];
        // avoid duplicating if already present
        if (!list.some(l => l.topic === def.topic)) {
          list.push({
            id: `default-${def.subjectId}-${def.topic}`,
            subject: matchingSubject,
            topic: def.topic,
            subTopic: def.subTopic,
            stage: def.stage,
            failCount: def.failCount,
            lastStruggledDate: new Date().toISOString().split('T')[0],
            severity: def.severity,
            accuracyRate: def.accuracyRate,
            aiDiagnosis: def.aiDiagnosis
          });
        }
      });
    }

    return list;
  }, [progress, user.stage]);

  // Categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    allGaps.forEach(g => set.add(g.subject.category));
    return Array.from(set);
  }, [allGaps]);

  // Filtered & Sorted Gaps
  const filteredGaps = useMemo(() => {
    return allGaps.filter(gap => {
      if (selectedCategory !== 'All' && gap.subject.category !== selectedCategory) return false;
      if (selectedSeverity !== 'All' && gap.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = gap.topic.toLowerCase().includes(q) || 
                        gap.subject.name.toLowerCase().includes(q) ||
                        (gap.subTopic && gap.subTopic.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'failCount') return b.failCount - a.failCount;
      if (sortBy === 'accuracyRate') return a.accuracyRate - b.accuracyRate;
      if (sortBy === 'severity') {
        const map = { critical: 4, high: 3, moderate: 2, low: 1 };
        return map[b.severity] - map[a.severity];
      }
      return 0;
    });
  }, [allGaps, selectedCategory, selectedSeverity, searchQuery, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalGaps = allGaps.length;
    const criticalCount = allGaps.filter(g => g.severity === 'critical').length;
    const highCount = allGaps.filter(g => g.severity === 'high').length;
    const avgAccuracy = Math.round(allGaps.reduce((acc, g) => acc + g.accuracyRate, 0) / (totalGaps || 1));
    return { totalGaps, criticalCount, highCount, avgAccuracy };
  }, [allGaps]);

  const handleLaunchModule = async (gap: DisplayGaps, isFastTrack: boolean = false) => {
    setLoadingGapId(gap.id);
    try {
      await onStartRelearnLesson(gap.subject, gap.stage, `${gap.topic} (${gap.subTopic || ''})`, isFastTrack);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGapId(null);
    }
  };

  const getSeverityBadge = (severity: 'low' | 'moderate' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          label: t('criticalFriction'),
          bg: 'bg-rose-500/20 text-rose-500 border-rose-500/40',
          dot: 'bg-rose-500',
          bar: 'bg-rose-500'
        };
      case 'high':
        return {
          label: t('highFriction'),
          bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          dot: 'bg-orange-500',
          bar: 'bg-orange-500'
        };
      case 'moderate':
        return {
          label: t('moderateFriction'),
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          dot: 'bg-amber-500',
          bar: 'bg-amber-500'
        };
      case 'low':
      default:
        return {
          label: t('lowFriction'),
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fadeIn space-y-12 pb-32">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-dare-teal flex items-center transition-all font-bold group text-sm uppercase tracking-widest"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>

        <button
          onClick={onOpenRelearnHub}
          className="px-6 py-2.5 bg-dare-purple/20 text-dare-purple border border-dare-purple/40 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-dare-purple hover:text-white transition-all shadow-lg flex items-center gap-2"
        >
          <span>🩹</span> Open Academic Restoration Hub
        </button>
      </div>

      {/* Hero Header */}
      <header className="bg-slate-950 rounded-[3.5rem] sm:rounded-[5rem] p-10 sm:p-16 md:p-20 text-white relative overflow-hidden shadow-2xl border-4 border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black rotate-12 uppercase tracking-tighter pointer-events-none">
          GAPS
        </div>
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-rose-500/20 text-rose-400 rounded-full text-xs font-black uppercase tracking-[0.4em] border border-rose-500/30">
            <span>🔍 Friction Diagnostics</span>
            <span>•</span>
            <span>darewast Adaptive Engine</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none font-display text-white">
            {t('curriculumGapsTitle')}
          </h1>
          <p className="text-slate-300 font-medium text-base sm:text-xl leading-relaxed">
            {t('curriculumGapsSubtitle')}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified Gaps</p>
              <p className="text-3xl font-black text-dare-gold mt-1">{stats.totalGaps}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Points</p>
              <p className="text-3xl font-black text-rose-500 mt-1">{stats.criticalCount}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Friction</p>
              <p className="text-3xl font-black text-orange-400 mt-1">{stats.highCount}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Gap Accuracy</p>
              <p className="text-3xl font-black text-dare-teal mt-1">{stats.avgAccuracy}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Heatmap Visual Matrix Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black dark:text-white uppercase font-display tracking-tight">
              Curriculum Heatmap Matrix
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Cross-Subject Friction Analysis across Educational Stages
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Critical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Moderate</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Low</span>
          </div>
        </div>

        {/* Heatmap Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SUBJECTS.map(sub => {
            const subGaps = allGaps.filter(g => g.subject.id === sub.id);
            const highestSeverity = subGaps.reduce((acc, g) => {
              if (g.severity === 'critical') return 'critical';
              if (g.severity === 'high' && acc !== 'critical') return 'high';
              if (g.severity === 'moderate' && acc !== 'critical' && acc !== 'high') return 'moderate';
              return acc;
            }, 'low' as 'low' | 'moderate' | 'high' | 'critical');

            const badge = getSeverityBadge(highestSeverity);

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedCategory(sub.category)}
                className={`p-5 rounded-2xl border-2 text-left transition-all group relative overflow-hidden flex flex-col justify-between ${
                  subGaps.length > 0 
                    ? `${badge.bg} hover:scale-105 shadow-md`
                    : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{sub.icon}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`}></span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider dark:text-white line-clamp-1">
                    {sub.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mt-1">
                    {subGaps.length} Gap{subGaps.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-black/5 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {sub.category.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-dare-teal text-slate-950 shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search struggled topics..."
              className="w-full px-5 py-3 pl-11 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold dark:text-white placeholder-gray-400 outline-none focus:border-dare-teal transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          </div>
        </div>

        {/* Sub-Filters: Severity & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Severity:</span>
            {['All', 'critical', 'high', 'moderate', 'low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md'
                    : 'border-gray-200 dark:border-slate-700 text-gray-400 hover:border-dare-teal'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
            >
              <option value="failCount">Repeat Failures (Highest First)</option>
              <option value="accuracyRate">Accuracy Rate (Lowest First)</option>
              <option value="severity">Severity Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Struggled Topic Cards List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
            {t('struggledAreas')} ({filteredGaps.length})
          </h3>
        </div>

        {filteredGaps.length === 0 ? (
          <div className="p-16 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-800 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h4 className="text-2xl font-black dark:text-white uppercase tracking-tight font-display">
              {t('noGapsFound')}
            </h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-md mx-auto">
              Try adjusting your category or severity filters above to view other learning domains.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGaps.map(gap => {
              const badge = getSeverityBadge(gap.severity);
              const isGenerating = loadingGapId === gap.id;

              return (
                <div
                  key={gap.id}
                  className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border-2 border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-dare-teal transition-all"
                >
                  <div className="space-y-6">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          {gap.subject.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest">
                            {gap.subject.name} • {gap.stage} Stage
                          </p>
                          <h4 className="text-xl sm:text-2xl font-black dark:text-white leading-tight mt-0.5">
                            {gap.topic}
                          </h4>
                          {gap.subTopic && (
                            <p className="text-xs text-gray-500 font-bold mt-1">
                              Sub-concept: <span className="text-gray-700 dark:text-slate-300">{gap.subTopic}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Severity Badge */}
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.bg} whitespace-nowrap shadow-sm`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Metrics Bar & Progress */}
                    <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accuracy</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{gap.accuracyRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${badge.bar} transition-all duration-1000`}
                            style={{ width: `${gap.accuracyRate}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Friction Metric</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-black border border-rose-500/20">
                            {gap.failCount}x Failures
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Gap Diagnosis */}
                    <div className="p-5 bg-dare-purple/10 rounded-2xl border border-dare-purple/20 space-y-2">
                      <div className="flex items-center gap-2 text-dare-purple text-[10px] font-black uppercase tracking-widest">
                        <span>🤖</span> {t('diagnosticSummary')}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{gap.aiDiagnosis}"
                      </p>
                    </div>
                  </div>

                  {/* Quick Links to Relevant Re-learning Modules */}
                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleLaunchModule(gap, false)}
                      disabled={isGenerating}
                      className="flex-1 py-4 px-6 bg-dare-teal text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span> {t('launchRelearnModule')}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleLaunchModule(gap, true)}
                      disabled={isGenerating}
                      className="py-4 px-5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      title="5-minute condensed recovery module"
                    >
                      <span>⚡</span> {t('fastTrackRestore')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StruggleAnalyticsView;
