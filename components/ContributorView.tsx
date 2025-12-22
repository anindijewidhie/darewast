
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, Subject, LessonContent, MasteryLevel, ContributorRole } from '../types';
import { SUBJECTS, LEVEL_METADATA } from '../constants';
import { translations } from '../translations';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  language: Language;
  user: User;
  onBack: () => void;
  onSuccess: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

interface ScanResult {
  lesson: LessonContent;
  detectedLevel: MasteryLevel;
  detectedSubject: string;
  confidence: number;
  detectedEra?: string;
  materialType?: 'textbook' | 'sheet_music' | 'source_code' | 'diagram' | 'historical_document';
}

interface ManagedLesson {
  id: string;
  title: string;
  subjectIcon: string;
  date: string;
  level: string;
  role: ContributorRole;
}

const ContributorView: React.FC<Props> = ({ language, user, onBack, onSuccess, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'auto'>(SUBJECTS[0]);
  const [uploadType, setUploadType] = useState<'scan' | 'video' | 'file' | 'certificate' | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [myLessons, setMyLessons] = useState<ManagedLesson[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  
  // Professional Verification State
  const [showRoleSelect, setShowRoleSelect] = useState(!user.contributorRole);
  const [proForm, setProForm] = useState({
    title: user.professionalCredentials?.title || '',
    institution: user.professionalCredentials?.institution || '',
    degree: user.professionalCredentials?.degree || '',
    yearsOfExperience: user.professionalCredentials?.yearsOfExperience || 0,
    certificateUploaded: user.professionalCredentials?.certificateUploaded || false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  useEffect(() => {
    const saved = localStorage.getItem(`darewast-contributions-${user.username}`);
    if (saved) {
      setMyLessons(JSON.parse(saved));
    }
  }, [user.username]);

  const handleSetRole = (role: ContributorRole) => {
    if (role === 'General') {
      onUpdateUser({ contributorRole: 'General', weeklyStipend: 200 });
      setShowRoleSelect(false);
    } else {
      // Stay on role select to fill pro form
    }
  };

  const handleProSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proForm.certificateUploaded) {
      alert(t('certRequired'));
      return;
    }
    onUpdateUser({ 
      contributorRole: 'Professional',
      weeklyStipend: 500,
      professionalCredentials: {
        ...proForm,
        verificationStatus: 'pending'
      }
    });
    setShowRoleSelect(false);
  };

  const saveContribution = (lesson: ManagedLesson) => {
    const updated = [lesson, ...myLessons];
    setMyLessons(updated);
    localStorage.setItem(`darewast-contributions-${user.username}`, JSON.stringify(updated));
    onUpdateUser({ contributions: user.contributions + 1 });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied. Please use file upload instead.");
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
        if (uploadType === 'certificate') {
          processCertificate(base64Data, 'image/jpeg');
        } else {
          processImage(base64Data, 'image/jpeg');
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      if (uploadType === 'certificate') {
        processCertificate(base64Data, file.type);
      } else {
        processImage(base64Data, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const processCertificate = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    try {
      // Simulate verification AI check
      await new Promise(r => setTimeout(r, 2000));
      setProForm(prev => ({ ...prev, certificateUploaded: true }));
      setLoading(false);
      setUploadType(null);
      alert(t('certUploaded'));
    } catch (err) {
      setLoading(false);
      alert("Certificate processing failed.");
    }
  };

  const processImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    setScanResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        UNIVERSAL ACADEMIC ANALYZER ROLE:
        Analyze this educational material. Subject should be from: ${SUBJECTS.map(s => s.name).join(', ')}.
        Language: ${language}.
        
        CONTRIBUTOR CONTEXT: ${user.contributorRole} Contributor.
        ${user.contributorRole === 'Professional' ? 'PROFESSIONAL MODE: Ensure higher rigor, use formal academic terminology, and structure for university-level equivalency if applicable.' : 'GENERAL MODE: Focus on clarity, engagement, and foundational understanding.'}

        FORMATTING:
        - TRANSFORM the content into a Kumon-like lesson.
        - Ensure steps are small and incremental.

        Return output as JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedSubject: { type: Type.STRING },
              detectedLevel: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              detectedEra: { type: Type.STRING },
              materialType: { type: Type.STRING },
              lesson: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                      },
                      required: ["question", "correctAnswer", "explanation"]
                    }
                  }
                },
                required: ["title", "explanation", "examples", "exercises"]
              }
            },
            required: ["detectedSubject", "detectedLevel", "lesson", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setScanResult(result);
      setLoading(false);
    } catch (err) {
      alert(t('errorGenerating'));
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (scanResult) {
      const subjectMatch = SUBJECTS.find(s => s.name.toLowerCase() === scanResult.detectedSubject.toLowerCase()) || SUBJECTS[0];
      saveContribution({
        id: Date.now().toString(),
        title: scanResult.lesson.title,
        subjectIcon: subjectMatch.icon,
        date: new Date().toISOString().split('T')[0],
        level: scanResult.detectedLevel,
        role: user.contributorRole || 'General'
      });
      alert(t('contributionSuccess'));
      onSuccess();
    }
  };

  if (showRoleSelect) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-fadeIn">
        <h2 className="text-5xl font-black text-center mb-4 dark:text-white tracking-tighter">Choose Your Contributor Path</h2>
        <p className="text-gray-500 text-center mb-16 text-lg">Help darewast expand its global library of knowledge.</p>
        
        <div className="grid md:grid-cols-2 gap-10">
          {/* General Path */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col justify-between group hover:border-dare-teal transition-all">
            <div>
              <div className="w-20 h-20 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🌱</div>
              <h3 className="text-3xl font-black mb-1 dark:text-white">General Contributor</h3>
              <p className="text-dare-teal font-black text-xl mb-4">{t('genEarnings')}</p>
              <p className="text-gray-500 mb-8 leading-relaxed">Perfect for enthusiasts, students, and life-long learners. Share materials you've found helpful and help others master foundations.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                  <span className="text-dare-teal">✓</span> "Community Contributor" Badge
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                  <span className="text-dare-teal">✓</span> Earn XP for every lesson published
                </li>
              </ul>
            </div>
            <button onClick={() => handleSetRole('General')} className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-xl hover:shadow-xl hover:shadow-dare-teal/20 transition-all">Select General Path</button>
          </div>

          {/* Professional Path */}
          <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black text-white">PRO</div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-20 h-20 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">🏅</div>
                <h3 className="text-3xl font-black mb-1 text-white">Professional Contributor</h3>
                <p className="text-dare-gold font-black text-xl mb-4">{t('proEarnings')}</p>
                <p className="text-gray-400 mb-8 leading-relaxed">For professional educators, researchers, and degree-holders. Provide high-rigor materials and earn professional verification.</p>
                
                <form onSubmit={handleProSubmit} className="space-y-4 mb-8">
                  <input 
                    placeholder="Professional Title (e.g. Senior Lecturer)" 
                    className="w-full bg-slate-800 border-2 border-transparent focus:border-dare-gold rounded-xl p-3 text-white font-bold outline-none"
                    value={proForm.title}
                    onChange={e => setProForm({...proForm, title: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="Institution" 
                    className="w-full bg-slate-800 border-2 border-transparent focus:border-dare-gold rounded-xl p-3 text-white font-bold outline-none"
                    value={proForm.institution}
                    onChange={e => setProForm({...proForm, institution: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      placeholder="Degree" 
                      className="w-full bg-slate-800 border-2 border-transparent focus:border-dare-gold rounded-xl p-3 text-white font-bold outline-none"
                      value={proForm.degree}
                      onChange={e => setProForm({...proForm, degree: e.target.value})}
                      required
                    />
                    <input 
                      type="number"
                      placeholder="Exp. Years" 
                      className="w-full bg-slate-800 border-2 border-transparent focus:border-dare-gold rounded-xl p-3 text-white font-bold outline-none"
                      value={proForm.yearsOfExperience}
                      onChange={e => setProForm({...proForm, yearsOfExperience: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  {/* Certificate Scan Button */}
                  <button 
                    type="button"
                    onClick={() => { setUploadType('certificate'); startCamera(); }}
                    className={`w-full py-4 border-2 border-dashed rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${proForm.certificateUploaded ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-700 text-gray-400 hover:border-dare-gold hover:text-dare-gold'}`}
                  >
                    {proForm.certificateUploaded ? '✓ ' + t('certUploaded') : '📄 ' + t('scanUnivCert')}
                  </button>

                  <button type="submit" className="w-full py-5 bg-dare-gold text-slate-900 rounded-2xl font-black text-xl hover:shadow-xl hover:shadow-dare-gold/20 transition-all mt-4">Verify Professional Path</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-dare-teal/20 border-t-dare-teal rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🔍</div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('detecting')}</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold">{t('processingContribution')}</p>
          <p className="text-[10px] font-black text-dare-teal uppercase tracking-widest mt-4">Applying {user.contributorRole} Standards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fadeIn px-4">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={() => { stopCamera(); onBack(); }} 
          className="text-gray-400 hover:text-dare-purple flex items-center transition-all font-bold group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${user.contributorRole === 'Professional' ? 'bg-dare-gold/10 text-dare-gold border-dare-gold/20' : 'bg-dare-teal/10 text-dare-teal border-dare-teal/20'}`}>
          {user.contributorRole === 'Professional' ? '🎖️ Professional Contributor ($500/wk)' : '🌱 General Contributor ($200/wk)'}
        </div>
      </div>

      {!scanResult ? (
        <div className="space-y-12">
          {/* Camera View */}
          {isCameraActive ? (
            <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-dare-teal relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto aspect-video object-cover" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <button onClick={captureFrame} className="px-10 py-5 bg-dare-teal text-white rounded-2xl font-black text-xl shadow-2xl animate-pulse">Capture</button>
                <button onClick={stopCamera} className="px-6 py-5 bg-white/20 backdrop-blur-md text-white rounded-2xl font-black">Stop</button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-12 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple"></div>
              
              <header className="mb-12 text-center">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Contribution Hub</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Transform any educational resource into a structured lesson.</p>
              </header>

              <div className="space-y-12">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. Set Scanning Mode</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('historicalMode')}</span>
                      <button onClick={() => setIsHistoricalMode(!isHistoricalMode)} className={`w-12 h-6 rounded-full transition-all relative ${isHistoricalMode ? 'bg-dare-gold' : 'bg-gray-200 dark:bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isHistoricalMode ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    <button onClick={() => setSelectedSubject('auto')} className={`p-4 rounded-2xl text-xs font-black border-2 text-center ${selectedSubject === 'auto' ? 'border-dare-gold bg-dare-gold/5 text-dare-gold shadow-lg' : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-500 hover:border-gray-200'}`}>
                      <span className="text-2xl block mb-2">🤖</span>
                      <span className="line-clamp-1">{t('autoDetect')}</span>
                    </button>
                    {SUBJECTS.map(sub => (
                      <button key={sub.id} onClick={() => setSelectedSubject(sub)} className={`p-4 rounded-2xl text-xs font-black border-2 text-center ${selectedSubject !== 'auto' && selectedSubject.id === sub.id ? 'border-dare-purple bg-dare-purple/5 text-dare-purple shadow-lg' : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-500 hover:border-gray-200'}`}>
                        <span className="text-2xl block mb-2">{sub.icon}</span>
                        <span className="line-clamp-1">{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <button onClick={() => { setUploadType('scan'); startCamera(); }} className="p-10 rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-teal hover:bg-dare-teal/5 transition-all text-center space-y-4">
                      <div className="w-16 h-16 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-3xl mx-auto">📷</div>
                      <h4 className="text-lg font-black dark:text-white">Scan Paper</h4>
                    </button>
                    <button onClick={() => { setUploadType('file'); fileInputRef.current?.click(); }} className="p-10 rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-gold hover:bg-dare-gold/5 transition-all text-center space-y-4">
                      <div className="w-16 h-16 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-3xl mx-auto">📁</div>
                      <h4 className="text-lg font-black dark:text-white">Upload File</h4>
                    </button>
                    <button onClick={() => { setUploadType('video'); fileInputRef.current?.click(); }} className="p-10 rounded-[2rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-purple hover:bg-dare-purple/5 transition-all text-center space-y-4">
                      <div className="w-16 h-16 bg-dare-purple/10 text-dare-purple rounded-3xl flex items-center justify-center text-3xl mx-auto">🎥</div>
                      <h4 className="text-lg font-black dark:text-white">Video Frame</h4>
                    </button>
                  </div>
                </section>
              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={uploadType === 'video' ? 'video/*' : 'image/*'} />
            </div>
          )}

          {/* History */}
          {myLessons.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-xl">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Recent Contributions</h3>
               <div className="space-y-4">
                  {myLessons.map(l => (
                    <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                       <div className="flex items-center gap-4">
                          <span className="text-2xl">{l.subjectIcon}</span>
                          <div>
                            <p className="font-black dark:text-white">{l.title}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Level {l.level} • {l.date}</p>
                          </div>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${l.role === 'Professional' ? 'text-dare-gold border-dare-gold/20 bg-dare-gold/5' : 'text-dare-teal border-dare-teal/20 bg-dare-teal/5'}`}>{l.role}</span>
                    </div>
                  ))}
               </div>
            </section>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-fadeIn">
          <div className={`p-12 text-center text-white relative ${user.contributorRole === 'Professional' ? 'bg-slate-900' : 'bg-dare-teal'}`}>
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-80">{scanResult.detectedSubject} • Level {scanResult.detectedLevel}</p>
            <h3 className="text-4xl font-black mb-8 leading-tight drop-shadow-lg">{scanResult.lesson.title}</h3>
            <div className={`inline-block px-6 py-2 rounded-2xl font-black text-sm shadow-xl ${user.contributorRole === 'Professional' ? 'bg-dare-gold text-slate-900' : 'bg-white text-dare-teal'}`}>
              Ready to Publish as {user.contributorRole}
            </div>
          </div>
          <div className="p-10 space-y-8">
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed italic">"{scanResult.lesson.explanation.substring(0, 200)}..."</p>
            <div className="flex gap-4">
              <button onClick={handleConfirm} className="flex-1 py-5 bg-dare-teal text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all">Publish Lesson</button>
              <button onClick={() => setScanResult(null)} className="px-10 py-5 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-2xl font-black">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorView;
