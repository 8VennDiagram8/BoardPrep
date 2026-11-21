import {
  AlertCircle,
  ArrowRight,
  Check,
  Database,
  FileUp,
  LoaderCircle,
  PencilLine,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import {
  GEMINI_MODEL,
  importQuestionsFromPdf,
  requestGeneratedQuestions,
} from '../lib/gemini'
import { createId } from '../lib/local'
import type { Difficulty, ProgramId, Question } from '../lib/types'
import { cn } from '../lib/utils'

type Scope = 'topic' | 'subject' | 'program'
type Tab = 'generate' | 'pdf' | 'manual'

interface TopicPickerProps {
  programId: ProgramId
  subjectId: string
  topicId: string
  onProgram: (value: ProgramId) => void
  onSubject: (value: string) => void
  onTopic: (value: string) => void
  showTopic?: boolean
  topicCounts?: (topicId: string) => number
}

function TopicPicker({
  programId, subjectId, topicId, onProgram, onSubject, onTopic,
  showTopic = true, topicCounts,
}: TopicPickerProps) {
  const { catalog, subjectsForProgram, topicsForSubject } = useApp()
  const subjects = subjectsForProgram(programId)
  const topics = topicsForSubject(subjectId)

  return (
    <>
      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Board / program</span>
        <select className="input" value={programId} onChange={(event) => onProgram(event.target.value as ProgramId)}>
          {catalog.programs.map((item) => (
            <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
          ))}
        </select>
      </label>
      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Subject</span>
        <select className="input" value={subjectId} onChange={(event) => onSubject(event.target.value)}>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
          ))}
        </select>
      </label>
      {showTopic && (
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Topic</span>
          <select className="input" value={topicId} onChange={(event) => onTopic(event.target.value)}>
            {topics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}{topicCounts ? ` (${topicCounts(item.id)} saved)` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  )
}

function DifficultySelect({ value, onChange }: { value: 'mixed' | Difficulty; onChange: (value: 'mixed' | Difficulty) => void }) {
  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">Difficulty</span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value as 'mixed' | Difficulty)}>
        <option value="mixed">Mixed</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </label>
  )
}

function QuestionPreview({
  questions,
  onRemove,
  onEdit,
  title,
  countLabel,
}: {
  questions: Question[]
  onRemove: (id: string) => void
  onEdit?: (question: Question) => void
  title?: string
  countLabel?: string
}) {
  const { topic } = useApp()
  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div key={question.id} className="card p-4">
          <div className="mb-2 flex items-start gap-2">
            <span className="chip shrink-0">#{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-relaxed">{question.prompt}</p>
              <p className="mt-1 text-[0.7rem] text-muted">{topic(question.topicId)?.name}</p>
            </div>
            {onEdit && (
              <button type="button" onClick={() => onEdit(question)} className="btn btn-ghost !px-2 !text-xs" title="Edit question">
                <PencilLine size={13} />
              </button>
            )}
            <button type="button" onClick={() => onRemove(question.id)} className="btn btn-ghost size-7 !px-0" title="Remove question">
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
            <Badge tone="neutral" className="shrink-0">{countLabel ?? 'Solution'}</Badge>
            <span>{question.explanation}</span>
          </div>
        </div>
      ))}
      {title && <p className="sr-only">{title}</p>}
    </div>
  )
}

function SaveBar({
  count,
  busy,
  saved,
  onSave,
  onDiscard,
  saveLabel = 'Save to question bank',
}: {
  count: number
  busy: boolean
  saved: boolean
  onSave: () => void
  onDiscard: () => void
  saveLabel?: string
}) {
  if (count === 0 && !saved) return null
  return (
    <>
      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Check size={16} /> Questions saved to your bank.
          <Link to="/practice" className="ml-auto inline-flex items-center gap-1 underline">
            Practice them <ArrowRight size={13} />
          </Link>
        </div>
      )}
      {count > 0 && (
        <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Database size={19} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">{count} question{count === 1 ? '' : 's'} ready to save</p>
            <p className="text-xs text-muted">Review them before adding to your bank.</p>
          </div>
          <button type="button" className="btn btn-ghost !text-xs" onClick={onDiscard}>
            <Trash2 size={14} /> Discard
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={busy}>
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
            {saveLabel}
          </button>
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* AI generation                                                              */
/* -------------------------------------------------------------------------- */

function GeneratePanel() {
  const { catalog, subjectsForProgram, topicsForSubject, addQuestions } = useApp()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [scope, setScope] = useState<Scope>('topic')
  const [difficulty, setDifficulty] = useState<'mixed' | Difficulty>('mixed')
  const [perTopic, setPerTopic] = useState(3)

  const [batches, setBatches] = useState<Array<{ topicId: string; questions: Question[] }>>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const targets = useMemo(() => {
    if (scope === 'topic') return topicId ? catalog.topics.filter((item) => item.id === topicId) : []
    if (scope === 'subject') return catalog.topics.filter((item) => item.subjectId === subjectId)
    return catalog.topics.filter((item) => item.programId === programId)
  }, [scope, topicId, subjectId, programId, catalog.topics])

  const countSaved = (id: string) =>
    catalog.questions.filter((item) => item.topicId === id && item.source === 'generated').length

  function handleProgram(next: ProgramId) {
    setProgramId(next)
    const first = subjectsForProgram(next)[0]?.id ?? ''
    setSubjectId(first)
    setTopicId(topicsForSubject(first)[0]?.id ?? '')
    setBatches([])
  }
  function handleSubject(next: string) {
    setSubjectId(next)
    setTopicId(topicsForSubject(next)[0]?.id ?? '')
    setBatches([])
  }

  async function generate() {
    if (targets.length === 0) {
      setError('Choose at least one topic to generate questions for.')
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    setBatches([])
    const results: Array<{ topicId: string; questions: Question[] }> = []
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
        })
        if (questions.length > 0) results.push({ topicId: target.id, questions })
      } catch (cause) {
        failures.push(`${target.name}: ${cause instanceof Error ? cause.message : 'failed'}`)
      }
    }
    setBatches(results)
    setProgress('')
    setBusy(false)
    if (failures.length > 0) setError(`${failures.length} topic(s) failed. ${failures[0]}`)
  }

  async function saveAll() {
    setBusy(true)
    await addQuestions(batches.flatMap((batch) => batch.questions))
    setBusy(false)
    setSaved(true)
    setBatches([])
  }

  const total = batches.reduce((sum, batch) => sum + batch.questions.length, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Generation settings</h2>
        <TopicPicker
          programId={programId}
          subjectId={subjectId}
          topicId={topicId}
          onProgram={handleProgram}
          onSubject={handleSubject}
          onTopic={(value) => { setTopicId(value); setBatches([]) }}
          showTopic={scope === 'topic'}
          topicCounts={countSaved}
        />
        <div className="mb-4">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Scope</span>
          <div className="grid grid-cols-3 gap-2">
            {([['topic', 'Topic'], ['subject', 'Subject'], ['program', 'Program']] as Array<[Scope, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => { setScope(value); setBatches([]) }}
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
                ? `All ${catalog.topics.filter((item) => item.subjectId === subjectId).length} topics in this subject.`
                : `All ${catalog.topics.filter((item) => item.programId === programId).length} topics in this program.`}
          </p>
        </div>
        <DifficultySelect value={difficulty} onChange={(value) => setDifficulty(value)} />
        <label className="mb-5 block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
            <span>Questions per topic</span><span className="text-ink">{perTopic}</span>
          </span>
          <input type="range" min={1} max={10} value={perTopic} onChange={(event) => setPerTopic(Number(event.target.value))} className="w-full accent-brand-600" />
        </label>
        <button type="button" className="btn btn-primary w-full" onClick={() => void generate()} disabled={busy || targets.length === 0}>
          {busy ? <LoaderCircle size={17} className="animate-spin" /> : <WandSparkles size={17} />}
          {busy ? 'Generating…' : 'Generate questions'}
        </button>
        {progress && <p className="mt-3 text-center text-xs text-brand-600 dark:text-brand-400">{progress}</p>}
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          {targets.length} topic{targets.length === 1 ? '' : 's'} × {perTopic} ≈ {targets.length * perTopic} items
        </p>
      </aside>

      <div>
        {error && <ErrorNote message={error} />}
        <SaveBar count={total} busy={busy} saved={saved} onSave={() => void saveAll()} onDiscard={() => { setBatches([]); setSaved(false) }} />
        {busy && batches.length === 0 ? (
          <LoadingCard message={progress || 'Contacting Gemini 3.8 Flash'} />
        ) : batches.length === 0 && !saved ? (
          <EmptyState icon="✨" title="No questions generated yet" description="Choose a scope on the left and generate. Review the preview, then save the questions you want." />
        ) : (
          <div className="space-y-5">
            {batches.map((batch) => (
              <section key={batch.topicId}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="heading text-sm">{catalog.topics.find((item) => item.id === batch.topicId)?.name}</h2>
                  <Badge tone="brand">{batch.questions.length} items</Badge>
                  <Link
                    to={`/practice?program=${catalog.topics.find((item) => item.id === batch.topicId)?.programId}&topic=${batch.topicId}`}
                    className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Practice <ArrowRight size={13} />
                  </Link>
                </div>
                <QuestionPreview
                  questions={batch.questions}
                  onRemove={(id) => setBatches((current) => current.map((b) => ({ ...b, questions: b.questions.filter((q) => q.id !== id) })).filter((b) => b.questions.length > 0))}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* PDF import                                                                 */
/* -------------------------------------------------------------------------- */

const MAX_PDF_BYTES = 3 * 1024 * 1024

function PdfImportPanel() {
  const { catalog, subjectsForProgram, topicsForSubject, addQuestions } = useApp()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleProgram(next: ProgramId) {
    setProgramId(next)
    const first = subjectsForProgram(next)[0]?.id ?? ''
    setSubjectId(first)
    setTopicId(topicsForSubject(first)[0]?.id ?? '')
    setQuestions([])
  }
  function handleSubject(next: string) {
    setSubjectId(next)
    setTopicId(topicsForSubject(next)[0]?.id ?? '')
    setQuestions([])
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setError(null)
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.')
      return
    }
    if (selected.size > MAX_PDF_BYTES) {
      setError('PDF is too large. Please use a file under 3 MB.')
      return
    }
    setFile(selected)
    setQuestions([])
  }

  async function extract() {
    if (!file) {
      setError('Choose a PDF file first.')
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    setQuestions([])
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      let binary = ''
      for (const byte of bytes) binary += String.fromCharCode(byte)
      const base64 = btoa(binary)
      const found = await importQuestionsFromPdf({
        programId,
        subjectId,
        topicId,
        programName: catalog.programs.find((item) => item.id === programId)?.name ?? programId,
        subjectName: catalog.subjects.find((item) => item.id === subjectId)?.name ?? subjectId,
        topicName: catalog.topics.find((item) => item.id === topicId)?.name ?? 'Topic',
        count: 0,
        difficulty: 'mixed',
        fileName: file.name,
        fileData: base64,
      })
      setQuestions(found)
      if (found.length === 0) setError('No questions were found in this PDF.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read the PDF.')
    } finally {
      setBusy(false)
    }
  }

  async function saveAll() {
    setBusy(true)
    await addQuestions(questions)
    setBusy(false)
    setSaved(true)
    setQuestions([])
    setFile(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Import from PDF</h2>
        <TopicPicker
          programId={programId}
          subjectId={subjectId}
          topicId={topicId}
          onProgram={handleProgram}
          onSubject={handleSubject}
          onTopic={(value) => { setTopicId(value); setQuestions([]) }}
        />
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">PDF file</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={chooseFile}
            className="input !py-2 !text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <span className="mt-1.5 block text-[0.7rem] leading-relaxed text-muted">
            Maximum 3 MB. Questions and answers are extracted with Gemini 3.8 Flash.
          </span>
        </label>
        {file && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-2 p-2.5 text-xs">
            <FileUp size={15} className="text-brand-500" />
            <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
            <span className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        )}
        <button type="button" className="btn btn-primary w-full" onClick={() => void extract()} disabled={busy || !file || !topicId}>
          {busy ? <LoaderCircle size={17} className="animate-spin" /> : <FileUp size={17} />}
          {busy ? 'Extracting…' : 'Extract questions'}
        </button>
      </aside>

      <div>
        {error && <ErrorNote message={error} />}
        <SaveBar count={questions.length} busy={busy} saved={saved} onSave={() => void saveAll()} onDiscard={() => { setQuestions([]); setSaved(false) }} />
        {busy && questions.length === 0 ? (
          <LoadingCard message="Reading your PDF and extracting questions…" />
        ) : questions.length === 0 && !saved ? (
          <EmptyState icon="📄" title="No questions extracted yet" description="Choose a PDF and a topic, then extract. Review the results before saving them to the question bank." />
        ) : (
          <QuestionPreview questions={questions} onRemove={(id) => setQuestions((current) => current.filter((item) => item.id !== id))} />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Manual entry                                                               */
/* -------------------------------------------------------------------------- */

const emptyOptions = ['', '', '', '']

function ManualPanel() {
  const { subjectsForProgram, topicsForSubject, addQuestions } = useApp()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [options, setOptions] = useState<string[]>(emptyOptions)
  const [answerIndex, setAnswerIndex] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [draft, setDraft] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  function handleProgram(next: ProgramId) {
    setProgramId(next)
    const first = subjectsForProgram(next)[0]?.id ?? ''
    setSubjectId(first)
    setTopicId(topicsForSubject(first)[0]?.id ?? '')
  }
  function handleSubject(next: string) {
    setSubjectId(next)
    setTopicId(topicsForSubject(next)[0]?.id ?? '')
  }

  function resetForm() {
    setPrompt('')
    setOptions([...emptyOptions])
    setAnswerIndex(0)
    setExplanation('')
    setDifficulty('medium')
  }

  function addToDraft(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!topicId) {
      setError('Choose a topic first.')
      return
    }
    if (!prompt.trim() || options.some((option) => !option.trim()) || !explanation.trim()) {
      setError('Fill in the question, all four options and the solution.')
      return
    }
    const question: Question = {
      id: `manual-${createId()}`,
      programId,
      subjectId,
      topicId,
      prompt: prompt.trim(),
      options: options.map((option) => option.trim()),
      answerIndex,
      explanation: explanation.trim(),
      difficulty,
      source: 'manual',
      generatedAt: new Date().toISOString(),
    }
    setDraft((current) => [...current, question])
    setSaved(false)
    resetForm()
  }

  function editQuestion(question: Question) {
    setDraft((current) => current.filter((item) => item.id !== question.id))
    setPrompt(question.prompt)
    setOptions([...question.options])
    setAnswerIndex(question.answerIndex)
    setExplanation(question.explanation)
    setDifficulty(question.difficulty)
    setProgramId(question.programId)
    setSubjectId(question.subjectId)
    setTopicId(question.topicId)
  }

  async function saveAll() {
    setBusy(true)
    await addQuestions(draft)
    setBusy(false)
    setSaved(true)
    setDraft([])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Type a question</h2>
        <TopicPicker programId={programId} subjectId={subjectId} topicId={topicId} onProgram={handleProgram} onSubject={handleSubject} onTopic={setTopicId} />

        <form onSubmit={addToDraft}>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Question</span>
            <textarea className="input min-h-20 resize-y" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Type the question or problem…" />
          </label>

          <span className="mb-1.5 block text-xs font-semibold text-muted">Options (select the correct one)</span>
          <div className="mb-4 space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerIndex(index)}
                  title="Mark as correct answer"
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold transition',
                    answerIndex === index
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-line bg-surface-2 text-muted hover:border-emerald-400',
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </button>
                <input
                  className="input !py-2 !text-xs"
                  value={option}
                  onChange={(event) => setOptions((current) => current.map((item, i) => (i === index ? event.target.value : item)))}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Solution / explanation</span>
            <textarea className="input min-h-20 resize-y" value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Explain the answer, show the formula or reasoning…" />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Difficulty</span>
            <select className="input" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <button type="submit" className="btn btn-primary w-full">
            <Check size={16} /> Add to draft
          </button>
        </form>
      </aside>

      <div>
        {error && <ErrorNote message={error} />}
        <SaveBar count={draft.length} busy={busy} saved={saved} onSave={() => void saveAll()} onDiscard={() => { setDraft([]); setSaved(false) }} saveLabel="Save questions" />
        {draft.length === 0 && !saved ? (
          <EmptyState icon="✍️" title="No questions typed yet" description="Fill in the form and add questions to your draft. Save them together when you're done." />
        ) : (
          <QuestionPreview
            questions={draft}
            onRemove={(id) => setDraft((current) => current.filter((item) => item.id !== id))}
            onEdit={editQuestion}
            countLabel="Solution"
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared bits + page                                                         */
/* -------------------------------------------------------------------------- */

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="card flex min-h-72 flex-col items-center justify-center gap-3 text-center">
      <span className="size-9 animate-spin rounded-full border-2 border-line border-t-brand-500" />
      <p className="text-sm font-semibold">Working…</p>
      <p className="text-xs text-muted">{message}</p>
    </div>
  )
}

export function QuestionGenerator() {
  const [tab, setTab] = useState<Tab>('generate')
  const tabs: Array<{ id: Tab; label: string; icon: typeof WandSparkles }> = [
    { id: 'generate', label: 'Generate with AI', icon: WandSparkles },
    { id: 'pdf', label: 'Import PDF', icon: FileUp },
    { id: 'manual', label: 'Type manually', icon: PencilLine },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Question bank"
        title="Add board exam questions"
        description={`Generate with ${GEMINI_MODEL}, extract from a PDF, or type them yourself — every question is saved with its answer and solution.`}
        actions={<Badge tone="brand"><Sparkles size={12} /> Gemini 3.8 Flash</Badge>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'btn !text-xs',
              tab === id ? 'btn-primary' : 'btn-secondary',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {tab === 'generate' && <GeneratePanel />}
      {tab === 'pdf' && <PdfImportPanel />}
      {tab === 'manual' && <ManualPanel />}
    </div>
  )
}
