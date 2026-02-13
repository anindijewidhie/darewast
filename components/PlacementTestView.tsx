
import React, { useState, useEffect, useRef } from 'react';
import { Language, User, MasteryLevel, UserProgress, AccommodationType, Subject, InstitutionStatus } from '../types';
import { generatePlacementTest, analyzeTestResults } from '../services/geminiService';
import { translations } from '../translations';
import { SUBJECTS, LEVEL_METADATA } from '../constants';

interface Props {
  language: Language;
  user: User | null;
  subject?: Subject; 
  testType?: 'placement' | 'assessment' | 'relearn' | 'transfer';
  onComplete: (recommendedProgress: UserProgress) => void;
  onCancel: () => void;
}

const PlacementTestView: React.FC<Props> = ({ language, user, subject, testType = 'placement', onComplete, onCancel }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalLevel, setFinalLevel] = useState<MasteryLevel>('A');
  const [finalScore, setFinalScore] = useState(0);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const startTest = async () => {
    setLoading(true);
    try {
      const data = await generatePlacementTest(language, user, 'none', subject, testType);
      setQuestions(data.questions);
      setCurrentIndex(0);
    } catch (err) { alert("Synthesis failed."); } finally { setLoading(false); }
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

  const processResults = (finalAnswers: string[]) => {
    setFinished(true);
    let score = 0;
    finalAnswers.forEach((ans, i) => { if (ans === questions[i].correctAnswer) score++; });
    setFinalScore(score);
    setFinalLevel(score > 8 ? 'Q' : score > 5 ? 'K' : 'C');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn text-center">
        <div className="w-24 h-24 border-[10px] border-dare-gold/10 border-t-dare-gold rounded-full animate-spin"></div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Calibrating Lab...</h2>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-dare-gold dark:bg-slate-900 rounded-[4rem] p-16 md:p-20 text-center shadow-2xl border-4 border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-white/20"></div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-12">Diagnostic Concluded</h2>
          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/20 p-10 rounded-[3rem] border border-white/30 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2">Verified Mastery</p>
              <p className="text-6xl font-black">{finalScore}/10</p>
            </div>
            <div className="bg-white/20 p-10 rounded-[3rem] border border-white/30 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2">Mastery Placement</p>
              <p className="text-6xl font-black">Lvl {finalLevel}</p>
            </div>
          </div>
          <button onClick={() => onComplete({ [subject?.id || 'literacy']: { level: finalLevel, lessonNumber: 1, isPlaced: true } })} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl">Start Your Journey →</button>
        </div>
      </div>
    );
  }

  if (currentIndex === -1) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center animate-fadeIn">
        <div className="bg-dare-gold dark:bg-slate-900 p-16 rounded-[4rem] border-4 border-white/30 shadow-2xl">
           <div className="w-24 h-24 bg-white/20 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🎯</div>
           <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{t('placementTitle')}</h2>
           <p className="text-white/80 text-xl font-medium mb-10 max-w-2xl mx-auto">"Determining your starting coordinate in the universal grid."</p>
           <button onClick={startTest} className="w-full py-8 bg-white text-dare-gold rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.02] transition-all">Begin Diagnostic Session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="bg-dare-gold dark:bg-slate-900 rounded-[3.5rem] p-12 md:p-16 border-4 border-white/20 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Question {currentIndex + 1}/10</span>
          <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white" style={{ width: `${(currentIndex + 1) * 10}%` }}></div>
          </div>
        </div>
        <h3 className="text-3xl font-black mb-12 leading-tight tracking-tight">{questions[currentIndex]?.question}</h3>
        <div className="grid gap-4">
          {questions[currentIndex]?.options?.map((opt: string) => (
            <button key={opt} onClick={() => handleAnswer(opt)} className="p-6 text-left rounded-[2rem] border-2 border-white/30 bg-white/10 hover:bg-white hover:text-dare-gold transition-all font-black text-xl">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementTestView;
