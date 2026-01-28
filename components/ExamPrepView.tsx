
import React, { useState, useMemo } from 'react';
import { Subject, Language, User, LessonContent, MasteryLevel } from '../types';
import { generateExamPrep } from '../services/geminiService';
import { translations } from '../translations';
import { MASTERY_LEVEL_ORDER } from '../constants';

interface Props {
  user: User;
  subject: Subject;
  language: Language;
  onBack: () => void;
  onComplete: () => void;
}

const ExamPrepView: React.FC<Props> = ({ user, subject, language, onBack, onComplete }) => {
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [prepContent, setPrepContent] = useState<(LessonContent & { tacticalTips: string[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const standardWeeks = useMemo(() => {
    const masteryIndex = MASTERY_LEVEL_ORDER.indexOf(user.level as any);
    const pIndex = MASTERY_LEVEL_ORDER.indexOf('P');
    return masteryIndex <= pIndex ? 12 : 24;
  }, [user.level]);

  const boards = useMemo(() => [
    { name: 'darewast Official Certification', weeks: standardWeeks, system: 'Universal Standards' },
    { name: 'SAT / ACT / AP', weeks: 12, system: 'US Standard' },
    { name: 'IB Diploma Programme', weeks: 24, system: 'International' },
    { name: 'GCSE / A-Levels', weeks: 12, system: 'UK National' },
    { name: 'Gaokao / CSAT / JEE', weeks: 16, system: 'Asia Elite' }
  ], [standardWeeks]);

  const handleStartPrep = async (boardName: string) => {
    setLoading(true);
    setActiveBoard(boardName);
    try {
      const content = await generateExamPrep(subject, language, boardName, 1, user);
      setPrepContent(content);
    } catch (err) {
      alert("Failed to synthesize prep content.");
      setActiveBoard(null);
    } finally { setLoading(false); }
  };

  const checkAnswer = (idx: number, ans: string) => {
    setUserAnswers(prev => ({ ...prev, [idx]: ans }));
    setCheckedIndices(prev => new Set(prev).add(idx));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fadeIn">
        <div className="w-20 h-20 border-8 border-dare-purple border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Synthesizing Tactics</h2>
          <p className="text-gray-500 font-bold">Aligning mastery to {activeBoard} curricula...</p>
        </div>
      </div>
    );
  }

  if (prepContent) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
        <button onClick={() => setPrepContent(null)} className="mb-8 text-gray-400 font-bold flex items-center gap-2 group transition-all">← Back to Boards</button>
        <div className="space-y-10">
          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] border-b-8 border-pink-500 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">PREP</div>
             <div className="relative z-10">
                <p className="text-pink-400 font-black uppercase text-[10px] tracking-[0.4em] mb-2">{activeBoard} • Simulation 01</p>
                <h2 className="text-4xl font-black tracking-tight">{prepContent.title}</h2>
             </div>
          </div>
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-slate-800">
             <div className="flex items-center gap-3 mb-8"><span className="w-10 h-1 bg-pink-500 rounded-full"></span><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tactical Insight Lab</h3></div>
             <div className="grid gap-4">
                {prepContent.tacticalTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/20">
                     <span className="text-xl">💡</span><p className="text-pink-800 dark:text-pink-300 font-bold text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
             </div>
          </section>
          <section className="space-y-8">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] text-center">Simulation Drills</h3>
             {prepContent.exercises.map((ex, i) => {
               const isChecked = checkedIndices.has(i);
               const userAns = userAnswers[i];
               const isCorrect = userAns === ex.correctAnswer;
               return (
                 <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all ${isChecked ? (isCorrect ? 'border-emerald-500 bg-emerald-50/10' : 'border-rose-500 bg-rose-50/10') : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                    <h4 className="text-xl font-black mb-8 dark:text-white">{ex.question}</h4>
                    <div className="grid gap-3">
                       {ex.options?.map(opt => (
                         <button key={opt} disabled={isChecked} onClick={() => checkAnswer(i, opt)} className={`p-5 text-left rounded-2xl font-bold transition-all ${isChecked ? (opt === ex.correctAnswer ? 'bg-emerald-500 text-white shadow-lg' : (opt === userAns ? 'bg-rose-500 text-white' : 'opacity-20')) : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-gray-600 dark:text-gray-300'}`}>{opt}</button>
                       ))}
                    </div>
                 </div>
               );
             })}
          </section>
          <button onClick={onComplete} className="w-full py-8 bg-gradient-to-r from-dare-purple to-pink-500 text-white rounded-[3rem] font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all">Conclude Prep Session 🎯</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
      <button onClick={onBack} className="mb-8 text-gray-400 font-bold flex items-center gap-2 group transition-all">← {t('backToDashboard')}</button>
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-purple to-pink-500"></div>
        <h2 className="text-5xl font-black mb-6 tracking-tighter">Universal Exam Prep 🎯</h2>
        <p className="text-gray-500 text-xl mb-12 leading-relaxed max-w-2xl font-medium">The darewast Exam engine covers all worldwide curricula. Preparation periods: <span className="text-dare-purple font-black">12 weeks</span> for Foundation path, <span className="text-dare-purple font-black">24 weeks</span> for Advanced path.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {boards.map(board => (
            <button key={board.name} onClick={() => handleStartPrep(board.name)} className="p-8 rounded-[2.5rem] text-left border-2 border-gray-50 dark:border-slate-800 hover:border-dare-purple hover:bg-dare-purple/5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-dare-purple/10 text-dare-purple rounded-full text-[10px] font-black uppercase tracking-widest">{board.weeks} Weeks</span>
                <span className="text-[10px] font-black text-gray-400 group-hover:text-dare-purple transition-colors uppercase tracking-widest">{board.system}</span>
              </div>
              <h3 className="text-2xl font-black mb-2 dark:text-white group-hover:translate-x-1 transition-transform">{board.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{subject.name} Preparation</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamPrepView;
