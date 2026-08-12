
// @google/genai library implementation following coding guidelines
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Subject, LessonContent, User, MasteryLevel, UserProgress, AccommodationType, EducationTrack, EducationalStage, EssayGradingResult, LearningMethod, CurriculumStyle, CurriculumEra, AuthorType, LearningStyle, Flashcard } from "../types";

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
         - INTERACTIVE EXERCISES: Use a mix of 'multiple-choice', 'fill-in-the-blank', 'sorting', 'matching', and 'handwriting' exercises.
           - For 'sorting', provide 'options' as items and 'correctAnswer' as comma-separated string.
           - For 'matching', provide 'matchingPairs'.
           - For 'fill-in-the-blank', use '[blank]' in 'blankText'.
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
                      type: { type: Type.STRING, description: "One of: multiple-choice, fill-in-the-blank, sorting, matching, handwriting" },
                      question: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      matchingPairs: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            left: { type: Type.STRING },
                            right: { type: Type.STRING }
                          }
                        }
                      },
                      blankText: { type: Type.STRING }
                    },
                    required: ["type", "question", "correctAnswer", "explanation"]
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
    const preferredStyle = user?.preferredLearningStyle || 'Unified';
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
      THE DAREWAST PROPRIETARY METHOD:
      1. INCLUSIVE & CULTURALLY SENSITIVE PEDAGOGY: Respectful multi-regional context, localized historical paradigms, and inclusive linguistic scaffolding so scholars from any culture connect deeply with concepts.
      2. PERSONALIZED CURRICULA & PATHWAYS: Adaptive pacing, customized chapter depth, and personalized curriculum design calculated specifically for scholar's age, level, and academic DNA.
      3. ADAPTATION FOR ALL LEARNING STYLES: Explicitly tailor the primary explanation and exercises for ${preferredStyle} learners (while providing scaffolding compatible with Visual, Auditory, Reading, Kinesthetic, and Unified modes).
      
      DYNAMIC ADAPTATION (CORE INSTRUCTION):
      - PREFERRED LEARNING STYLE: ${preferredStyle}. Tailor the primary explanation and exercises to resonate with this style while maintaining the darewast Proprietary Method's core logic.
      - INTERACTIVE EXERCISES: Use a mix of 'multiple-choice', 'fill-in-the-blank', 'sorting', 'matching', and 'handwriting' exercises to maximize engagement.
        - For 'sorting', provide 'options' as the items to sort, and 'correctAnswer' as the items joined by a comma and space (e.g., "Item 1, Item 2, Item 3").
        - For 'matching', provide 'matchingPairs' as an array of {left, right} objects. 'correctAnswer' can be any descriptive string.
        - For 'fill-in-the-blank', use '[blank]' in 'blankText' and provide the missing word in 'correctAnswer'.
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
                  type: { type: Type.STRING, description: "One of: multiple-choice, fill-in-the-blank, sorting, matching, handwriting" },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      }
                    }
                  },
                  blankText: { type: Type.STRING }
                },
                required: ["type", "question", "correctAnswer", "explanation"]
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
    Follow the darewast Proprietary Method: inclusive, culturally sensitive, personalized curriculum tailored for all learning styles.
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
    icon, name, category, description, explanation, subtopics. Language: ${l}. Emphasize that resources are Interactive Digital Textbooks.`;
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
            explanation: { type: Type.STRING },
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

export const generatePlacementTest = async (
  l: Language, 
  u: User | null, 
  a: AccommodationType, 
  s: Subject | undefined, 
  t: string
) => {
  return withRetry(async () => {
    const isCurriculumMethod = t === 'curriculum-method' || t === 'assessment';
    const age = u?.age || 12;
    const currentStage = u?.stage || 'Middle';

    const prompt = isCurriculumMethod
      ? `Generate a 10-question Curriculum & Pedagogy Diagnostic Assessment for scholar (Age: ${age}, Stage: ${currentStage}). Language: ${l}.
Include a mix of:
1. Math & Fluency baseline logic questions (Kumon pillar)
2. Structural pattern & logic modeling questions (Sakamoto pillar)
3. Critical inquiry & real-world application questions (Eye Level pillar)
4. Learning style preference scenarios (Visual diagrams vs Auditory rhythm vs Reading analytical text vs Kinesthetic tactile/hands-on)
5. Pacing and study habit preference scenarios.
Make questions clear, engaging, and age-appropriate.`
      : `Generate a 10-question darewast Proprietary placement test for ${s?.name || 'General Knowledge'}. Language: ${l}. Scholar Age: ${age}, Stage: ${currentStage}.
Mixture of:
- 4 Incremental Fluency questions (Level A-F)
- 3 Logic Modeling questions (Level G-L)
- 3 Critical Inquiry & Abstract Application questions (Level M-S).
Ensure calibrated progression in difficulty.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  pillar: { type: Type.STRING },
                  category: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
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

export const analyzeCurriculumMethodAssessment = async (
  u: User | null,
  lan: Language,
  questions: any[],
  userAnswers: string[],
  subject?: Subject
): Promise<{
  summaryDiagnosis: string;
  recommendedStage: EducationalStage;
  recommendedTrack: EducationTrack;
  recommendedStyle: LearningStyle;
  recommendedMethod: LearningMethod;
  suggestedDailyMinutes: number;
  subjectLevels: Record<string, MasteryLevel>;
  strengths: string[];
  areasForGrowth: string[];
  pedagogicalInsights: string[];
}> => {
  return withRetry(async () => {
    const age = u?.age || 12;
    const prompt = `Analyze diagnostic test performance for scholar (Age: ${age}, Current Stage: ${u?.stage || 'Middle'}, Current Track: ${u?.track || 'Standard'}, Language: ${lan}).
Questions & Answers submitted:
${questions.map((q, idx) => `Q${idx + 1} (${q.pillar || q.category || 'General'}): ${q.question} | Selected: ${userAnswers[idx] || 'None'} | Correct: ${q.correctAnswer || 'N/A'}`).join('\n')}

Provide an AI Diagnostic Assessment Blueprint:
1. summaryDiagnosis: 2-3 sentence overarching pedagogical summary.
2. recommendedStage: Choose best fit from ['Preschool', 'Primary', 'Middle', 'High', 'University', 'Transition'].
3. recommendedTrack: Choose best fit from ['Standard', 'School', 'University', 'DistanceSchool', 'DistanceUniversity', 'VocationalSchool', 'VocationalUniversity'].
4. recommendedStyle: Choose primary sensory style from ['Unified', 'Visual', 'Auditory', 'Reading', 'Kinesthetic'].
5. recommendedMethod: Choose primary pedagogy from ['darewast-Unified', 'Kumon-style', 'Sakamoto-Method', 'Eye-Level-aligned', 'Socratic-Inquiry', 'Project-Based-Learning'].
6. suggestedDailyMinutes: Recommended daily study goal in minutes (e.g., 20, 30, 45, 60).
7. subjectLevels: Object mapping core subject IDs ('math', 'literacy', 'science', 'logic', 'technology', 'art', 'social') to recommended starting MasteryLevel ('A' through 'S').
8. strengths: 3 specific academic strengths demonstrated.
9. areasForGrowth: 3 specific learning areas to develop.
10. pedagogicalInsights: 3 tactical tips for optimal daily study.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryDiagnosis: { type: Type.STRING },
            recommendedStage: { type: Type.STRING },
            recommendedTrack: { type: Type.STRING },
            recommendedStyle: { type: Type.STRING },
            recommendedMethod: { type: Type.STRING },
            suggestedDailyMinutes: { type: Type.NUMBER },
            subjectLevels: {
              type: Type.OBJECT,
              properties: {
                math: { type: Type.STRING },
                literacy: { type: Type.STRING },
                science: { type: Type.STRING },
                logic: { type: Type.STRING },
                technology: { type: Type.STRING },
                art: { type: Type.STRING },
                social: { type: Type.STRING }
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForGrowth: { type: Type.ARRAY, items: { type: Type.STRING } },
            pedagogicalInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      summaryDiagnosis: parsed.summaryDiagnosis || "Diagnostic calibration completed.",
      recommendedStage: (parsed.recommendedStage as EducationalStage) || u?.stage || 'Middle',
      recommendedTrack: (parsed.recommendedTrack as EducationTrack) || u?.track || 'Standard',
      recommendedStyle: (parsed.recommendedStyle as LearningStyle) || 'Unified',
      recommendedMethod: (parsed.recommendedMethod as LearningMethod) || 'darewast-Unified',
      suggestedDailyMinutes: parsed.suggestedDailyMinutes || 30,
      subjectLevels: parsed.subjectLevels || { math: 'C', literacy: 'C', science: 'C', logic: 'C' },
      strengths: parsed.strengths || ["Consistent logical reasoning", "High engagement with visual patterns"],
      areasForGrowth: parsed.areasForGrowth || ["Complex multi-step reduction", "Speed fluency"],
      pedagogicalInsights: parsed.pedagogicalInsights || ["Incorporate 15 minutes of incremental drill daily", "Utilize visual diagram scaffolding"]
    };
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

export const generateVisualAid = async (description: string): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Educational diagram or infographic for: ${description}. Clear, professional, academic style, suitable for a digital textbook.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Neural visual synthesis failed.");
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

export const generateRelearnLesson = async (s: Subject, l: Language, st: EducationalStage, u: User, f: boolean, topicPrompt?: string): Promise<any> => {
  return withRetry(async () => {
    const topicFocus = topicPrompt ? `Specific Friction Concept Focus: ${topicPrompt}.` : '';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `High-fidelity darewast Proprietary recovery lesson for ${s.name} Stage: ${st}. Lang: ${l}. ${topicFocus} Restoration via Interactive Digital Textbook architecture. ${f ? 'Condensed 5-minute Fast-Track recovery mode.' : ''}`,
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

/**
 * Offline / Fallback Flashcard Extractor
 */
export const generateOfflineFlashcards = (
  lesson: LessonContent,
  subject: Subject
): Flashcard[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  const flashcards: Flashcard[] = [];

  // 1. Concept from lesson title & explanation
  flashcards.push({
    id: `fc-off-${Date.now()}-1`,
    subjectId: subject.id,
    subjectName: subject.name,
    lessonTitle: lesson.title,
    lessonNumber: lesson.lessonNumber || 1,
    level: lesson.level || 'A',
    concept: lesson.title,
    front: `What is the core principle behind "${lesson.title}"?`,
    back: lesson.explanation.slice(0, 300) + (lesson.explanation.length > 300 ? '...' : ''),
    hint: `Think about ${subject.name} core concepts`,
    tags: [subject.name, `Level ${lesson.level || 'A'}`],
    difficulty: 'medium',
    nextReviewDate: todayStr,
    intervalDays: 1,
    easeFactor: 2.5,
    reviewsCount: 0,
    status: 'learning'
  });

  // 2. Concepts from timeline steps or examples if available
  if (lesson.timelineSteps && lesson.timelineSteps.length > 0) {
    lesson.timelineSteps.slice(0, 2).forEach((step, idx) => {
      flashcards.push({
        id: `fc-off-${Date.now()}-ts-${idx}`,
        subjectId: subject.id,
        subjectName: subject.name,
        lessonTitle: lesson.title,
        lessonNumber: lesson.lessonNumber || 1,
        level: lesson.level || 'A',
        concept: step.title,
        front: `Explain the concept: "${step.title}"`,
        back: step.detail,
        hint: `Key step in ${lesson.title}`,
        tags: [subject.name, 'Key Step'],
        difficulty: 'easy',
        nextReviewDate: todayStr,
        intervalDays: 1,
        easeFactor: 2.5,
        reviewsCount: 0,
        status: 'learning'
      });
    });
  } else if (lesson.examples && lesson.examples.length > 0) {
    flashcards.push({
      id: `fc-off-${Date.now()}-ex`,
      subjectId: subject.id,
      subjectName: subject.name,
      lessonTitle: lesson.title,
      lessonNumber: lesson.lessonNumber || 1,
      level: lesson.level || 'A',
      concept: `Application Example of ${lesson.title}`,
      front: `How is ${lesson.title} applied in practice?`,
      back: lesson.examples[0],
      tags: [subject.name, 'Example'],
      difficulty: 'easy',
      nextReviewDate: todayStr,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewsCount: 0,
      status: 'learning'
    });
  }

  // 3. Concept from exercises
  if (lesson.exercises && lesson.exercises.length > 0) {
    const ex = lesson.exercises[0];
    flashcards.push({
      id: `fc-off-${Date.now()}-ex1`,
      subjectId: subject.id,
      subjectName: subject.name,
      lessonTitle: lesson.title,
      lessonNumber: lesson.lessonNumber || 1,
      level: lesson.level || 'A',
      concept: `Key Exercise Concept`,
      front: ex.question,
      back: `Correct Answer: ${ex.correctAnswer}\n\nExplanation: ${ex.explanation}`,
      hint: ex.hint || `Review ${lesson.title} exercises`,
      tags: [subject.name, 'Exercise Practice'],
      difficulty: 'hard',
      nextReviewDate: todayStr,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewsCount: 0,
      status: 'learning'
    });
  }

  return flashcards;
};

/**
 * AI-Powered Concept Flashcard Generator from completed lessons using Gemini
 */
export const extractFlashcardsFromLesson = async (
  lesson: LessonContent,
  subject: Subject,
  language: Language,
  user: User
): Promise<Flashcard[]> => {
  return withRetry(async () => {
    try {
      const prompt = `
        ROLE: darewast Academic Memory & Spaced Repetition Architect.
        TASK: Extract 3 to 5 vital core concepts, principles, formulas, or key definitions from this completed lesson and format them as high-yield spaced repetition flashcards.

        Lesson Title: "${lesson.title}"
        Subject: "${subject.name}" (${subject.category})
        Level: ${lesson.level || 'A'}, Lesson #: ${lesson.lessonNumber || 1}
        Explanation: ${lesson.explanation.slice(0, 1000)}
        Examples: ${lesson.examples?.join('; ') || 'N/A'}
        Target Language: ${language}
        Student: ${user.name}, Age: ${user.age}

        REQUIREMENTS:
        1. Front of card: A clear, engaging question or prompt testing understanding of a key concept.
        2. Back of card: A concise, authoritative answer and key takeaway explanation.
        3. Concept: 2-4 word term naming the concept.
        4. Difficulty: 'easy', 'medium', or 'hard'.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING, description: "One of: easy, medium, hard" }
                  },
                  required: ["concept", "front", "back", "difficulty"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const todayStr = new Date().toISOString().split('T')[0];

      if (parsed.flashcards && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
        return parsed.flashcards.map((item: any, idx: number) => ({
          id: `fc-${Date.now()}-${idx}`,
          subjectId: subject.id,
          subjectName: subject.name,
          lessonTitle: lesson.title,
          lessonNumber: lesson.lessonNumber || 1,
          level: lesson.level || 'A',
          concept: item.concept || `Concept ${idx + 1}`,
          front: item.front,
          back: item.back,
          hint: item.hint || undefined,
          tags: item.tags || [subject.name],
          difficulty: (['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium') as any,
          nextReviewDate: todayStr,
          intervalDays: 1,
          easeFactor: 2.5,
          reviewsCount: 0,
          status: 'learning'
        }));
      }

      return generateOfflineFlashcards(lesson, subject);
    } catch (e) {
      console.warn("AI Flashcard generation failed, utilizing offline fallback engine:", e);
      return generateOfflineFlashcards(lesson, subject);
    }
  });
};
