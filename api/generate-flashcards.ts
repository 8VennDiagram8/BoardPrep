import { generateFlashcards, type FlashcardGenerateInput } from '../server/gemini.ts'

interface RequestLike {
  method?: string
  body?: FlashcardGenerateInput | null
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

  const body = req.body
  if (!body?.targets?.length) {
    return res.status(400).json({ error: 'At least one topic is required.' })
  }

  try {
    const cards = await generateFlashcards(body, apiKey)
    return res.status(200).json({ flashcards: cards })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Flashcard generation failed.'
    const status = /api key|401|403|invalid key/i.test(message) ? 401 : 502
    return res.status(status).json({ error: message })
  }
}
