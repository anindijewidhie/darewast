
import { Subject, Language, MasteryLevel } from './types';

export const LANGUAGES: Language[] = [
  'English', 'Indonesian', 'Traditional Chinese', 'Simplified Chinese', 
  'Japanese', 'Korean', 'Arabic', 'Spanish', 'French', 
  'Portuguese', 'Russian', 'Hindi', 'Bengali', 'Urdu'
];

export interface LevelInfo {
  id: MasteryLevel;
  equivalency: string;
  duration: string;
  lessonsCount: number;
  type: 'mandatory' | 'optional' | 'maintenance';
}

export const MASTERY_LEVEL_ORDER: MasteryLevel[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'Beyond P', 'Beyond T'
];

export const LEVEL_METADATA: Record<MasteryLevel, LevelInfo> = {
  'A': { id: 'A', equivalency: 'Pre-Kindergarten', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'B': { id: 'B', equivalency: 'Pre-Kindergarten', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'C': { id: 'C', equivalency: 'Kindergarten', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'D': { id: 'D', equivalency: 'Kindergarten', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'E': { id: 'E', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'F': { id: 'F', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'G': { id: 'G', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'H': { id: 'H', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'I': { id: 'I', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'J': { id: 'J', equivalency: 'Primary School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'K': { id: 'K', equivalency: 'Middle School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'L': { id: 'L', equivalency: 'Middle School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'M': { id: 'M', equivalency: 'Middle School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'N': { id: 'N', equivalency: 'High School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'O': { id: 'O', equivalency: 'High School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'P': { id: 'P', equivalency: 'High School', duration: '1-2 weeks', lessonsCount: 12, type: 'mandatory' },
  'Q': { id: 'Q', equivalency: 'University', duration: '2-4 weeks', lessonsCount: 12, type: 'optional' },
  'R': { id: 'R', equivalency: 'University', duration: '2-4 weeks', lessonsCount: 12, type: 'optional' },
  'S': { id: 'S', equivalency: 'University', duration: '2-4 weeks', lessonsCount: 12, type: 'optional' },
  'T': { id: 'T', equivalency: 'University', duration: '2-4 weeks', lessonsCount: 12, type: 'optional' },
  'Beyond P': { id: 'Beyond P', equivalency: 'Post-High School Mastery', duration: 'Continuous', lessonsCount: 1, type: 'maintenance' },
  'Beyond T': { id: 'Beyond T', equivalency: 'University Mastery', duration: 'Continuous', lessonsCount: 1, type: 'maintenance' },
};

export const UNIVERSAL_RICH_MEDIA = {
  ebooks: 24,
  blogs: 96,
  podcasts: 48,
  videos: 96,
  exercisesPerLesson: 4
};

const TECH_RICH_MEDIA = {
  ebooks: 24,
  videos: 96,
  exercisesPerLesson: 4
};

const MUSIC_THEORY_RICH_MEDIA = {
  blogs: 48,
  videos: 96,
  exercisesPerLesson: 2
};

const MUSIC_PERFORMANCE_RICH_MEDIA = {
  songs: 48,
  videos: 96,
  exercisesPerLesson: 2
};

export const SUBJECTS: Subject[] = [
  { 
    id: 'literacy', 
    name: 'Literacy', 
    category: 'Literacy', 
    icon: '📖', 
    description: 'Unlocking the power of language through reading, writing, and critical linguistic analysis across multiple languages.',
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'numeracy', 
    name: 'Numeracy', 
    category: 'Numeracy', 
    icon: '🔢', 
    description: 'Mastering the universal language of numbers, logic, and abstract computational thinking from foundations to complex sets.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'physics', 
    name: 'Physics', 
    category: 'Science', 
    icon: '⚛️', 
    description: 'Exploring the fundamental laws of energy, matter, and the hidden mechanics of our physical universe.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'chemistry', 
    name: 'Chemistry', 
    category: 'Science', 
    icon: '🧪', 
    description: 'Diving into the molecular world of atoms, complex reactions, and the elemental composition of everything around us.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'biology', 
    name: 'Biology', 
    category: 'Science', 
    icon: '🧬', 
    description: 'Investigating the miraculous complexity of living organisms, cellular structures, and the biological systems that sustain life.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'astronomy', 
    name: 'Astronomy', 
    category: 'Science', 
    icon: '🌌', 
    description: 'Journeying through the vast cosmos to understand planets, stars, black holes, and the origins of our galaxy.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'sci-geo', 
    name: 'Science Geography', 
    category: 'Science', 
    icon: '🌍', 
    description: 'Deciphering the physical forces that shape Earth, from geological shifts to atmospheric global climate systems.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'history', 
    name: 'History', 
    category: 'Humanities', 
    icon: '📜', 
    description: 'Chronicling the rise and fall of civilizations to understand the profound events that shaped our modern world.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'soc-geo', 
    name: 'Social Geography', 
    category: 'Humanities', 
    icon: '🏙️', 
    description: 'Examining how human societies organize, urbanize, and interact with their diverse environments and each other.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'economics', 
    name: 'Economics', 
    category: 'Humanities', 
    icon: '📈', 
    description: 'Analyzing the flow of wealth, market dynamics, and the engines of global finance through micro and macro perspectives.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'sociology', 
    name: 'Sociology', 
    category: 'Humanities', 
    icon: '👥', 
    description: 'Studying the intricate patterns of human social behavior, collective identity, and the evolution of modern society.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'psychology', 
    name: 'Psychology', 
    category: 'Humanities', 
    icon: '🧠', 
    description: 'Probing the depths of the human mind, from cognitive functions to the biological roots of behavioral patterns.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'philosophy', 
    name: 'Philosophy', 
    category: 'Humanities', 
    icon: '🏛️', 
    description: 'Challenging the nature of reality, logic, and ethics through the fundamental pursuit of wisdom and critical inquiry.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'anthropology', 
    name: 'Anthropology', 
    category: 'Humanities', 
    icon: '🏺', 
    description: 'Uncovering the global cultural tapestry and the biological journey of humanity from prehistory to the present day.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'religion', 
    name: 'Religion', 
    category: 'Humanities', 
    icon: '🕊️', 
    description: 'A global exploration of faith, belief systems, and the diverse spiritual paths that influence human culture.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'computer-os', 
    name: 'Operating Systems', 
    category: 'Tech', 
    icon: '💿', 
    description: 'Taking control of digital architecture, from low-level kernels to intuitive user interfaces across all major platforms.', 
    richMediaConfig: TECH_RICH_MEDIA
  },
  { 
    id: 'computer-soft', 
    name: 'Software', 
    category: 'Tech', 
    icon: '💾', 
    description: 'Mastering the essential tools of the digital age, covering applications, workflows, and their creative potential.', 
    richMediaConfig: TECH_RICH_MEDIA
  },
  { 
    id: 'computer-code', 
    name: 'Programming', 
    category: 'Tech', 
    icon: '💻', 
    description: 'Coding the future through logic, algorithms, and deep mastery of major programming languages and paradigms.', 
    richMediaConfig: TECH_RICH_MEDIA
  },
  { 
    id: 'ai-ml', 
    name: 'Artificial Intelligence', 
    category: 'Tech', 
    icon: '🤖', 
    description: 'Unlocking the secrets of neural networks, machine learning models, and the automation systems of the next frontier.', 
    richMediaConfig: TECH_RICH_MEDIA
  },
  { 
    id: 'music-theory', 
    name: 'Music Theory', 
    category: 'Music', 
    icon: '🎼', 
    description: 'Decoding the science of sound, harmony, rhythm, and the structural beauty of professional musical composition.', 
    richMediaConfig: MUSIC_THEORY_RICH_MEDIA
  },
  { 
    id: 'music-instrument', 
    name: 'Musical Instruments', 
    category: 'Music', 
    icon: '🎻', 
    description: 'Achieving technical excellence and emotional expression through proficiency in instrumental performance.', 
    richMediaConfig: MUSIC_PERFORMANCE_RICH_MEDIA
  },
  { 
    id: 'music-vocal', 
    name: 'Vocal', 
    category: 'Music', 
    icon: '🎤', 
    description: 'Mastering the art of singing, vocal techniques, and performance across every major language and musical genre.', 
    richMediaConfig: MUSIC_PERFORMANCE_RICH_MEDIA
  },
  { 
    id: 'ethics', 
    name: 'Moral and Ethics', 
    category: 'Ethics', 
    icon: '⚖️', 
    description: 'Navigating the complex landscapes of right and wrong through deep philosophical inquiry and ethical decision-making.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
  { 
    id: 'law', 
    name: 'Law', 
    category: 'Ethics', 
    icon: '📜', 
    description: 'Understanding the pillars of justice, global legal systems, jurisprudence, and the protection of constitutional rights.', 
    richMediaConfig: UNIVERSAL_RICH_MEDIA
  },
];
