import { generateQuestions, type GenerateQuestionsInput } from '../server/gemini.ts'

type GenerateBody = Partial<GenerateQuestionsInput>

interface RequestLike {
  method?: string
  body?: GenerateBody | null
}

interface ResponseLike {
  status: (code: number) => ResponseLike
  json: (body: unknown) => void
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Add it to your environment variables.',
    })
  }

  const body = req.body ?? {}
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
