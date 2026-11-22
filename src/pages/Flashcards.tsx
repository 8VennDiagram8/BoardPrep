import { ArrowLeft, ArrowRight, Check, RotateCcw, Shuffle, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { readLocal, writeLocal } from '../lib/local'
import type { Flashcard, ProgramId } from '../lib/types'
import { cn, shuffle } from '../lib/utils'

export function Flashcards() {
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
      <PageHeader
        eyebrow="Active recall"
        title="Flashcards"
        description="Flip, recall, and sort. Short focused sessions are the fastest way to make facts stick."
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => setOrder(shuffle(order))} disabled={cards.length === 0}>
            <Shuffle size={16} /> Shuffle
          </button>
        }
      />

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
        <div className="ml-auto flex min-w-40 items-center gap-2">
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
