import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  LoaderCircle,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Shuffle,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { type FlashcardTarget } from '../lib/gemini'
import {
  cancelFlashcardJob,
  startFlashcardJob,
  useJobs,
} from '../lib/jobs'
import { createId, readLocal, writeLocal } from '../lib/local'
import type { Flashcard, ProgramId } from '../lib/types'
import { cn, shuffle } from '../lib/utils'

function StudyPanel() {
  const { catalog, topic, program: getProgram } = useApp()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const paramProgram = searchParams.get('program')
  const paramTopic = searchParams.get('topic')
  const initialProgram = catalog.programs.some((item) => item.id === paramProgram)
    ? (paramProgram as ProgramId)
    : (catalog.programs[0]?.id ?? 'ecele')

  const [programId, setProgramId] = useState<ProgramId>(initialProgram)
  const [topicFilter, setTopicFilter] = useState(paramTopic ?? '')
  const [order, setOrder] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const ownerId = user?.id ?? 'anonymous'
  const [known, setKnown] = useState<string[]>(() =>
    readLocal<string[]>(`known:${ownerId}`, []),
  )

  useEffect(() => {
    setKnown(readLocal<string[]>(`known:${ownerId}`, []))
  }, [ownerId])

  useEffect(() => {
    if (paramProgram && catalog.programs.some((item) => item.id === paramProgram)) {
      setProgramId(paramProgram as ProgramId)
    }
    setTopicFilter(paramTopic ?? '')
  }, [paramProgram, paramTopic, catalog.programs])

  const programCards = useMemo(
    () => catalog.flashcards.filter((item) => item.programId === programId),
    [catalog.flashcards, programId],
  )
  const filteredCards = useMemo(
    () => (topicFilter ? programCards.filter((item) => item.topicId === topicFilter) : programCards),
    [programCards, topicFilter],
  )

  useEffect(() => {
    setOrder(shuffle(filteredCards.map((item) => item.id)))
    setIndex(0)
    setFlipped(false)
  }, [filteredCards])

  const cardById = useMemo(() => {
    const map = new Map<string, Flashcard>()
    for (const item of filteredCards) map.set(item.id, item)
    return map
  }, [filteredCards])

  const cards = order.map((id) => cardById.get(id)).filter((item): item is Flashcard => Boolean(item))
  const current = cards[index]
  const knownSet = new Set(known)
  const knownInDeck = cards.filter((item) => knownSet.has(item.id)).length
  const progress = cards.length === 0 ? 0 : Math.round((knownInDeck / cards.length) * 100)

  const persistKnown = useCallback(
    (next: string[]) => {
      setKnown(next)
      writeLocal(`known:${ownerId}`, next)
    },
    [ownerId],
  )

  function mark(knownIt: boolean) {
    if (!current) return
    const next = knownIt
      ? [...new Set([...known, current.id])]
      : known.filter((id) => id !== current.id)
    persistKnown(next)
    setFlipped(false)
    setIndex((value) => (value + 1) % Math.max(1, cards.length))
  }

  function move(delta: number) {
    setFlipped(false)
    setIndex((value) => (value + delta + cards.length) % Math.max(1, cards.length))
  }

  const flip = useCallback(() => setFlipped((value) => !value), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault()
        flip()
      } else if (event.key === 'ArrowRight') {
        move(1)
      } else if (event.key === 'ArrowLeft') {
        move(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const itemProgram = getProgram(programId)
  const styles = accentStyles[itemProgram?.accent ?? 'indigo']

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          className="input !w-auto min-w-40"
          value={programId}
          onChange={(event) => setProgramId(event.target.value as ProgramId)}
        >
          {catalog.programs.map((item) => (
            <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
          ))}
        </select>
        <select className="input !w-auto min-w-48" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
          <option value="">All topics</option>
          {catalog.topics
            .filter((item) => item.programId === programId)
            .map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
        </select>
        <Badge tone="neutral">{cards.length} cards</Badge>
        <button
          type="button"
          className="btn btn-secondary !text-xs"
          onClick={() => setOrder(shuffle(order))}
          disabled={cards.length === 0}
        >
          <Shuffle size={14} /> Shuffle
        </button>
        <div className="flex min-w-40 items-center gap-2">
          <ProgressBar value={progress} barClassName="bg-emerald-500" />
          <span className="shrink-0 text-xs font-bold text-muted">{progress}%</span>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon="🃏"
          title="No cards in this deck"
          description="Try another topic or program — more cards can be added to the catalog any time."
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-xs text-muted">
            <span>Card {index + 1} of {cards.length}</span>
            <span className="flex items-center gap-1.5"><Sparkles size={13} /> Click the card or press Space to flip</span>
          </div>

          <button
            type="button"
            onClick={flip}
            className="group relative flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:min-h-80"
          >
            <div className={cn('absolute inset-x-0 top-0 h-1.5 rounded-t-2xl', styles.bar)} />
            <span className="chip mb-5">
              {topic(current.topicId)?.name ?? 'Topic'}
            </span>
            {!flipped ? (
              <>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted">Question</p>
                <p className="heading mt-3 text-xl leading-snug sm:text-2xl">{current.front}</p>
                <p className="mt-6 text-xs text-muted">Tap to reveal the answer</p>
              </>
            ) : (
              <>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Answer</p>
                <p className="mt-3 text-lg font-semibold leading-relaxed text-ink">{current.back}</p>
                <p className="mt-6 text-xs text-muted">Tap to see the question again</p>
              </>
            )}
          </button>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => move(-1)}>
              <ArrowLeft size={16} /> Previous
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => mark(false)} title="Needs more review">
                <X size={16} /> <span className="hidden sm:inline">Review again</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={() => mark(true)} title="I know this one">
                <Check size={16} /> <span className="hidden sm:inline">Got it</span>
              </button>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => move(1)}>
              Next <ArrowRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className="mx-auto mt-5 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
            onClick={() => {
              persistKnown([])
              setFlipped(false)
            }}
          >
            <RotateCcw size={13} /> Reset known cards
          </button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Generate (conceptual)                                                      */
/* -------------------------------------------------------------------------- */

type CardScope = 'topic' | 'subject' | 'program'

function GeneratePanel() {
  const { catalog } = useApp()
  const { user } = useAuth()
  const { flashcards: job } = useJobs()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => catalog.subjects.find((item) => item.programId === 'ecele')?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [scope, setScope] = useState<CardScope>('topic')
  const [perTopic, setPerTopic] = useState(5)

  const targets = useMemo<FlashcardTarget[]>(() => {
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

  function handleProgram(next: ProgramId) {
    setProgramId(next)
    const first = catalog.subjects.find((item) => item.programId === next)?.id ?? ''
    setSubjectId(first)
    setTopicId(catalog.topics.find((item) => item.subjectId === first)?.id ?? '')
  }
  function handleSubject(next: string) {
    setSubjectId(next)
    setTopicId(catalog.topics.find((item) => item.subjectId === next)?.id ?? '')
  }

  const groups = new Map<string, Flashcard[]>()
  for (const card of job.cards) {
    const group = groups.get(card.topicId) ?? []
    group.push(card)
    groups.set(card.topicId, group)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Generate conceptual cards</h2>
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[0.7rem] leading-relaxed text-brand-800 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
          Cards are <strong>concept only</strong> — definitions, principles, textbook concepts and board-exam rules. No numerical problems.
        </div>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Board / program</span>
          <select className="input" value={programId} onChange={(event) => handleProgram(event.target.value as ProgramId)}>
            {catalog.programs.map((item) => (
              <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
            ))}
          </select>
        </label>
        <div className="mb-4">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Scope</span>
          <div className="grid grid-cols-3 gap-2">
            {([['topic', 'Topic'], ['subject', 'Subject'], ['program', 'Program']] as Array<[CardScope, string]>).map(([value, label]) => (
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
        {scope === 'program' ? (
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Subject</span>
            <select className="input" value={subjectId} onChange={(event) => handleSubject(event.target.value)}>
              {catalog.subjects.filter((item) => item.programId === programId).map((item) => (
                <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Subject</span>
              <select className="input" value={subjectId} onChange={(event) => handleSubject(event.target.value)}>
                {catalog.subjects.filter((item) => item.programId === programId).map((item) => (
                  <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
                ))}
              </select>
            </label>
            {scope === 'topic' && (
              <label className="mb-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Topic</span>
                <select className="input" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
                  {catalog.topics.filter((item) => item.subjectId === subjectId).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}
        <label className="mb-5 block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
            <span>Cards per topic</span><span className="text-ink">{perTopic}</span>
          </span>
          <input type="range" min={2} max={12} value={perTopic} onChange={(event) => setPerTopic(Number(event.target.value))} className="w-full accent-brand-600" />
        </label>
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={job.running || targets.length === 0}
          onClick={() => startFlashcardJob({
            targets,
            perTopic,
            userId: user?.id ?? 'anonymous',
            existingFronts: catalog.flashcards.map((card) => card.front),
          })}
        >
          {job.running ? <LoaderCircle size={16} className="animate-spin" /> : <WandSparkles size={16} />}
          {job.running ? 'Generating…' : 'Generate flashcards'}
        </button>
        {job.running && (
          <button type="button" className="btn btn-secondary mt-2 w-full !text-xs" onClick={cancelFlashcardJob}>
            <X size={14} /> Cancel
          </button>
        )}
        <p className="mt-3 text-center text-[0.7rem] text-muted">
          {targets.length} topic{targets.length === 1 ? '' : 's'} × {perTopic} cards
        </p>
      </aside>

      <div>
        {job.error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {job.error}
          </div>
        )}
        {job.running && job.progress && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
            <LoaderCircle size={14} className="animate-spin" />
            <span className="flex-1">{job.progress}</span>
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.65rem] text-white">{job.savedCount} saved</span>
          </div>
        )}
        {!job.running && job.finished && job.savedCount > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Check size={14} /> {job.savedCount} conceptual cards saved to your deck.
          </div>
        )}
        {!job.running && job.cancelled && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertCircle size={14} /> Cancelled — {job.savedCount} cards saved.
          </div>
        )}
        {job.cards.length === 0 ? (
          <EmptyState icon="🧠" title="No cards generated yet" description="Choose a topic scope and generate conceptual cards. They save automatically as they are created." />
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([topicKey, cards]) => (
              <section key={topicKey}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="heading text-sm">{catalog.topics.find((item) => item.id === topicKey)?.name ?? 'Topic'}</h2>
                  <Badge tone="brand">{cards.length} cards</Badge>
                </div>
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div key={card.id} className="card p-4">
                      <p className="text-sm font-semibold">{card.front}</p>
                      <p className="mt-2 rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-muted">{card.back}</p>
                    </div>
                  ))}
                </div>
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

function ManualPanel() {
  const { catalog, addFlashcards } = useApp()
  const [programId, setProgramId] = useState<ProgramId>('ecele')
  const [subjectId, setSubjectId] = useState(() => catalog.subjects.find((item) => item.programId === 'ecele')?.id ?? '')
  const [topicId, setTopicId] = useState('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [draft, setDraft] = useState<Flashcard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  function handleProgram(next: ProgramId) {
    setProgramId(next)
    const first = catalog.subjects.find((item) => item.programId === next)?.id ?? ''
    setSubjectId(first)
    setTopicId(catalog.topics.find((item) => item.subjectId === first)?.id ?? '')
  }
  function handleSubject(next: string) {
    setSubjectId(next)
    setTopicId(catalog.topics.find((item) => item.subjectId === next)?.id ?? '')
  }

  function addToDraft(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!topicId) {
      setError('Choose a topic first.')
      return
    }
    if (!front.trim() || !back.trim()) {
      setError('Fill in both the concept question and the concept answer.')
      return
    }
    setDraft((current) => [...current, {
      id: `manual-card-${createId()}`,
      programId,
      subjectId,
      topicId,
      front: front.trim(),
      back: back.trim(),
      source: 'manual',
      generatedAt: new Date().toISOString(),
    }])
    setSaved(false)
    setFront('')
    setBack('')
  }

  async function saveAll() {
    setBusy(true)
    await addFlashcards(draft)
    setBusy(false)
    setSaved(true)
    setDraft([])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="heading mb-4 text-base">Type a concept card</h2>
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-[0.7rem] leading-relaxed text-brand-800 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
          Keep cards conceptual: a question about a principle, definition, code rule or textbook concept — not a computation.
        </div>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Board / program</span>
          <select className="input" value={programId} onChange={(event) => handleProgram(event.target.value as ProgramId)}>
            {catalog.programs.map((item) => (
              <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
            ))}
          </select>
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Subject</span>
          <select className="input" value={subjectId} onChange={(event) => handleSubject(event.target.value)}>
            {catalog.subjects.filter((item) => item.programId === programId).map((item) => (
              <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
            ))}
          </select>
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">Topic</span>
          <select className="input" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            {catalog.topics.filter((item) => item.subjectId === subjectId).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <form onSubmit={addToDraft}>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Concept question (front)</span>
            <textarea className="input min-h-20 resize-y" value={front} onChange={(event) => setFront(event.target.value)} placeholder="e.g. What does the Nyquist theorem state?" />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Concept / answer (back)</span>
            <textarea className="input min-h-24 resize-y" value={back} onChange={(event) => setBack(event.target.value)} placeholder="e.g. A signal must be sampled at least twice its highest frequency." />
          </label>
          <button type="submit" className="btn btn-primary w-full">
            <Plus size={16} /> Add to draft
          </button>
        </form>
      </aside>

      <div>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Check size={14} /> Cards saved to your deck.
          </div>
        )}
        {draft.length > 0 && (
          <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <Database size={19} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">{draft.length} card{draft.length === 1 ? '' : 's'} ready to save</p>
              <p className="text-xs text-muted">Review before adding to your deck.</p>
            </div>
            <button type="button" className="btn btn-ghost !text-xs" onClick={() => setDraft([])}>
              <Trash2 size={14} /> Discard
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void saveAll()} disabled={busy}>
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              Save cards
            </button>
          </div>
        )}
        {draft.length === 0 && !saved ? (
          <EmptyState icon="✍️" title="No cards typed yet" description="Write a conceptual question and answer, add them to the draft, then save them together." />
        ) : (
          <div className="space-y-2">
            {draft.map((card, index) => (
              <div key={card.id} className="card p-4">
                <div className="mb-2 flex items-start gap-2">
                  <span className="chip shrink-0">#{index + 1}</span>
                  <p className="flex-1 text-sm font-semibold">{card.front}</p>
                  <button type="button" className="btn btn-ghost size-7 !px-0" onClick={() => setDraft((current) => current.filter((item) => item.id !== card.id))}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="ml-11 rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-muted">{card.back}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

type Tab = 'study' | 'generate' | 'manual'

export function Flashcards() {
  const [tab, setTab] = useState<Tab>('study')
  const tabs: Array<{ id: Tab; label: string; icon: typeof Sparkles }> = [
    { id: 'study', label: 'Study deck', icon: RotateCcw },
    { id: 'generate', label: 'Generate', icon: WandSparkles },
    { id: 'manual', label: 'Type manually', icon: PencilLine },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Active recall"
        title="Flashcards"
        description="Purely conceptual board-exam review — principles, definitions and textbook concepts, not calculations."
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
      {tab === 'study' && <StudyPanel />}
      {tab === 'generate' && <GeneratePanel />}
      {tab === 'manual' && <ManualPanel />}
    </div>
  )
}
