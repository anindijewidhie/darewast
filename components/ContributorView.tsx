
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, Subject, LessonContent, MasteryLevel, ContributorRole, ProfessionalCredentials, UserProgress } from '../types';
import { SUBJECTS, LEVEL_METADATA } from '../constants';
import { translations } from '../translations';
import { digitizeMaterial } from '../services/geminiService';
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
  combinationPotential: string;
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
        processContributionImage(base64Data, 'image/jpeg');
        stopCamera();
      }
    }
  };

  const processContributionImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    setScanResult(null);
    try {
      const result = await digitizeMaterial(base64Data, language, user);
      setScanResult(result as any);
    } catch (err) { 
      alert("Neural synthesis interrupted."); 
    } finally { 
      setLoading(false); 
    }
  };

  if (onboardingStep === 'role') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-fadeIn">
        <h2 className="text-5xl font-black text-center mb-16 dark:text-white tracking-tighter uppercase leading-none">Authority Registration</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-dare-gold dark:bg-slate-900 rounded-[3rem] p-10 border-4 border-white/20 shadow-2xl flex flex-col justify-between group hover:scale-[1.02] transition-all">
            <div><div className="w-20 h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-inner">🎓</div><h3 className="text-3xl font-black mb-4 text-slate-950 dark:text-white uppercase">{t('educatorPath')}</h3><p className="text-slate-950/70 dark:text-gray-500 mb-8 leading-relaxed font-bold italic">{t('educatorRequirement')}</p></div>
            <button onClick={() => handleRoleSelection('Educator')} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-xl shadow-xl transition-all uppercase tracking-widest">Select Educator</button>
          </div>
          <div className="bg-dare-purple dark:bg-slate-900 rounded-[3rem] p-10 border-4 border-white/20 shadow-2xl flex flex-col justify-between group hover:scale-[1.02] transition-all text-white">
            <div><div className="w-20 h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-inner">🌱</div><h3 className="text-3xl font-black mb-4 uppercase">{t('contributorPath')}</h3><p className="text-white/70 dark:text-gray-400 mb-8 leading-relaxed font-bold italic">{t('contributorRequirement')}</p></div>
            <button onClick={() => handleRoleSelection('Contributor')} className="w-full py-5 bg-white text-dare-purple rounded-2xl font-black text-xl shadow-xl transition-all uppercase tracking-widest">Select Contributor</button>
          </div>
        </div>
      </div>
    );
  }

  if (onboardingStep === 'hub') {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="text-gray-400 hover:text-dare-gold flex items-center transition-all font-bold group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
          </button>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 bg-dare-gold/10 text-dare-gold border-dare-gold/20`}>
            {user.contributorRole === 'Educator' ? '🎖️ Verified Educator' : '🌱 Certified Contributor'}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-12">
              <section className="bg-dare-gold dark:bg-slate-900 rounded-[3.5rem] p-12 border-4 border-white/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black text-slate-950 uppercase rotate-12">GRID</div>
                
                {loading ? (
                  <div className="py-24 text-center space-y-8 animate-pulse text-slate-950">
                     <div className="w-24 h-24 border-[10px] border-slate-950/10 border-t-slate-950 rounded-full animate-spin mx-auto"></div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter">Digitalizing Logic Nodes...</h3>
                  </div>
                ) : isCameraActive ? (
                  <div className="bg-black rounded-[3rem] overflow-hidden relative shadow-2xl aspect-video border-4 border-white/20">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                      <button onClick={captureFrame} className="px-10 py-4 bg-white text-dare-gold rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest">Capture Material</button>
                      <button onClick={stopCamera} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-10 animate-fadeIn relative z-10">
                     <div className="bg-dare-teal rounded-[3rem] p-10 border-4 border-white/30 shadow-2xl text-slate-950">
                        <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                           <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl text-white">
                             {SUBJECTS.find(s => s.name === scanResult.detectedSubject)?.icon || '📚'}
                           </div>
                           <div className="flex-1 text-center md:text-left space-y-4">
                              <h3 className="text-4xl font-black leading-tight uppercase tracking-tighter">{scanResult.lesson.title}</h3>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">{scanResult.detectedSubject} • Trinity Synthesis Node</p>
                           </div>
                        </div>
                        <button onClick={() => onSuccess()} className="w-full py-8 bg-slate-950 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest">Anchor to Grid →</button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-12 text-center relative z-10">
                     <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-none uppercase">Global Digitalization Hub</h2>
                        <p className="text-slate-900/60 font-bold max-w-xl mx-auto italic text-lg leading-relaxed">"Convert textbooks and music into unlimited adaptive combinations."</p>
                     </div>
                     <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <button onClick={() => startCamera('contribution')} className="p-12 bg-slate-950 rounded-[3rem] border-4 border-white/10 hover:border-white transition-all text-center space-y-6 text-white group shadow-2xl">
                          <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner group-hover:scale-110 transition-transform">📷</div>
                          <h4 className="text-xl font-black uppercase tracking-widest">Scan Material</h4>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-12 bg-slate-900 rounded-[3rem] border-4 border-white/10 hover:border-white transition-all text-center space-y-6 text-white group shadow-2xl">
                          <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner group-hover:scale-110 transition-transform">📁</div>
                          <h4 className="text-xl font-black uppercase tracking-widest">Upload Files</h4>
                        </button>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" />
                  </div>
                )}
              </section>
           </div>
        </div>
      </div>
    );
  }

  return onboardingStep === 'evidence' ? (
    <div className="max-w-2xl mx-auto py-20 px-6 animate-fadeIn text-center">
      <div className="bg-dare-gold p-16 rounded-[4rem] border-4 border-white/30 shadow-2xl">
        <h2 className="text-5xl font-black mb-12 text-slate-950 tracking-tighter uppercase">Verification Registry</h2>
        <div className="grid gap-6">
          <button onClick={() => startCamera('verification')} className="p-12 bg-slate-950 border-4 border-white/10 rounded-[3rem] hover:border-white hover:scale-[1.02] transition-all text-white shadow-2xl group">
            <span className="text-6xl block mb-6 group-hover:scale-110 transition-transform">📜</span>
            <h4 className="text-2xl font-black uppercase tracking-widest">{t('scanUnivCert')}</h4>
          </button>
        </div>
        <button onClick={onBack} className="mt-12 text-slate-950 font-black uppercase text-xs tracking-widest hover:text-rose-700">Cancel Registration</button>
      </div>
    </div>
  ) : null;
};

export default ContributorView;
