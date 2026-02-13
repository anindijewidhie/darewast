
import { Subject, Language, MasteryLevel, DistanceSchoolType, EducationalStage } from './types';

export const LANGUAGES: Language[] = [
  'English', 'Indonesian', 'Traditional Chinese', 'Simplified Chinese', 
  'Japanese', 'Korean', 'Arabic', 'Spanish', 'French', 
  'Portuguese', 'Russian', 'Hindi', 'Bengali', 'Urdu'
];

export interface LevelInfo {
  id: MasteryLevel;
  equivalency: string;
  duration: string;
  chaptersCount: number;
  type: 'mandatory' | 'optional' | 'maintenance';
}

export const MASTERY_LEVEL_ORDER: MasteryLevel[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'Beyond P', 'Beyond T'
];

export const LEVEL_METADATA: Record<MasteryLevel, LevelInfo> = {
  'A': { id: 'A', equivalency: 'Pre-Kindergarten', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'B': { id: 'B', equivalency: 'Pre-Kindergarten', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'C': { id: 'C', equivalency: 'Kindergarten', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'D': { id: 'D', equivalency: 'Kindergarten', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'E': { id: 'E', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'F': { id: 'F', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'G': { id: 'G', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'H': { id: 'H', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'I': { id: 'I', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'J': { id: 'J', equivalency: 'Primary School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'K': { id: 'K', equivalency: 'Middle School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'L': { id: 'L', equivalency: 'Middle School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'M': { id: 'M', equivalency: 'Middle School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'N': { id: 'N', equivalency: 'High School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'O': { id: 'O', equivalency: 'High School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'P': { id: 'P', equivalency: 'High School', duration: '12-24 months', chaptersCount: 12, type: 'mandatory' },
  'Q': { id: 'Q', equivalency: '1st Year University', duration: '24-48 months', chaptersCount: 12, type: 'optional' },
  'R': { id: 'R', equivalency: '2nd Year University', duration: '24-48 months', chaptersCount: 12, type: 'optional' },
  'S': { id: 'S', equivalency: '3rd Year University', duration: '24-48 months', chaptersCount: 12, type: 'optional' },
  'T': { id: 'T', equivalency: '4th Year University', duration: '24-48 months', chaptersCount: 12, type: 'optional' },
  'Beyond P': { id: 'Beyond P', equivalency: 'Global Skill Maintenance (Post-P)', duration: 'Continuous', chaptersCount: 1, type: 'maintenance' },
  'Beyond T': { id: 'Beyond T', equivalency: 'Expert Skill Maintenance (Post-T)', duration: 'Continuous', chaptersCount: 1, type: 'maintenance' },
};

// Quotas are PER SUBJECT DAILY
export const USAGE_LIMITS: Record<EducationalStage, number> = {
  'Preschool': 15,      // 15 minutes per subject
  'Primary': 30,        // 30 minutes per subject
  'Middle': 45,         // 45 minutes per subject
  'High': 45,           // 45 minutes per subject
  'University': 60,     // 60 minutes per subject
  'Transition': 45
};

export const DISTANCE_SCHOOL_MAPS: Record<DistanceSchoolType, { stage: string; grades: number }[]> = {
  '6-3-3': [{ stage: 'Early', grades: 3 }, { stage: 'Primary', grades: 6 }, { stage: 'Middle', grades: 3 }, { stage: 'High', grades: 3 }],
  '4-4-4': [{ stage: 'Early', grades: 3 }, { stage: 'Primary', grades: 4 }, { stage: 'Middle', grades: 4 }, { stage: 'High', grades: 4 }],
  '8-4': [{ stage: 'Early', grades: 3 }, { stage: 'Primary', grades: 8 }, { stage: 'Secondary', grades: 4 }],
  '7-4': [{ stage: 'Early', grades: 4 }, { stage: 'Primary', grades: 7 }, { stage: 'Secondary', grades: 4 }],
  '4-3-4': [{ stage: 'Early', grades: 4 }, { stage: 'Primary', grades: 4 }, { stage: 'Middle', grades: 3 }, { stage: 'High', grades: 4 }],
  '8-3': [{ stage: 'Early', grades: 4 }, { stage: 'Primary', grades: 8 }, { stage: 'Secondary', grades: 3 }],
  '4-4-3': [{ stage: 'Early', grades: 4 }, { stage: 'Primary', grades: 4 }, { stage: 'Middle', grades: 4 }, { stage: 'High', grades: 3 }],
  '5-5': [{ stage: 'Early', grades: 5 }, { stage: 'Primary', grades: 5 }, { stage: 'Secondary', grades: 5 }],
  '7-3': [{ stage: 'Early', grades: 5 }, { stage: 'Primary', grades: 7 }, { stage: 'Secondary', grades: 3 }]
};

export const getInstitutionalGrade = (type: DistanceSchoolType, level: MasteryLevel) => {
  const map = DISTANCE_SCHOOL_MAPS[type];
  const levelIndex = MASTERY_LEVEL_ORDER.indexOf(level);
  if (levelIndex === -1) return "Maintenance Mode";
  if (level === 'Beyond P') return "Post-P Mastery Hub";
  if (level === 'Beyond T') return "Post-T Expert Hub";
  const allSemesters: string[] = [];
  map.forEach(stage => {
    for (let i = 1; i <= stage.grades; i++) {
      allSemesters.push(`${stage.stage} ${i}A`);
      allSemesters.push(`${stage.stage} ${i}B`);
    }
  });
  return allSemesters[levelIndex] || LEVEL_METADATA[level].equivalency;
};

export const UNIVERSAL_RICH_MEDIA = { ebooks: 24, blogs: 96, podcasts: 48, videos: 96, exercisesPerLesson: 4 };

export const PODCAST_DURATIONS = [5, 10, 15, 30, 45, 60];

export const LEARNING_DURATIONS = [5, 10, 15, 30, 45, 60];
export const FAST_TRACK_DURATIONS = [30, 60, 90, 120];

export const SUBJECTS: Subject[] = [
  { id: 'literacy', name: 'Literacy', category: 'Literacy', icon: '📖', description: 'Deep linguistic analysis and high-fidelity literature synthesis across global eras.', suggestedSubTopics: ['Comparative Literature', 'Semantics', 'Creative Rhetoric'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'numeracy', name: 'Numeracy', category: 'Numeracy', icon: '🔢', description: 'Mathematical logic from fundamental arithmetic to abstract topological axioms.', suggestedSubTopics: ['Vector Calculus', 'Statistical Modeling', 'Logic Theory'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'physics', name: 'Natural Science', category: 'Natural Science', icon: '⚛️', description: 'Universal mechanics, quantum electrodynamics, and general relativity logic.', suggestedSubTopics: ['Astrophysics', 'Quantum Computing', 'Biology', 'Chemistry'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'social-science', name: 'Social Science', category: 'Social Science', icon: '🌍', description: 'Temporal analysis of global civilizations, demography, and political logic shifts.', suggestedSubTopics: ['Modern Geopolitics', 'History', 'Sociology'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'moral-ethics', name: 'Moral and Ethics', category: 'Moral and Ethics', icon: '⚖️', description: 'Foundational logic of right and wrong, distributive justice, and societal axioms.', suggestedSubTopics: ['Normative Ethics', 'Political Philosophy', 'Universal Rights'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'religion', name: 'Religion', category: 'Religion', icon: '📿', description: 'Comparative analysis of theological frameworks and spiritual logic pathways.', suggestedSubTopics: ['Comparative Religion', 'Theology', 'Sacred Texts'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'computer-science', name: 'Computer Science', category: 'Computer Science', icon: '💻', description: 'Algorithmic logic, neural architecture, and the synthesis of hardware/software.', suggestedSubTopics: ['Artificial Intelligence', 'Data Structures', 'Cybersecurity'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'music', name: 'Music', category: 'Music', icon: '🎵', description: 'Rhythmic logic, harmonic synthesis, and the mathematical beauty of sound.', suggestedSubTopics: ['Composition', 'Music Theory', 'Instrumental Mastery'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'dance', name: 'Dance', category: 'Dance', icon: '💃', description: 'Kinesthetic logic, spatial movement synthesis, and rhythmic physical expression.', suggestedSubTopics: ['Choreography', 'Kinematics', 'Cultural Styles'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'design', name: 'Design', category: 'Design', icon: '🎨', description: 'Visual logic modeling, ergonomic synthesis, and aesthetic engineering.', suggestedSubTopics: ['UI/UX Design', 'Architectural Drafting', 'Visual Branding'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'craft', name: 'Craft', category: 'Craft', icon: '🛠️', description: 'Material logic, manual dexterity synthesis, and functional artifact engineering.', suggestedSubTopics: ['Textile Arts', 'Woodworking', 'Industrial Prototyping'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'mind-sports', name: 'Mind Sports', category: 'Mind Sports', icon: '♟️', description: 'High-rigor cognitive strategy across Chess, Go, and Logic Puzzles.', suggestedSubTopics: ['Grandmaster Theory', 'Game Mechanics', 'Probability'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
];
