
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

export const getLearningStage = (level: MasteryLevel): string => {
  const levelIndex = MASTERY_LEVEL_ORDER.indexOf(level);
  if (levelIndex === -1) return 'Unknown';
  if (level.startsWith('Beyond')) return 'Master';
  
  if (levelIndex <= 3) return 'Beginner'; // A-D
  if (levelIndex <= 9) return 'Intermediate'; // E-J
  if (levelIndex <= 12) return 'Advanced'; // K-M
  if (levelIndex <= 15) return 'Proficient'; // N-P
  if (levelIndex <= 19) return 'Expert'; // Q-T
  return 'Master';
};

export const UNIVERSAL_RICH_MEDIA = { ebooks: 24, blogs: 96, podcasts: 48, videos: 96, exercisesPerLesson: 4 };

export const PODCAST_DURATIONS = [5, 10, 15, 30, 45, 60];

export const LEARNING_DURATIONS = [5, 10, 15, 30, 45, 60];
export const FAST_TRACK_DURATIONS = [30, 60, 90, 120];

export const SUBJECTS: Subject[] = [
  { id: 'literacy', name: 'Literacy', category: 'Literacy', icon: '📖', description: 'Deep linguistic analysis and high-fidelity literature synthesis across global eras.', explanation: 'Literacy in the darewast framework transcends basic reading and writing. It is the study of human expression through the lens of semiotics, rhetoric, and comparative philology. Students analyze how language shapes reality, from ancient cuneiform records to modern digital narratives, developing the ability to synthesize complex ideas and communicate with precision and power.', suggestedSubTopics: ['Comparative Literature', 'Semantics', 'Creative Rhetoric'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'numeracy', name: 'Numeracy', category: 'Numeracy', icon: '🔢', description: 'Mathematical logic from fundamental arithmetic to abstract topological axioms.', explanation: 'Numeracy is the exploration of the universe’s underlying quantitative structure. Beyond simple calculation, this subject focuses on mathematical reasoning, abstract modeling, and the beauty of formal systems. From the elegance of number theory to the practical power of statistical inference, students learn to decode the patterns that govern both the natural and digital worlds.', suggestedSubTopics: ['Vector Calculus', 'Statistical Modeling', 'Logic Theory'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'physics', name: 'Physics', category: 'Physics', icon: '⚛️', description: 'Universal mechanics, quantum electrodynamics, and general relativity logic.', explanation: 'Physics at darewast is a rigorous investigation into the fundamental physical laws of the cosmos. It explores the nature of matter, energy, space, and time. Students engage with the scientific method to explore everything from subatomic particles to galactic structures, fostering a deep appreciation for the complexity and order of the physical universe.', suggestedSubTopics: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'chemistry', name: 'Chemistry', category: 'Chemistry', icon: '🧪', description: 'Molecular synthesis, atomic logic, and the transformative properties of matter.', explanation: 'Chemistry is the study of matter and the changes it undergoes. Students explore atomic structure, chemical bonding, and the reactions that form the basis of life and technology. The curriculum emphasizes laboratory precision, molecular modeling, and the synthesis of new materials for a sustainable future.', suggestedSubTopics: ['Organic Chemistry', 'Biochemistry', 'Materials Science'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'biology', name: 'Biology', category: 'Biology', icon: '🧬', description: 'Genetic logic, cellular synthesis, and the complex systems of living organisms.', explanation: 'Biology is the study of life in all its forms. From the molecular machinery of the cell to the complex interactions within ecosystems, students explore the principles of evolution, genetics, and physiology. The curriculum fosters a deep understanding of the biological basis of health, disease, and the interconnectedness of all living things.', suggestedSubTopics: ['Genetics', 'Microbiology', 'Ecology'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'astronomy', name: 'Astronomy', category: 'Astronomy', icon: '🔭', description: 'Cosmic logic, stellar evolution, and the mapping of the observable universe.', explanation: 'Astronomy is the study of celestial objects and the universe as a whole. Students explore the birth and death of stars, the formation of galaxies, and the search for extraterrestrial life. The curriculum integrates physics and mathematics to decode the signals from the deep cosmos, expanding our understanding of humanity’s place in the universe.', suggestedSubTopics: ['Cosmology', 'Planetary Science', 'Astrophysics'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'natural-geography', name: 'Natural Geography', category: 'Natural Geography', icon: '🏔️', description: 'Geological logic, atmospheric synthesis, and the physical mapping of Earth.', explanation: 'Natural Geography examines the physical processes that shape the Earth’s surface. Students study plate tectonics, climate systems, and the distribution of natural resources. The curriculum emphasizes the dynamic relationship between the lithosphere, hydrosphere, and atmosphere, fostering a deep appreciation for the Earth’s physical complexity.', suggestedSubTopics: ['Geomorphology', 'Climatology', 'Hydrology'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'social-geography', name: 'Social Geography', category: 'Social Geography', icon: '🏙️', description: 'Demographic logic, urban synthesis, and the spatial mapping of human society.', explanation: 'Social Geography explores the relationship between people and their environments. Students study urbanization, migration patterns, and the spatial distribution of culture and wealth. The curriculum emphasizes how human societies organize space, interact with their surroundings, and adapt to changing global conditions.', suggestedSubTopics: ['Urban Planning', 'Human Migration', 'Cultural Landscapes'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'history', name: 'History', category: 'History', icon: '📜', description: 'Temporal logic analysis of global civilizations and the synthesis of historical events.', explanation: 'History is the study of the human past through the critical analysis of evidence. Students explore the rise and fall of civilizations, the evolution of ideas, and the forces that have shaped the modern world. The curriculum emphasizes historical empathy, source criticism, and the understanding of continuity and change across eras.', suggestedSubTopics: ['World History', 'Archaeology', 'Historiography'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'economics', name: 'Economics', category: 'Economics', icon: '📈', description: 'Distributive logic, market synthesis, and the mathematical modeling of value.', explanation: 'Economics is the study of how societies allocate scarce resources. Students explore microeconomic behavior, macroeconomic systems, and the principles of global trade. The curriculum emphasizes mathematical modeling, data analysis, and the ethical implications of economic policy in a complex world.', suggestedSubTopics: ['Macroeconomics', 'Game Theory', 'Behavioral Economics'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'sociology', name: 'Sociology', category: 'Sociology', icon: '👥', description: 'Institutional logic, social synthesis, and the analysis of human group behavior.', explanation: 'Sociology is the study of social life, social change, and the social causes and consequences of human behavior. Students explore social structures, institutions, and the dynamics of power and inequality. The curriculum emphasizes critical thinking, research methods, and the understanding of how society shapes individual lives.', suggestedSubTopics: ['Social Theory', 'Criminology', 'Gender Studies'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'psychology', name: 'Psychology', category: 'Psychology', icon: '🧠', description: 'Cognitive logic, behavioral synthesis, and the mapping of the human mind.', explanation: 'Psychology is the scientific study of the mind and behavior. Students explore cognitive processes, emotional development, and the biological basis of behavior. The curriculum emphasizes research methodology, clinical applications, and the understanding of individual differences and social influence.', suggestedSubTopics: ['Cognitive Psychology', 'Developmental Psychology', 'Neuroscience'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'philosophy', name: 'Philosophy', category: 'Philosophy', icon: '🏛️', description: 'Axiomatic logic, metaphysical synthesis, and the foundational inquiry of existence.', explanation: 'Philosophy is the study of fundamental questions about existence, knowledge, values, and reason. Students explore logic, ethics, and metaphysics through the lens of diverse philosophical traditions. The curriculum emphasizes critical analysis, rigorous argumentation, and the pursuit of wisdom in a complex world.', suggestedSubTopics: ['Epistemology', 'Metaphysics', 'Logic'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'anthropology', name: 'Anthropology', category: 'Anthropology', icon: '🗿', description: 'Cultural logic, evolutionary synthesis, and the holistic study of humanity.', explanation: 'Anthropology is the holistic study of humanity across time and space. Students explore human evolution, cultural diversity, and the development of social institutions. The curriculum emphasizes ethnographic research, linguistic analysis, and the understanding of what it means to be human in a globalized world.', suggestedSubTopics: ['Cultural Anthropology', 'Biological Anthropology', 'Linguistic Anthropology'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'religion', name: 'Religion', category: 'Religion', icon: '📿', description: 'Comparative analysis of theological frameworks and spiritual logic pathways for all belief systems.', explanation: 'The study of Religion at darewast is a scholarly exploration of the world’s major faith traditions and spiritual philosophies. Students examine sacred texts, rituals, and theological doctrines to understand how religion has influenced human history, art, and identity. The curriculum promotes interfaith literacy and a respectful understanding of the diverse ways humans seek meaning.', suggestedSubTopics: ['Comparative Religion', 'Theology', 'Sacred Texts'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'moral-ethics', name: 'Moral and Ethics', category: 'Moral and Ethics', icon: '⚖️', description: 'Foundational logic of right and wrong, distributive justice, and societal axioms.', explanation: 'Moral and Ethics provides the philosophical foundation for navigating a complex world. Students explore diverse ethical frameworks, from virtue ethics to utilitarianism, and apply them to contemporary dilemmas. The goal is to develop a robust internal compass, fostering empathy, integrity, and a deep commitment to justice and the common good.', suggestedSubTopics: ['Normative Ethics', 'Political Philosophy', 'Universal Rights'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'operating-systems', name: 'Operating Systems', category: 'Operating Systems', icon: '💽', description: 'Kernel logic, resource synthesis, and the architecture of all operating systems.', explanation: 'Operating Systems is the study of the software that manages computer hardware and software resources. Students explore process management, memory allocation, and file systems across diverse architectures like Linux, Windows, and macOS. The curriculum emphasizes system-level programming, security, and the optimization of computational environments.', suggestedSubTopics: ['Kernel Development', 'Distributed Systems', 'Virtualization'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'basic-software', name: 'Basic Software', category: 'Basic Software', icon: '💿', description: 'Fundamental application logic, productivity suites, and essential utility synthesis.', explanation: 'Basic Software covers the essential tools required for modern digital literacy. This includes productivity suites, browsers, and utility software. Students explore the logic of interface design, data management within applications, and the foundational principles of how common software tools facilitate human tasks.', suggestedSubTopics: ['Productivity Suites', 'Web Browsers', 'Utility Logic'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'specialized-software', name: 'Specialized Software', category: 'Specialized Software', icon: '🛠️', description: 'Advanced domain-specific logic nodes picked by the user for professional mastery.', explanation: 'Specialized Software allows students to dive deep into professional-grade tools tailored to their specific interests or career paths. This includes creative suites, engineering software, and data analysis platforms. Students master the complex workflows and specialized logic required for high-level professional output.', suggestedSubTopics: ['Creative Suites', 'CAD/CAM Logic', 'Data Analysis Tools'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'programming', name: 'Programming', category: 'Programming', icon: '⌨️', description: 'Algorithmic logic, syntax synthesis, and the mastery of all programming languages.', explanation: 'Programming is the art and science of instructing computers to perform tasks. Students explore diverse paradigms—from imperative and functional to object-oriented and logic programming. The curriculum emphasizes algorithmic thinking, data structures, and the ability to learn and apply any programming language with precision and efficiency.', suggestedSubTopics: ['Algorithms', 'Data Structures', 'Functional Programming'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'ai', name: 'AI', category: 'AI', icon: '🤖', description: 'Neural logic, machine synthesis, and the architecture of all AI platforms.', explanation: 'Artificial Intelligence is the study of systems that can perform tasks that typically require human intelligence. Students explore machine learning, neural networks, and natural language processing. The curriculum emphasizes the mathematical foundations of AI, the development of intelligent agents, and the ethical implications of autonomous systems.', suggestedSubTopics: ['Deep Learning', 'Natural Language Processing', 'Computer Vision'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'music-theory', name: 'Music Theory', category: 'Music Theory', icon: '🎼', description: 'Harmonic logic, structural synthesis, and the mathematical beauty of musical systems.', explanation: 'Music Theory is the study of the practices and possibilities of music. Students explore melody, harmony, rhythm, and form through the lens of diverse musical traditions. The curriculum emphasizes the mathematical and logical structures that underlie musical expression, fostering a deep understanding of how music is constructed and perceived.', suggestedSubTopics: ['Counterpoint', 'Orchestration', 'Acoustics'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'instrumental-performance', name: 'Musical Instrument Performance', category: 'Musical Instrument Performance', icon: '🎻', description: 'Technical logic, expressive synthesis, and the mastery of all musical instruments.', explanation: 'Musical Instrument Performance is the study of the technical and expressive aspects of playing an instrument. Students explore technique, repertoire, and performance practice across a wide range of instruments. The curriculum emphasizes both technical mastery and creative interpretation, fostering the ability to communicate through music with precision and emotion.', suggestedSubTopics: ['Technique', 'Repertoire', 'Performance Practice'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'vocal-music', name: 'Vocal Music', category: 'Vocal Music', icon: '🎤', description: 'Phonetic logic, melodic synthesis, and the mastery of the human voice.', explanation: 'Vocal Music is the study of the human voice as a musical instrument. Students explore vocal technique, diction, and repertoire across diverse genres and languages. The curriculum emphasizes the connection between breath, body, and sound, fostering the ability to express complex emotions and narratives through song.', suggestedSubTopics: ['Vocal Pedagogy', 'Diction', 'Choral Conducting'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'dance', name: 'Dance', category: 'Dance', icon: '💃', description: 'Kinesthetic logic, spatial movement synthesis, and rhythmic physical expression.', explanation: 'Dance is the art of kinesthetic expression and spatial storytelling. Students explore the mechanics of movement, the discipline of various techniques, and the creative process of choreography. The curriculum emphasizes the connection between body and mind, using dance as a medium to explore cultural identity, emotion, and the physical limits of human performance.', suggestedSubTopics: ['Choreography', 'Kinematics', 'Cultural Styles'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'design', name: 'Design', category: 'Design', icon: '🎨', description: 'Visual logic modeling, ergonomic synthesis, and aesthetic engineering.', explanation: 'Design is the intentional creation of solutions that are both functional and beautiful. Our curriculum integrates visual arts, engineering, and psychology to teach students how to solve complex problems through design thinking. From user interfaces to architectural structures, students learn to balance aesthetics with utility, creating artifacts that enhance human life.', suggestedSubTopics: ['UI/UX Design', 'Architectural Drafting', 'Visual Branding'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'crafting', name: 'Crafting', category: 'Crafting', icon: '🛠️', description: 'Material logic, manual dexterity synthesis, and functional artifact engineering.', explanation: 'Crafting is the mastery of materials and the discipline of manual creation. Students engage with traditional and modern techniques—from woodworking and textiles to 3D printing and prototyping. The curriculum focuses on the relationship between the maker and the object, fostering patience, precision, and a deep understanding of material properties and functional design.', suggestedSubTopics: ['Textile Arts', 'Woodworking', 'Industrial Prototyping'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
  { id: 'mind-sports', name: 'Mind Sports', category: 'Mind Sports', icon: '♟️', description: 'High-rigor cognitive strategy across all types of games and logic puzzles.', explanation: 'Mind Sports are the ultimate test of cognitive endurance and strategic reasoning. Students study the deep theory and mechanics of games like Chess and Go, developing skills in pattern recognition, probability, and psychological warfare. The curriculum emphasizes the transferability of these strategic skills to real-world decision-making and complex problem-solving.', suggestedSubTopics: ['Grandmaster Theory', 'Game Mechanics', 'Probability'], richMediaConfig: UNIVERSAL_RICH_MEDIA },
];
