import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import {
  extractQuestionsFromPdf,
  generateFlashcards,
  generateQuestions,
  sanitizeTopics,
  solveQuestion,
  type GenerateQuestionsInput,
} from './server/gemini.ts'
import type { ProgramId } from './src/lib/types.ts'

interface ImportBody extends Partial<GenerateQuestionsInput> {
  fileName?: string
  fileData?: string
}

async function readJson(req: any): Promise<Record<string, any>> {
  let raw = ''
  for await (const chunk of req) raw += chunk.toString()
  return raw ? JSON.parse(raw) : {}
}

function send(res: any, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to .env.local and restart the dev server.')
  }
  return key
}

/** Serves the same endpoints locally so `npm run dev` works without Vercel. */
function geminiApiPlugin() {
  return {
    name: 'boardprep-gemini-api',
    configureServer(server: any) {
      server.middlewares.use('/api/generate-questions', async (req: any, res: any) => {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
        try {
          const body = await readJson(req) as Partial<GenerateQuestionsInput>
          const questions = await generateQuestions(
            {
              programId: body.programId!,
              subjectId: body.subjectId!,
              topicId: body.topicId!,
              programName: body.programName ?? body.programId?.toUpperCase() ?? 'Board exam',
              subjectName: body.subjectName ?? body.subjectId ?? 'Subject',
              topicName: body.topicName ?? 'Topic',
              count: body.count ?? 5,
              difficulty: body.difficulty ?? 'mixed',
            },
            getApiKey(),
          )
          send(res, 200, { questions })
        } catch (error) {
          send(res, 400, { error: error instanceof Error ? error.message : 'Generation failed' })
        }
      })

      server.middlewares.use('/api/import-pdf', async (req: any, res: any) => {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
        try {
          const body = await readJson(req) as ImportBody
          if (!body.fileData) return send(res, 400, { error: 'A PDF file is required.' })
          if (body.fileData.length > 4_000_000) {
            return send(res, 413, { error: 'PDF is too large. Please use a file under 3 MB.' })
          }
          const questions = await extractQuestionsFromPdf(
            {
              programId: body.programId!,
              subjectId: body.subjectId!,
              topicId: body.topicId!,
              programName: body.programName ?? body.programId?.toUpperCase() ?? 'Board exam',
              subjectName: body.subjectName ?? body.subjectId ?? 'Subject',
              topicName: body.topicName ?? 'Topic',
              count: 0,
              difficulty: 'mixed',
              autoDetectTopic: body.autoDetectTopic ?? false,
              topics: sanitizeTopics(body.topics),
            },
            getApiKey(),
            body.fileData,
            body.fileName ?? 'document.pdf',
          )
          send(res, 200, { questions })
        } catch (error) {
          send(res, 400, { error: error instanceof Error ? error.message : 'PDF import failed' })
        }
      })

      server.middlewares.use('/api/generate-flashcards', async (req: any, res: any) => {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
        try {
          const body = await readJson(req) as {
            targets?: Array<{
              id?: string
              programId?: ProgramId
              subjectId?: string
              name?: string
              programName?: string
              subjectName?: string
            }>
            perTopic?: number
          }
          if (!body.targets?.length) return send(res, 400, { error: 'At least one topic is required.' })
          const cards = await generateFlashcards(
            {
              targets: body.targets.map((target) => ({
                id: target.id!,
                programId: target.programId!,
                subjectId: target.subjectId!,
                name: target.name ?? 'Topic',
                programName: target.programName ?? 'Board exam',
                subjectName: target.subjectName ?? 'Subject',
              })),
              perTopic: body.perTopic ?? 5,
            },
            getApiKey(),
          )
          send(res, 200, { flashcards: cards })
        } catch (error) {
          send(res, 400, { error: error instanceof Error ? error.message : 'Flashcard generation failed' })
        }
      })

      server.middlewares.use('/api/solve-question', async (req: any, res: any) => {
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
        try {
          const body = await readJson(req) as {
            prompt?: string
            options?: string[]
            programName?: string
            subjectName?: string
            topicName?: string
          }
          if (!body.prompt?.trim() || !Array.isArray(body.options) || body.options.length < 2) {
            return send(res, 400, { error: 'A question and at least two options are required.' })
          }
          const solved = await solveQuestion(
            {
              prompt: body.prompt,
              options: body.options,
              programName: body.programName ?? 'Board exam',
              subjectName: body.subjectName ?? 'Subject',
              topicName: body.topicName ?? 'Topic',
            },
            getApiKey(),
          )
          send(res, 200, solved)
        } catch (error) {
          send(res, 400, { error: error instanceof Error ? error.message : 'Could not solve the question' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  }

  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
  }
})
