/** Core domain types shared by the UI, the demo data layer and Supabase. */

export type ProgramId = 'ecele' | 'ectle'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Program {
  id: ProgramId
  code: string
  name: string
  shortName: string
  description: string
  /** Tailwind-compatible accent colour key used for cards and charts. */
  accent: 'indigo' | 'cyan'
  /** Emoji glyph used as a lightweight, dependency-free icon. */
  glyph: string
}

export interface Subject {
  id: string
  programId: ProgramId
  name: string
  code: string
  description: string
  glyph: string
}

export interface Topic {
  id: string
  subjectId: string
  programId: ProgramId
  name: string
  description: string
}

export interface Question {
  id: string
  programId: ProgramId
  subjectId: string
  topicId: string
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
  difficulty: Difficulty
  /** Bundled questions use "seed"; AI-generated questions use "generated". */
  source?: 'seed' | 'generated'
  generatedAt?: string
}

export interface Flashcard {
  id: string
  programId: ProgramId
  subjectId: string
  topicId: string
  front: string
  back: string
}

export interface Catalog {
  programs: Program[]
  subjects: Subject[]
  topics: Topic[]
  questions: Question[]
  flashcards: Flashcard[]
}

export interface AnswerRecord {
  questionId: string
  selectedIndex: number | null
  correct: boolean
  flagged: boolean
  /** Seconds spent on this question, used for the review breakdown. */
  timeSeconds: number
}

export type AttemptMode = 'practice' | 'mock'

export interface Attempt {
  id: string
  userId: string
  programId: ProgramId
  mode: AttemptMode
  topicId: string | null
  subjectId: string | null
  startedAt: string
  completedAt: string
  durationSeconds: number
  score: number
  total: number
  answers: AnswerRecord[]
}

export interface UserProfile {
  id: string
  email: string
  name: string
  isGuest: boolean
}

export interface StudySettings {
  instantFeedback: boolean
  examMinutes: number
  theme: 'light' | 'dark'
}

export const DEFAULT_SETTINGS: StudySettings = {
  instantFeedback: true,
  examMinutes: 30,
  theme: 'light',
}
