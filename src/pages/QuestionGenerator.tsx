import {
  AlertCircle,
  ArrowRight,
  Check,
  Database,
  KeyRound,
  LoaderCircle,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { GEMINI_MODEL, requestGeneratedQuestions } from '../lib/gemini'
import { readLocal, writeLocal } from '../lib/local'
import type { Difficulty, ProgramId, Question, Topic } from '../lib/types'
import { cn } from '../lib/utils'

type Scope = 'topic' | 'subject' | 'program'

interface Batch {
  topic: Topic
  questions: Question[]
}

const API_KEY_STORAGE = 'gemini-api-key'

export function QuestionGenerator() {
  const { catalog, subjectsForProgram, topicsForSubject, addQuestions } = useApp()

  const [apiKey, setApiKey] = useState(() => readLocal<string>(API_KEY_STORAGE, ''))
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [scope, setScope] = useState<Scope>('topic')
  const [difficulty, setDifficulty] = useState<'mixed' | Difficulty>('mixed')
  const [perTopic, setPerTopic] = useState(3)

  const [batches, setBatches] = useState<Batch[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const subjects = subjectsForProgram(programId)
  const subjectTopics = topicsForSubject(subjectId)

  const targets = useMemo(() => {
    if (scope === 'topic') return topicId ? catalog.topics.filter((item) => item.id === topicId) : []
    if (scope === 'subject') return subjectTopics
    return catalog.topics.filter((item) => item.programId === programId)
  }, [scope, topicId, subjectTopics, catalog.topics, programId])

  const generatedCount = (topicId: string) =>
    catalog.questions.filter((item) => item.topicId === topicId && item.source === 'generated').length

  const previewCount = batches.reduce((sum, batch) => sum + batch.questions.length, 0)

  function changeProgram(next: ProgramId) {
    setProgramId(next)
    const firstSubject = subjectsForProgram(next)[0]?.id ?? ''
    setSubjectId(firstSubject)
    setTopicId(topicsForSubject(firstSubject)[0]?.id ?? '')
    setBatches([])
    setSaved(false)
  }

  function changeSubject(next: string) {
    setSubjectId(next)
    setTopicId(topicsForSubject(next)[0]?.id ?? '')
    setBatches([])
    setSaved(false)
  }

  async function generate() {
    if (!apiKey.trim()) {
      setError('Paste a Gemini API key first, or set GEMINI_API_KEY in the environment.')
      return
    }
    if (targets.length === 0) {
      setError('Choose at least one topic to generate questions for.')
      return
    }

    writeLocal(API_KEY_STORAGE, apiKey.trim())
    setBusy(true)
    setError(null)
    setSaved(false)
    setBatches([])

    const results: Batch[] = []
    const failures: string[] = []

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index]
      setProgress(`Generating ${target.name} — ${index + 1} of ${targets.length}`)
      try {
        const questions = await requestGeneratedQuestions({
          programId: target.programId,
          subjectId: target.subjectId,
          topicId: target.id,
          programName: catalog.programs.find((item) => item.id === target.programId)?.name ?? target.programId,
          subjectName: catalog.subjects.find((item) => item.id === target.subjectId)?.name ?? target.subjectId,
          topicName: target.name,
          count: perTopic,
          difficulty,
        }, apiKey.trim())
        if (questions.length > 0) results.push({ topic: target, questions })
      } catch (cause) {
        failures.push(`${target.name}: ${cause instanceof Error ? cause.message : 'failed'}`)
      }
    }

    setBatches(results)
    setProgress('')
    setBusy(false)
    if (failures.length > 0) {
      setError(`${failures.length} topic(s) failed. ${failures[0]}`)
    } else if (results.length === 0) {
      setError('No questions were generated. Check your API key and try again.')
    }
  }

  function removeQuestion(topicId: string, questionId: string) {
    setBatches((current) =>
      current
        .map((batch) =>
          batch.topic.id === topicId
            ? { ...batch, questions: batch.questions.filter((item) => item.id !== questionId) }
            : batch,
        )
        .filter((batch) => batch.questions.length > 0),
    )
  }

  async function saveAll() {
    setBusy(true)
    await addQuestions(batches.flatMap((batch) => batch.questions))
    setBusy(false)
    setSaved(true)
    setBatches([])
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI question bank"
        title="Generate mock board questions"
        description={`Create original, solution-backed multiple-choice items with ${GEMINI_MODEL} for any program, subject or topic, then save them straight into your reviewer.`}
        actions={<Badge tone="brand"><Sparkles size={12} /> Gemini 3.8 Flash</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Controls */}
        <aside className="card h-fit p-5">
          <h2 className="heading mb-4 text-base">Generation settings</h2>

          <label className="mb-4 block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <KeyRound size={13} /> Gemini API key
            </span>
            <input
              className="input"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="AIza…"
              autoComplete="off"
            />
            <span className="mt-1.5 block text-[0.7rem] leading-relaxed text-muted">
              Stored only in this browser. You can also set <code>GEMINI_API_KEY</code> on the server.
            </span>
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Board / program</span>
            <select className="input" value={programId} onChange={(event) => changeProgram(event.target.value as ProgramId)}>
              {catalog.programs.map((item) => (
                <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
              ))}
            </select>
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Subject</span>
            <select className="input" value={subjectId} onChange={(event) => changeSubject(event.target.value)}>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
              ))}
            </select>
          </label>

          <div className="mb-4">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Scope</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['topic', 'Topic'],
                ['subject', 'Subject'],
                ['program', 'Program'],
              ] as Array<[Scope, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setScope(value)
                    setBatches([])
                  }}
                  className={cn(
                    'rounded-lg border py-2 text-xs font-semibold transition',
                    scope === value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-line bg-surface-2 text-muted hover:border-brand-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted">
              {scope === 'topic'
                ? 'Generate questions for one selected topic.'
                : scope === 'subject'
                  ? `Generate questions for all ${subjectTopics.length} topics in this subject.`
                  : `Generate questions for all ${catalog.topics.filter((item) => item.programId === programId).length} topics in this program.`}
            </p>
          </div>

          {scope === 'topic' && (
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Topic</span>
              <select className="input" value={topicId} onChange={(event) => { setTopicId(event.target.value); setBatches([]) }}>
                {subjectTopics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({generatedCount(item.id)} generated)
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Difficulty</span>
            <select
              className="input"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as 'mixed' | Difficulty)}
            >
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
              <span>Questions per topic</span>
              <span className="text-ink">{perTopic}</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={perTopic}
              onChange={(event) => setPerTopic(Number(event.target.value))}
              className="w-full accent-brand-600"
            />
          </label>

          <button type="button" className="btn btn-primary w-full" onClick={() => void generate()} disabled={busy || targets.length === 0}>
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : <WandSparkles size={17} />}
            {busy ? 'Generating…' : 'Generate questions'}
          </button>
          {progress && <p className="mt-3 text-center text-xs text-brand-600 dark:text-brand-400">{progress}</p>}
          <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted">
            {targets.length} topic{targets.length === 1 ? '' : 's'} × {perTopic} questions ≈ {targets.length * perTopic} items
          </p>
        </aside>

        {/* Preview / results */}
        <div>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
              <span className="flex items-center gap-2 font-semibold"><Check size={16} /> Questions saved to your bank.</span>
              <Link to="/practice" className="inline-flex items-center gap-1 font-bold underline">
                Practice them <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {busy && batches.length === 0 ? (
            <div className="card flex min-h-72 flex-col items-center justify-center gap-3 text-center">
              <span className="size-9 animate-spin rounded-full border-2 border-line border-t-brand-500" />
              <p className="text-sm font-semibold">Working through your topics…</p>
              <p className="text-xs text-muted">{progress || 'Contacting Gemini 3.8 Flash'}</p>
            </div>
          ) : batches.length === 0 ? (
            <EmptyState
              icon="✨"
              title="No questions generated yet"
              description="Choose a scope on the left and generate. Review and remove any weak items before saving them to your question bank."
            />
          ) : (
            <>
              <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Database size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{previewCount} questions ready to save</p>
                  <p className="text-xs text-muted">{batches.length} topic batch{batches.length === 1 ? '' : 'es'} · review before saving</p>
                </div>
                <button type="button" className="btn btn-ghost !text-xs" onClick={() => { setBatches([]); setSaved(false) }}>
                  <Trash2 size={14} /> Discard
                </button>
                <button type="button" className="btn btn-primary" onClick={() => void saveAll()} disabled={busy}>
                  {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Save to question bank
                </button>
              </div>

              <div className="space-y-5">
                {batches.map((batch) => (
                  <section key={batch.topic.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <h2 className="heading text-sm">{batch.topic.name}</h2>
                      <Badge tone="brand">{batch.questions.length} items</Badge>
                      <Link
                        to={`/practice?program=${batch.topic.programId}&topic=${batch.topic.id}`}
                        className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Practice <ArrowRight size={13} />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {batch.questions.map((question, index) => (
                        <div key={question.id} className="card p-4">
                          <div className="mb-2 flex items-start gap-2">
                            <span className="chip shrink-0">#{index + 1}</span>
                            <p className="flex-1 text-sm font-semibold leading-relaxed">{question.prompt}</p>
                            <button
                              type="button"
                              onClick={() => removeQuestion(batch.topic.id, question.id)}
                              className="btn btn-ghost size-7 !px-0"
                              title="Remove this question"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="ml-11 grid gap-1.5 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={cn(
                                  'rounded-lg border px-2.5 py-1.5 text-xs',
                                  optionIndex === question.answerIndex
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'
                                    : 'border-line bg-surface-2 text-muted',
                                )}
                              >
                                <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}
                              </div>
                            ))}
                          </div>
                          <div className="ml-11 mt-2 flex items-start gap-2 rounded-lg bg-surface-2 p-2.5 text-xs leading-relaxed text-muted">
                            <Badge tone="neutral" className="shrink-0">Solution</Badge>
                            <span>{question.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
