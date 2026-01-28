
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, Subject, LessonContent, MasteryLevel, ContributorRole, ProfessionalCredentials, UserProgress } from '../types';
import { SUBJECTS, LEVEL_METADATA } from '../constants';
import { translations } from '../translations';
import { GoogleGenAI, Type } from "@google/genai";
import PlacementTestView from './PlacementTestView';

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
  detectedEra: string;
  materialType: 'textbook' | 'sheet_music' | 'source_code' | 'diagram' | 'historical_document';
}

const ContributorView: React.FC<Props> = ({ language, user, onBack, onSuccess, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'role' | 'evidence' | 'portfolio' | 'diagnostic' | 'hub'>(user.contributorRole ? 'hub' : 'role');
  const [selectedRole, setSelectedRole] = useState<ContributorRole | null>(user.contributorRole || null);
  const [evidenceType, setEvidenceType] = useState<'degree' | 'report_card' | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isEvidenceVerified, setIsEvidenceVerified] = useState(user.professionalCredentials?.evidenceUploaded || false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeMediaCaptureMode, setActiveMediaCaptureMode] = useState<'verification' | 'contribution' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = (key: string) => translations[language][key] || translations['English'][key] || key;

  const handleRoleSelection = (role: ContributorRole) => {
    setSelectedRole(role);
    setOnboardingStep('evidence');
  };

  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioUrl.trim()) return;
    setOnboardingStep('diagnostic');
  };

  const handleDiagnosticComplete = (recProgress: UserProgress) => {
    const stipend = selectedRole === 'Educator' ? 500 : 200;
    onUpdateUser({
      contributorRole: selectedRole!,
      weeklyStipend: stipend,
      professionalCredentials: {
        title: selectedRole === 'Educator' ? 'Verified Educator' : 'Certified Contributor',
        institution: 'darewast Academy',
        degree: evidenceType === 'degree' ? 'Bachelor/Higher' : 'Academic Portfolio',
        yearsOfExperience: 1,
        verificationStatus: 'verified',
        evidenceUploaded: true,
        evidenceType: evidenceType || 'degree',
        portfolioUrl: portfolioUrl
      }
    });
    setOnboardingStep('hub');
  };

  const startCamera = (mode: 'verification' | 'contribution') => {
    setActiveMediaCaptureMode(mode);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      })
      .catch(() => alert("Camera access denied."));
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setActiveMediaCaptureMode(null);
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
        if (activeMediaCaptureMode === 'verification') {
          processVerificationImage(base64Data, 'image/jpeg');
        } else {
          processContributionImage(base64Data, 'image/jpeg');
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      if (onboardingStep !== 'hub') {
        processVerificationImage(base64Data, file.type);
      } else {
        processContributionImage(base64Data, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const processVerificationImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this ${evidenceType === 'degree' ? 'University Degree' : 'Academic Report Card'}. Verify identity for ${selectedRole} role. Return JSON.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: { verified: { type: Type.BOOLEAN }, confidence: { type: Type.NUMBER } },
            required: ['verified']
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      if (result.verified) {
        setIsEvidenceVerified(true);
        setOnboardingStep('portfolio');
      } else { alert("Verification failed."); }
    } catch (err) { alert("Error processing document."); } finally { setLoading(false); }
  };

  const processContributionImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    setScanResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        ROLE: World-Class Academic Ingestion Architect. Digitize this material into the darewast 24/7 Grid.
        1. Material type: textbook, sheet_music, source_code, diagram, historical_document.
        2. Detect subject (Map to: ${SUBJECTS.map(s => s.name).join(', ')}).
        3. Detect Mastery Level (A-T Scale).
        4. Detect Era: Modern, Legacy (1960-2010), Classical (Pre-1960).
        5. Synthesize 2 exercises. Maintain context integrity.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedSubject: { type: Type.STRING },
              detectedLevel: { type: Type.STRING },
              detectedEra: { type: Type.STRING },
              materialType: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              lesson: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING } } } }
                }
              }
            },
            required: ['detectedSubject', 'detectedLevel', 'materialType', 'lesson']
          }
        }
      });
      setScanResult(JSON.parse(response.text || '{}'));
    } catch (err) { alert("Neural synthesis interrupted."); } finally { setLoading(false); }
  };

  if (onboardingStep === 'role') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-fadeIn">
        <h2 className="text-5xl font-black text-center mb-16 dark:text-white tracking-tighter">Academic Authority Hub</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col justify-between group hover:border-dare-teal transition-all">
            <div><div className="w-20 h-20 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🎓</div><h3 className="text-3xl font-black mb-4 dark:text-white">{t('educatorPath')}</h3><p className="text-gray-500 mb-8 leading-relaxed">{t('educatorRequirement')}</p></div>
            <button onClick={() => handleRoleSelection('Educator')} className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-xl hover:shadow-xl transition-all">Select Educator</button>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col justify-between group hover:border-dare-gold transition-all">
            <div><div className="w-20 h-20 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🌱</div><h3 className="text-3xl font-black mb-4 text-white">{t('contributorPath')}</h3><p className="text-gray-400 mb-8 leading-relaxed">{t('contributorRequirement')}</p></div>
            <button onClick={() => handleRoleSelection('Contributor')} className="w-full py-5 bg-dare-gold text-slate-900 rounded-2xl font-black text-xl hover:shadow-xl transition-all">Select Contributor</button>
          </div>
        </div>
      </div>
    );
  }

  if (onboardingStep === 'hub') {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="text-gray-400 hover:text-dare-purple flex items-center transition-all font-bold">← {t('backToDashboard')}</button>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${user.contributorRole === 'Educator' ? 'bg-dare-teal/10 text-dare-teal border-dare-teal/20' : 'bg-dare-gold/10 text-dare-gold border-dare-gold/20'}`}>
            {user.contributorRole === 'Educator' ? '🎖️ Verified Educator' : '🌱 Certified Contributor'}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-12">
              <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple"></div>
                {loading ? (
                  <div className="py-24 text-center space-y-8 animate-pulse">
                     <div className="w-24 h-24 border-[10px] border-dare-teal/10 border-t-dare-teal rounded-full animate-spin mx-auto"></div>
                     <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Neural Ingestion...</h3>
                  </div>
                ) : isCameraActive ? (
                  <div className="bg-black rounded-[3rem] overflow-hidden relative shadow-2xl aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-4 border-dare-teal/20 pointer-events-none">
                       <div className="absolute top-0 left-0 w-full h-1 bg-dare-teal/50 animate-[scanLine_2s_linear_infinite]"></div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                      <button onClick={captureFrame} className="px-10 py-4 bg-dare-teal text-white rounded-2xl font-black">Capture Node</button>
                      <button onClick={stopCamera} className="px-6 py-4 bg-white/20 text-white rounded-2xl font-black backdrop-blur-md">Cancel</button>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-10 animate-fadeIn">
                     <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-6xl shadow-xl">{SUBJECTS.find(s => s.name === scanResult.detectedSubject)?.icon || '📚'}</div>
                        <div className="flex-1 text-center md:text-left">
                           <div className="flex gap-2 mb-2 justify-center md:justify-start">
                              <span className="px-3 py-1 bg-dare-teal text-white rounded-full text-[9px] font-black uppercase">Lvl {scanResult.detectedLevel}</span>
                              <span className="px-3 py-1 bg-dare-gold/20 text-dare-gold rounded-full text-[9px] font-black uppercase">{Math.round(scanResult.confidence * 100)}% Match</span>
                           </div>
                           <h3 className="text-3xl font-black dark:text-white mb-2">{scanResult.lesson.title}</h3>
                           <p className="text-gray-500 font-medium">Era: <span className="text-gray-900 dark:text-white font-black">{scanResult.detectedEra}</span> • Material: <span className="text-gray-900 dark:text-white font-black">{scanResult.materialType.replace('_', ' ')}</span></p>
                        </div>
                     </div>
                     <button onClick={() => setScanResult(null)} className="w-full py-6 bg-dare-teal text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all">Finalize Ingestion</button>
                  </div>
                ) : (
                  <div className="space-y-12 text-center">
                     <h2 className="text-4xl font-black mb-12">Neural Contribution Hub</h2>
                     <div className="grid sm:grid-cols-2 gap-6">
                        <button onClick={() => startCamera('contribution')} className="p-10 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-teal transition-all text-center space-y-4 group">
                          <div className="w-16 h-16 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-3xl mx-auto">📷</div>
                          <h4 className="text-lg font-black dark:text-white">{t('scanMaterials')}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sheet Music • Code • Diagrams</p>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-10 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-gold transition-all text-center space-y-4 group">
                          <div className="w-16 h-16 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-3xl mx-auto">📁</div>
                          <h4 className="text-lg font-black dark:text-white">{t('uploadFiles')}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PDF • JPG • PNG High Res</p>
                        </button>
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>
                )}
              </section>
           </div>
           <aside className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <p className="text-[10px] font-black text-dare-teal uppercase tracking-[0.4em] mb-4">Ingestion Metrics</p>
                <div className="flex justify-between items-center"><span className="text-gray-400 text-xs">Active Modules</span><span className="font-black text-xl">{user.contributions}</span></div>
                <div className="pt-4 border-t border-white/5 mt-4">
                   <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed italic">Neural engine optimized for Music Theory, Computer Science, and Classical Curricula.</p>
                </div>
              </div>
           </aside>
        </div>
      </div>
    );
  }

  return onboardingStep === 'evidence' ? (
    <div className="max-w-2xl mx-auto py-20 px-6 animate-fadeIn text-center">
      <h2 className="text-4xl font-black mb-12 dark:text-white">{t('academicEvidence')}</h2>
      <div className="grid gap-6">
        <button onClick={() => { setEvidenceType('degree'); startCamera('verification'); }} className="p-10 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem] hover:border-dare-teal transition-all">📜 <h4 className="text-xl font-black mt-4">{t('scanUnivCert')}</h4></button>
        <button onClick={() => { setEvidenceType('report_card'); startCamera('verification'); }} className="p-10 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem] hover:border-dare-gold transition-all">📝 <h4 className="text-xl font-black mt-4">{t('scanReportCard')}</h4></button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  ) : null;
};

export default ContributorView;
