
// @google/genai library implementation following coding guidelines
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Subject, LessonContent, User, MasteryLevel, UserProgress, AccommodationType, EducationTrack, EducationalStage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Standard lesson generation for regular subject progress
export const generateLesson = async (
  subject: Subject,
  language: Language,
  level: MasteryLevel,
  lessonNumber: number,
  user?: User | null,
  progress?: UserProgress | null,
): Promise<LessonContent> => {
  const age = user?.age || 10;
  const culturalBackground = user?.culturalBackground || 'Global';
  const subProg = progress?.[subject.id];
  const track = subProg?.track || 'Standard';
  const interests = subProg?.specializations?.join(', ') || 'General Knowledge';
  const activeMethod = user?.academicDNA?.method || 'Kumon-style';
  
  const prompt = `
    ROLE: World-Class Academic Architect & Personalization Specialist.
    TASK: Design Chapter ${lessonNumber}/12 for ${subject.name} Level ${level}.
    METHOD: ${activeMethod}.
    
    PERSONALIZATION PARAMETERS:
    - Target Age: ${age} years old.
    - Mastery Level: ${level}.
    - Interests/Specializations: ${interests}.
    - Education Track: ${track}.
    - Cultural Context: ${culturalBackground}.
    - Language: ${language}.
    
    CONTENT REQUIREMENTS:
    1. A short title.
    2. PEDAGOGICAL ADAPTATIONS (VARK):
       - Visual: A text-based description of a "Mental Model Map" for this concept.
       - Auditory: A conversational "Lecture Script" for an AI tutor to speak.
       - Kinesthetic: A practical "Action Drill" or at-home experiment to test the concept physically.
       - Reading: A high-rigor "Deep Dive" scholarly analysis for linguistic learners.
    3. Exercises: 4 validation steps.
  `;

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
          adaptations: {
            type: Type.OBJECT,
            properties: {
              visualMapDescription: { type: Type.STRING },
              auditoryScript: { type: Type.STRING },
              kinestheticActivity: { type: Type.STRING },
              readingDeepDive: { type: Type.STRING }
            },
            required: ["visualMapDescription", "auditoryScript", "kinestheticActivity", "readingDeepDive"]
          },
          pronunciationGuide: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                phonetic: { type: Type.STRING },
                guide: { type: Type.STRING }
              },
              required: ["word", "phonetic", "guide"]
            }
          },
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
          },
          mediaResources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["ebook", "blog", "podcast", "video", "song"] },
                title: { type: Type.STRING }
              },
              required: ["id", "type", "title"]
            }
          }
        },
        required: ["title", "explanation", "examples", "exercises", "mediaResources", "adaptations"]
      },
    },
  });

  const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference Source",
    uri: chunk.web?.uri || ""
  })).filter((s: any) => s.uri) || [];

  try {
    const data = JSON.parse(response.text || '{}');
    return { ...data, level, lessonNumber, groundingSources };
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw new Error("Failed to design personalized content.");
  }
};

export const generateMasteryExam = async (
  subject: Subject,
  language: Language,
  level: MasteryLevel,
  user: User
): Promise<LessonContent> => {
  const prompt = `Generate a 15-question FORMAL MASTERY EXAM for ${subject.name} Level ${level}. 
  Standard: International Academic Integrity. Language: ${language}. User Age: ${user.age}. 
  Include logic traps and application-based questions tailored to localized context: ${user.culturalBackground}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
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
        required: ["title", "explanation", "exercises"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generatePlacementTest = async (
  language: Language, 
  user: User | null, 
  accommodation: AccommodationType,
  subject: Subject | undefined,
  testType: 'placement' | 'assessment' | 'relearn'
) => {
  const prompt = `Generate a 10-question ${testType} diagnostic for ${subject?.name || 'General Knowledge'}. 
  Targeting age ${user?.age || 18}. Accommodation: ${accommodation}. Language: ${language}. 
  Ensure questions are age-appropriate and localized to ${user?.culturalBackground || 'Global context'}.`;
  
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: prompt, 
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "difficulty"]
            }
          }
        },
        required: ["questions"]
      }
    } 
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeTestResults = async (
  subject: Subject,
  score: number,
  total: number,
  level: MasteryLevel,
  language: Language,
  user: User | null
): Promise<string> => {
  const prompt = `Analyze test results for ${subject.name}. Score: ${score}/${total}. Recommended Level: ${level}. 
  User Age: ${user?.age || 18}. Language: ${language}. 
  Provide a brief, encouraging academic insight localized to their cultural background (${user?.culturalBackground}).`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "Your performance shows steady potential.";
};

export const generateCustomSubject = async (q: string, t: EducationTrack, l: Language) => {
  const prompt = `Define a learning subject based on query: "${q}". 
  Provide icon, name, category, description, and 5 subtopics. Track: ${t}. Language: ${l}. 
  Ensure description is engaging and localized for the global learner.`;
  
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: prompt, 
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          icon: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          subtopics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["icon", "name", "category", "description", "subtopics"]
      }
    } 
  });
  return JSON.parse(response.text || '{}');
};

export const generateExamPrep = async (
  subject: Subject,
  language: Language,
  boardName: string,
  week: number,
  user: User
): Promise<LessonContent & { tacticalTips: string[] }> => {
  const prompt = `Generate Exam Prep Level ${week} for ${subject.name} targeting ${boardName}. 
  User Age: ${user.age}. Language: ${language}. Include tactical tips for this specific exam board. 
  Localize content for ${user.culturalBackground}.`;

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
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "explanation", "tacticalTips", "exercises"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { 
    ...data, 
    level: 'A' as MasteryLevel, 
    lessonNumber: week 
  } as LessonContent & { tacticalTips: string[] };
};

export const generateGuardianReport = async (
  user: User,
  progress: UserProgress,
  language: Language
): Promise<string> => {
  const prompt = `Generate a progress report for the guardian of ${user.name}. 
  Language: ${language}. Summary of subjects and levels: ${JSON.stringify(progress)}.
  Write a professional yet supportive letter summarizing achievements and focus areas, 
  respecting the cultural norms of ${user.culturalBackground}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "Report generation failed.";
};

export const generateHybridLesson = async (
  sub1: Subject,
  sub2: Subject,
  language: Language,
  user: User
): Promise<LessonContent> => {
  const prompt = `Generate a HYBRID chapter combining ${sub1.name} and ${sub2.name}. 
  Target Age: ${user.age}. Language: ${language}. 
  Localize content for ${user.culturalBackground}.
  Find interdisciplinary bridges between these subjects.`;

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
        required: ["title", "explanation", "exercises"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { 
    ...data, 
    level: 'A', 
    lessonNumber: 1, 
    isHybrid: true, 
    hybridSubjects: [sub1.name, sub2.name] 
  } as LessonContent;
};

export const generateRelearnLesson = async (
  subject: Subject,
  language: Language,
  stage: EducationalStage,
  user: User,
  isFastTrack: boolean
): Promise<LessonContent> => {
  const prompt = `Generate a RELEARN restoration chapter for ${subject.name} at the ${stage} stage. 
  User Age: ${user.age}. Language: ${language}. Fast Track: ${isFastTrack}.
  Focus on identifying and fixing fundamental gaps, localized for ${user.culturalBackground}.`;

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
        required: ["title", "explanation", "exercises"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { 
    ...data, 
    level: 'A', 
    lessonNumber: 1, 
    isRelearn: true, 
    relearnStage: stage 
  } as LessonContent;
};
