
// @google/genai library implementation following coding guidelines
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Subject, LessonContent, User, MasteryLevel, UserProgress, AccommodationType, EducationTrack, EducationalStage, EssayGradingResult, LearningMethod, CurriculumStyle, CurriculumEra, AuthorType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Robust retry wrapper for Gemini API calls to handle rate limits (429) or transient errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('429') || error.message?.includes('500') || error.message?.includes('503'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const digitizeMaterial = async (
  base64Image: string,
  language: Language,
  user: User
): Promise<{
  detectedSubject: string;
  detectedLevel: MasteryLevel;
  detectedEra: string;
  confidence: number;
  combinationPotential: string;
  lesson: LessonContent;
}> => {
  return withRetry(async () => {
    const prompt = `
      ROLE: darewast Digitalization Hub Architect.
      TASK: Analyze this learning material image and synthesize an official darewast lesson node.
      
      1. DETECT: Identify the primary subject (must be one of the darewast standard subjects) and the mastery level (A-T).
      2. SYNTESIZE: Create a full Trinity-Method lesson:
         - KUMON: Small-step incremental drills.
         - SAKAMOTO: Logic modeling and systematic understanding.
         - EYE LEVEL: Critical inquiry and reasoning.
      3. COMBINATION POTENTIAL: Explain how this content can be fused with other subjects (e.g., Biology + Ethics).
      
      User Context: ${user.name}, ${user.age} years old.
      Target Language: ${language}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSubject: { type: Type.STRING },
            detectedLevel: { type: Type.STRING },
            detectedEra: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            combinationPotential: { type: Type.STRING },
            lesson: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                timelineSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      detail: { type: Type.STRING }
                    },
                    required: ["title", "detail"]
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
                    required: ["question", "correctAnswer", "explanation"]
                  }
                },
                adaptations: {
                  type: Type.OBJECT,
                  properties: {
                    visualMapDescription: { type: Type.STRING },
                    auditoryScript: { type: Type.STRING },
                    kinestheticActivity: { type: Type.STRING },
                    readingDeepDive: { type: Type.STRING }
                  }
                }
              },
              required: ["title", "explanation", "exercises"]
            }
          },
          required: ["detectedSubject", "detectedLevel", "lesson", "confidence"]
        }
      }
    });

    try {
      const result = JSON.parse(response.text || '{}');
      if (result.lesson) result.lesson.authorType = 'Contributor';
      return result;
    } catch (e) {
      throw new Error("Neural digitalization synthesis failure.");
    }
  });
};

export const generateLesson = async (
  subject: Subject,
  language: Language,
  level: MasteryLevel,
  lessonNumber: number,
  user?: User | null,
  progress?: UserProgress | null,
): Promise<LessonContent> => {
  return withRetry(async () => {
    const age = user?.age || 10;
    const activeEra: CurriculumEra = user?.academicDNA?.era || 'Modern';
    const culturalBg = user?.culturalBackground || 'Global';
    const iddSupport = user?.accessibility?.iddSupport || false;
    const additionalLangs = progress?.[subject.id]?.additionalLanguages || [];
    
    // Core Performance Metric: Skill Points (0-100)
    const lastPerf = progress?.[subject.id]?.lastScore;
    const skillPoints = lastPerf?.skillPoints ?? 50;
    
    const isCreative = ['Music', 'Dance', 'Design', 'Craft'].includes(subject.category);

    // ZONE OF PROXIMAL DEVELOPMENT (ZPD) LOGIC
    const preferredDifficulty = progress?.[subject.id]?.difficulty || 'Medium';
    let challengeDirective = "";
    let challengeLabel: 'Scaffolded' | 'Adaptive' | 'High Rigor' | 'Expert' = "Adaptive";
    
    if (iddSupport) {
      challengeDirective = "STRICT RIGOR REDUCTION: User requires IDD support. Use hyper-literal language, avoid metaphors, and provide 3-step visual scaffolding for every exercise. Focus on functional achievement.";
      challengeLabel = "Scaffolded";
    } else if (preferredDifficulty === 'Hard' || skillPoints >= 90) {
      challengeDirective = `ELITE CALIBRATION (ZPD Upper Bound): ${preferredDifficulty === 'Hard' ? 'User explicitly requested HARD difficulty.' : 'High performance detected.'} Increase complexity via multi-variable logic puzzles, interdisciplinary synthesis, and reduced scaffolding. Exercises must require 'High Rigor' deduction rather than recall.`;
      challengeLabel = "High Rigor";
      if (skillPoints >= 98) challengeLabel = "Expert";
    } else if (preferredDifficulty === 'Easy' || skillPoints <= 45) {
      challengeDirective = `REMEDIATION CALIBRATION (ZPD Lower Bound): ${preferredDifficulty === 'Easy' ? 'User explicitly requested EASY difficulty.' : 'Recent struggle detected.'} Maintain academic integrity but increase 'Kumon-style' incremental steps. Use relatable daily life metaphors and heavy linguistic scaffolding to ensure achievability.`;
      challengeLabel = "Scaffolded";
    } else {
      challengeDirective = "STANDARD ADAPTIVE CALIBRATION: Balance challenge and achievable logic nodes. Use standard 'Sakamoto' modeling techniques.";
    }

    const ageStrategy = age < 8 ? "PEDAGOGICAL STRATEGY: Concrete operations. Use physical-world examples and simple visual logic." :
                        age < 14 ? "PEDAGOGICAL STRATEGY: Formal operations. Use structured logic, social dynamics, and systematic modeling." :
                        "PEDAGOGICAL STRATEGY: Scholarly research. Use abstract theoretical frameworks and professional-grade application.";

    const trinityPedagogy = `
      THE DAREWAST UNIFIED METHOD (TRINITY SYNTHESIS):
      1. KUMON PILLAR: Computational fluency and incremental mastery.
      2. SAKAMOTO PILLAR: Systematic logic modeling (The "Why").
      3. EYE LEVEL PILLAR: Critical inquiry and self-directed application.
      
      DYNAMIC ADAPTATION (CORE INSTRUCTION):
      - CULTURAL ALIGNMENT: Integrate "${culturalBg}" cultural context. Use regional historical figures, local geography, or indigenous logical frameworks as exercise predicates.
      - PERFORMANCE VECTOR: Skill Point Index is ${skillPoints} SP. ${challengeDirective}
      - AGE ALIGNMENT: ${ageStrategy}
      
      STRICT REQUIREMENT: All exercises must remain "CHALLENGING YET ACHIEVABLE". If the user is struggling, increase scaffolding (hints). If the user is excelling, increase logical depth.
      
      MULTILINGUAL MODE:
      ${additionalLangs.length > 0 ? `The user has enabled Multilingual Mode. Integrate the following additional languages into the lesson content (e.g., provide translations for key terms, bilingual exercises, or comparative linguistic analysis): ${additionalLangs.join(', ')}.` : 'Standard single-language mode.'}

      INTERACTIVITY: Return as a "DIGITAL INTERACTIVE TEXTBOOK" with branching logic nodes.
      Era: ${activeEra}. Language: ${language}.
    `;

    const prompt = `
      ROLE: darewast Academic Architect.
      TASK: Synthesize Chapter ${lessonNumber}/12 for Level ${level} in ${subject.name}.
      
      PEDAGOGICAL CONSTRAINTS:
      ${trinityPedagogy}
      
      STRICT REQUIREMENT: 
      - Explanation MUST synthesize Sakamoto logic with Kumon-style incrementalism.
      - Exercises MUST scale based on the difficulty strategy provided.
      - Return 'challengeLevel' as '${challengeLabel}'.
      ${isCreative ? "- Return a 'creativeSession' object for this arts discipline." : ""}
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
            challengeLevel: { type: Type.STRING },
            timelineSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING }
                },
                required: ["title", "detail"]
              }
            },
            eraNote: { type: Type.STRING },
            adaptations: {
              type: Type.OBJECT,
              properties: {
                visualMapDescription: { type: Type.STRING },
                auditoryScript: { type: Type.STRING },
                kinestheticActivity: { type: Type.STRING },
                readingDeepDive: { type: Type.STRING }
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
                }
              }
            },
            mediaResources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, type: { type: Type.STRING }, title: { type: Type.STRING } } } },
            phoneticMap: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
            creativeSession: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                data: { type: Type.STRING },
                interactionPrompt: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      details: { type: Type.STRING },
                      value: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          required: ["title", "explanation", "examples", "exercises", "mediaResources", "phoneticMap", "challengeLevel"]
        },
      },
    });

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Verification Source",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri) || [];

    try {
      const data = JSON.parse(response.text || '{}');
      const authorType: AuthorType = Math.random() > 0.5 ? 'Professional' : 'Contributor';
      return { 
        ...data, 
        level, 
        lessonNumber, 
        groundingSources, 
        authorType,
        eraNote: data.eraNote || `Synthesized via the darewast Trinity Method.` 
      };
    } catch (e) {
      throw new Error("Neural synthesis parse failure.");
    }
  });
};

export const generateLessonQuiz = async (
  subject: Subject,
  lessonTitle: string,
  lessonExplanation: string,
  language: Language,
  level: MasteryLevel,
  user?: User | null
): Promise<{ question: string; options: string[]; correctAnswer: string; explanation: string }[]> => {
  return withRetry(async () => {
    const age = user?.age || 10;
    const prompt = `Generate a 5-question logic challenge for ${subject.name}, Level ${level}. 
    Follow darewast method: Mixture of Kumon (incremental), Sakamoto (logic modeling), and Eye Level (critical thinking).
    Age: ${age}, Language: ${language}. All reference materials used are high-fidelity interactive digital textbooks.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

export const generateCustomSubject = async (q: string, t: EducationTrack, l: Language) => {
  return withRetry(async () => {
    const prompt = `Define darewast subject: "${q}". Follow trinity method: Kumon/Sakamoto/EyeLevel mix. 
    icon, name, category, description, subtopics. Language: ${l}. Emphasize that resources are Interactive Digital Textbooks.`;
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
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const mapExternalCurriculum = async (
  query: string,
  language: Language,
  context?: 'nomadic' | 'working' | 'special_needs' | 'standard'
): Promise<{ level: MasteryLevel; explanation: string; comparison: string }> => {
  return withRetry(async () => {
    const prompt = `Map external curriculum: "${query}" to darewast Trinity levels (mixture of Kumon/Sakamoto/EyeLevel). 
    Context: ${context}. Return MasteryLevel (A-T). Assume materials are Digital Interactive Textbooks.`;
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
    return JSON.parse(response.text || '{}');
  });
};

export const recognizeHandwriting = async (base64Image: string, language: Language): Promise<string> => {
  return withRetry(async () => {
    const prompt = `Transcribe the handwritten text in this image. Language: ${language}. Context: Analyzing work from an interactive digital textbook.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ inlineData: { data: base64Image, mimeType: "image/png" } }, { text: prompt }] }]
    });
    return response.text?.trim() || "";
  });
};

export const gradeEssay = async (q: string, r: string, c: string, l: Language): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Grade essay: ${r}. Question: ${q}. Use darewast Trinity grading logic (Rigor/Logic/Fluency). Language: ${l}. Submission for interactive digital textbook module.`,
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
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateMasteryProject = async (subject: Subject, level: MasteryLevel, language: Language): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate darewast Trinity project (Kumon/Sakamoto/EyeLevel mix) for ${subject.name} Level ${level}. Language: ${language}. Project should be integrated with Digital Interactive Textbook resources.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            guidelines: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const evaluatePerformance = async (subject: Subject, description: string, language: Language): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Evaluate darewast Trinity performance in ${subject.name}: "${description}". Language: ${language}. Feedback linked to Interactive Textbook mastery.`,
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
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateMasteryExam = async (s: Subject, l: Language, lvl: MasteryLevel, u: User, p?: UserProgress | null): Promise<any> => {
  return withRetry(async () => {
    const difficulty = p?.[s.id]?.difficulty || 'Medium';
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate Official darewast Mastery Trinity Exam (Kumon Speed, Sakamoto Logic, Eye Level Critical Thinking) for ${s.name} Level ${lvl}. Difficulty Level: ${difficulty}. Language: ${l}. Questions derived from Interactive Digital Textbook logic chapters.`,
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generatePlacementTest = async (l: Language, u: User | null, a: AccommodationType, s: Subject | undefined, t: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10-question darewast Trinity placement test for ${s?.name || 'General Knowledge'}. Mixture of incremental fluency and logic modeling. Language: ${l}. Calibrate entry into Digital Interactive Textbook system.`,
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const analyzeTestResults = async (s: Subject, sc: number, t: number, l: MasteryLevel, lan: Language, u: User | null): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Analyze Trinity Diagnostic mastery for ${s.name}. Score: ${sc}/${t}. Placement: ${l}. Language: ${lan}. Strategic mapping for Interactive Textbook tracks.` 
    });
    return response.text || "Trinity Calibration concluded.";
  });
};

export const generateExamPrep = async (s: Subject, l: Language, b: string, w: number, u: User): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate Trinity simulation prep for ${s.name} Board: ${b}. Week: ${w}. Language: ${l}. Prep for high-rigor Digital Interactive Textbook certification.`,
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateGuardianReport = async (u: User, p: UserProgress, l: Language): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Draft darewast Trinity guardian transcript for ${u.name}. Explain Kumon/Sakamoto/EyeLevel progress. Progress: ${JSON.stringify(p)}. Lang: ${l}. Mention Interactive Textbook milestones.` 
    });
    return response.text || "Trinity report generated.";
  });
};

export const generateHybridLesson = async (s1: Subject, s2: Subject, l: Language, u: User): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Interdisciplinary hybrid Trinity synthesis: ${s1.name} + ${s2.name}. Lang: ${l}. Synthesized as a Digital Interactive logic chapter.`,
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateRelearnLesson = async (s: Subject, l: Language, st: EducationalStage, u: User, f: boolean): Promise<any> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `High-fidelity Trinity recovery lesson for ${s.name} Stage: ${st}. Lang: ${l}. Restoration via Interactive Digital Textbook architecture.`,
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
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};
