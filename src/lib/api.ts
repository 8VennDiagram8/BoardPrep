import { seedCatalog } from '../data/seed'
import { readLocal, writeLocal } from './local'
import { supabase } from './supabase'
import type {
  Attempt,
  Catalog,
  Flashcard,
  Program,
  Question,
  Subject,
  Topic,
} from './types'

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Loads programs, subjects, topics, questions and flashcards.
 * Supabase is preferred when configured; any failure falls back to the bundled
 * demo catalog so the reviewer is always usable — including offline.
 */
export async function getCatalog(): Promise<Catalog> {
  if (!supabase) return seedCatalog

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
      return seedCatalog
    }

    return {
      programs: (programs.data ?? []) as Program[],
      subjects: (subjects.data ?? []) as Subject[],
      topics: (topics.data ?? []) as Topic[],
      questions: (questions.data ?? []) as Question[],
      flashcards: (flashcards.data ?? []) as Flashcard[],
    }
  } catch {
    return seedCatalog
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
