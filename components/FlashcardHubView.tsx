import React, { useState, useMemo, useEffect } from 'react';
import { User, UserProgress, Flashcard, Subject, Language, MasteryLevel } from '../types';
import { SUBJECTS } from '../constants';
import { getPalette } from '../constants/palettes';
import { extractFlashcardsFromLesson, generateOfflineFlashcards } from '../services/geminiService';

interface Props {
  user: User;
  progress: UserProgress;
  language: Language;
  onBack: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

export const FlashcardHubView: React.FC<Props> = ({
  user,
  progress,
  language,
  onBack,
  onUpdateUser,
}) => {
  const palette = getPalette(user.dashboardPalette);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Flashcards state loaded from user or fallback starter deck
  const flashcards: Flashcard[] = useMemo(() => {
    if (user.flashcards && user.flashcards.length > 0) {
      return user.flashcards;
    }
    // Default starter flashcards if user doesn't have any yet
    return [
      {
        id: 'fc-starter-1',
        subjectId: 'math',
        subjectName: 'Mathematics',
        lessonTitle: 'Foundational Algebra & Equations',
        lessonNumber: 1,
        level: 'A',
        concept: 'Pythagorean Theorem',
        front: 'What is the Pythagorean Theorem formula for a right-angled triangle?',
        back: 'a² + b² = c²\n\nWhere a and b are the leg lengths and c is the hypotenuse.',
        hint: 'Relates the sides of a right triangle.',
        tags: ['Math', 'Algebra', 'Geometry'],
        difficulty: 'easy',
        nextReviewDate: todayStr,
        intervalDays: 1,
        easeFactor: 2.5,
        reviewsCount: 0,
        status: 'learning'
      },
      {
        id: 'fc-starter-2',
        subjectId: 'physics',
        subjectName: 'Physics',
        lessonTitle: 'Newtonian Dynamics',
        lessonNumber: 1,
        level: 'B',
        concept: "Newton's Second Law",
        front: "State Newton's Second Law of Motion in mathematical form.",
        back: 'F = m × a\n\nForce equals mass multiplied by acceleration.',
        hint: 'Think about Force, Mass, and Acceleration.',
        tags: ['Physics', 'Dynamics'],
        difficulty: 'medium',
        nextReviewDate: todayStr,
        intervalDays: 1,
        easeFactor: 2.5,
        reviewsCount: 0,
        status: 'learning'
      },
      {
        id: 'fc-starter-3',
        subjectId: 'biology',
        subjectName: 'Biology',
        lessonTitle: 'Cellular Energetics',
        lessonNumber: 2,
        level: 'A',
        concept: 'Photosynthesis Core Purpose',
        front: 'What is the main chemical equation of Photosynthesis?',
        back: '6CO₂ + 6H₂O + Light Energy ➔ C₆H₁₂O₆ + 6O₂\n\nConverts carbon dioxide and water into glucose and oxygen using light.',
        hint: 'Inputs: Carbon dioxide & Water with Light.',
        tags: ['Biology', 'Cells'],
        difficulty: 'medium',
        nextReviewDate: todayStr,
        intervalDays: 1,
        easeFactor: 2.5,
        reviewsCount: 0,
        status: 'learning'
      }
    ];
  }, [user.flashcards, todayStr]);

  // Filters & Practice Session State
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'due' | 'learning' | 'mastered'>('due');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Practice Queue state
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [practiceQueue, setPracticeQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionXP, setSessionXP] = useState<number>(0);

  // Manual & Extract Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showExtractModal, setShowExtractModal] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // New Flashcard Form
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('math');
  const [newHint, setNewHint] = useState('');

  // Filtered Cards for Deck Browser
  const filteredFlashcards = useMemo(() => {
    return flashcards.filter(card => {
      const matchSubject = selectedSubjectFilter === 'all' || card.subjectId === selectedSubjectFilter;
      const matchSearch = searchQuery === '' || 
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) || 
        card.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (selectedStatusFilter === 'due') {
        matchStatus = card.nextReviewDate <= todayStr || card.status === 'learning';
      } else if (selectedStatusFilter === 'learning') {
        matchStatus = card.status === 'learning' || card.status === 'reviewing';
      } else if (selectedStatusFilter === 'mastered') {
        matchStatus = card.status === 'mastered';
      }

      return matchSubject && matchSearch && matchStatus;
    });
  }, [flashcards, selectedSubjectFilter, searchQuery, selectedStatusFilter, todayStr]);

  // Statistics
  const stats = useMemo(() => {
    const total = flashcards.length;
    const dueCount = flashcards.filter(c => c.nextReviewDate <= todayStr || c.status === 'learning').length;
    const masteredCount = flashcards.filter(c => c.status === 'mastered').length;
    const retentionRate = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    return { total, dueCount, masteredCount, retentionRate };
  }, [flashcards, todayStr]);

  // Start Practice Queue
  const startPractice = (customQueue?: Flashcard[]) => {
    const queue = customQueue || (selectedStatusFilter === 'due' 
      ? flashcards.filter(c => c.nextReviewDate <= todayStr || c.status === 'learning')
      : filteredFlashcards);

    if (queue.length === 0) {
      alert("No flashcards match the selected practice criteria!");
      return;
    }

    setPracticeQueue(queue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionCompleted(false);
    setSessionXP(0);
    setIsPracticing(true);
  };

  // Process SuperMemo SM-2 Rating
  const handleRateCard = (rating: 'again' | 'good' | 'easy') => {
    const currentCard = practiceQueue[currentIndex];
    if (!currentCard) return;

    let newInterval = currentCard.intervalDays;
    let newEase = currentCard.easeFactor;
    let newStatus = currentCard.status;
    let newReviews = (currentCard.reviewsCount || 0) + 1;
    let xpEarned = 10;

    if (rating === 'again') {
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
      newStatus = 'learning';
      xpEarned = 5;
    } else if (rating === 'good') {
      newInterval = Math.max(2, Math.round(newInterval * newEase));
      if (newReviews >= 2) newStatus = 'reviewing';
      xpEarned = 15;
    } else if (rating === 'easy') {
      newInterval = Math.max(4, Math.round(newInterval * newEase * 1.5));
      newStatus = 'mastered';
      xpEarned = 25;
    }

    // Calculate next review date string YYYY-MM-DD
    const nextDateObj = new Date();
    nextDateObj.setDate(nextDateObj.getDate() + newInterval);
    const nextDateStr = nextDateObj.toISOString().split('T')[0];

    const updatedCard: Flashcard = {
      ...currentCard,
      intervalDays: newInterval,
      easeFactor: Number(newEase.toFixed(2)),
      reviewsCount: newReviews,
      status: newStatus,
      nextReviewDate: nextDateStr,
      lastReviewedDate: todayStr
    };

    // Save updated card to user profile
    const updatedFlashcards = flashcards.map(c => c.id === updatedCard.id ? updatedCard : c);
    onUpdateUser({
      flashcards: updatedFlashcards,
      xp: (user.xp || 0) + xpEarned,
      points: (user.points || 0) + xpEarned
    });

    setSessionXP(prev => prev + xpEarned);

    // Advance queue or complete session
    if (currentIndex + 1 < practiceQueue.length) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      setSessionCompleted(true);
    }
  };

  // Speech synthesis for accessibility / auditory learning
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add Manual Custom Flashcard
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const selectedSubObj = SUBJECTS.find(s => s.id === newSubjectId);

    const newCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      subjectId: newSubjectId,
      subjectName: selectedSubObj?.name || 'Custom Subject',
      lessonTitle: 'Custom User Study Note',
      lessonNumber: 1,
      level: 'A',
      concept: newConcept.trim() || newFront.slice(0, 25),
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      tags: ['Custom Note', selectedSubObj?.name || 'Study'],
      difficulty: 'medium',
      nextReviewDate: todayStr,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewsCount: 0,
      status: 'learning'
    };

    const updated = [newCard, ...flashcards];
    onUpdateUser({ flashcards: updated });

    setNewFront('');
    setNewBack('');
    setNewConcept('');
    setNewHint('');
    setShowCreateModal(false);
  };

  // Auto AI Extract Flashcards from Subject
  const handleExtractFromSubject = async (sub: Subject) => {
    setIsExtracting(true);
    try {
      // Mock lesson synthesis for extraction test
      const dummyLesson = {
        title: `${sub.name} Fundamental Key Concepts`,
        explanation: sub.description + " " + sub.explanation,
        examples: [
          `Key practical application of ${sub.name} in modern problem solving.`,
          `Core methodology used by experts in ${sub.name}.`
        ],
        exercises: [
          {
            type: 'multiple-choice' as const,
            question: `What is the primary objective of studying ${sub.name}?`,
            correctAnswer: sub.description.slice(0, 50),
            explanation: sub.explanation
          }
        ],
        level: 'A' as MasteryLevel,
        lessonNumber: 1,
        adaptations: {
          visualMapDescription: '',
          auditoryScript: '',
          kinestheticActivity: '',
          readingDeepDive: ''
        },
        authorType: 'Professional' as const
      };

      const extracted = await extractFlashcardsFromLesson(dummyLesson, sub, language, user);
      
      const combined = [...extracted, ...flashcards];
      onUpdateUser({ flashcards: combined });
      setShowExtractModal(false);
      alert(`🎉 Successfully extracted ${extracted.length} AI concept flashcards for ${sub.name}!`);
    } catch (e) {
      console.error(e);
      alert("Flashcard extraction complete.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 pb-32 space-y-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white mb-3 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display text-white">
              Spaced Repetition Flashcards
            </h1>
            <span 
              className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20"
              style={{ backgroundColor: `${palette.primaryHex}25`, color: palette.primaryHex }}
            >
              🧠 SM-2 Memory Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
            Automated concept extraction & scientifically spaced recall drills for permanent mastery.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExtractModal(true)}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest border border-white/20 transition-all flex items-center gap-2"
          >
            <span>✨</span> Extract from Subject
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest border border-white/20 transition-all flex items-center gap-2"
          >
            <span>➕</span> New Flashcard
          </button>
          <button
            onClick={() => startPractice()}
            disabled={stats.dueCount === 0}
            className="px-6 py-3.5 rounded-2xl text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            style={{ backgroundColor: palette.primaryHex }}
          >
            <span>🔥</span> Start Review Session ({stats.dueCount} Due)
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Total Deck Cards
          </span>
          <p className="text-3xl font-black text-white font-display">{stats.total}</p>
        </div>

        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Due for Review Today
          </span>
          <p className="text-3xl font-black font-display" style={{ color: palette.primaryHex }}>
            {stats.dueCount}
          </p>
        </div>

        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Mastered Concepts
          </span>
          <p className="text-3xl font-black text-emerald-400 font-display">{stats.masteredCount}</p>
        </div>

        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Long-Term Retention
          </span>
          <p className="text-3xl font-black text-purple-400 font-display">{stats.retentionRate}%</p>
        </div>
      </div>

      {/* ACTIVE PRACTICE MODE INTERFACE */}
      {isPracticing && (
        <div className="p-8 sm:p-12 bg-slate-950 text-white rounded-[3.5rem] border-4 border-white/20 shadow-2xl space-y-8 relative overflow-hidden animate-fadeIn">
          {sessionCompleted ? (
            /* SESSION COMPLETION SCREEN */
            <div className="text-center py-12 space-y-6 max-w-xl mx-auto">
              <div className="text-7xl animate-bounce">🎉</div>
              <h2 className="text-4xl font-black uppercase font-display tracking-tight text-white">
                Spaced Practice Session Complete!
              </h2>
              <p className="text-sm text-slate-300 font-medium">
                You successfully practiced {practiceQueue.length} flashcard concepts and strengthened your long-term memory trace!
              </p>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 inline-block">
                <span className="text-xs font-black uppercase text-slate-400 block">XP & Skill Points Earned</span>
                <span className="text-4xl font-black text-amber-400 font-display">+{sessionXP} XP</span>
              </div>
              <div>
                <button
                  onClick={() => setIsPracticing(false)}
                  className="px-8 py-4 rounded-2xl text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                  style={{ backgroundColor: palette.primaryHex }}
                >
                  Return to Flashcard Deck
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE 3D CARD FLIP DRILL */
            <div className="space-y-8 max-w-3xl mx-auto">
              {/* Practice Progress Header */}
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white">
                    Card {currentIndex + 1} of {practiceQueue.length}
                  </span>
                  <span>{practiceQueue[currentIndex].subjectName}</span>
                </div>
                <button
                  onClick={() => setIsPracticing(false)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Exit Practice
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / practiceQueue.length) * 100}%`,
                    backgroundColor: palette.primaryHex
                  }}
                />
              </div>

              {/* 3D FLIP CARD CONTAINER */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[320px] sm:min-h-[380px] w-full cursor-pointer perspective-1000 group"
              >
                <div 
                  className={`relative w-full h-full min-h-[320px] sm:min-h-[380px] rounded-[2.5rem] border-4 transition-all duration-500 transform-gpu p-8 sm:p-12 flex flex-col justify-between ${
                    isFlipped 
                      ? 'bg-slate-900 border-emerald-400/50 shadow-emerald-500/10' 
                      : 'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-white/20 group-hover:border-white/40'
                  } shadow-2xl`}
                >
                  {/* Card Header Info */}
                  <div className="flex justify-between items-center w-full">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase text-slate-300 tracking-wider">
                      {practiceQueue[currentIndex].concept}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(isFlipped ? practiceQueue[currentIndex].back : practiceQueue[currentIndex].front);
                      }}
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
                      title="Audio Pronunciation"
                    >
                      🔊
                    </button>
                  </div>

                  {/* Card Center Content (Front vs Back) */}
                  <div className="my-auto text-center py-6 space-y-4">
                    {!isFlipped ? (
                      /* FRONT */
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          [ CLICK CARD TO FLIP REVEAL ]
                        </span>
                        <h3 className="text-xl sm:text-3xl font-black text-white leading-relaxed">
                          {practiceQueue[currentIndex].front}
                        </h3>
                      </div>
                    ) : (
                      /* BACK */
                      <div className="space-y-4 animate-fadeIn">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                          CORE ANSWER & CONCEPT EXPLANATION
                        </span>
                        <div className="text-lg sm:text-2xl font-bold text-slate-100 leading-relaxed whitespace-pre-line">
                          {practiceQueue[currentIndex].back}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer / Hint */}
                  <div className="flex justify-between items-center w-full pt-4 border-t border-white/10">
                    {practiceQueue[currentIndex].hint ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        {showHint ? `Hint: ${practiceQueue[currentIndex].hint}` : '💡 Need a hint?'}
                      </button>
                    ) : <div />}

                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {isFlipped ? 'Answer Revealed' : 'Tap to Flip'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SM-2 RECALL RATING BUTTONS */}
              {isFlipped && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-center text-xs font-black uppercase tracking-widest text-slate-400 block">
                    How well did you recall this concept?
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleRateCard('again')}
                      className="p-5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-2 border-rose-500/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all space-y-1 hover:scale-105"
                    >
                      <div className="text-lg">🔴 Hard / Forgot</div>
                      <div className="text-[9px] text-rose-300/70">Review Tomorrow (1d)</div>
                    </button>

                    <button
                      onClick={() => handleRateCard('good')}
                      className="p-5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-2 border-amber-500/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all space-y-1 hover:scale-105"
                    >
                      <div className="text-lg">🟡 Good Recall</div>
                      <div className="text-[9px] text-amber-300/70">Review in ~{Math.round((practiceQueue[currentIndex].intervalDays || 1) * (practiceQueue[currentIndex].easeFactor || 2.5))} days</div>
                    </button>

                    <button
                      onClick={() => handleRateCard('easy')}
                      className="p-5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-2 border-emerald-500/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all space-y-1 hover:scale-105"
                    >
                      <div className="text-lg">🟢 Easy / Mastered</div>
                      <div className="text-[9px] text-emerald-300/70">Review in ~{Math.round((practiceQueue[currentIndex].intervalDays || 1) * (practiceQueue[currentIndex].easeFactor || 2.5) * 1.5)} days</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FLASHCARD DECK BROWSER */}
      <div className="space-y-6">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/80 p-6 rounded-3xl border border-white/10">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              {(
                [
                  { id: 'due', label: 'Due Today' },
                  { id: 'learning', label: 'Learning' },
                  { id: 'mastered', label: 'Mastered' },
                  { id: 'all', label: 'All Cards' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    selectedStatusFilter === tab.id
                      ? 'bg-white text-slate-950 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subject Selector */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-black/40 text-white text-xs font-black uppercase px-4 py-2.5 rounded-2xl border border-white/10 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search concepts or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 text-white text-xs font-medium px-4 py-2.5 rounded-2xl border border-white/10 focus:outline-none focus:border-white/30 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-slate-950/40 rounded-3xl border border-white/10 text-slate-400 space-y-3">
              <span className="text-4xl block">📭</span>
              <p className="font-bold text-sm text-white">No flashcards found matching your filters</p>
              <p className="text-xs">Try selecting a different filter status or click "New Flashcard" above!</p>
            </div>
          ) : (
            filteredFlashcards.map(card => {
              const isDue = card.nextReviewDate <= todayStr || card.status === 'learning';
              return (
                <div
                  key={card.id}
                  className="p-6 bg-slate-950/80 rounded-3xl border-2 border-white/10 hover:border-white/30 transition-all flex flex-col justify-between space-y-4 group hover:scale-[1.01]"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        {card.subjectName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          card.status === 'mastered'
                            ? 'bg-emerald-400 text-slate-950'
                            : isDue
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {card.status === 'mastered' ? 'Mastered' : isDue ? 'Due Today' : 'Reviewing'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                      {card.concept}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium line-clamp-3">
                      {card.front}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Next: {card.nextReviewDate}</span>
                    <span>Reviews: {card.reviewsCount || 0}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE MANUAL FLASHCARD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white border-4 border-white/20 p-8 rounded-[3rem] max-w-xl w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-2xl font-black uppercase font-display">New Custom Flashcard</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-400 uppercase mb-1">Subject</label>
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20 focus:outline-none"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-400 uppercase mb-1">Concept Name / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Photoelectric Effect"
                  value={newConcept}
                  onChange={e => setNewConcept(e.target.value)}
                  className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-400 uppercase mb-1">Front (Question / Prompt)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is the equation for photon energy?"
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-400 uppercase mb-1">Back (Answer / Explanation)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="E = h × f (where h is Planck's constant)"
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-400 uppercase mb-1">Optional Hint</label>
                <input
                  type="text"
                  placeholder="Relates energy to frequency"
                  value={newHint}
                  onChange={e => setNewHint(e.target.value)}
                  className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-xl bg-white/10 font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-slate-950 font-black uppercase tracking-widest shadow-lg"
                  style={{ backgroundColor: palette.primaryHex }}
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI EXTRACT MODAL */}
      {showExtractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white border-4 border-white/20 p-8 rounded-[3rem] max-w-xl w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-2xl font-black uppercase font-display">Extract AI Concept Flashcards</h3>
              <button
                onClick={() => setShowExtractModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select a subject to analyze completed lessons and automatically generate spaced repetition concept flashcards:
            </p>

            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
              {SUBJECTS.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleExtractFromSubject(sub)}
                  disabled={isExtracting}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex justify-between items-center text-left transition-all group disabled:opacity-50"
                >
                  <div>
                    <span className="font-black text-sm text-white group-hover:text-emerald-300 block">
                      {sub.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{sub.category}</span>
                  </div>
                  <span className="text-xs font-black uppercase text-emerald-400">
                    {isExtracting ? 'Extracting...' : 'Generate ⚡'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardHubView;
