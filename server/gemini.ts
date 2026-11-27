/**
 * Shared question-generation logic used by both the Vercel serverless functions
 * and the Vite dev middleware. Kept free of framework types so it runs in both.
 *
 * Model: gemini-3.6-flash (Google AI Studio / Gemini API)
 */
import type { Difficulty, Flashcard, ProgramId, Question } from '../src/lib/types.ts'

export const GEMINI_MODEL = 'gemini-3.6-flash'

export interface TopicCandidate {
  id: string
  name: string
  subjectId: string
  subjectName: string
}

export interface GenerateQuestionsInput {
  programId: ProgramId
  subjectId: string
  topicId: string
  programName: string
  subjectName: string
  topicName: string
  count: number
  difficulty: 'mixed' | Difficulty
  /** When importing a mixed PDF, let Gemini pick the topic per question. */
  autoDetectTopic?: boolean
  topics?: TopicCandidate[]
}

interface GeminiQuestion {
  prompt?: unknown
  options?: unknown
  answerIndex?: unknown
  explanation?: unknown
  difficulty?: unknown
  topicId?: unknown
}

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }

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
          topicId: { type: 'STRING' },
        },
        required: ['prompt', 'options', 'answerIndex', 'explanation', 'difficulty'],
      },
    },
  },
  required: ['questions'],
}

/**
 * Shared persona and domain grounding. Keeps generated content tied to the
 * actual PRC board exam instead of drifting into generic textbook material.
 */
function examinerGuidance(
  programId: ProgramId,
  programName: string,
  subjectName: string,
  topicName: string,
): string[] {
  const discipline =
    programId === 'ecele'
      ? 'Electronics and Communications Engineering (ECE)'
      : 'Electronics Technician (ET) practice'
  const subject = subjectName.toLowerCase()

  const lines = [
    'You are a Philippine PRC board examiner writing material for this specific licensure exam. Think like an examiner who sets the actual board exam — not a generic textbook author.',
    `Exam: ${programName} (${programId.toUpperCase()}) — ${discipline}.`,
    `Subject: ${subjectName}. Topic: ${topicName}.`,
    'Every item must be relevant to this exam and this discipline. Never write questions from unrelated fields or with no connection to the profession.',
  ]

  if (subject.includes('math')) {
    lines.push(
      'This is a mathematics subject, but frame every problem in an electronics/electrical engineering setting: circuits, signals, electromagnetics, communications, semiconductor devices or control systems.',
      'Use board-exam-style advanced engineering mathematics — differential equations, Laplace and Fourier transforms, complex variables, vector calculus and engineering data analysis — applied to ECE/ET problems.',
      'Example: instead of a bare "solve dy/dx + 2y = 0", ask about the natural response of an RC circuit or a damped system governed by that equation.',
    )
  } else if (programId === 'ectle') {
    lines.push(
      'Keep everything at the Electronics Technician level: practical equipment, components, test instruments, maintenance and repair, and the Philippine Electronics Code, Philippine Electrical Code and RA 9292.',
    )
  } else {
    lines.push(
      'Ground content in ECE practice: electronic devices and circuits, electromagnetics, communications, digital logic, microcontrollers, feedback control, and economics/ethics as applied to the profession.',
    )
  }

  if (subject.includes('general') || subject.includes('geas')) {
    lines.push(
      'For GEAS-style subjects, tie chemistry, physics, engineering economics, management and ethics questions to electronics engineering workplace situations and professional practice.',
    )
  }

  return lines
}

function buildPrompt(input: GenerateQuestionsInput): string {
  const difficultyInstruction =
    input.difficulty === 'mixed'
      ? 'Use a natural mix of easy, medium and hard items, with most at medium difficulty.'
      : `Make every question ${input.difficulty} difficulty.`

  return [
    ...examinerGuidance(input.programId, input.programName, input.subjectName, input.topicName),
    '',
    `Write exactly ${input.count} original multiple-choice questions on the topic below.`,
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

function buildExtractPrompt(input: GenerateQuestionsInput, fileName: string): string {
  const candidates = (input.topics ?? []).slice(0, 100)
  const classifyInstruction = input.autoDetectTopic && candidates.length > 0
    ? [
        '',
        'The PDF questions may be in random order and cover different topics. For EACH question, choose exactly one topicId from this list:',
        ...candidates.map((item) => `- ${item.id} = ${item.name} (subject: ${item.subjectName})`),
        '',
        'Use the topicId field for your choice. Pick the single best match based on what the question actually tests — do not put every question in the same topic.',
      ]
    : ['', `Topic for all questions: ${input.topicName}`]

  return [
    ...examinerGuidance(input.programId, input.programName, input.subjectName, input.topicName),
    '',
    'You are extracting questions from a PDF for this board exam. Preserve the source wording, but classify and tag everything against the exam above — never against an unrelated discipline.',
    '',
    `Source file: ${fileName}`,
    ...classifyInstruction,
    '',
    'Requirements:',
    '- Extract EVERY distinct multiple-choice question present in the PDF, including any that appear in a separate answer-key section.',
    '- Each question must have exactly four options and exactly one correct answer.',
    '- Determine the correct answer from the PDF answer key when one is provided; otherwise work the problem out yourself.',
    '- If the PDF includes a rationale or solution, include it. Otherwise write a concise solution showing the key reasoning or formula.',
    '- Ignore headers, page numbers, instructions, tables of contents and answer-key lines that are not actual questions.',
    '- Keep the original wording as closely as possible; do not invent questions that are not in the document.',
    '- Set difficulty to easy, medium or hard based on the question.',
    '- Return at most 100 questions from this portion of the PDF.',
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

function toQuestion(
  item: GeminiQuestion,
  input: GenerateQuestionsInput,
  candidates: TopicCandidate[] = [],
  fallbackTopicId = input.topicId,
): Question | null {
  const prompt = typeof item.prompt === 'string' ? item.prompt.trim() : ''
  const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : ''
  const options = Array.isArray(item.options)
    ? item.options.filter((option): option is string => typeof option === 'string').map((option) => option.trim())
    : []
  const answerIndex = typeof item.answerIndex === 'number' ? Math.floor(item.answerIndex) : -1

  if (!prompt || !explanation || options.length !== 4 || options.some((option) => !option)) return null
  if (answerIndex < 0 || answerIndex > 3) return null

  const detected = typeof item.topicId === 'string' ? item.topicId.trim() : ''
  const chosen =
    candidates.find((candidate) => candidate.id === detected) ??
    candidates.find((candidate) => candidate.id === fallbackTopicId)
  const topicId = chosen?.id ?? fallbackTopicId
  const subjectId = chosen?.subjectId ?? input.subjectId

  return {
    id: `gen-${topicId}-${crypto.randomUUID()}`,
    programId: input.programId,
    subjectId,
    topicId,
    prompt,
    options,
    answerIndex,
    explanation,
    difficulty: normaliseDifficulty(item.difficulty),
    source: 'generated',
    generatedAt: new Date().toISOString(),
  }
}

async function callGemini(
  parts: GeminiPart[],
  apiKey: string,
  input: GenerateQuestionsInput,
  maxCount?: number,
): Promise<Question[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          thinkingConfig: { thinkingLevel: 'LOW' },
          maxOutputTokens: 32768,
        },
      }),
      signal: AbortSignal.timeout(120_000),
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

  const topicCandidates = input.autoDetectTopic ? (input.topics ?? []).slice(0, 100) : []
  const fallbackTopicId = input.topicId || topicCandidates[0]?.id || ''
  const items = Array.isArray(parsed.questions) ? parsed.questions : []
  const questions = items
    .map((item) => toQuestion(item, input, topicCandidates, fallbackTopicId))
    .filter((item): item is Question => item !== null)

  const limited = maxCount === undefined ? questions : questions.slice(0, maxCount)
  if (limited.length === 0) {
    throw new Error('No valid questions were found. Please try again.')
  }
  return limited
}

/** Keeps only usable topic candidates supplied by the client. */
export function sanitizeTopics(value: unknown): TopicCandidate[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.name === 'string' &&
      typeof item.subjectId === 'string' && typeof item.subjectName === 'string')
    .slice(0, 100)
    .map((item) => ({
      id: item.id as string,
      name: item.name as string,
      subjectId: item.subjectId as string,
      subjectName: item.subjectName as string,
    }))
}

/** Generates fresh questions from a topic description. */
export async function generateQuestions(
  input: GenerateQuestionsInput,
  apiKey: string,
): Promise<Question[]> {
  const count = Math.min(20, Math.max(1, Math.floor(Number(input.count) || 5)))
  return callGemini([{ text: buildPrompt({ ...input, count }) }], apiKey, input, count)
}

export interface FlashcardTarget {
  id: string
  programId: ProgramId
  subjectId: string
  name: string
  programName: string
  subjectName: string
}

export interface FlashcardGenerateInput {
  targets: FlashcardTarget[]
  perTopic: number
}

const flashcardSchema = {
  type: 'OBJECT',
  properties: {
    flashcards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          front: { type: 'STRING' },
          back: { type: 'STRING' },
        },
        required: ['front', 'back'],
      },
    },
  },
  required: ['flashcards'],
}

/** Creates purely conceptual flashcards, not calculation drills. */
export async function generateFlashcards(
  input: FlashcardGenerateInput,
  apiKey: string,
): Promise<Flashcard[]> {
  const instructions = input.targets.map((target, index) =>
    `${index + 1}. Program: ${target.programName}; Subject: ${target.subjectName}; Topic: ${target.name} (topicId: ${target.id}) — create ${input.perTopic} cards.`,
  )

  const guidance = [
    ...new Set(
      input.targets.flatMap((target) =>
        examinerGuidance(target.programId, target.programName, target.subjectName, target.name),
      ),
    ),
  ]

  const prompt = [
    ...guidance,
    '',
    'Think like that board examiner when choosing what is worth memorising for the exam.',
    '',
    'IMPORTANT: Cards must be purely CONCEPTUAL. Write concept-check questions and the concepts themselves as found in standard textbooks and review books. Never write numerical problems, calculations, or "solve for X" items. Do not ask the learner to compute anything.',
    'For a mathematics subject, ask conceptually how an engineering-math tool is used in electronics engineering — for example "What does a Laplace transform let an engineer analyze?" — never a computation.',
    '',
    'Good fronts: "What does the Nyquist sampling theorem state?", "What is the purpose of a Zener diode?", "Which principle explains why a conductor has low resistivity?"',
    'Good backs: one concise textbook concept, definition, rule, code provision or principle — with no numbers to calculate.',
    '',
    'Create cards for each of these topics:',
    ...instructions,
    '',
    'Set topicId to the exact topicId shown for each topic.',
    'Return ONLY a JSON object matching the response schema. No extra commentary.',
  ].join('\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: flashcardSchema,
          thinkingConfig: { thinkingLevel: 'LOW' },
          maxOutputTokens: 16384,
        },
      }),
      signal: AbortSignal.timeout(120_000),
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

  let parsed: { flashcards?: Array<{ front?: unknown; back?: unknown; topicId?: unknown }> }
  try {
    parsed = JSON.parse(stripCodeFence(text)) as typeof parsed
  } catch {
    throw new Error('Gemini returned a response that could not be parsed. Please try again.')
  }

  const cards: Flashcard[] = []
  for (const item of parsed.flashcards ?? []) {
    const front = typeof item.front === 'string' ? item.front.trim() : ''
    const back = typeof item.back === 'string' ? item.back.trim() : ''
    const requested = typeof item.topicId === 'string' ? item.topicId : ''
    const target = input.targets.find((candidate) => candidate.id === requested)
    const fallback = input.targets.find((candidate) =>
      cards.filter((card) => card.topicId === candidate.id).length < input.perTopic,
    ) ?? input.targets[0]
    const chosen = target ?? fallback
    if (!front || !back || !chosen) continue
    cards.push({
      id: `gen-card-${chosen.id}-${crypto.randomUUID()}`,
      programId: chosen.programId,
      subjectId: chosen.subjectId,
      topicId: chosen.id,
      front,
      back,
      source: 'generated',
      generatedAt: new Date().toISOString(),
    })
  }

  if (cards.length === 0) throw new Error('No valid flashcards were generated. Please try again.')
  return cards
}

/** Solves a manually entered multiple-choice question. */
export interface SolveQuestionInput {
  prompt: string
  options: string[]
  programId: ProgramId
  programName: string
  subjectName: string
  topicName: string
}

export interface SolvedQuestion {
  answerIndex: number
  explanation: string
  difficulty: Difficulty
}

const solveSchema = {
  type: 'OBJECT',
  properties: {
    answerIndex: { type: 'INTEGER' },
    explanation: { type: 'STRING' },
    difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
  },
  required: ['answerIndex', 'explanation', 'difficulty'],
}

export async function solveQuestion(
  input: SolveQuestionInput,
  apiKey: string,
): Promise<SolvedQuestion> {
  const prompt = [
    ...examinerGuidance(input.programId, input.programName, input.subjectName, input.topicName),
    '',
    'Determine the single correct answer to this multiple-choice question and write a concise solution from the perspective of that board examiner.',
    '',
    'Question:',
    input.prompt,
    '',
    'Options:',
    ...input.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`),
    '',
    'The answerIndex must be the zero-based index of the correct option. The explanation should show the reasoning, formula or principle that makes it correct.',
    'Return ONLY a JSON object matching the response schema.',
  ].join('\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: solveSchema,
          thinkingConfig: { thinkingLevel: 'LOW' },
          maxOutputTokens: 4096,
        },
      }),
      signal: AbortSignal.timeout(60_000),
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

  let parsed: { answerIndex?: unknown; explanation?: unknown; difficulty?: unknown }
  try {
    parsed = JSON.parse(stripCodeFence(text)) as typeof parsed
  } catch {
    throw new Error('Gemini returned a response that could not be parsed. Please try again.')
  }

  const answerIndex = typeof parsed.answerIndex === 'number' ? Math.floor(parsed.answerIndex) : -1
  const explanation = typeof parsed.explanation === 'string' ? parsed.explanation.trim() : ''
  if (answerIndex < 0 || answerIndex >= input.options.length || !explanation) {
    throw new Error('Gemini could not determine a valid answer. Please try again.')
  }

  return {
    answerIndex,
    explanation,
    difficulty: normaliseDifficulty(parsed.difficulty),
  }
}

/** Extracts questions and answers from a base64-encoded PDF. */
export async function extractQuestionsFromPdf(
  input: GenerateQuestionsInput,
  apiKey: string,
  pdfBase64: string,
  fileName: string,
): Promise<Question[]> {
  return callGemini(
    [
      { text: buildExtractPrompt(input, fileName) },
      { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
    ],
    apiKey,
    input,
  )
}
