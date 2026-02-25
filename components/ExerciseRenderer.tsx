
import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseType, Language } from '../types';
import HandwritingCanvas from './HandwritingCanvas';
import { recognizeHandwriting } from '../services/geminiService';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Lightbulb, RefreshCcw, GripVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  exercise: Exercise;
  index: number;
  language: Language;
  onCorrect: () => void;
  isCompleted: boolean;
  onHintUsed: () => void;
  showHint: boolean;
  onToggleHint: () => void;
}

const ExerciseRenderer: React.FC<Props> = ({ 
  exercise, index, language, onCorrect, isCompleted, onHintUsed, showHint, onToggleHint 
}) => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  // Sorting state
  const [sortItems, setSortItems] = useState<string[]>([]);
  
  // Matching state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [availableRight, setAvailableRight] = useState<string[]>([]);

  useEffect(() => {
    if (exercise.type === 'sorting' && exercise.options) {
      // Shuffle options for sorting
      setSortItems([...exercise.options].sort(() => Math.random() - 0.5));
    }
    if (exercise.type === 'matching' && exercise.matchingPairs) {
      setAvailableRight([...exercise.matchingPairs.map(p => p.right)].sort(() => Math.random() - 0.5));
    }
  }, [exercise]);

  const checkAnswer = (answer: string) => {
    if (isCompleted) return;
    
    const isCorrect = answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Mastery Confirmed! Node Anchored.' });
      onCorrect();
    } else {
      setFeedback({ type: 'error', message: 'Logic Mismatch. Recalibrating...' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 2000);
    }
  };

  const handleHandwritingCapture = async (base64: string) => {
    setIsChecking(true);
    try {
      const text = await recognizeHandwriting(base64, language);
      setUserAnswer(text);
      checkAnswer(text);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Neural recognition failed.' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSortCheck = () => {
    const answer = sortItems.join(', ');
    checkAnswer(answer);
  };

  const handleMatch = (left: string, right: string) => {
    const newMatches = { ...matches, [left]: right };
    setMatches(newMatches);
    setSelectedLeft(null);
    
    if (Object.keys(newMatches).length === exercise.matchingPairs?.length) {
      // Check all matches
      const isAllCorrect = exercise.matchingPairs.every(p => newMatches[p.left] === p.right);
      if (isAllCorrect) {
        onCorrect();
        setFeedback({ type: 'success', message: 'All pairs synchronized!' });
      } else {
        setFeedback({ type: 'error', message: 'Some connections are unstable.' });
        setTimeout(() => {
          setMatches({});
          setFeedback({ type: null, message: '' });
        }, 2000);
      }
    }
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <div className="grid gap-4">
            {exercise.options?.map(opt => (
              <button 
                key={opt} 
                onClick={() => checkAnswer(opt)} 
                disabled={isCompleted} 
                className={cn(
                  "p-8 text-left rounded-[2.5rem] border-4 transition-all font-black text-2xl flex justify-between items-center group",
                  isCompleted && exercise.correctAnswer === opt 
                    ? "bg-dare-teal text-slate-950 border-white shadow-2xl scale-[1.02]" 
                    : (isCompleted ? "opacity-30 border-black/5 dark:border-white/5" : "border-black/5 dark:border-white/10 text-slate-900 dark:text-white bg-black/5 dark:bg-slate-950 hover:border-dare-teal dark:hover:border-dare-teal hover:bg-white dark:hover:bg-slate-900")
                )}
              >
                <span className="tracking-tight">{opt}</span>
                {isCompleted && exercise.correctAnswer === opt && <CheckCircle2 className="w-8 h-8" />}
              </button>
            ))}
          </div>
        );

      case 'fill-in-the-blank':
        return (
          <div className="space-y-8">
            <div className="text-3xl font-bold text-slate-700 dark:text-slate-300 leading-relaxed p-8 bg-black/5 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              {exercise.blankText?.split('[blank]').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={isCompleted}
                      placeholder="..."
                      className="mx-2 px-4 py-1 bg-white dark:bg-slate-950 border-b-4 border-dare-teal outline-none text-dare-teal w-40 text-center transition-all focus:w-60"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            {!isCompleted && (
              <button 
                onClick={() => checkAnswer(userAnswer)}
                className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-dare-teal transition-all"
              >
                Verify Logic
              </button>
            )}
          </div>
        );

      case 'sorting':
        return (
          <div className="space-y-8">
            <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-4">Drag to reorder into correct sequence:</p>
            <Reorder.Group axis="y" values={sortItems} onReorder={setSortItems} className="space-y-3">
              {sortItems.map((item) => (
                <Reorder.Item 
                  key={item} 
                  value={item}
                  disabled={isCompleted}
                  className={cn(
                    "p-6 bg-white dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm",
                    isCompleted && "opacity-50 grayscale"
                  )}
                >
                  <GripVertical className="w-5 h-5 text-slate-300" />
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{item}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {!isCompleted && (
              <button 
                onClick={handleSortCheck}
                className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-dare-teal transition-all"
              >
                Validate Sequence
              </button>
            )}
          </div>
        );

      case 'matching':
        return (
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Logic Nodes</p>
              {exercise.matchingPairs?.map(pair => (
                <button
                  key={pair.left}
                  onClick={() => !isCompleted && setSelectedLeft(pair.left)}
                  disabled={isCompleted || !!matches[pair.left]}
                  className={cn(
                    "w-full p-6 text-left rounded-2xl border-2 transition-all font-bold text-lg",
                    selectedLeft === pair.left ? "border-dare-teal bg-dare-teal/10 text-dare-teal shadow-lg" : 
                    matches[pair.left] ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 opacity-50" :
                    "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
                  )}
                >
                  {pair.left}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Target Values</p>
              {availableRight.map(right => {
                const isMatched = Object.values(matches).includes(right);
                return (
                  <button
                    key={right}
                    onClick={() => selectedLeft && handleMatch(selectedLeft, right)}
                    disabled={isCompleted || isMatched || !selectedLeft}
                    className={cn(
                      "w-full p-6 text-left rounded-2xl border-2 transition-all font-bold text-lg",
                      isMatched ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 opacity-50" :
                      !selectedLeft ? "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 opacity-30 cursor-not-allowed" :
                      "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-dare-teal"
                    )}
                  >
                    {right}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'handwriting':
        return (
          <div className="space-y-6">
            <HandwritingCanvas 
              onCapture={handleHandwritingCapture} 
              onClear={() => setUserAnswer('')} 
              isLoading={isChecking} 
            />
            {userAnswer && (
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Recognized Input</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{userAnswer}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "p-12 md:p-20 rounded-[4.5rem] bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border-[6px] border-black/5 dark:border-white/5 transition-all relative overflow-hidden",
      isCompleted ? "border-dare-teal dark:border-dare-teal shadow-[0_40px_80px_rgba(83,205,186,0.15)] bg-white dark:bg-slate-950" : "shadow-2xl"
    )}>
      {/* Exercise Header */}
      <div className="flex justify-between items-start mb-16">
        <div className="flex items-center gap-6">
          <span className="text-8xl font-black text-black/5 dark:text-white/5 leading-none font-display">{(index + 1).toString().padStart(2, '0')}</span>
          <div className="px-4 py-1.5 bg-slate-950 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
            {exercise.type.replace('-', ' ')}
          </div>
        </div>
        <button 
          onClick={onToggleHint} 
          className={cn(
            "text-[10px] font-black uppercase px-8 py-3 rounded-2xl transition-all flex items-center gap-3",
            showHint ? "bg-dare-gold text-slate-950 shadow-2xl scale-110" : "bg-black/5 dark:bg-slate-800 text-slate-600 dark:text-white border border-black/5 dark:border-white/10"
          )}
        >
          <span>{showHint ? 'Dismiss' : 'Neural Hint'}</span>
          <Lightbulb className="w-4 h-4" />
        </button>
      </div>

      {/* Question */}
      <h4 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-16 leading-[1.1] tracking-tighter uppercase font-display">
        {exercise.question}
      </h4>

      {/* Hint Area */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-16 p-10 bg-dare-gold text-slate-950 rounded-[3rem] border-4 border-white/40 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl font-black rotate-12">HINT</div>
            <div className="flex items-start gap-6 relative z-10">
              <Lightbulb className="w-10 h-10 mt-1" />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Axiomatic Insight Node</p>
                <p className="text-2xl font-black italic leading-tight">"{exercise.hint || 'Analyze the core logic modeling of the previous node.'}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Message */}
      <AnimatePresence>
        {feedback.type && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-12 py-8 rounded-[3rem] font-black text-2xl uppercase tracking-widest shadow-2xl flex flex-col items-center gap-4 whitespace-nowrap border-8 border-white/40",
              feedback.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}
          >
            {feedback.type === 'success' ? (
              <>
                <CheckCircle2 className="w-20 h-20" />
                <span>Mastery Anchored</span>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20" />
                <span>Logic Mismatch</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Content */}
      <motion.div 
        animate={feedback.type === 'error' ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="transition-all duration-500"
      >
        {renderExerciseContent()}
      </motion.div>

      {/* Explanation (shown after completion) */}
      {isCompleted && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-16 pt-12 border-t-4 border-emerald-500/20"
        >
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">✓</div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Mastery Explanation</p>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{exercise.explanation}"</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseRenderer;
