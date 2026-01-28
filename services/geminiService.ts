
// @google/genai library implementation following coding guidelines
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Subject, LessonContent, User, MasteryLevel, UserProgress, AccommodationType, EducationTrack, EducationalStage, EssayGradingResult, ProjectPrompt } from "../types";
import { getInstitutionalGrade } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// AI-powered curriculum mapping with Student Context Awareness
export const mapExternalCurriculum = async (
  query: string,
  language: Language,
  context?: 'nomadic' | 'working' | 'special_needs' | 'standard'
): Promise<{ level: MasteryLevel; explanation: string; comparison: string }> => {
  const prompt = `
    ROLE: Global Pedagogical Standards Expert & Inclusion Specialist.
    TASK: Map an external curriculum/milestone to the darewast Mastery Scale (A-T).
    
    STUDENT CONTEXT: ${context || 'standard'}. 
    (If nomadic: prioritize continuity. If working: prioritize professional competency mapping. If special_needs: prioritize sensory/IEP tiers).

    DAREWAST SCALE REFERENCE:
    - A-D: Early/Pre-K
    - E-J: Primary/Elementary
    - K-M: Middle School
    - N-P: High School/Secondary
    - Q-T: University/Advanced Research
    
    INPUT QUERY: "${query}"
    
    REQUIREMENTS:
    1. Identify the system and grade.
    2. Map to darewast MasteryLevel.
    3. Provide an explanation in ${language} tailored to the ${context} context.
    4. List 2-3 comparable levels in other global systems.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING },
          explanation: { type: Type.STRING },
          comparison: { type: Type.STRING }
        },
        required: ["level", "explanation", "comparison"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Mapping Parse Error:", error);
    throw new Error("Curriculum synthesis failure.");
  }
};

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
  const lastScore = subProg?.lastScore;
  
  // Dynamic Difficulty Logic with Cognitive Scaling
  let difficultyTuning = "Standard Complexity";
  const skillPoints = lastScore?.skillPoints || 0;
  
  if (age < 7) {
    difficultyTuning = skillPoints > 80 
      ? "Cognitive Stretch: Introduce symbolic reasoning through playful abstraction." 
      : "Concrete Foundation: Maintain high visual support and repetition.";
  } else if (age < 13) {
    difficultyTuning = skillPoints > 80 
      ? "Analytical Depth: Challenge logic through cross-subject analogies." 
      : "Procedural Reinforcement: Break down multi-step tasks into atomic units.";
  } else {
    difficultyTuning = skillPoints > 80 
      ? "Professional Rigor: High-density theoretical analysis and critical logic traps." 
      : "Conceptual Clarity: Bridge theoretical gaps with practical industrial examples.";
  }

  const isMusic = subject.category === 'Music' || subject.id.includes('music') || subject.id === 'music-vocal' || subject.id === 'music-instrument';

  const prompt = `
    ROLE: World-Class Academic Architect & Neuro-Pedagogy Specialist.
    TASK: Synthesize Personalized Chapter ${lessonNumber}/12 for Level ${level}.
    
    DAREWAST PEDAGOGICAL CONSTRAINTS:
    - Target Age: ${age} years.
    - Subject: ${subject.name} (Mastery Level ${level}).
    - Chapter Context: This is Chapter ${lessonNumber} of 12 in the curriculum.
    - Method: ${activeMethod}.
    - Cultural Context: ${culturalBackground}.
    - Performance Tuning: ${difficultyTuning}.
    - Language: ${language}.
    
    STRICT REQUIREMENT: All mediaResources (E-books, Blogs, Podcasts, Videos, Songs) MUST be explicitly and uniquely designed for THIS specific chapter (${lessonNumber}) and Level (${level}). 
    If subject is Music/Vocal/Instrumental, at least one media item MUST be a 'song' type.
    
    REQUIREMENTS:
    1. EXPLANATION: Deep theoretical overview adapted to ${age}yo cognitive capacity.
    2. VARK ADAPTATIONS: Visual, Auditory, Kinesthetic, Reading.
    3. EXERCISES: At least one MUST be 'isEssay: true'.
    4. MEDIA RESOURCES: List specific titles for an e-book, blog post, podcast, and video (and song if music) that are uniquely architected for Chapter ${lessonNumber} Level ${level}.
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
                hint: { type: Type.STRING },
                isEssay: { type: Type.BOOLEAN }
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
                type: { type: Type.STRING, enum: ["ebook", "blog", "podcast", "video", "song", "work", "danceMove", "simulation"] },
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

export const gradeEssay = async (
  question: string,
  userResponse: string,
  context: string,
  language: Language
): Promise<EssayGradingResult> => {
  const prompt = `Grade essay: ${userResponse}. Criteria: Clarity, Coherence, Relevance. Context: ${context}. Question: ${question}. Language: ${language}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarity: { type: Type.NUMBER },
          coherence: { type: Type.NUMBER },
          relevance: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          passed: { type: Type.BOOLEAN }
        },
        required: ["clarity", "coherence", "relevance", "feedback", "passed"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateMasteryProject = async (subject: Subject, level: MasteryLevel, language: Language): Promise<ProjectPrompt> => {
  const prompt = `Generate a high-rigor Mastery Project prompt for ${subject.name} Level ${level}. 
  The project should be multi-modal (research, creation, or problem-solving). Language: ${language}.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          objective: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          guidelines: { type: Type.STRING }
        },
        required: ["title", "objective", "requirements", "guidelines"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const evaluatePerformance = async (subject: Subject, description: string, language: Language): Promise<EssayGradingResult> => {
  const prompt = `Evaluate a performance in ${subject.name}. Description of performance: "${description}". 
  Provide formal academic feedback and a score out of 100. Language: ${language}.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clarity: { type: Type.NUMBER },
          coherence: { type: Type.NUMBER },
          relevance: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          passed: { type: Type.BOOLEAN }
        },
        required: ["clarity", "coherence", "relevance", "feedback", "passed"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateMasteryExam = async (s: Subject, l: Language, lvl: MasteryLevel, u: User): Promise<LessonContent> => {
  const prompt = `Generate formal exam for ${s.name} Level ${lvl}. Language: ${l}. Age: ${u.age}.`;
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

export const generatePlacementTest = async (l: Language, u: User | null, a: AccommodationType, s: Subject | undefined, t: string) => {
  const prompt = `Generate 10-question ${t} for ${s?.name || 'General Knowledge'}. Language: ${l}. Age: ${u?.age}. Accomm: ${a}.`;
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

export const analyzeTestResults = async (s: Subject, sc: number, t: number, l: MasteryLevel, lan: Language, u: User | null): Promise<string> => {
  const prompt = `Analyze test results for ${s.name}. Score: ${sc}/${t}. Level: ${l}. Language: ${lan}. Age: ${u?.age}.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "Your performance shows steady potential.";
};

export const generateCustomSubject = async (q: string, t: EducationTrack, l: Language) => {
  const prompt = `Define subject: "${q}". Icon, name, category, description, 5 subtopics. Track: ${t}. Language: ${l}.`;
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

export const generateExamPrep = async (s: Subject, l: Language, b: string, w: number, u: User): Promise<LessonContent & { tacticalTips: string[] }> => {
  const prompt = `Generate Exam Prep for ${s.name} targeting ${b}. Language: ${l}. Week: ${w}.`;
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
  return { ...data, level: 'A' as MasteryLevel, lessonNumber: w } as LessonContent & { tacticalTips: string[] };
};

export const generateGuardianReport = async (u: User, p: UserProgress, l: Language): Promise<string> => {
  const prompt = `Guardian report for ${u.name}. Lang: ${l}. Progress: ${JSON.stringify(p)}.`;
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
  return response.text || "Report generation failed.";
};

export const generateHybridLesson = async (s1: Subject, s2: Subject, l: Language, u: User): Promise<LessonContent> => {
  const prompt = `Hybrid lesson: ${s1.name} and ${s2.name}. Lang: ${l}. Age: ${u.age}.`;
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
  return { ...data, level: 'A', lessonNumber: 1, isHybrid: true, hybridSubjects: [s1.name, s2.name] } as LessonContent;
};

export const generateRelearnLesson = async (s: Subject, l: Language, st: EducationalStage, u: User, f: boolean): Promise<LessonContent> => {
  const prompt = `Relearn for ${s.name} stage ${st}. Lang: ${l}. Fast: ${f}. Age: ${u.age}.`;
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
  return { ...data, level: 'A', lessonNumber: 1, isRelearn: true, relearnStage: st } as LessonContent;
};
