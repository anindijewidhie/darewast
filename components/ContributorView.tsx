
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
  detectedEra?: string;
  materialType?: 'textbook' | 'sheet_music' | 'source_code' | 'diagram' | 'historical_document';
  isEducationDegree?: boolean;
}

const ContributorView: React.FC<Props> = ({ language, user, onBack, onSuccess, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'role' | 'evidence' | 'portfolio' | 'diagnostic' | 'hub'>(user.contributorRole ? 'hub' : 'role');
  const [selectedRole, setSelectedRole] = useState<ContributorRole | null>(user.contributorRole || null);
  const [evidenceType, setEvidenceType] = useState<'degree' | 'report_card' | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isEvidenceVerified, setIsEvidenceVerified] = useState(user.professionalCredentials?.evidenceUploaded || false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'auto'>(SUBJECTS[0]);
  const [uploadType, setUploadType] = useState<'scan' | 'file' | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

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
    // Finalize onboarding
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
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
        processVerificationImage(base64Data, 'image/jpeg');
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
      processVerificationImage(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processVerificationImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this ${evidenceType === 'degree' ? 'University Degree' : 'Academic Report Card'}. 
      Verify if it belongs to a ${selectedRole}. If it is a degree, check if it is Bachelor or higher and if it relates to Education.
      Return result as JSON.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              institution: { type: Type.STRING },
              degreeType: { type: Type.STRING },
              isEducationRelated: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER }
            },
            required: ['verified']
          }
        }
      });
      
      const result = JSON.parse(response.text);
      if (result.verified) {
        setIsEvidenceVerified(true);
        setOnboardingStep('portfolio');
      } else {
        alert("Verification failed. Please ensure the document is clear and valid.");
      }
    } catch (err) {
      alert("Error processing document.");
    } finally {
      setLoading(false);
    }
  };

  // Onboarding UI: Role selection
  if (onboardingStep === 'role') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 animate-fadeIn">
        <h2 className="text-5xl font-black text-center mb-4 dark:text-white tracking-tighter">Academic Authority Hub</h2>
        <p className="text-gray-500 text-center mb-16 text-lg">Join the world's largest 24/7 knowledge grid.</p>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col justify-between group hover:border-dare-teal transition-all">
            <div>
              <div className="w-20 h-20 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🎓</div>
              <h3 className="text-3xl font-black mb-1 dark:text-white">{t('educatorPath')}</h3>
              <p className="text-dare-teal font-black text-xl mb-4">{t('proEarnings')}</p>
              <p className="text-gray-500 mb-8 leading-relaxed">{t('educatorRequirement')}</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">✓ Degree Verification</li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">✓ Academic Diagnostic</li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">✓ Weekly Stipend Channel</li>
              </ul>
            </div>
            <button onClick={() => handleRoleSelection('Educator')} className="w-full py-5 bg-dare-teal text-white rounded-2xl font-black text-xl hover:shadow-xl shadow-dare-teal/20 transition-all">Select Educator</button>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl flex flex-col justify-between group hover:border-dare-gold transition-all">
            <div>
              <div className="w-20 h-20 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🌱</div>
              <h3 className="text-3xl font-black mb-1 text-white">{t('contributorPath')}</h3>
              <p className="text-dare-gold font-black text-xl mb-4">{t('genEarnings')}</p>
              <p className="text-gray-400 mb-8 leading-relaxed">{t('contributorRequirement')}</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-400">✓ Student Report Card Accepted</li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-400">✓ Portfolio Entry</li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-400">✓ Level Placement Test</li>
              </ul>
            </div>
            <button onClick={() => handleRoleSelection('Contributor')} className="w-full py-5 bg-dare-gold text-slate-900 rounded-2xl font-black text-xl hover:shadow-xl shadow-dare-gold/20 transition-all">Select Contributor</button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding UI: Evidence (Degree/Report Card)
  if (onboardingStep === 'evidence') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 animate-fadeIn text-center">
        <h2 className="text-4xl font-black mb-4 dark:text-white">{t('academicEvidence')}</h2>
        <p className="text-gray-500 mb-12">Scan your credentials to verify authority for the {selectedRole} role.</p>
        
        {loading ? (
          <div className="py-20 space-y-8">
            <div className="w-20 h-20 border-8 border-dare-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-black text-dare-teal animate-pulse uppercase tracking-widest">{t('detecting')}</p>
          </div>
        ) : isCameraActive ? (
          <div className="bg-black rounded-[3rem] overflow-hidden relative shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <button onClick={captureFrame} className="px-10 py-4 bg-dare-teal text-white rounded-2xl font-black">Capture</button>
              <button onClick={stopCamera} className="px-6 py-4 bg-white/20 text-white rounded-2xl font-black">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <button onClick={() => { setEvidenceType('degree'); startCamera(); }} className="p-10 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem] hover:border-dare-teal transition-all group">
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">📜</span>
              <h4 className="text-xl font-black dark:text-white">{t('scanUnivCert')}</h4>
              {selectedRole === 'Educator' && <p className="text-rose-500 text-[10px] font-black uppercase mt-2">Required for Educators</p>}
            </button>
            
            <button onClick={() => { setEvidenceType('report_card'); startCamera(); }} className="p-10 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem] hover:border-dare-gold transition-all group">
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">📝</span>
              <h4 className="text-xl font-black dark:text-white">{t('scanReportCard')}</h4>
              <p className="text-gray-400 text-[10px] font-black uppercase mt-2">School/Uni Student Path</p>
            </button>
            
            <button onClick={() => setOnboardingStep('portfolio')} className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-dare-teal transition-colors mt-6">
              Skip Evidence (Contributors Only)
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Onboarding UI: Portfolio
  if (onboardingStep === 'portfolio') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 animate-fadeIn">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-dare-purple/10 text-dare-purple rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📁</div>
          <h2 className="text-4xl font-black dark:text-white mb-2">{t('portfolio')}</h2>
          <p className="text-gray-500">Provide evidence of your academic or creative work.</p>
        </div>
        
        <form onSubmit={handlePortfolioSubmit} className="space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Portfolio Link (Website/Cloud/Drive)</label>
              <input 
                value={portfolioUrl} 
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://portfolio.university.edu/mywork"
                className="w-full p-6 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-dare-purple rounded-[2rem] outline-none font-bold dark:text-white transition-all shadow-inner"
                required
              />
           </div>
           
           <button type="submit" className="w-full py-6 bg-dare-purple text-white rounded-[2rem] font-black text-xl shadow-xl shadow-dare-purple/20 hover:scale-[1.02] active:scale-95 transition-all">
             Continue to Diagnostic →
           </button>
        </form>
      </div>
    );
  }

  // Onboarding UI: Diagnostic
  if (onboardingStep === 'diagnostic') {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-2xl mx-auto text-center py-12 px-6">
           <h2 className="text-4xl font-black mb-4 dark:text-white">{t('academicDiagnostic')}</h2>
           <p className="text-gray-500">Final step: Verify your mastery level to determine your institutional authority.</p>
        </div>
        <PlacementTestView 
           language={language} 
           user={user} 
           testType={selectedRole === 'Educator' ? 'assessment' : 'placement'}
           onCancel={() => setOnboardingStep('portfolio')}
           onComplete={handleDiagnosticComplete}
        />
      </div>
    );
  }

  // HUB VIEW (If verified)
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="text-gray-400 hover:text-dare-purple flex items-center transition-all font-bold group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> {t('backToDashboard')}
        </button>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${user.contributorRole === 'Educator' ? 'bg-dare-teal/10 text-dare-teal border-dare-teal/20' : 'bg-dare-gold/10 text-dare-gold border-dare-gold/20'}`}>
          {user.contributorRole === 'Educator' ? '🎖️ Verified Educator' : '🌱 Certified Contributor'}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-12">
            <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-12 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dare-teal via-dare-gold to-dare-purple"></div>
              <header className="mb-12 text-center">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Contribution Hub</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Transform any educational resource into a structured lesson.</p>
              </header>

              <div className="grid sm:grid-cols-2 gap-6">
                <button onClick={() => { startCamera(); }} className="p-10 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-teal transition-all text-center space-y-4">
                  <div className="w-16 h-16 bg-dare-teal/10 text-dare-teal rounded-3xl flex items-center justify-center text-3xl mx-auto">📷</div>
                  <h4 className="text-lg font-black dark:text-white">{t('scanMaterials')}</h4>
                </button>
                <button onClick={() => { fileInputRef.current?.click(); }} className="p-10 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-slate-800 hover:border-dare-gold transition-all text-center space-y-4">
                  <div className="w-16 h-16 bg-dare-gold/10 text-dare-gold rounded-3xl flex items-center justify-center text-3xl mx-auto">📁</div>
                  <h4 className="text-lg font-black dark:text-white">{t('uploadFiles')}</h4>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </section>
         </div>

         <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-dare-teal uppercase tracking-[0.4em] mb-4">Institutional Stats</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold text-xs">Total Lessons</span>
                    <span className="font-black text-xl">{user.contributions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold text-xs">Weekly Stipend</span>
                    <span className="font-black text-xl text-dare-gold">${user.weeklyStipend}</span>
                  </div>
                </div>
              </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

export default ContributorView;
