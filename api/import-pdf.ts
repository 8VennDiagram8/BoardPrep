import { extractQuestionsFromPdf, type GenerateQuestionsInput } from '../server/gemini.ts'

interface ImportBody extends Partial<GenerateQuestionsInput> {
  fileName?: string
  fileData?: string
}

interface RequestLike {
  method?: string
  body?: ImportBody | null
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
  if (!body.programId || !body.subjectId || !body.topicId || !body.fileData) {
    return res.status(400).json({ error: 'A topic and a PDF file are required.' })
  }

  // Vercel limits request bodies to 4.5 MB; base64 adds ~33%.
  if (body.fileData.length > 4_000_000) {
    return res.status(413).json({ error: 'PDF is too large. Please use a file under 3 MB.' })
  }

  try {
    const questions = await extractQuestionsFromPdf(
      {
        programId: body.programId,
        subjectId: body.subjectId,
        topicId: body.topicId,
        programName: body.programName ?? body.programId.toUpperCase(),
        subjectName: body.subjectName ?? body.subjectId,
        topicName: body.topicName ?? 'Topic',
        count: 0,
        difficulty: body.difficulty ?? 'mixed',
      },
      apiKey,
      body.fileData,
      body.fileName ?? 'document.pdf',
    )
    return res.status(200).json({ questions })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PDF import failed.'
    const status = /api key|401|403|invalid key/i.test(message) ? 401 : 502
    return res.status(status).json({ error: message })
  }
}
