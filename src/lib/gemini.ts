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

export const GEMINI_MODEL = 'gemini-3.8-flash'

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
