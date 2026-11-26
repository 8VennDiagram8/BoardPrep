import { solveQuestion, type SolveQuestionInput } from '../server/gemini.ts'

interface RequestLike {
  method?: string
  body?: (Partial<SolveQuestionInput> & { programName?: string }) | null
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
  if (!body.prompt?.trim() || !Array.isArray(body.options) || body.options.length < 2) {
    return res.status(400).json({ error: 'A question and at least two options are required.' })
  }

  try {
    const solved = await solveQuestion(
      {
        prompt: body.prompt,
        options: body.options,
        programName: body.programName ?? 'Board exam',
        subjectName: body.subjectName ?? 'Subject',
        topicName: body.topicName ?? 'Topic',
      },
      apiKey,
    )
    return res.status(200).json(solved)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not solve the question.'
    const status = /api key|401|403|invalid key/i.test(message) ? 401 : 502
    return res.status(status).json({ error: message })
  }
}
