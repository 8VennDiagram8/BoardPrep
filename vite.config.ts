import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { generateQuestions, type GenerateQuestionsInput } from './server/gemini.ts'

/** Serves the same generation endpoint locally so `npm run dev` works without Vercel. */
function geminiApiPlugin() {
  return {
    name: 'boardprep-gemini-api',
    configureServer(server: any) {
      server.middlewares.use('/api/generate-questions', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          let raw = ''
          for await (const chunk of req) raw += chunk.toString()
          const body = (raw ? JSON.parse(raw) : {}) as Partial<GenerateQuestionsInput>

          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured on the server. Add it to .env.local and restart the dev server.')
          }

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
            apiKey,
          )

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ questions }))
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Generation failed' }))
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
