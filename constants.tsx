
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
  { id: 'literacy', name: 'Literacy', category: 'Literacy', icon: '📖', description: 'Deep linguistic analysis and high-fidelity literature synthesis across global eras.', explanation: 'Literacy in the darewast framework transcends basic reading and writing. It is the study of human expression through the lens of semiotics, rhetoric, and comparative philology. Students analyze how language shapes reality, from ancient cuneiform records to modern digital narratives, developing the ability to synthesize complex ideas and communicate with precision and power.', suggestedSubTopics: ['Comparative Literature', 'Semantics', 'Creative Rhetoric'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'numeracy', name: 'Numeracy', category: 'Numeracy', icon: '🔢', description: 'Mathematical logic from fundamental arithmetic to abstract topological axioms.', explanation: 'Numeracy is the exploration of the universe’s underlying quantitative structure. Beyond simple calculation, this subject focuses on mathematical reasoning, abstract modeling, and the beauty of formal systems. From the elegance of number theory to the practical power of statistical inference, students learn to decode the patterns that govern both the natural and digital worlds.', suggestedSubTopics: ['Vector Calculus', 'Statistical Modeling', 'Logic Theory'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'physics', name: 'Natural Science', category: 'Natural Science', icon: '⚛️', description: 'Universal mechanics, quantum electrodynamics, and general relativity logic.', explanation: 'Natural Science at darewast is a rigorous investigation into the physical laws of the cosmos. It integrates physics, chemistry, and biology into a unified understanding of matter, energy, and life. Students engage with the scientific method to explore everything from subatomic particles to galactic structures, fostering a deep appreciation for the complexity and order of the natural world.', suggestedSubTopics: ['Astrophysics', 'Quantum Computing', 'Biology', 'Chemistry'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'social-science', name: 'Social Science', category: 'Social Science', icon: '🌍', description: 'Temporal analysis of global civilizations, demography, and political logic shifts.', explanation: 'Social Science examines the intricate web of human interactions, institutions, and history. By studying sociology, anthropology, and political science, students gain insights into how societies form, evolve, and sometimes collapse. The curriculum emphasizes critical analysis of power structures, cultural shifts, and the historical forces that have shaped our contemporary global landscape.', suggestedSubTopics: ['Modern Geopolitics', 'History', 'Sociology'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'moral-ethics', name: 'Moral and Ethics', category: 'Moral and Ethics', icon: '⚖️', description: 'Foundational logic of right and wrong, distributive justice, and societal axioms.', explanation: 'Moral and Ethics provides the philosophical foundation for navigating a complex world. Students explore diverse ethical frameworks, from virtue ethics to utilitarianism, and apply them to contemporary dilemmas. The goal is to develop a robust internal compass, fostering empathy, integrity, and a deep commitment to justice and the common good.', suggestedSubTopics: ['Normative Ethics', 'Political Philosophy', 'Universal Rights'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'religion', name: 'Religion', category: 'Religion', icon: '📿', description: 'Comparative analysis of theological frameworks and spiritual logic pathways.', explanation: 'The study of Religion at darewast is a scholarly exploration of the world’s major faith traditions and spiritual philosophies. Students examine sacred texts, rituals, and theological doctrines to understand how religion has influenced human history, art, and identity. The curriculum promotes interfaith literacy and a respectful understanding of the diverse ways humans seek meaning.', suggestedSubTopics: ['Comparative Religion', 'Theology', 'Sacred Texts'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'computer-science', name: 'Computer Science', category: 'Computer Science', icon: '💻', description: 'Algorithmic logic, neural architecture, and the synthesis of hardware/software.', explanation: 'Computer Science is the study of computation, information, and automation. In our curriculum, it goes beyond coding to encompass algorithmic thinking, data structures, and the architecture of intelligent systems. Students learn to build, secure, and optimize the digital infrastructure that powers the modern world, while considering the ethical implications of technology.', suggestedSubTopics: ['Artificial Intelligence', 'Data Structures', 'Cybersecurity'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'music', name: 'Music', category: 'Music', icon: '🎵', description: 'Rhythmic logic, harmonic synthesis, and the mathematical beauty of sound.', explanation: 'Music is the mathematical and emotional synthesis of sound and silence. Our curriculum covers music theory, composition, and performance, exploring how melody, harmony, and rhythm interact to create profound human experiences. Students develop both technical mastery and creative intuition, understanding music as a universal language that transcends cultural boundaries.', suggestedSubTopics: ['Composition', 'Music Theory', 'Instrumental Mastery'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'dance', name: 'Dance', category: 'Dance', icon: '💃', description: 'Kinesthetic logic, spatial movement synthesis, and rhythmic physical expression.', explanation: 'Dance is the art of kinesthetic expression and spatial storytelling. Students explore the mechanics of movement, the discipline of various techniques, and the creative process of choreography. The curriculum emphasizes the connection between body and mind, using dance as a medium to explore cultural identity, emotion, and the physical limits of human performance.', suggestedSubTopics: ['Choreography', 'Kinematics', 'Cultural Styles'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'design', name: 'Design', category: 'Design', icon: '🎨', description: 'Visual logic modeling, ergonomic synthesis, and aesthetic engineering.', explanation: 'Design is the intentional creation of solutions that are both functional and beautiful. Our curriculum integrates visual arts, engineering, and psychology to teach students how to solve complex problems through design thinking. From user interfaces to architectural structures, students learn to balance aesthetics with utility, creating artifacts that enhance human life.', suggestedSubTopics: ['UI/UX Design', 'Architectural Drafting', 'Visual Branding'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'craft', name: 'Craft', category: 'Craft', icon: '🛠️', description: 'Material logic, manual dexterity synthesis, and functional artifact engineering.', explanation: 'Craft is the mastery of materials and the discipline of manual creation. Students engage with traditional and modern techniques—from woodworking and textiles to 3D printing and prototyping. The curriculum focuses on the relationship between the maker and the object, fostering patience, precision, and a deep understanding of material properties and functional design.', suggestedSubTopics: ['Textile Arts', 'Woodworking', 'Industrial Prototyping'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'mind-sports', name: 'Mind Sports', category: 'Mind Sports', icon: '♟️', description: 'High-rigor cognitive strategy across Chess, Go, and Logic Puzzles.', explanation: 'Mind Sports are the ultimate test of cognitive endurance and strategic reasoning. Students study the deep theory and mechanics of games like Chess and Go, developing skills in pattern recognition, probability, and psychological warfare. The curriculum emphasizes the transferability of these strategic skills to real-world decision-making and complex problem-solving.', suggestedSubTopics: ['Grandmaster Theory', 'Game Mechanics', 'Probability'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
];
