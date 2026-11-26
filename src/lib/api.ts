import { seedCatalog } from '../data/seed'
import { createId, readLocal, removeLocal, writeLocal } from './local'
import { supabase } from './supabase'
import type {
  Attempt,
  Catalog,
  ExamDate,
  Flashcard,
  Program,
  ProgramId,
  Question,
  Subject,
  Topic,
} from './types'

type DbRow = Record<string, any>

/** Supabase columns are snake_case; the app models are camelCase. */
function mapProgram(row: DbRow): Program {
  return {
    id: row.id as ProgramId,
    code: row.code ?? '',
    name: row.name ?? '',
    shortName: row.short_name ?? '',
    description: row.description ?? '',
    accent: row.accent === 'cyan' ? 'cyan' : 'indigo',
    glyph: row.glyph ?? '📘',
  }
}

function mapSubject(row: DbRow): Subject {
  return {
    id: row.id,
    programId: row.program_id as ProgramId,
    name: row.name ?? '',
    code: row.code ?? '',
    description: row.description ?? '',
    glyph: row.glyph ?? '📗',
  }
}

function mapTopic(row: DbRow): Topic {
  return {
    id: row.id,
    subjectId: row.subject_id ?? '',
    programId: row.program_id as ProgramId,
    name: row.name ?? '',
    description: row.description ?? '',
  }
}

function mapQuestion(row: DbRow): Question {
  return {
    id: row.id,
    programId: row.program_id as ProgramId,
    subjectId: row.subject_id ?? '',
    topicId: row.topic_id ?? '',
    prompt: row.prompt ?? '',
    options: Array.isArray(row.options) ? row.options : [],
    answerIndex: Number(row.answer_index ?? 0),
    explanation: row.explanation ?? '',
    difficulty: row.difficulty === 'easy' || row.difficulty === 'hard' ? row.difficulty : 'medium',
    source: row.source === 'generated' || row.source === 'manual' ? row.source : 'seed',
    generatedAt: row.generated_at ?? undefined,
    userId: row.user_id ?? undefined,
  }
}

function mapFlashcard(row: DbRow): Flashcard {
  return {
    id: row.id,
    programId: row.program_id as ProgramId,
    subjectId: row.subject_id ?? '',
    topicId: row.topic_id ?? '',
    front: row.front ?? '',
    back: row.back ?? '',
    source: row.source === 'generated' || row.source === 'manual' ? row.source : 'seed',
    generatedAt: row.generated_at ?? undefined,
    userId: row.user_id ?? undefined,
  }
}

function customQuestionsKey(userId: string): string {
  return `custom-questions:${userId}`
}

function customFlashcardsKey(userId: string): string {
  return `custom-flashcards:${userId}`
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

/** Flashcards generated/typed by one account and kept in that browser. */
export function getLocalFlashcards(userId: string): Flashcard[] {
  return readLocal<Flashcard[]>(customFlashcardsKey(userId), [])
}

/** Questions generated/typed by one account and kept in that browser. */
export function getLocalQuestions(userId: string): Question[] {
  const scoped = readLocal<Question[] | null>(customQuestionsKey(userId), null)
  if (scoped) return scoped
  // One-time migration from the old account-agnostic key.
  const legacy = readLocal<Question[] | null>('custom-questions', null)
  if (legacy?.length) {
    writeLocal(customQuestionsKey(userId), legacy)
    removeLocal('custom-questions')
    return legacy
  }
  return []
}

function withLocalContent(catalog: Catalog, userId: string): Catalog {
  const customQuestions = getLocalQuestions(userId)
  const customFlashcards = getLocalFlashcards(userId)
  const questionIds = new Set(catalog.questions.map((question) => question.id))
  const flashcardIds = new Set(catalog.flashcards.map((card) => card.id))
  return {
    ...catalog,
    questions: [
      ...catalog.questions,
      ...customQuestions.filter((question) => !questionIds.has(question.id)),
    ],
    flashcards: [
      ...catalog.flashcards,
      ...customFlashcards.filter((card) => !flashcardIds.has(card.id)),
    ],
  }
}

/**
 * Loads programs, subjects, topics, questions and flashcards.
 * Supabase is preferred when configured; any failure falls back to the bundled
 * demo catalog so the reviewer is always usable — including offline.
 */
export async function getCatalog(userId: string): Promise<Catalog> {
  if (!supabase) return withLocalContent(seedCatalog, userId)

  try {
    const [programs, subjects, topics, questions, flashcards] = await Promise.all([
      supabase.from('programs').select('*'),
      supabase.from('subjects').select('*'),
      supabase.from('topics').select('*'),
      supabase.from('questions').select('*'),
      supabase.from('flashcards').select('*'),
    ])

    const results = [programs, subjects, topics, questions, flashcards]
    if (results.some((result) => result.error) || !programs.data?.length) {
      return withLocalContent(seedCatalog, userId)
    }

    return withLocalContent({
      programs: (programs.data ?? []).map(mapProgram),
      subjects: (subjects.data ?? []).map(mapSubject),
      topics: (topics.data ?? []).map(mapTopic),
      questions: (questions.data ?? []).map(mapQuestion),
      flashcards: (flashcards.data ?? []).map(mapFlashcard),
    }, userId)
  } catch {
    return withLocalContent(seedCatalog, userId)
  }
}

/** Persists one account's questions locally and, when available, to Supabase. */
export async function addQuestions(questions: Question[], userId: string): Promise<void> {
  if (questions.length === 0) return

  const existing = getLocalQuestions(userId)
  const ids = new Set(existing.map((question) => question.id))
  writeLocal(
    customQuestionsKey(userId),
    [...existing, ...questions.filter((question) => !ids.has(question.id))].slice(0, 2000),
  )

  if (!supabase) return
  try {
    await supabase.from('questions').upsert(
      questions.map((question) => ({
        id: question.id,
        program_id: question.programId,
        subject_id: question.subjectId,
        topic_id: question.topicId,
        prompt: question.prompt,
        options: question.options,
        answer_index: question.answerIndex,
        explanation: question.explanation,
        difficulty: question.difficulty,
        source: question.source ?? 'generated',
        generated_at: question.generatedAt ?? null,
        user_id: userId,
      })),
    )
  } catch {
    /* Local copy is already saved. */
  }
}

/** Persists one account's flashcards locally and, when available, to Supabase. */
export async function addFlashcards(cards: Flashcard[], userId: string): Promise<void> {
  if (cards.length === 0) return

  const existing = getLocalFlashcards(userId)
  const ids = new Set(existing.map((card) => card.id))
  writeLocal(
    customFlashcardsKey(userId),
    [...existing, ...cards.filter((card) => !ids.has(card.id))].slice(0, 4000),
  )

  if (!supabase) return
  try {
    await supabase.from('flashcards').upsert(
      cards.map((card) => ({
        id: card.id,
        program_id: card.programId,
        subject_id: card.subjectId,
        topic_id: card.topicId,
        front: card.front,
        back: card.back,
        source: card.source ?? 'generated',
        generated_at: card.generatedAt ?? null,
        user_id: userId,
      })),
    )
  } catch {
    /* Local copy is already saved. */
  }
}

/* -------------------------------------------------------------------------- */
/* Attempts                                                                   */
/* -------------------------------------------------------------------------- */

function attemptsKey(userId: string): string {
  return `attempts:${userId}`
}

export async function getAttempts(userId: string): Promise<Attempt[]> {
  if (!supabase) return readLocal<Attempt[]>(attemptsKey(userId), [])

  try {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error || !data) return readLocal<Attempt[]>(attemptsKey(userId), [])

    return data.map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      programId: row.program_id as Attempt['programId'],
      mode: row.mode as Attempt['mode'],
      topicId: (row.topic_id as string | null) ?? null,
      subjectId: (row.subject_id as string | null) ?? null,
      startedAt: row.started_at as string,
      completedAt: row.completed_at as string,
      durationSeconds: Number(row.duration_seconds ?? 0),
      score: Number(row.score ?? 0),
      total: Number(row.total ?? 0),
      answers: (row.answers ?? []) as Attempt['answers'],
    }))
  } catch {
    return readLocal<Attempt[]>(attemptsKey(userId), [])
  }
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  // Keep a local copy as well so progress survives a failed sync or offline use.
  const key = attemptsKey(attempt.userId)
  const existing = readLocal<Attempt[]>(key, [])
  writeLocal(key, [attempt, ...existing].slice(0, 200))

  if (!supabase) return

  try {
    await supabase.from('attempts').upsert({
      id: attempt.id,
      user_id: attempt.userId,
      program_id: attempt.programId,
      mode: attempt.mode,
      topic_id: attempt.topicId,
      subject_id: attempt.subjectId,
      started_at: attempt.startedAt,
      completed_at: attempt.completedAt,
      duration_seconds: attempt.durationSeconds,
      score: attempt.score,
      total: attempt.total,
      answers: attempt.answers,
    })
  } catch {
    /* Local copy is already persisted. */
  }
}

export async function clearAttempts(userId: string): Promise<void> {
  writeLocal(attemptsKey(userId), [])
  if (!supabase) return
  try {
    await supabase.from('attempts').delete().eq('user_id', userId)
  } catch {
    /* no-op */
  }
}

/* -------------------------------------------------------------------------- */
/* Board exam dates                                                           */
/* -------------------------------------------------------------------------- */

function examDatesKey(userId: string): string {
  return `exam-dates:${userId}`
}

function localExamDates(userId: string): ExamDate[] {
  return readLocal<ExamDate[]>(examDatesKey(userId), [])
}

function saveLocalExamDates(userId: string, dates: ExamDate[]): void {
  writeLocal(examDatesKey(userId), dates)
}

function mapExamDate(row: DbRow): ExamDate {
  return {
    id: row.id as string,
    programId: row.program_id as ProgramId,
    label: row.label ?? '',
    date: row.exam_at as string,
    createdAt: row.created_at as string,
  }
}

export async function getExamDates(userId: string): Promise<ExamDate[]> {
  const local = localExamDates(userId)
  if (!supabase) return local

  try {
    const { data, error } = await supabase
      .from('exam_dates')
      .select('*')
      .eq('user_id', userId)
      .order('exam_at', { ascending: true })
    if (error || !data) return local
    return data.map(mapExamDate)
  } catch {
    return local
  }
}

export interface ExamDateInput {
  programId: ProgramId
  label: string
  date: string
}

export async function addExamDate(input: ExamDateInput, userId: string): Promise<ExamDate> {
  const examDate: ExamDate = {
    id: createId(),
    programId: input.programId,
    label: input.label.trim(),
    date: new Date(input.date).toISOString(),
    createdAt: new Date().toISOString(),
  }
  saveLocalExamDates(userId, [...localExamDates(userId), examDate])

  if (supabase) {
    try {
      await supabase.from('exam_dates').insert({
        id: examDate.id,
        user_id: userId,
        program_id: examDate.programId,
        label: examDate.label,
        exam_at: examDate.date,
        created_at: examDate.createdAt,
      })
    } catch {
      /* Local copy is already saved. */
    }
  }
  return examDate
}

export async function deleteExamDate(id: string, userId: string): Promise<void> {
  saveLocalExamDates(userId, localExamDates(userId).filter((item) => item.id !== id))
  if (!supabase) return
  try {
    await supabase.from('exam_dates').delete().eq('id', id).eq('user_id', userId)
  } catch {
    /* no-op */
  }
}
