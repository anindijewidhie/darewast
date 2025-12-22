
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, Subject, LessonContent, User, MasteryLevel, UserProgress, AccommodationType, EducationTrack } from "../types";
import { LEVEL_METADATA, SUBJECTS } from "../constants";

export const generateLesson = async (
  subject: Subject,
  language: Language,
  level: MasteryLevel,
  lessonNumber: number,
  user?: User | null,
  progress?: UserProgress | null,
  secondaryLanguage?: Language,
  isExam: boolean = false
): Promise<LessonContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const age = user?.age || 10;
  const culturalBackground = user?.culturalBackground || 'Global';
  const iddActive = user?.accessibility?.iddSupport || false;
  
  const subProg = progress?.[subject.id];
  const currentTheme = subProg?.currentTheme;
  const educationTrack = subProg?.track || 'Standard';
  const specializations = subProg?.specializations || [];
  const lastScore = subProg?.lastScore;
  const isFastTrack = subProg?.isFastTrack || false;
  const fastTrackDuration = subProg?.fastTrackDuration || 60;
  
  const era = user?.academicDNA?.era || 'Modern';
  const method = user?.academicDNA?.method || 'Kumon-style';
  const hybridMethods = user?.academicDNA?.hybridMethods;

  const methodologyDescription = hybridMethods 
    ? `A HYBRID SYNERGY of ${hybridMethods[0]} and ${hybridMethods[1]}.` 
    : method;

  const specializationContext = specializations.length > 0 
    ? `Focus: ${specializations.join(', ')}.`
    : '';

  // --- REFINED DYNAMIC RIGOR LOGIC ---
  const momentum = lastScore ? (lastScore.correct / (lastScore.total || 1)) : 0.75;
  let difficultyDirective = "";
  
  if (momentum >= 0.9) {
    difficultyDirective = "ZONE OF PROXIMAL DEVELOPMENT (HIGH): Increase abstraction and logic complexity. Reduce scaffolding. Target Bloom's 'Synthesis' and 'Evaluation' tiers. Ensure problems require multi-disciplinary connections.";
  } else if (momentum >= 0.7) {
    difficultyDirective = "CHALLENGING STEADY-STATE: Standard mastery level. Introduce 1-2 'stretch' problems that bridge to the next mastery level.";
  } else if (momentum >= 0.5) {
    difficultyDirective = "REINFORCEMENT MODE: Focus on 'Application'. Use highly relatable examples and maintain clear, step-by-step logic. Don't increase difficulty until concepts are anchored.";
  } else {
    difficultyDirective = "SCAFFOLDED REMEDIATION: Focus on 'Recall' and 'Understanding'. Use simpler vocabulary, high visual/textual scaffolding, and 50% more concrete examples. Ensure the lesson builds confidence.";
  }

  const culturalDirective = `CULTURAL ANCHORING: Root all examples, scenarios, and story elements in the user's ${culturalBackground} background. Use relevant idioms, cultural norms, and localized logic.`;
  const ageDirective = `COGNITIVE CALIBRATION: Adjust syntax complexity, abstract reasoning, and vocabulary specifically for a ${age}-year-old learner.`;

  const fastTrackDirective = isFastTrack ? `FAST TRACK: Accelerated, high-density session for ${fastTrackDuration} minutes.` : "";

  const prompt = isExam 
    ? `Generate a 15-question FORMAL MASTERY EXAM for ${subject.name} Level ${level}. Language: ${language}. Era: ${era}. Method: ${methodologyDescription}. Cultural Context: ${culturalBackground}. ${specializationContext} Ensure university-entrance rigor for Level Q-T.`
    : `Generate Lesson ${lessonNumber}/12 for ${subject.name} Level ${level}. 
       Language: ${language}. 
       Era: ${era}. 
       Method: ${methodologyDescription}. 
       Theme: ${currentTheme || 'Standard'}. 
       ${difficultyDirective} 
       ${culturalDirective} 
       ${ageDirective} 
       ${fastTrackDirective}
       Ensure the lesson follows the Goldilocks principle: challenging enough to engage but achievable enough to build mastery.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          timelinePoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ["title", "detail", "icon"]
            }
          },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING }
              },
              required: ["question", "correctAnswer", "explanation", "hint"]
            }
          }
        },
        required: ["title", "explanation", "examples", "exercises"]
      },
    },
  });

  const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference",
    uri: chunk.web?.uri || ""
  })).filter((s: any) => s.uri) || [];

  try {
    const data = JSON.parse(response.text || '{}');
    return { ...data, level, lessonNumber, isExam, groundingSources };
  } catch (error) {
    throw new Error("Failed to design personalized content.");
  }
};

export const generateExamPrep = async (
  subject: Subject, 
  language: Language, 
  targetExam: string, 
  lessonNumber: number, 
  user: User
): Promise<LessonContent & { tacticalTips: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    INTENSIVE EXAM PREP: Generate Lesson ${lessonNumber}/12 for ${targetExam} preparation in ${subject.name}.
    Language: ${language}. Focus on tactical strategies, typical board questions, and high-yield topics.
    Return JSON with 'tacticalTips' (array of strings) and standard lesson fields.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          tacticalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateCustomSubject = async (query: string, track: EducationTrack, language: Language): Promise<Partial<Subject>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Metadata for module: "${query}". Campus: ${track}. Language: ${language}. JSON output.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const generateThemeSuggestions = async (user: User, language: Language): Promise<{ icon: string; name: string }[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `6 narrative themes for age ${user.age}. Language: ${language}. JSON icon/name.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '[]');
};

export const generateMotivationalQuote = async (subject: string, score: number, total: number, language: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Motivational quote in ${language} for score ${score}/${total} in ${subject}.`,
  });
  return response.text?.trim() || "Mastery is a journey.";
};

export const generatePlacementTest = async (
  language: Language, 
  user?: User | null, 
  accommodation: AccommodationType = 'none',
  subject?: Subject,
  testType: 'placement' | 'assessment' = 'placement'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate 10-question ${testType} for ${subject?.name || 'General'}. Language: ${language}. JSON output.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeTestResults = async (
  subject: Subject,
  score: number,
  total: number,
  recommendedLevel: MasteryLevel,
  language: Language,
  user?: User | null
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze diagnostic results for ${user?.name || 'Scholar'}. Score: ${score}/${total}. Recommended Level: ${recommendedLevel}. Language: ${language}. Brief insight.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text?.trim() || "Excellent potential.";
};

export const generateHybridLesson = async (
  subject1: Subject,
  subject2: Subject,
  language: Language,
  user: User
): Promise<LessonContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Synthesize lesson combining ${subject1.name} and ${subject2.name}. Language: ${language}.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const generateGuardianReport = async (user: User, progress: UserProgress, language: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Professional report for ${user.name} in ${language}. Markdown. Progress data: ${JSON.stringify(progress)}`;
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
  return response.text || "Report failed.";
};
