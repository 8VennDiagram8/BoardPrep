/**
 * Shared question-generation logic used by both the Vercel serverless function
 * and the Vite dev middleware. Kept free of framework types so it runs in both.
 *
 * Model: gemini-3.8-flash (Google AI Studio / Gemini API)
 */
import type { Difficulty, ProgramId, Question } from '../src/lib/types.ts'

export const GEMINI_MODEL = 'gemini-3.8-flash'

export interface GenerateQuestionsInput {
  programId: ProgramId
  subjectId: string
  topicId: string
  programName: string
  subjectName: string
  topicName: string
  count: number
  difficulty: 'mixed' | Difficulty
}

interface GeminiQuestion {
  prompt?: unknown
  options?: unknown
  answerIndex?: unknown
  explanation?: unknown
  difficulty?: unknown
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          prompt: { type: 'STRING' },
          options: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 4,
            maxItems: 4,
          },
          answerIndex: { type: 'INTEGER' },
          explanation: { type: 'STRING' },
          difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
        },
        required: ['prompt', 'options', 'answerIndex', 'explanation', 'difficulty'],
      },
    },
  },
  required: ['questions'],
}

function buildPrompt(input: GenerateQuestionsInput): string {
  const difficultyInstruction =
    input.difficulty === 'mixed'
      ? 'Use a natural mix of easy, medium and hard items, with most at medium difficulty.'
      : `Make every question ${input.difficulty} difficulty.`

  return [
    'You are an expert reviewer and item writer for Philippine engineering board exams.',
    '',
    `Write exactly ${input.count} original multiple-choice questions on the topic below.`,
    '',
    `Board / program: ${input.programName} (${input.programId.toUpperCase()})`,
    `Subject: ${input.subjectName}`,
    `Topic: ${input.topicName}`,
    '',
    'Requirements for every question:',
    '- Four plausible options, with exactly one unambiguously correct answer.',
    '- Present the correct option at a varied index; do not always put it in the same position.',
    '- Options must be similar in length and style; no "all of the above" or obvious giveaways.',
    '- Test real engineering understanding: use short calculations, standards, concepts or realistic scenarios where appropriate.',
    '- Provide a concise solution/explanation that shows the reasoning, formula or principle behind the correct answer.',
    '- Do not repeat questions from other topics and do not number the questions yourself.',
    `- ${difficultyInstruction}`,
    '',
    'Return ONLY a JSON object matching the provided response schema.',
  ].join('\n')
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1] : trimmed
}

function normaliseDifficulty(value: unknown): Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard' ? value : 'medium'
}

function toQuestion(item: GeminiQuestion, input: GenerateQuestionsInput): Question | null {
  const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : ''
  const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : ''
  const options = Array.isArray(item.options)
    ? item.options.filter((option): option is string => typeof option === 'string').map((option) => option.trim())
    : []
  const answerIndex = typeof item.answerIndex === 'number' ? Math.floor(item.answerIndex) : -1

  if (!prompt || !explanation || options.length !== 4 || options.some((option) => !option)) return null
  if (answerIndex < 0 || answerIndex > 3) return null

  return {
    id: `gen-${input.topicId}-${crypto.randomUUID()}`,
    programId: input.programId,
    subjectId: input.subjectId,
    topicId: input.topicId,
    prompt,
    options,
    answerIndex,
    explanation,
    difficulty: normaliseDifficulty(item.difficulty),
    source: 'generated',
    generatedAt: new Date().toISOString(),
  }
}

/** Calls Gemini 3.8 Flash and returns validated, storage-ready questions. */
export async function generateQuestions(
  input: GenerateQuestionsInput,
  apiKey: string,
): Promise<Question[]> {
  const count = Math.min(20, Math.max(1, Math.floor(Number(input.count) || 5)))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt({ ...input, count }) }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          thinkingConfig: { thinkingLevel: 'LOW' },
          maxOutputTokens: 16384,
        },
      }),
      signal: AbortSignal.timeout(90_000),
    },
  )

  const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    const message =
      (raw.error as { message?: string } | undefined)?.message ??
      `Gemini API returned HTTP ${response.status}.`
    throw new Error(message)
  }

  const candidates = raw.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
  const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
  if (!text) throw new Error('Gemini returned an empty response. Please try again.')

  let parsed: { questions?: GeminiQuestion[] }
  try {
    parsed = JSON.parse(stripCodeFence(text)) as { questions?: GeminiQuestion[] }
  } catch {
    throw new Error('Gemini returned a response that could not be parsed. Please try again.')
  }

  const items = Array.isArray(parsed.questions) ? parsed.questions : []
  const questions = items
    .map((item) => toQuestion(item, input))
    .filter((item): item is Question => item !== null)
    .slice(0, count)

  if (questions.length === 0) {
    throw new Error('No valid questions were generated. Please try again.')
  }
  return questions
}
