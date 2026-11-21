import { generateQuestions, type GenerateQuestionsInput } from '../server/gemini.ts'

interface RequestLike {
  method?: string
  body?: (Partial<GenerateQuestionsInput> & { apiKey?: string }) | null
  headers?: Record<string, string | string[] | undefined>
}

interface ResponseLike {
  status: (code: number) => ResponseLike
  json: (body: unknown) => void
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body ?? {}
  const apiKey =
    process.env.GEMINI_API_KEY ??
    headerValue(req.headers?.['x-gemini-api-key']) ??
    body.apiKey

  if (!apiKey) {
    return res.status(400).json({
      error: 'No Gemini API key configured. Add GEMINI_API_KEY in Vercel or paste a key in the generator.',
    })
  }

  if (!body.programId || !body.subjectId || !body.topicId || !body.topicName) {
    return res.status(400).json({ error: 'Program, subject and topic are required.' })
  }

  try {
    const questions = await generateQuestions(
      {
        programId: body.programId,
        subjectId: body.subjectId,
        topicId: body.topicId,
        programName: body.programName ?? body.programId.toUpperCase(),
        subjectName: body.subjectName ?? body.subjectId,
        topicName: body.topicName,
        count: body.count ?? 5,
        difficulty: body.difficulty ?? 'mixed',
      },
      apiKey,
    )
    return res.status(200).json({ questions })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Question generation failed.'
    const status = /api key|401|403|invalid key/i.test(message) ? 401 : 502
    return res.status(status).json({ error: message })
  }
}
