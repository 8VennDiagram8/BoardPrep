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
  X,
} from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { solveQuestionRequest, type TopicCandidate } from '../lib/gemini'
import {
  cancelGenerateJob,
  cancelPdfJob,
  removeGenerateQuestion,
  removePdfQuestion,
  resetGenerateJob,
  saveGenerateJob,
  startGenerateJob,
  startPdfJob,
  useJobs,
  type GenerateTarget,
} from '../lib/jobs'
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
  allSubjectsLabel?: string
}

function TopicPicker({
  programId, subjectId, topicId, onProgram, onSubject, onTopic,
  showTopic = true, topicCounts, allSubjectsLabel,
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
          {allSubjectsLabel && <option value="">{allSubjectsLabel}</option>}
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
}: {
  questions: Question[]
  onRemove: (id: string) => void
  onEdit?: (question: Question) => void
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
            <Badge tone="neutral" className="shrink-0">Solution</Badge>
            <span>{question.explanation}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SaveBar({
  count,
  busy,
  saved,
  onSave,
  onDiscard,
}: {
  count: number
  busy: boolean
  saved: boolean
  onSave: () => void
  onDiscard: () => void
}) {
  if (count === 0 && !saved) return null
  return (
    <>
      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Check size={16} /> Questions saved to your bank.
          <Link to="/practice" className="ml-auto inline-flex items-center gap-1 underline">
            Practice <ArrowRight size={13} />
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
            Save to question bank
          </button>
        </div>
      )}
    </>
  )
}

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

/* -------------------------------------------------------------------------- */
/* AI generation                                                              */
/* -------------------------------------------------------------------------- */

function GeneratePanel() {
  const { catalog, subjectsForProgram, topicsForSubject } = useApp()
  const { user } = useAuth()
  const { generate } = useJobs()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [scope, setScope] = useState<Scope>('topic')
  const [difficulty, setDifficulty] = useState<'mixed' | Difficulty>('mixed')
  const [perTopic, setPerTopic] = useState(3)
  const [localError, setLocalError] = useState<string | null>(null)

  const targets = useMemo<GenerateTarget[]>(() => {
    const topics =
      scope === 'topic'
        ? topicId ? catalog.topics.filter((item) => item.id === topicId) : []
        : scope === 'subject'
          ? catalog.topics.filter((item) => item.subjectId === subjectId)
          : catalog.topics.filter((item) => item.programId === programId)
    return topics.map((item) => ({
      id: item.id,
      programId: item.programId,
      subjectId: item.subjectId,
      name: item.name,
      programName: catalog.programs.find((program) => program.id === item.programId)?.name ?? item.programId,
      subjectName: catalog.subjects.find((subject) => subject.id === item.subjectId)?.name ?? item.subjectId,
    }))
  }, [scope, topicId, subjectId, programId, catalog])

  const countSaved = (id: string) =>
    catalog.questions.filter((item) => item.topicId === id && item.source === 'generated').length

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

  const total = generate.batches.reduce((sum, batch) => sum + batch.questions.length, 0)

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
          onTopic={setTopicId}
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
                onClick={() => setScope(value)}
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
        </div>
        <DifficultySelect value={difficulty} onChange={setDifficulty} />
        <label className="mb-5 block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
            <span>Questions per topic</span><span className="text-ink">{perTopic}</span>
          </span>
          <input type="range" min={1} max={10} value={perTopic} onChange={(event) => setPerTopic(Number(event.target.value))} className="w-full accent-brand-600" />
        </label>
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={generate.running || targets.length === 0}
          onClick={() => {
            if (targets.length === 0) {
              setLocalError('Choose at least one topic to generate questions for.')
              return
            }
            setLocalError(null)
            startGenerateJob({ targets, perTopic, difficulty, userId: user?.id ?? 'anonymous' })
          }}
        >
          {generate.running ? <LoaderCircle size={17} className="animate-spin" /> : <WandSparkles size={17} />}
          {generate.running ? 'Generating…' : 'Generate questions'}
        </button>
        {generate.running && (
          <button type="button" className="btn btn-secondary mt-2 w-full !text-xs" onClick={cancelGenerateJob}>
            <X size={14} /> Cancel generation
          </button>
        )}
        {generate.progress && <p className="mt-3 text-center text-xs text-brand-600 dark:text-brand-400">{generate.progress}</p>}
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          {targets.length} topic{targets.length === 1 ? '' : 's'} × {perTopic} ≈ {targets.length * perTopic} items
        </p>
      </aside>

      <div>
        {localError && <ErrorNote message={localError} />}
        {generate.error && <ErrorNote message={generate.error} />}
        {generate.running && generate.progress && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            <LoaderCircle size={14} className="animate-spin" /> {generate.progress}
            <span className="ml-auto">You can switch tabs or pages — generation continues.</span>
          </div>
        )}
        <SaveBar
          count={total}
          busy={generate.saving}
          saved={generate.saved}
          onSave={() => void saveGenerateJob(user?.id ?? 'anonymous')}
          onDiscard={resetGenerateJob}
        />
        {generate.running && generate.batches.length === 0 ? (
          <LoadingCard message={generate.progress || 'Preparing your questions…'} />
        ) : generate.batches.length === 0 && !generate.saved ? (
          <EmptyState icon="✨" title="No questions generated yet" description="Choose a scope and generate. Work continues even if you leave this tab." />
        ) : (
          <div className="space-y-5">
            {generate.batches.map((batch) => (
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
                  onRemove={(id) => removeGenerateQuestion(batch.topicId, id)}
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

const MAX_PDF_BYTES = 20 * 1024 * 1024

function PdfImportPanel() {
  const { catalog, subjectsForProgram, topicsForSubject } = useApp()
  const { user } = useAuth()
  const { pdf } = useJobs()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => subjectsForProgram('ecele')[0]?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [autoDetect, setAutoDetect] = useState(true)
  const [pagesPerBatch, setPagesPerBatch] = useState(5)
  const [file, setFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const candidates: TopicCandidate[] = (
    subjectId
      ? catalog.topics.filter((item) => item.subjectId === subjectId)
      : catalog.topics.filter((item) => item.programId === programId)
  ).map((item) => ({
    id: item.id,
    name: item.name,
    subjectId: item.subjectId,
    subjectName: catalog.subjects.find((subject) => subject.id === item.subjectId)?.name ?? '',
  }))

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

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setLocalError(null)
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Please choose a PDF file.')
      return
    }
    if (selected.size > MAX_PDF_BYTES) {
      setLocalError('PDF is too large. Please use a file under 20 MB.')
      return
    }
    setFile(selected)
  }

  async function extract() {
    if (!file) {
      setLocalError('Choose a PDF file first.')
      return
    }
    if (!autoDetect && !topicId) {
      setLocalError('Choose a topic, or turn on auto-detect.')
      return
    }
    if (autoDetect && candidates.length === 0) {
      setLocalError('No topics are available to classify the questions into.')
      return
    }
    setLocalError(null)
    startPdfJob({
      bytes: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
      pagesPerBatch,
      baseRequest: {
        programId,
        subjectId,
        topicId: autoDetect ? (candidates[0]?.id ?? topicId) : topicId,
        programName: catalog.programs.find((item) => item.id === programId)?.name ?? programId,
        subjectName: subjectId
          ? catalog.subjects.find((item) => item.id === subjectId)?.name ?? subjectId
          : 'Mixed subjects',
        count: 0,
        difficulty: 'mixed',
        autoDetectTopic: autoDetect,
        topics: candidates,
      },
      topicName: autoDetect
        ? 'Detect per question'
        : catalog.topics.find((item) => item.id === topicId)?.name ?? 'Topic',
      candidates,
      existingPrompts: catalog.questions.map((item) => item.prompt),
      userId: user?.id ?? 'anonymous',
    })
  }

  const groups = new Map<string, Question[]>()
  for (const question of pdf.questions) {
    const group = groups.get(question.topicId) ?? []
    group.push(question)
    groups.set(question.topicId, group)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Import from PDF</h2>
        <button
          type="button"
          role="switch"
          aria-checked={autoDetect}
          onClick={() => setAutoDetect((value) => !value)}
          className={cn(
            'mb-2 flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition',
            autoDetect
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
              : 'border-line bg-surface-2 hover:border-brand-300',
          )}
        >
          <span className={cn(
            'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
            autoDetect ? 'bg-brand-600 text-white' : 'bg-bg-soft text-muted',
          )}>
            <Sparkles size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-ink">Auto-detect topic per question</span>
            <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted">
              Let the AI file each question into the right topic
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5">
            <span className={cn(
              'text-[0.65rem] font-extrabold tracking-wide',
              autoDetect ? 'text-brand-600 dark:text-brand-400' : 'text-muted',
            )}>
              {autoDetect ? 'ON' : 'OFF'}
            </span>
            <span className={cn(
              'relative block h-6 w-11 rounded-full transition-colors',
              autoDetect ? 'bg-brand-600' : 'bg-slate-400 dark:bg-slate-600',
            )}>
              <span className={cn(
                'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
                autoDetect && 'translate-x-5',
              )} />
            </span>
          </span>
        </button>
        <p className="mb-4 text-[0.7rem] leading-relaxed text-muted">
          {autoDetect
            ? 'The AI reads each question and files it under the most relevant topic, even if the PDF is randomly ordered.'
            : 'Every extracted question will be saved under the topic you choose below.'}
        </p>
        <TopicPicker
          programId={programId}
          subjectId={subjectId}
          topicId={topicId}
          onProgram={handleProgram}
          onSubject={handleSubject}
          onTopic={setTopicId}
          showTopic={!autoDetect}
          allSubjectsLabel={autoDetect ? 'All subjects in this program' : undefined}
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
            Up to 20 MB. Large PDFs are processed in page batches.
          </span>
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Pages per batch</span>
          <select
            className="input"
            value={pagesPerBatch}
            onChange={(event) => setPagesPerBatch(Number(event.target.value))}
          >
            {[2, 3, 5, 10].map((value) => (
              <option key={value} value={value}>{value} pages</option>
            ))}
          </select>
          <span className="mt-1.5 block text-[0.7rem] leading-relaxed text-muted">
            Smaller batches extract more questions from dense PDFs, but take longer.
          </span>
        </label>
        {file && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-2 p-2.5 text-xs">
            <FileUp size={15} className="text-brand-500" />
            <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
            <span className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" className="btn btn-primary flex-1" onClick={() => void extract()} disabled={pdf.running || !file}>
            {pdf.running ? <LoaderCircle size={17} className="animate-spin" /> : <FileUp size={17} />}
            {pdf.running ? 'Extracting…' : 'Extract questions'}
          </button>
          {pdf.running && (
            <button type="button" className="btn btn-secondary !px-3" onClick={cancelPdfJob}>
              <X size={16} /> Cancel
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[0.7rem] text-muted">
          Questions are saved to your bank automatically as each batch finishes.
        </p>
      </aside>

      <div>
        {localError && <ErrorNote message={localError} />}
        {pdf.error && <ErrorNote message={pdf.error} />}
        {pdf.running && pdf.progress && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            <LoaderCircle size={14} className="animate-spin" />
            <span className="flex-1">{pdf.progress}</span>
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.65rem] text-white">
              {pdf.savedCount} saved
            </span>
            <span className="w-full text-[0.65rem] font-medium opacity-80">
              You can switch tabs or pages — extraction continues.
            </span>
          </div>
        )}
        {!pdf.running && pdf.cancelled && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertCircle size={14} /> Cancelled — {pdf.savedCount} question{pdf.savedCount === 1 ? '' : 's'} saved to your bank.
            <Link to="/practice" className="ml-auto inline-flex items-center gap-1 underline">
              Practice <ArrowRight size={13} />
            </Link>
          </div>
        )}
        {!pdf.running && pdf.finished && pdf.savedCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Check size={14} /> Extraction complete — {pdf.savedCount} question{pdf.savedCount === 1 ? '' : 's'} saved to your bank.
            <Link to="/practice" className="ml-auto inline-flex items-center gap-1 underline">
              Practice <ArrowRight size={13} />
            </Link>
          </div>
        )}
        {pdf.running && pdf.questions.length === 0 ? (
          <LoadingCard message={pdf.progress || 'Reading your PDF and classifying each question…'} />
        ) : pdf.questions.length === 0 && !pdf.cancelled && !pdf.finished ? (
          <EmptyState icon="📄" title="No questions extracted yet" description="Choose a PDF, then extract. Questions are grouped by the topic the AI detects for each one." />
        ) : (
          <div className="space-y-5">
            {autoDetect && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
                <Sparkles size={14} /> {groups.size} topic{groups.size === 1 ? '' : 's'} detected across {pdf.questions.length} questions
              </div>
            )}
            {[...groups.entries()].map(([topicKey, items]) => (
              <section key={topicKey}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="heading text-sm">{catalog.topics.find((item) => item.id === topicKey)?.name ?? 'Unassigned'}</h2>
                  <Badge tone="brand">{items.length} items</Badge>
                  <Link
                    to={`/practice?program=${programId}&topic=${topicKey}`}
                    className="ml-auto flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Practice <ArrowRight size={13} />
                  </Link>
                </div>
                <QuestionPreview questions={items} onRemove={removePdfQuestion} />
              </section>
            ))}
          </div>
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
  const { catalog, subjectsForProgram, topicsForSubject, addQuestions } = useApp()
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
  const [solving, setSolving] = useState(false)
  const [solveError, setSolveError] = useState<string | null>(null)

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

  async function solveWithAI() {
    setSolveError(null)
    if (!prompt.trim() || options.some((option) => !option.trim())) {
      setSolveError('Fill in the question and all four options first.')
      return
    }
    setSolving(true)
    try {
      const solved = await solveQuestionRequest({
        prompt: prompt.trim(),
        options: options.map((option) => option.trim()),
        programId,
        programName: catalog.programs.find((item) => item.id === programId)?.name ?? programId,
        subjectName: catalog.subjects.find((item) => item.id === subjectId)?.name ?? subjectId,
        topicName: catalog.topics.find((item) => item.id === topicId)?.name ?? 'Topic',
      })
      setAnswerIndex(solved.answerIndex)
      setExplanation(solved.explanation)
      setDifficulty(solved.difficulty)
    } catch (cause) {
      setSolveError(cause instanceof Error ? cause.message : 'Could not solve the question.')
    } finally {
      setSolving(false)
    }
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

          <button
            type="button"
            className="btn btn-secondary mb-4 w-full !text-xs"
            onClick={() => void solveWithAI()}
            disabled={solving}
          >
            {solving ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {solving ? 'Generating…' : 'Generate answer & solution'}
          </button>
          {solveError && (
            <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {solveError}
            </p>
          )}

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
        <SaveBar count={draft.length} busy={busy} saved={saved} onSave={() => void saveAll()} onDiscard={() => { setDraft([]); setSaved(false) }} />
        {draft.length === 0 && !saved ? (
          <EmptyState icon="✍️" title="No questions typed yet" description="Fill in the form and add questions to your draft. Save them together when you're done." />
        ) : (
          <QuestionPreview
            questions={draft}
            onRemove={(id) => setDraft((current) => current.filter((item) => item.id !== id))}
            onEdit={editQuestion}
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export function QuestionGenerator() {
  const [tab, setTab] = useState<Tab>('generate')
  const tabs: Array<{ id: Tab; label: string; icon: typeof WandSparkles }> = [
    { id: 'generate', label: 'Generate', icon: WandSparkles },
    { id: 'pdf', label: 'Import PDF', icon: FileUp },
    { id: 'manual', label: 'Type manually', icon: PencilLine },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Question bank"
        title="Add board exam questions"
        description="Generate questions, extract them from a PDF, or type them yourself — every question is saved with its answer and solution."
        actions={<Badge tone="brand"><Sparkles size={12} /> AI powered</Badge>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn('btn !text-xs', tab === id ? 'btn-primary' : 'btn-secondary')}
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
