/**
 * Module-level job store. Generation/import loops live here rather than inside
 * page components, so switching tabs or routes never interrupts them.
 */
import { useSyncExternalStore } from 'react'
import { addQuestions } from './api'
import {
  importQuestionsFromPdf,
  requestGeneratedQuestions,
  type PdfImportRequest,
  type TopicCandidate,
} from './gemini'
import type { Difficulty, ProgramId, Question } from './types'

interface GenerateBatch {
  topicId: string
  questions: Question[]
}

interface GenerateJob {
  running: boolean
  saving: boolean
  progress: string
  batches: GenerateBatch[]
  error: string | null
  saved: boolean
}

interface PdfJob {
  running: boolean
  progress: string
  questions: Question[]
  savedCount: number
  finished: boolean
  cancelled: boolean
  error: string | null
}

interface JobState {
  generate: GenerateJob
  pdf: PdfJob
}

const initialGenerate: GenerateJob = {
  running: false,
  saving: false,
  progress: '',
  batches: [],
  error: null,
  saved: false,
}

const initialPdf: PdfJob = {
  running: false,
  progress: '',
  questions: [],
  savedCount: 0,
  finished: false,
  cancelled: false,
  error: null,
}

let state: JobState = {
  generate: { ...initialGenerate },
  pdf: { ...initialPdf },
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function patchGenerate(patch: Partial<GenerateJob>) {
  state = { ...state, generate: { ...state.generate, ...patch } }
  emit()
}

function patchPdf(patch: Partial<PdfJob>) {
  state = { ...state, pdf: { ...state.pdf, ...patch } }
  emit()
}

export function useJobs(): JobState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

async function retryOnDemand<T>(run: () => Promise<T>, signal?: AbortSignal, attempt = 0): Promise<T> {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
  try {
    return await run()
  } catch (cause) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    const message = cause instanceof Error ? cause.message : ''
    const transient = /high demand|overloaded|resource exhausted|rate limit|too many requests|429|503|try again later/i.test(message)
    if (attempt >= 2 || !transient) throw cause
    await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
    return retryOnDemand(run, signal, attempt + 1)
  }
}

/* -------------------------------------------------------------------------- */
/* AI generation                                                              */
/* -------------------------------------------------------------------------- */

export interface GenerateTarget {
  id: string
  programId: ProgramId
  subjectId: string
  name: string
  programName: string
  subjectName: string
}

export interface GenerateJobInput {
  targets: GenerateTarget[]
  perTopic: number
  difficulty: 'mixed' | Difficulty
}

let generateController: AbortController | null = null

export function startGenerateJob(input: GenerateJobInput): void {
  if (state.generate.running) return

  // Don't lose an unsaved preview if the user starts another run.
  if (state.generate.batches.length > 0 && !state.generate.saved) {
    void addQuestions(state.generate.batches.flatMap((batch) => batch.questions))
  }

  const controller = new AbortController()
  generateController = controller
  patchGenerate({ running: true, progress: '', batches: [], error: null, saved: false })

  void (async () => {
    const results: GenerateBatch[] = []
    const failures: string[] = []

    for (let index = 0; index < input.targets.length; index += 1) {
      if (controller.signal.aborted) break
      const target = input.targets[index]
      patchGenerate({ progress: `Generating ${target.name} — ${index + 1} of ${input.targets.length}` })

      try {
        const questions = await retryOnDemand(
          () => requestGeneratedQuestions({
            programId: target.programId,
            subjectId: target.subjectId,
            topicId: target.id,
            programName: target.programName,
            subjectName: target.subjectName,
            topicName: target.name,
            count: input.perTopic,
            difficulty: input.difficulty,
          }),
          controller.signal,
        )
        if (controller.signal.aborted) break
        if (questions.length > 0) {
          results.push({ topicId: target.id, questions })
          patchGenerate({ batches: [...results] })
        }
      } catch (cause) {
        if (controller.signal.aborted) break
        failures.push(`${target.name}: ${cause instanceof Error ? cause.message : 'failed'}`)
      }
    }

    patchGenerate({
      running: false,
      progress: '',
      batches: results,
      error: failures.length > 0 ? `${failures.length} topic(s) failed. ${failures[0]}` : null,
    })
    generateController = null
  })()
}

export function removeGenerateQuestion(topicId: string, questionId: string): void {
  patchGenerate({
    batches: state.generate.batches
      .map((batch) =>
        batch.topicId === topicId
          ? { ...batch, questions: batch.questions.filter((question) => question.id !== questionId) }
          : batch,
      )
      .filter((batch) => batch.questions.length > 0),
  })
}

export function cancelGenerateJob(): void {
  generateController?.abort()
  patchGenerate({ running: false, progress: 'Cancelled.' })
}

export function resetGenerateJob(): void {
  generateController?.abort()
  patchGenerate({ ...initialGenerate })
}

export async function saveGenerateJob(): Promise<void> {
  const questions = state.generate.batches.flatMap((batch) => batch.questions)
  if (questions.length === 0) return
  patchGenerate({ saving: true })
  await addQuestions(questions)
  patchGenerate({ saving: false, saved: true, batches: [] })
}

/* -------------------------------------------------------------------------- */
/* PDF extraction                                                             */
/* -------------------------------------------------------------------------- */

export interface PdfJobInput {
  bytes: Uint8Array
  fileName: string
  pagesPerBatch: number
  baseRequest: Omit<PdfImportRequest, 'topicName' | 'fileName' | 'fileData'>
  topicName: string
  candidates: TopicCandidate[]
  existingPrompts: string[]
}

let pdfController: AbortController | null = null

function normalisePrompt(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function startPdfJob(input: PdfJobInput): void {
  if (state.pdf.running) return

  const controller = new AbortController()
  pdfController = controller
  patchPdf({
    running: true,
    progress: 'Reading PDF…',
    questions: [],
    savedCount: 0,
    finished: false,
    cancelled: false,
    error: null,
  })

  void (async () => {
    const collected: Question[] = []
    const seen = new Set(input.existingPrompts.map(normalisePrompt))
    const failures: string[] = []

    try {
      const { splitPdf, toBase64 } = await import('./pdf')
      const { chunks, pageCount } = await splitPdf(input.bytes, input.pagesPerBatch)

      for (let index = 0; index < chunks.length; index += 1) {
        if (controller.signal.aborted) break
        const start = index * input.pagesPerBatch + 1
        const end = Math.min(start + input.pagesPerBatch - 1, pageCount)
        patchPdf({ progress: `Pages ${start}–${end} of ${pageCount} · ${collected.length} saved so far` })

        try {
          const found = await retryOnDemand(
            () => importQuestionsFromPdf({
              ...input.baseRequest,
              topicName: input.topicName,
              fileName: `${input.fileName} (pages ${start}-${end})`,
              fileData: toBase64(chunks[index]),
            }, controller.signal),
            controller.signal,
          )
          if (controller.signal.aborted) break

          const fresh: Question[] = []
          for (const question of found) {
            const key = normalisePrompt(question.prompt)
            if (!key || seen.has(key)) continue
            seen.add(key)
            fresh.push(question)
            collected.push(question)
          }
          if (fresh.length > 0) {
            await addQuestions(fresh)
            patchPdf({ savedCount: collected.length, questions: [...collected] })
          }
        } catch (cause) {
          if (controller.signal.aborted) break
          failures.push(`pages ${start}–${end}: ${cause instanceof Error ? cause.message : 'failed'}`)
        }
      }

      if (!controller.signal.aborted) {
        patchPdf({
          finished: true,
          error:
            collected.length === 0
              ? 'No questions were found in this PDF. Try a smaller pages-per-batch value.'
              : failures.length > 0
                ? `${failures.length} batch(es) failed. ${failures[0]}`
                : null,
        })
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        patchPdf({ error: cause instanceof Error ? cause.message : 'Could not read the PDF.' })
      }
    } finally {
      patchPdf({ running: false, progress: '' })
      pdfController = null
    }
  })()
}

export function removePdfQuestion(questionId: string): void {
  patchPdf({ questions: state.pdf.questions.filter((question) => question.id !== questionId) })
}

export function cancelPdfJob(): void {
  pdfController?.abort()
  patchPdf({ cancelled: true, progress: 'Cancelling after the current batch…' })
}
