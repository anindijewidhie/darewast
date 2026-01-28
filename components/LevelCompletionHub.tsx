
import React, { useState, useEffect } from 'react';
import { Subject, Language, MasteryLevel, User, ProjectPrompt, EssayGradingResult, CompletionMethod } from '../types';
import { generateMasteryProject, evaluatePerformance, gradeEssay, generateMasteryExam } from '../services/geminiService';
import { translations } from '../translations';
import MasteryExamView from './MasteryExamView';

interface Props {
  subject: Subject;
  language: Language;
  level: MasteryLevel;
  user: User;
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

const LevelCompletionHub: React.FC<Props> = ({ subject, language, level, user, onComplete, onBack }) => {
  const [method, setMethod] = useState<CompletionMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectPrompt, setProjectPrompt] = useState<ProjectPrompt | null>(null);
  const [submission, setSubmission] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<EssayGradingResult | null>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const canPerform = ['Music', 'Arts', 'Sports'].includes(subject.category) || subject.id.includes('dance') || subject.id.includes('mind-sports');

  const startMethod = async (m: CompletionMethod) => {
    setMethod(m);
    if (m === 'project') {
      setLoading(true);
      try {
        const prompt = await generateMasteryProject(subject, level, language);
        setProjectPrompt(prompt);
      } catch (err) {
        alert("Failed to load project parameters.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProjectSubmit = async () => {
    if (!submission.trim()) return;
    setIsGrading(true);
    try {
      const res = await evaluatePerformance(subject, submission, language);
      setGradingResult(res);
      if (res.passed) {
        setTimeout(() => onComplete(Math.round(res.relevance), 100), 2000);
      }
    } catch (err) {
      alert("Grading synthesis failed.");
    } finally {
      setIsGrading(false);
    }
  };

  if (method === 'assessment') {
    return <MasteryExamView subject={subject} language={language} level={level} user={user} onComplete={onComplete} onBack={() => setMethod(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-teal flex items-center transition-all font-black uppercase text-xs tracking-widest group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
        <div className="px-4 py-1.5 bg-dare-teal/10 text-dare-teal rounded-full text-[10px] font-black uppercase tracking-widest border border-dare-teal/20">
          Mastery Verification Node
        </div>
      </div>

      {!method ? (
        <div className="space-y-12">
          <header className="text-center space-y-4">
             <div className="w-24 h-24 bg-dare-teal/10 text-dare-teal rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl">🎓</div>
             <h2 className="text-5xl font-black dark:text-white tracking-tighter">Level {level} Completion</h2>
             <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
               You have finished the academic cycle for <span className="text-dare-teal font-black">{subject.name}</span>. Choose your preferred method to verify mastery.
             </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <button onClick={() => startMethod('assessment')} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 hover:border-dare-teal transition-all text-left flex flex-col justify-between group shadow-xl hover:-translate-y-1">
                <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">📝</span>
                <div>
                   <h4 className="font-black text-lg dark:text-white mb-1">Standard Exam</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">A.I. Proctored diagnostic assessment.</p>
                </div>
             </button>

             <button onClick={() => startMethod('project')} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 hover:border-dare-purple transition-all text-left flex flex-col justify-between group shadow-xl hover:-translate-y-1">
                <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">🏗️</span>
                <div>
                   <h4 className="font-black text-lg dark:text-white mb-1">Mastery Project</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Synthesize a practical or research-led task.</p>
                </div>
             </button>

             <button 
                onClick={() => startMethod('performance')} 
                disabled={!canPerform}
                className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 transition-all text-left flex flex-col justify-between group shadow-xl hover:-translate-y-1 ${!canPerform ? 'opacity-30 cursor-not-allowed' : 'hover:border-dare-gold'}`}
             >
                <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">🎻</span>
                <div>
                   <h4 className="font-black text-lg dark:text-white mb-1">Performance</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Verification via creation or live demonstration.</p>
                </div>
             </button>

             <button onClick={() => startMethod('questionnaire')} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 hover:border-blue-500 transition-all text-left flex flex-col justify-between group shadow-xl hover:-translate-y-1">
                <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">🗣️</span>
                <div>
                   <h4 className="font-black text-lg dark:text-white mb-1">Questionnaire</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Reflective dialogue and logic validation.</p>
                </div>
             </button>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6">
               <div className="w-16 h-16 border-4 border-dare-teal border-t-transparent rounded-full animate-spin"></div>
               <p className="font-black text-dare-teal uppercase tracking-widest animate-pulse">Designing Completion Parameters...</p>
            </div>
          ) : method === 'project' && projectPrompt ? (
            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-7 space-y-8">
                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black">PROJ</div>
                     <p className="text-dare-teal font-black uppercase text-[10px] tracking-[0.4em] mb-2">Subject Mastery Task</p>
                     <h3 className="text-3xl font-black mb-6">{projectPrompt.title}</h3>
                     <div className="space-y-6">
                        <div>
                           <h5 className="text-xs font-black uppercase text-gray-400 mb-2">Objective</h5>
                           <p className="text-lg font-medium leading-relaxed">{projectPrompt.objective}</p>
                        </div>
                        <div>
                           <h5 className="text-xs font-black uppercase text-gray-400 mb-2">Requirements</h5>
                           <ul className="space-y-2">
                              {projectPrompt.requirements.map((r, i) => (
                                <li key={i} className="flex gap-3 text-sm font-bold text-gray-300">
                                   <span className="text-dare-teal">✓</span> {r}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black dark:text-white">Submission Portal</h4>
                        <span className="text-[8px] font-black text-dare-teal uppercase bg-dare-teal/5 px-2 py-1 rounded">Spell Check Active</span>
                     </div>
                     <textarea 
                        value={submission}
                        onChange={e => setSubmission(e.target.value)}
                        placeholder="Describe your project, upload files, or synthesize your narrative here..."
                        spellCheck={true}
                        className="w-full p-6 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-teal rounded-2xl outline-none font-bold text-sm dark:text-white transition-all min-h-[300px]"
                     />
                     <button 
                        onClick={handleProjectSubmit}
                        disabled={isGrading || !submission.trim()}
                        className="w-full py-5 mt-6 bg-dare-teal text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-dare-teal/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                     >
                        {isGrading ? 'Synthesizing Grade...' : 'Finalize Submission'}
                     </button>
                  </div>
               </div>
            </div>
          ) : method === 'performance' || method === 'questionnaire' ? (
             <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-2xl text-center">
                   <span className="text-6xl mb-8 block">{method === 'performance' ? '🎭' : '💡'}</span>
                   <h3 className="text-3xl font-black dark:text-white mb-4">{method === 'performance' ? 'Performance Evaluation' : 'Reflective Questionnaire'}</h3>
                   <p className="text-gray-500 font-medium leading-relaxed mb-8">
                     {method === 'performance' 
                        ? 'Describe your performance or achievement in detail. Include links to video/audio if applicable.'
                        : 'Explain how you have mastered the core logic of this level and how it applies to real-world scenarios.'}
                   </p>
                   <div className="relative">
                      <textarea 
                         value={submission}
                         onChange={e => setSubmission(e.target.value)}
                         placeholder="Enter your mastery narrative..."
                         spellCheck={true}
                         className="w-full p-6 bg-gray-50 dark:bg-slate-950 border-2 border-transparent focus:border-dare-gold rounded-2xl outline-none font-bold text-sm dark:text-white transition-all min-h-[250px] mb-6"
                      />
                      <div className="absolute bottom-10 right-4 text-[7px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">Spell Check Active</div>
                   </div>
                   <button 
                      onClick={handleProjectSubmit}
                      disabled={isGrading || !submission.trim()}
                      className="w-full py-5 bg-dare-gold text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-dare-gold/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                   >
                      {isGrading ? 'Analyzing Mastery...' : 'Submit Mastery Narrative'}
                   </button>
                </div>
             </div>
          ) : null}

          {gradingResult && (
             <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 text-center shadow-2xl animate-fadeIn">
                   <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl">✓</div>
                   <h3 className="text-3xl font-black mb-4 dark:text-white">Mastery Verified</h3>
                   <div className="grid grid-cols-3 gap-4 mb-8">
                      <div><p className="text-[8px] font-black text-gray-400 uppercase">Clarity</p><p className="text-xl font-black text-dare-teal">{gradingResult.clarity}%</p></div>
                      <div><p className="text-[8px] font-black text-gray-400 uppercase">Mastery</p><p className="text-xl font-black text-dare-gold">{gradingResult.relevance}%</p></div>
                      <div><p className="text-[8px] font-black text-gray-400 uppercase">Passed</p><p className="text-xl font-black text-emerald-500">YES</p></div>
                   </div>
                   <p className="text-gray-500 font-bold italic mb-8">"{gradingResult.feedback}"</p>
                   <p className="text-xs font-black uppercase text-dare-teal animate-pulse">Finalizing Diploma...</p>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelCompletionHub;
