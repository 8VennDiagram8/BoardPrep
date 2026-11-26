import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedCatalog } from '../data/seed'
import {
  addExamDate,
  addQuestions,
  clearAttempts,
  deleteExamDate,
  getAttempts,
  getCatalog,
  getExamDates,
  saveAttempt,
  type ExamDateInput,
} from '../lib/api'
import { readLocal, removeLocal, writeLocal } from '../lib/local'
import { DEFAULT_SETTINGS } from '../lib/types'
import type {
  Attempt,
  Catalog,
  ExamDate,
  Flashcard,
  Program,
  ProgramId,
  Question,
  StudySettings,
  Subject,
  Topic,
} from '../lib/types'
import { percent } from '../lib/utils'
import { useAuth } from './AuthContext'

function settingsKey(userId: string): string {
  return `settings:${userId}`
}

function loadSettings(userId: string): StudySettings {
  const scoped = readLocal<StudySettings | null>(settingsKey(userId), null)
  if (scoped) return scoped
  const legacy = readLocal<StudySettings | null>('settings', null)
  if (legacy) {
    writeLocal(settingsKey(userId), legacy)
    removeLocal('settings')
    return legacy
  }
  return DEFAULT_SETTINGS
}

export interface TopicMastery {
  answered: number
  correct: number
  accuracy: number
  attempts: number
  lastPracticed: string | null
}

export interface ProgramMastery {
  answered: number
  correct: number
  accuracy: number
  topicsTouched: number
  topicsTotal: number
  lastPracticed: string | null
}

interface AppContextValue {
  catalog: Catalog
  attempts: Attempt[]
  loadingAttempts: boolean
  examDates: ExamDate[]
  settings: StudySettings
  updateSettings: (patch: Partial<StudySettings>) => void
  recordAttempt: (attempt: Attempt) => Promise<void>
  clearProgress: () => Promise<void>
  addExamDate: (input: ExamDateInput) => Promise<ExamDate>
  removeExamDate: (id: string) => Promise<void>
  addQuestions: (questions: Question[]) => Promise<void>
  refreshCatalog: () => Promise<void>
  program: (id: ProgramId | string | undefined) => Program | undefined
  subject: (id: string | undefined) => Subject | undefined
  topic: (id: string | undefined) => Topic | undefined
  subjectsForProgram: (programId: ProgramId) => Subject[]
  topicsForSubject: (subjectId: string) => Topic[]
  questionsForTopic: (topicId: string) => Question[]
  questionsForProgram: (programId: ProgramId) => Question[]
  flashcardsForProgram: (programId: ProgramId) => Flashcard[]
  attemptsForProgram: (programId: ProgramId) => Attempt[]
  topicMastery: (topicId: string) => TopicMastery
  programMastery: (programId: ProgramId) => ProgramMastery
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'
  const [catalog, setCatalog] = useState<Catalog>(seedCatalog)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loadingAttempts, setLoadingAttempts] = useState(false)
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [settings, setSettings] = useState<StudySettings>(() => loadSettings(userId))
  const [settingsOwner, setSettingsOwner] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getCatalog(userId).then((next) => {
      if (active) setCatalog(next)
    })
    return () => {
      active = false
    }
  }, [userId])

  // Preferences are stored per account, not shared across the browser.
  useEffect(() => {
    setSettings(loadSettings(userId))
    setSettingsOwner(userId)
  }, [userId])

  useEffect(() => {
    if (settingsOwner !== userId) return
    writeLocal(settingsKey(userId), settings)
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings, settingsOwner, userId])

  useEffect(() => {
    if (userId === 'anonymous') {
      setAttempts([])
      return
    }
    let active = true
    setAttempts([])
    setLoadingAttempts(true)
    void getAttempts(userId).then((items) => {
      if (!active) return
      setAttempts(items)
      setLoadingAttempts(false)
    })
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    let active = true
    void getExamDates(userId).then((items) => {
      if (active) setExamDates(items)
    })
    return () => {
      active = false
    }
  }, [userId])

  const updateSettings = useCallback((patch: Partial<StudySettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const recordAttempt = useCallback(
    async (attempt: Attempt) => {
      const complete: Attempt = { ...attempt, userId }
      setAttempts((current) => [complete, ...current])
      await saveAttempt(complete)
    },
    [userId],
  )

  const clearProgress = useCallback(async () => {
    if (userId === 'anonymous') return
    await clearAttempts(userId)
    setAttempts([])
  }, [userId])

  const createExamDate = useCallback(
    async (input: ExamDateInput) => {
      const saved = await addExamDate(input, userId)
      setExamDates((current) =>
        [...current.filter((item) => item.id !== saved.id), saved].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      )
      return saved
    },
    [userId],
  )

  const removeExamDate = useCallback(
    async (id: string) => {
      await deleteExamDate(id, userId)
      setExamDates((current) => current.filter((item) => item.id !== id))
    },
    [userId],
  )

  const refreshCatalog = useCallback(async () => {
    setCatalog(await getCatalog(userId))
  }, [userId])

  const addGeneratedQuestions = useCallback(
    async (questions: Question[]) => {
      await addQuestions(questions, userId)
      setCatalog((current) => {
        const ids = new Set(current.questions.map((question) => question.id))
        return {
          ...current,
          questions: [...current.questions, ...questions.filter((question) => !ids.has(question.id))],
        }
      })
    },
    [userId],
  )

  const value = useMemo<AppContextValue>(() => {
    const program = (id: ProgramId | string | undefined) =>
      catalog.programs.find((item) => item.id === id)
    const subject = (id: string | undefined) =>
      catalog.subjects.find((item) => item.id === id)
    const topic = (id: string | undefined) => catalog.topics.find((item) => item.id === id)
    const subjectsForProgram = (programId: ProgramId) =>
      catalog.subjects.filter((item) => item.programId === programId)
    const topicsForSubject = (subjectId: string) =>
      catalog.topics.filter((item) => item.subjectId === subjectId)
    const questionsForTopic = (topicId: string) =>
      catalog.questions.filter((item) => item.topicId === topicId)
    const questionsForProgram = (programId: ProgramId) =>
      catalog.questions.filter((item) => item.programId === programId)
    const flashcardsForProgram = (programId: ProgramId) =>
      catalog.flashcards.filter((item) => item.programId === programId)
    const attemptsForProgram = (programId: ProgramId) =>
      attempts.filter((item) => item.programId === programId)

    const topicMastery = (topicId: string): TopicMastery => {
      let answered = 0
      let correct = 0
      let count = 0
      let lastPracticed: string | null = null
      for (const attempt of attempts) {
        const relevant = attempt.answers.filter((answer) => {
          const question = catalog.questions.find((item) => item.id === answer.questionId)
          return question?.topicId === topicId
        })
        if (relevant.length === 0) continue
        count += 1
        answered += relevant.length
        correct += relevant.filter((answer) => answer.correct).length
        if (!lastPracticed || attempt.completedAt > lastPracticed) {
          lastPracticed = attempt.completedAt
        }
      }
      return {
        answered,
        correct,
        accuracy: percent(correct, answered),
        attempts: count,
        lastPracticed,
      }
    }

    const programMastery = (programId: ProgramId): ProgramMastery => {
      const programAttempts = attemptsForProgram(programId)
      const answered = programAttempts.reduce((sum, item) => sum + item.answers.length, 0)
      const correct = programAttempts.reduce(
        (sum, item) => sum + item.answers.filter((answer) => answer.correct).length,
        0,
      )
      const touched = new Set<string>()
      for (const attempt of programAttempts) {
        for (const answer of attempt.answers) {
          const question = catalog.questions.find((item) => item.id === answer.questionId)
          if (question) touched.add(question.topicId)
        }
      }
      const topicsTotal = catalog.topics.filter((item) => item.programId === programId).length
      return {
        answered,
        correct,
        accuracy: percent(correct, answered),
        topicsTouched: touched.size,
        topicsTotal,
        lastPracticed: programAttempts[0]?.completedAt ?? null,
      }
    }

    return {
      catalog,
      attempts,
      loadingAttempts,
      examDates,
      settings,
      updateSettings,
      recordAttempt,
      clearProgress,
      addExamDate: createExamDate,
      removeExamDate,
      addQuestions: addGeneratedQuestions,
      refreshCatalog,
      program,
      subject,
      topic,
      subjectsForProgram,
      topicsForSubject,
      questionsForTopic,
      questionsForProgram,
      flashcardsForProgram,
      attemptsForProgram,
      topicMastery,
      programMastery,
    }
  }, [
    catalog,
    attempts,
    loadingAttempts,
    examDates,
    settings,
    updateSettings,
    recordAttempt,
    clearProgress,
    createExamDate,
    removeExamDate,
    addGeneratedQuestions,
    refreshCatalog,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
