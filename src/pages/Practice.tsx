import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Flag,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { accentStyles, Badge, ProgressBar } from '../components/ui'
import { useApp } from '../context/AppContext'
import { createId } from '../lib/local'
import type {
  AnswerRecord,
  Attempt,
  AttemptMode,
  ProgramId,
  Question,
} from '../lib/types'
import { cn, formatClock, pickRandom } from '../lib/utils'

type SetupMode = 'practice' | 'mock'

export function Practice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { catalog, settings, questionsForProgram, program, topic, recordAttempt } = useApp()

  /* ------------------------------ setup state ----------------------------- */
  const [setupProgram, setSetupProgram] = useState<ProgramId>('ecele')
  const [setupMode, setSetupMode] = useState<SetupMode>('practice')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [topicSubjectFilter, setTopicSubjectFilter] = useState('all')
  const [setupCount, setSetupCount] = useState(10)

  /* ------------------------------ quiz state ------------------------------ */
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [startedAt, setStartedAt] = useState('')
  const [limitSeconds, setLimitSeconds] = useState<number | null>(null)
  const [sessionProgram, setSessionProgram] = useState<ProgramId>('ecele')
  const [sessionMode, setSessionMode] = useState<AttemptMode>('practice')
  const [sessionTopic, setSessionTopic] = useState<string | null>(null)
  const [sessionSubject, setSessionSubject] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const autoStartedRef = useRef<string | null>(null)
  const questionStartRef = useRef(Date.now())
  const finishRef = useRef<() => void>(() => {})

  const active = questions.length > 0
  const programTopics = catalog.topics.filter((item) => item.programId === setupProgram)
  const visibleTopics = topicSubjectFilter === 'all'
    ? programTopics
    : programTopics.filter((item) => item.subjectId === topicSubjectFilter)
  const availableQuestions = questionsForProgram(setupProgram).filter(
    (question) => selectedTopics.length === 0 || selectedTopics.includes(question.topicId),
  )
  const maxQuestions = Math.max(1, availableQuestions.length)
  const effectiveCount = Math.min(setupCount, maxQuestions)

  /* ------------------------------ session start --------------------------- */
  const startSession = useCallback(
    (programId: ProgramId, mode: AttemptMode, topicIds: string[]) => {
      const programQuestions = questionsForProgram(programId)
      const pool = topicIds.length === 0
        ? programQuestions
        : programQuestions.filter((question) => topicIds.includes(question.topicId))
      if (pool.length === 0) return

      const selected = mode === 'mock'
        ? pickRandom(pool, Math.min(settings.examMinutes * 2, pool.length))
        : pickRandom(pool, Math.min(10, pool.length))

      const onlyTopic = topicIds.length === 1 ? topicIds[0] : null
      const selectedSubjects = new Set(topicIds.map((id) => topic(id)?.subjectId).filter(Boolean))
      const sharedSubject = selectedSubjects.size === 1 ? ([...selectedSubjects][0] ?? null) : null

      setSessionProgram(programId)
      setSessionMode(mode)
      setSessionTopic(onlyTopic)
      setSessionSubject(sharedSubject)
      setQuestions(selected)
      setAnswers({})
      setCurrentIndex(0)
      setElapsed(0)
      setStartedAt(new Date().toISOString())
      setLimitSeconds(mode === 'mock' ? settings.examMinutes * 60 : null)
      questionStartRef.current = Date.now()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [questionsForProgram, settings.examMinutes, topic],
  )

  // Honour deep links such as /practice?program=ecele&topic=ecele-elecs-dc
  useEffect(() => {
    const search = searchParams.toString()
    if (!search || autoStartedRef.current === search) return
    const programParam = searchParams.get('program')
    const topicParam = searchParams.get('topic')
    const modeParam = searchParams.get('mode')
    const isMock = modeParam === 'mock'
    if (!isMock && !topicParam) return
    if (isMock) setSetupMode('mock')

    const programId = programParam && catalog.programs.some((item) => item.id === programParam)
      ? (programParam as ProgramId)
      : catalog.programs[0]?.id
    if (!programId) return

    const resolvedTopic = topicParam && catalog.topics.some((item) => item.id === topicParam)
      ? topicParam
      : null

    autoStartedRef.current = search
    setSetupProgram(programId)
    setSetupMode(isMock ? 'mock' : 'practice')
    const topicIds = resolvedTopic ? [resolvedTopic] : []
    setSelectedTopics(topicIds)
    setTopicSubjectFilter('all')
    startSession(programId, isMock ? 'mock' : 'practice', topicIds)
  }, [searchParams, catalog, startSession])

  /* --------------------------------- timer -------------------------------- */
  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => {
      setElapsed((value) => value + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [active])

  const remaining = limitSeconds === null ? null : Math.max(0, limitSeconds - elapsed)

  /* --------------------------------- answer -------------------------------- */
  const currentQuestion = questions[currentIndex]

  function selectOption(optionIndex: number) {
    if (!currentQuestion || submitting) return
    const alreadyAnswered = Boolean(answers[currentQuestion.id])
    if (alreadyAnswered && sessionMode === 'mock') return // exam answers are final
    const now = Date.now()
    const timeSeconds = Math.max(0, Math.round((now - questionStartRef.current) / 1000))
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedIndex: optionIndex,
        correct: optionIndex === currentQuestion.answerIndex,
        flagged: current[currentQuestion.id]?.flagged ?? false,
        timeSeconds: (current[currentQuestion.id]?.timeSeconds ?? 0) + timeSeconds,
      },
    }))
    questionStartRef.current = now
  }

  function toggleFlag() {
    if (!currentQuestion) return
    setAnswers((current) => {
      const previous = current[currentQuestion.id]
      const base: AnswerRecord = previous ?? {
        questionId: currentQuestion.id,
        selectedIndex: null,
        correct: false,
        flagged: false,
        timeSeconds: 0,
      }
      return { ...current, [currentQuestion.id]: { ...base, flagged: !base.flagged } }
    })
  }

  function goTo(index: number) {
    if (index < 0 || index >= questions.length) return
    setCurrentIndex(index)
    questionStartRef.current = Date.now()
  }

  /* --------------------------------- finish -------------------------------- */
  const finish = useCallback(async () => {
    if (submitting || questions.length === 0) return
    setSubmitting(true)
    const answerList = questions.map((question) => {
      const existing = answers[question.id]
      return existing ?? {
        questionId: question.id,
        selectedIndex: null,
        correct: false,
        flagged: false,
        timeSeconds: 0,
      }
    })
    const score = answerList.filter((answer) => answer.correct).length
    const attempt: Attempt = {
      id: createId(),
      userId: '', // filled by AppContext.recordAttempt from the active profile
      programId: sessionProgram,
      mode: sessionMode,
      topicId: sessionTopic,
      subjectId: sessionSubject,
      startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsed,
      score,
      total: questions.length,
      answers: answerList,
    }
    await recordAttempt(attempt)
    navigate(`/results/${attempt.id}`, { replace: true })
  }, [submitting, questions, answers, sessionProgram, sessionMode, sessionTopic, sessionSubject, startedAt, elapsed, recordAttempt, navigate])

  useEffect(() => {
    finishRef.current = () => void finish()
  }, [finish])

  useEffect(() => {
    if (active && remaining !== null && remaining <= 0) finishRef.current()
  }, [active, remaining])

  function exitQuiz() {
    if (window.confirm('Leave this session? Your answers will not be saved.')) {
      setQuestions([])
      navigate(sessionTopic ? `/programs/${sessionProgram}` : '/practice')
    }
  }

  /* --------------------------------- render -------------------------------- */
  const answeredCount = Object.values(answers).filter((answer) => answer.selectedIndex !== null).length
  const flaggedCount = Object.values(answers).filter((answer) => answer.flagged).length
  const activeProgram = program(sessionProgram)

  const revealFor = useCallback(
    (questionId: string) => {
      if (sessionMode === 'mock') return false
      const record = answers[questionId]
      return settings.instantFeedback && record != null && record.selectedIndex !== null
    },
    [sessionMode, settings.instantFeedback, answers],
  )

  const correctCount = useMemo(
    () => Object.values(answers).filter((answer) => answer.correct).length,
    [answers],
  )

  if (!active || !currentQuestion) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            Practice lab
          </p>
          <h1 className="heading mt-1 text-2xl sm:text-3xl">Set up your session</h1>
          <p className="mt-2 text-sm text-muted">
            Choose a program and study mode. You can always change questions after starting.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {/* Program */}
            <section className="card p-5 sm:p-6">
              <h2 className="heading mb-4 text-base">1. Choose a program</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {catalog.programs.map((item) => {
                  const styles = accentStyles[item.accent]
                  const selected = setupProgram === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSetupProgram(item.id)
                        setSelectedTopics([])
                        setTopicSubjectFilter('all')
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                        selected
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15 dark:bg-brand-500/10'
                          : 'border-line bg-surface-2 hover:border-brand-300',
                      )}
                    >
                      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl text-xl', styles.tile)}>
                        {item.glyph}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-xs font-bold tracking-wider ${styles.text}`}>{item.code}</span>
                        <span className="block truncate text-sm font-semibold">{item.shortName}</span>
                      </span>
                      {selected && <Check size={17} className="ml-auto shrink-0 text-brand-600" />}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Mode */}
            <section className="card p-5 sm:p-6">
              <h2 className="heading mb-4 text-base">2. Pick a mode</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  {
                    id: 'practice' as SetupMode,
                    icon: Target,
                    title: 'Topic practice',
                    text: 'Instant explanations after every answer. No pressure.',
                  },
                  {
                    id: 'mock' as SetupMode,
                    icon: Clock3,
                    title: 'Timed mock exam',
                    text: 'Mixed questions, countdown timer, results at the end.',
                  },
                ]).map(({ id, icon: Icon, title, text }) => {
                  const selected = setupMode === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSetupMode(id)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition',
                        selected
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15 dark:bg-brand-500/10'
                          : 'border-line bg-surface-2 hover:border-brand-300',
                      )}
                    >
                      <span className={cn('mb-3 grid size-9 place-items-center rounded-lg', selected ? 'bg-brand-600 text-white' : 'bg-bg-soft text-muted')}>
                        <Icon size={17} />
                      </span>
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">{text}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Scope */}
            <section className="card p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="heading text-base">3. Choose your scope</h2>
                <div className="flex gap-1">
                  <button type="button" className="btn btn-ghost !text-xs" onClick={() => setSelectedTopics([])}>
                    All topics
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost !text-xs"
                    onClick={() => setSelectedTopics(visibleTopics.map((item) => item.id))}
                  >
                    Select visible
                  </button>
                </div>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-muted">
                Pick one or more topics. Leave everything unchecked to cover all topics in{' '}
                <strong className="text-ink">{program(setupProgram)?.code}</strong>.
              </p>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Filter by subject</span>
                <select
                  className="input"
                  value={topicSubjectFilter}
                  onChange={(event) => setTopicSubjectFilter(event.target.value)}
                >
                  <option value="all">All subjects</option>
                  {catalog.subjects
                    .filter((item) => item.programId === setupProgram)
                    .map((item) => (
                      <option key={item.id} value={item.id}>{item.code} — {item.name}</option>
                    ))}
                </select>
              </label>

              <div className="scrollbar-thin max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-surface-2 p-3">
                {visibleTopics.map((item) => {
                  const checked = selectedTopics.includes(item.id)
                  const questionCount = catalog.questions.filter((q) => q.topicId === item.id).length
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition',
                        checked ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-surface',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedTopics((current) =>
                            checked
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id],
                          )
                        }
                        className="size-4 shrink-0 accent-brand-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.name}</span>
                        <span className="block text-[0.65rem] text-muted">
                          {catalog.subjects.find((subject) => subject.id === item.subjectId)?.code} · {questionCount} questions
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-[0.7rem] text-muted">
                {selectedTopics.length === 0
                  ? `All ${programTopics.length} topics`
                  : `${selectedTopics.length} topic${selectedTopics.length === 1 ? '' : 's'} selected`}{' '}
                · {availableQuestions.length} questions available
              </p>

              {setupMode === 'practice' ? (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
                    <span>Questions</span>
                    <span className="text-ink">{effectiveCount} available</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={Math.max(3, Math.min(30, maxQuestions))}
                    value={Math.min(setupCount, Math.max(3, maxQuestions))}
                    onChange={(event) => setSetupCount(Number(event.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                  <Sparkles size={15} className="mb-1.5 text-brand-500" />
                  Timed exam · <strong className="text-ink">{settings.examMinutes} minutes</strong>.
                  Answers are locked once selected.
                </div>
              )}
            </section>
          </div>

          {/* Summary */}
          <aside className="card h-fit p-5 sm:p-6">
            <h2 className="heading mb-4 text-base">Session summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Program</dt>
                <dd className="font-semibold">{program(setupProgram)?.code}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Mode</dt>
                <dd className="font-semibold">{setupMode === 'mock' ? 'Timed mock' : 'Practice'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Scope</dt>
                <dd className="max-w-40 truncate text-right font-semibold">
                  {selectedTopics.length === 0
                    ? 'All topics'
                    : selectedTopics.length === 1
                      ? topic(selectedTopics[0])?.name
                      : `${selectedTopics.length} topics`}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Items</dt>
                <dd className="font-semibold">
                  {setupMode === 'mock' ? Math.min(settings.examMinutes * 2, maxQuestions) : effectiveCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Feedback</dt>
                <dd className="font-semibold">{setupMode === 'mock' ? 'After submit' : settings.instantFeedback ? 'Instant' : 'After submit'}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="btn btn-primary mt-6 w-full"
              disabled={availableQuestions.length === 0}
              onClick={() => startSession(setupProgram, setupMode, selectedTopics)}
            >
              <Target size={17} /> Start session
            </button>
            {availableQuestions.length === 0 && (
              <p className="mt-2 text-center text-xs text-rose-500">No questions available for this scope.</p>
            )}
            <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted">
              Your answers and time are saved when you finish the session.
            </p>
          </aside>
        </div>
      </div>
    )
  }

  /* -------------------------------- Quiz UI -------------------------------- */
  const styles = accentStyles[activeProgram?.accent ?? 'indigo']
  const canReveal = revealFor(currentQuestion.id)
  const selected = answers[currentQuestion.id]?.selectedIndex ?? null

  return (
    <div className="animate-fade-up">
      {/* Session bar */}
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <button type="button" onClick={exitQuiz} className="btn btn-ghost size-9 !px-0" title="Exit session">
          <X size={18} />
        </button>
        <span className={`grid size-9 place-items-center rounded-lg text-lg ${styles.tile}`}>
          {activeProgram?.glyph}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">
            {sessionMode === 'mock' ? 'Mock exam' : 'Practice drill'} · {activeProgram?.code}
          </p>
          <p className="truncate text-[0.7rem] text-muted">
            {sessionTopic ? topic(sessionTopic)?.name : 'All subjects'} · {questions.length} items
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Badge tone={answeredCount === questions.length ? 'success' : 'neutral'}>
            {answeredCount}/{questions.length} answered
          </Badge>
          <Badge tone={sessionMode === 'mock' ? 'warning' : 'neutral'} className="font-mono">
            <Clock3 size={12} />
            {remaining === null ? formatClock(elapsed) : formatClock(remaining)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Question */}
        <div className="card p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="chip">Question {currentIndex + 1} of {questions.length}</span>
              <Badge tone={currentQuestion.difficulty === 'hard' ? 'danger' : currentQuestion.difficulty === 'medium' ? 'warning' : 'success'}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <button
              type="button"
              onClick={toggleFlag}
              className={cn(
                'btn !px-3 !py-1.5 !text-xs',
                answers[currentQuestion.id]?.flagged ? 'btn-primary' : 'btn-secondary',
              )}
            >
              <Flag size={14} fill={answers[currentQuestion.id]?.flagged ? 'currentColor' : 'none'} />
              {answers[currentQuestion.id]?.flagged ? 'Flagged' : 'Flag for review'}
            </button>
          </div>

          <ProgressBar value={(answeredCount / questions.length) * 100} className="mb-6" barClassName={styles.bar} />

          <h2 className="heading mb-6 text-lg leading-snug sm:text-xl">{currentQuestion.prompt}</h2>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selected === index
              const isCorrect = index === currentQuestion.answerIndex
              let stateClass = 'border-line bg-surface hover:border-brand-300 hover:bg-surface-2'
              if (isSelected) stateClass = 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15 dark:bg-brand-500/10'
              if (canReveal && isCorrect) {
                stateClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
              } else if (canReveal && isSelected && !isCorrect) {
                stateClass = 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
              }
              return (
                <button
                  key={index}
                  type="button"
                  disabled={sessionMode === 'mock' && selected !== null}
                  onClick={() => selectOption(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition sm:p-4',
                    stateClass,
                  )}
                >
                  <span className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold',
                    isSelected ? 'bg-brand-600 text-white' : 'bg-bg-soft text-muted',
                    canReveal && isCorrect && 'bg-emerald-600 text-white',
                    canReveal && isSelected && !isCorrect && 'bg-rose-600 text-white',
                  )}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {canReveal && isCorrect && <Check size={17} className="shrink-0 text-emerald-600" />}
                  {canReveal && isSelected && !isCorrect && <X size={17} className="shrink-0 text-rose-600" />}
                </button>
              )
            })}
          </div>

          {canReveal && (
            <div className={cn(
              'animate-fade-up mt-5 rounded-xl border p-4',
              selected === currentQuestion.answerIndex
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-500/10'
                : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-500/10',
            )}>
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <CircleHelp size={14} />
                {selected === currentQuestion.answerIndex ? 'Correct' : 'Not quite'}
              </p>
              <p className="text-sm leading-relaxed text-ink/85">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => goTo(currentIndex - 1)}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {currentIndex === questions.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => void finish()} disabled={submitting}>
                <Send size={16} /> {submitting ? 'Saving…' : 'Submit & see results'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => goTo(currentIndex + 1)}>
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Palette */}
        <aside className="card h-fit p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="heading text-sm">Question map</h3>
            <span className="text-[0.7rem] text-muted">{answeredCount} done</span>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-5 lg:grid-cols-5">
            {questions.map((question, index) => {
              const record = answers[question.id]
              const isAnswered = record?.selectedIndex !== null && Boolean(record)
              const isCurrent = index === currentIndex
              const reveal = revealFor(question.id)
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    'relative grid size-9 place-items-center rounded-lg border text-xs font-bold transition',
                    isCurrent && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface',
                    isAnswered && !reveal && 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
                    reveal && record?.correct && 'border-emerald-400 bg-emerald-500 text-white',
                    reveal && record && !record.correct && 'border-rose-400 bg-rose-500 text-white',
                    !isAnswered && 'border-line bg-surface-2 text-muted hover:border-brand-300',
                  )}
                  title={`Question ${index + 1}${record?.flagged ? ' (flagged)' : ''}`}
                >
                  {index + 1}
                  {record?.flagged && (
                    <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-surface" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 space-y-2 border-t border-line pt-4 text-[0.7rem] text-muted">
            <div className="flex items-center gap-2"><span className="size-3 rounded bg-brand-200" /> Answered</div>
            <div className="flex items-center gap-2"><span className="size-3 rounded bg-bg-soft" /> Not answered</div>
            <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-amber-500" /> Flagged ({flaggedCount})</div>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-2 text-[0.7rem] font-semibold text-muted">Running score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</span>
              <span className="text-xs text-muted">/ {answeredCount} answered</span>
            </div>
            <button
              type="button"
              onClick={() => void finish()}
              className="btn btn-secondary mt-4 w-full !text-xs"
              disabled={submitting}
            >
              <RotateCcw size={14} /> Finish early
            </button>
          </div>
        </aside>
      </div>

      {sessionMode === 'mock' && (
        <p className="mt-4 text-center text-[0.7rem] text-muted">
          Mock exam answers are locked once selected. Explanations appear on the results page.
        </p>
      )}
    </div>
  )
}
