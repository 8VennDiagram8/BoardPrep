import type { Difficulty, ProgramId, Question } from './types'

export interface GenerateRequest {
  programId: ProgramId
  subjectId: string
  topicId: string
  programName: string
  subjectName: string
  topicName: string
  count: number
  difficulty: 'mixed' | Difficulty
}

export const GEMINI_MODEL = 'gemini-3.6-flash'

/** Calls BoardPrep's own API route; the Gemini key stays on the server. */
export async function requestGeneratedQuestions(request: GenerateRequest): Promise<Question[]> {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data = (await response.json().catch(() => ({}))) as {
    questions?: Question[]
    error?: string
  }

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}.`)
  }
  return data.questions ?? []
}

export interface TopicCandidate {
  id: string
  name: string
  subjectId: string
  subjectName: string
}

export interface PdfImportRequest extends GenerateRequest {
  fileName: string
  /** Base64-encoded PDF bytes, without the data-URL prefix. */
  fileData: string
  autoDetectTopic?: boolean
  topics?: TopicCandidate[]
}

export async function importQuestionsFromPdf(
  request: PdfImportRequest,
  signal?: AbortSignal,
): Promise<Question[]> {
  const response = await fetch('/api/import-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })

  const data = (await response.json().catch(() => ({}))) as {
    questions?: Question[]
    error?: string
  }

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}.`)
  }
  return data.questions ?? []
}
