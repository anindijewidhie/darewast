
export type Language = 
  | 'Indonesian' | 'English' | 'Traditional Chinese' | 'Simplified Chinese' 
  | 'Japanese' | 'Korean' | 'Arabic' | 'Spanish' | 'French' 
  | 'Portuguese' | 'Russian' | 'Hindi' | 'Bengali' | 'Urdu';

export type SubjectCategory = 'Literacy' | 'Numeracy' | 'Science' | 'Humanities' | 'Tech' | 'Music' | 'Ethics' | 'Vocational' | 'Custom';

export type CurriculumEra = 'Modern' | 'Legacy' | 'Classical';

export type LearningMethod = 'Kumon-style' | 'Montessori-inspired' | 'Waldorf-aligned' | 'Traditional-Rote' | 'Inquiry-based' | 'Practical-Vocational';

export type LearningStyle = 'Unified' | 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic';

export type MasteryLevel = 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' 
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'Beyond P' | 'Beyond T';

export type EducationalStage = 'Preschool' | 'Primary' | 'Middle' | 'High' | 'University' | 'Transition';

export type ContributorRole = 'General' | 'Professional';

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

export interface TransitionProgram {
  id: string;
  targetAge: number;
  targetTypes: DistanceSchoolType[];
  yearsRemaining: number;
  enrolledDate: string;
}

export interface CreditRecord {
  subjectId: string;
  subjectName: string;
  level: MasteryLevel;
  creditsUS: number;
  creditsECTS: number;
  verificationId: string;
  completionDate: string;
}

export interface AccessibilitySettings {
  dyslexicFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  textScale: number; // 1 to 1.5
  screenReaderHints: boolean;
  iddSupport: boolean;
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
  };
}

export interface MediaItem {
  id: string;
  type: 'ebook' | 'blog' | 'podcast' | 'video' | 'song';
  title: string;
  isCompleted: boolean;
}

export interface TimelinePoint {
  title: string;
  detail: string;
  icon: string;
}

export interface PronunciationEntry {
  word: string;
  phonetic: string;
  guide: string;
}

export interface MultiModalAdaptation {
  visualMapDescription: string;
  auditoryScript: string;
  kinestheticActivity: string;
  readingDeepDive: string;
}

export interface LessonContent {
  title: string;
  subTopic?: string;
  explanation: string;
  pronunciationGuide?: PronunciationEntry[];
  timelinePoints?: TimelinePoint[];
  examples: string[];
  adaptations: MultiModalAdaptation;
  exercises: {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }[];
  level: MasteryLevel;
  lessonNumber: number;
  isExam?: boolean;
  isRelearn?: boolean;
  isTransition?: boolean;
  relearnStage?: EducationalStage;
  eraNote?: string;
  methodApplied?: LearningMethod | string;
  isHybrid?: boolean;
  hybridSubjects?: string[];
  groundingSources?: { title: string; uri: string }[];
  mediaResources?: MediaItem[];
}

export interface SubjectProgress {
  level: MasteryLevel;
  lessonNumber: number; // 1 to 12
  lastScore?: { correct: number; total: number; skillPoints?: number; gradeTier?: string };
  specializations?: string[];
  secondaryLanguage?: Language;
  currentTheme?: string;
  track?: EducationTrack;
  examPrepActive?: boolean;
  examPrepLesson?: number;
  completedExams?: string[];
  isFastTrack?: boolean;
  fastTrackDuration?: number; // In minutes
  relearnActive?: boolean;
  relearnStage?: EducationalStage;
  mediaProgress?: {
    completedEbooks: string[];
    completedBlogs: string[];
    completedPodcasts: string[];
    completedVideos: string[];
    completedSongs: string[];
  };
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
  | 'contributor' | 'grade-converter' | 'mastery-exam' | 'exam-prep' 
  | 'guardian-report' | 'accessibility' | 'lesson-combination' 
  | 'method-combination' | 'leaderboard' | 'track-selection'
  | 'curriculum-generator'
  | 'fast-track-hub'
  | 'certificate'
  | 'exam-hall'
  | 'relearn-hub'
  | 'transition-hub'
  | 'credit-transfer';

export interface ScheduledSession {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  time: string;
  duration: number; // minutes
}

export interface StudySchedule {
  time: string;
  duration: number;
}

export interface UserBadge {
  id: string;
  earnedDate: string;
}

export interface GuardianInfo {
  name?: string;
  email?: string;
  phone?: string;
  isLinked: boolean;
  lastReportSent?: string;
}

export interface ProfessionalCredentials {
  title: string;
  institution: string;
  degree: string;
  yearsOfExperience: number;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  certificateUploaded: boolean;
  certificateUri?: string;
}

export interface PaymentPreferences {
  withdrawalMethod: 'bank' | 'wallet';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  walletProvider?: string;
  walletNumber?: string;
}

export interface MasterySchedule {
  type: 'preset' | 'custom';
  presetId?: 'M-F' | 'M-S' | 'M-Sun';
  activeDays: number[]; // 0: Sun, 1: Mon, ..., 6: Sat
}

export interface User {
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  birthDate: string;
  age: number;
  isMinor: boolean;
  dailyGoal: number;
  timeSpentToday: number;
  studyHistory: Record<string, number>; // YYYY-MM-DD: minutes
  contributions: number;
  streak: number;
  xp: number;
  level: number;
  rank: string;
  badges: UserBadge[];
  points: number;
  contributorRole?: ContributorRole;
  professionalCredentials?: ProfessionalCredentials;
  weeklyStipend?: number;
  paymentPreferences?: PaymentPreferences;
  masterySchedule?: MasterySchedule;
  academicDNA?: {
    era: CurriculumEra;
    method: LearningMethod;
    hybridMethods?: [LearningMethod, LearningMethod];
  };
  guardian?: GuardianInfo;
  accessibility?: AccessibilitySettings;
  culturalBackground?: string;
  track?: EducationTrack;
  distanceSchoolType?: DistanceSchoolType;
  degreeDuration?: number;
  transitionProgram?: TransitionProgram;
  creditRecords?: CreditRecord[];
  studentNumber?: string;
  institutionName?: string;
  scheduledSessions?: ScheduledSession[];
}

export interface Certificate {
  subjectName: string;
  level: MasteryLevel | string;
  date: string;
  userName: string;
  subTopic?: string;
  equivalency?: string;
  verificationId: string;
  programType: 'regular' | 'fast-track' | 'relearn' | 'transition';
  score: number; // 0-100 (Skill Points)
  gradeDescription: string;
}
