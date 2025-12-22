
export type Language = 
  | 'Indonesian' | 'English' | 'Traditional Chinese' | 'Simplified Chinese' 
  | 'Japanese' | 'Korean' | 'Arabic' | 'Spanish' | 'French' 
  | 'Portuguese' | 'Russian' | 'Hindi' | 'Bengali' | 'Urdu';

export type SubjectCategory = 'Literacy' | 'Numeracy' | 'Science' | 'Humanities' | 'Tech' | 'Music' | 'Ethics' | 'Vocational' | 'Custom';

export type CurriculumEra = 'Modern' | 'Legacy' | 'Classical';

export type LearningMethod = 'Kumon-style' | 'Montessori-inspired' | 'Waldorf-aligned' | 'Traditional-Rote' | 'Inquiry-based' | 'Practical-Vocational';

export type MasteryLevel = 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' 
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'Beyond P' | 'Beyond T';

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

export interface LessonContent {
  title: string;
  subTopic?: string;
  explanation: string;
  timelinePoints?: TimelinePoint[];
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
  isExam?: boolean;
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
  lastScore?: { correct: number; total: number; tenPointScale?: number; gradeTier?: string };
  specializations?: string[];
  secondaryLanguage?: Language;
  currentTheme?: string;
  track?: EducationTrack;
  examPrepActive?: boolean;
  examPrepLesson?: number;
  completedExams?: string[];
  isFastTrack?: boolean;
  fastTrackDuration?: number; // In minutes: 30, 60, 90, 120, 180
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
  | 'contributor' | 'grade-converter' | 'mastery-exam' | 'exam-prep' 
  | 'guardian-report' | 'accessibility' | 'lesson-combination' 
  | 'method-combination' | 'leaderboard' | 'track-selection'
  | 'curriculum-generator'
  | 'fast-track-hub'
  | 'certificate'
  | 'exam-hall';

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
  academicDNA?: {
    era: CurriculumEra;
    method: LearningMethod;
    hybridMethods?: [LearningMethod, LearningMethod];
  };
  guardian?: GuardianInfo;
  accessibility?: AccessibilitySettings;
  culturalBackground?: string;
  track?: EducationTrack;
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
  programType: 'regular' | 'fast-track';
  score: number; // 0-10
  gradeDescription: string;
}
