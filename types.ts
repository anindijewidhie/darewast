
export type Language = 
  | 'Indonesian' | 'English' | 'Traditional Chinese' | 'Simplified Chinese' 
  | 'Japanese' | 'Korean' | 'Arabic' | 'Spanish' | 'French' 
  | 'Portuguese' | 'Russian' | 'Hindi' | 'Bengali' | 'Urdu';

export type SubjectCategory = 
  | 'Literacy' 
  | 'Numeracy' 
  | 'Natural Science' 
  | 'Social Science' 
  | 'Moral and Ethics'
  | 'Religion'
  | 'Computer Science' 
  | 'Music' 
  | 'Dance'
  | 'Design'
  | 'Craft'
  | 'Mind Sports' 
  | 'Custom';

export type CurriculumEra = 
  | 'Ancient' 
  | 'Medieval' 
  | 'Renaissance' 
  | 'Enlightenment' 
  | 'Industrial' 
  | 'Modern' 
  | 'Contemporary' 
  | 'Future' 
  | string;

export type LearningMethod = 
  | 'darewast-Unified' 
  | 'Kumon-style' 
  | 'Sakamoto-Method' 
  | 'Eye-Level-aligned' 
  | 'Socratic-Inquiry'
  | 'Scholastic-Method'
  | 'Montessori-inspired' 
  | 'Waldorf-aligned' 
  | 'Traditional-Rote' 
  | 'Project-Based-Learning'
  | 'Phenomenon-Based'
  | string;

export type CurriculumStyle = 
  | 'darewast-Universal'
  | 'US-Common-Core'
  | 'UK-National-Curriculum'
  | 'IB-Continuum'
  | 'Japan-Monbusho'
  | 'Singapore-MOE'
  | 'Finland-National'
  | string;

export type LearningStyle = 'Unified' | 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic';

export type MasteryLevel = 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' 
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'Beyond P' | 'Beyond T';

export type CompletionMethod = 'assessment' | 'questionnaire' | 'project' | 'performance';

export type EducationalStage = 'Preschool' | 'Primary' | 'Middle' | 'High' | 'University' | 'Transition';

export type ContributorRole = 'Contributor' | 'Educator';

export type AccommodationType = 'none' | 'dyslexia' | 'visual' | 'adhd' | 'hearing' | 'idd';

export type EducationTrack = 
  | 'Standard' 
  | 'School' 
  | 'University' 
  | 'DistanceSchool' 
  | 'DistanceUniversity'
  | 'VocationalSchool' 
  | 'VocationalUniversity'
  | 'DistanceVocationalSchool' 
  | 'DistanceVocationalUniversity';

export type DistanceSchoolType = 
  | '6-3-3' | '4-4-4' | '8-4' | '7-4' | '4-3-4' | '8-3' | '4-4-3' | '5-5' | '7-3';

export type InstitutionStatus = 'regular' | 'closed' | 'problematic' | 'independent';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export type AuthorType = 'Professional' | 'Contributor';

export interface MasterySchedule {
  type: 'academic' | 'dedicated' | 'unstoppable' | 'custom';
  days: string[];
}

export interface TransitionProgram {
  id: string;
  targetAge: number;
  targetTypes: DistanceSchoolType[];
  yearsRemaining: number;
  enrolledDate: string;
  sourceMethod: 'Kumon' | 'Sakamoto' | 'Eye Level';
  legacyGrade: string;
}

export interface EssayGradingResult {
  clarity: number;
  coherence: number;
  relevance: number;
  feedback: string;
  passed: boolean;
}

export interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  title: string;
  uri?: string;
}

export interface PaymentPreferences {
  method: 'bank' | 'wallet';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  walletProvider?: string;
  walletNumber?: string;
}

export interface ProfessionalCredentials {
  title: string;
  institution: string;
  degree: string;
  yearsOfExperience: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  evidenceUploaded: boolean;
  evidenceType: 'degree' | 'report_card';
  portfolioUrl?: string;
}

export interface ProjectPrompt {
  title: string;
  objective: string;
  requirements: string[];
  guidelines: string;
}

export interface AccessibilitySettings {
  dyslexicFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  textScale: number;
  screenReaderHints: boolean;
  iddSupport: boolean;
  focusMode: boolean;
  voiceNavigation: boolean;
  colorBlindMode: ColorBlindMode;
}

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  icon: string;
  description: string;
  suggestedSubTopics?: string[];
  availableSpecializations?: string[];
  equivalencies?: Record<MasteryLevel | string, string>;
  isUserGenerated?: boolean;
  targetCurriculum?: string;
  richMediaConfig?: {
    ebooks?: number;
    blogs?: number;
    podcasts?: number;
    videos?: number;
    songs?: number;
    exercisesPerLesson: number;
    worksPerLesson?: number;
    danceMovesPerLesson?: number;
    simulationsPerLesson?: number;
  };
}

export interface SubjectProgress {
  level: MasteryLevel;
  lessonNumber: number;
  isPlaced: boolean;
  lastScore?: { correct: number; total: number; skillPoints?: number; gradeTier?: string };
  specializations?: string[];
  secondaryLanguage?: Language;
  currentTheme?: string;
  track?: EducationTrack;
  examPrepActive?: boolean;
  examPrepLesson?: number;
  completedExams?: string[];
  isFastTrack?: boolean;
  fastTrackDuration?: number;
  totalMinutesSpent?: number;
  dailyMinutesSpent?: number; // New: tracking daily quota per subject
  hintsUsed?: number;
  relearnActive?: boolean;
  relearnStage?: EducationalStage;
  completedMedia?: string[];
}

export interface UserProgress {
  [subjectId: string]: SubjectProgress;
}

export type View = 
  | 'landing' 
  | 'dashboard' 
  | 'school-dashboard' 
  | 'university-dashboard' 
  | 'distance-school-dashboard'
  | 'distance-university-dashboard'
  | 'vocational-school-dashboard'
  | 'vocational-university-dashboard'
  | 'distance-vocational-school-dashboard'
  | 'distance-vocational-university-dashboard'
  | 'auth' | 'donation' | 'lesson' | 'profile' | 'placement-test' 
  | 'subject-placement' | 'subject-assessment'
  | 'relearn-placement'
  | 'diagnostic-gate'
  | 'contributor' | 'grade-converter' | 'mastery-exam' | 'exam-prep' 
  | 'guardian-report' | 'accessibility' | 'lesson-combination' 
  | 'method-combination' | 'leaderboard' | 'track-selection'
  | 'curriculum-generator'
  | 'fast-track-hub'
  | 'certificate'
  | 'exam-hall'
  | 'relearn-hub'
  | 'transition-hub'
  | 'credit-transfer'
  | 'transfer-portal'
  | 'level-completion-hub'
  | 'handwriting-hub';

export interface User {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  birthDate: string;
  age: number;
  isMinor: boolean;
  stage?: EducationalStage; 
  dailyGoal: number;
  timeSpentToday: number; // in minutes (total across all subjects)
  studyHistory: Record<string, number>;
  contributions: number;
  streak: number;
  xp: number;
  level: number;
  rank: string;
  badges: any[];
  points: number;
  contributorRole?: ContributorRole;
  masterySchedule?: MasterySchedule;
  preferredLearningStyle?: LearningStyle;
  professionalCredentials?: ProfessionalCredentials;
  academicDNA?: {
    era: CurriculumEra;
    method: LearningMethod;
    curriculumStyle?: CurriculumStyle;
    hybridMethods?: [LearningMethod, LearningMethod];
  };
  accessibility?: AccessibilitySettings;
  culturalBackground?: string;
  track?: EducationTrack;
  distanceSchoolType?: DistanceSchoolType;
  degreeDuration?: number;
  institutionStatus?: InstitutionStatus;
  transitionProgram?: TransitionProgram;
  creditRecords?: any[];
  studentNumber?: string;
  institutionName?: string;
  weeklyStipend?: number;
  guardian?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface Certificate {
  subjectName: string;
  level: MasteryLevel | string;
  date: string;
  userName: string;
  verificationId: string;
  programType: 'regular' | 'fast-track' | 'relearn' | 'transition';
  score: number;
  gradeDescription: string;
}

export interface CreativeSession {
  type: 'notation' | 'choreography' | 'blueprint' | 'craft-guide';
  title: string;
  data: string; 
  interactionPrompt: string;
  steps: { label: string; details: string; value?: string }[];
}

export interface LessonContent {
  title: string;
  explanation: string;
  timelineSteps?: { title: string; detail: string }[];
  adaptations: {
    visualMapDescription: string;
    auditoryScript: string;
    kinestheticActivity: string;
    readingDeepDive: string;
  };
  examples: string[];
  exercises: {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }[];
  level: MasteryLevel;
  lessonNumber: number;
  eraNote?: string;
  groundingSources?: { title: string; uri: string }[];
  mediaResources?: MediaItem[];
  isRelearn?: boolean;
  isTransition?: boolean;
  relearnStage?: EducationalStage;
  phoneticMap?: Record<string, string>;
  creativeSession?: CreativeSession;
  challengeLevel?: 'Scaffolded' | 'Adaptive' | 'High Rigor' | 'Expert';
  authorType: AuthorType;
}

export type CurriculumCluster = 
  | 'Academic (Global)' 
  | 'Methods (Kumon/EyeLevel)' 
  | 'Arts (ABRSM/Suzuki)' 
  | 'Vocational (Career)';
