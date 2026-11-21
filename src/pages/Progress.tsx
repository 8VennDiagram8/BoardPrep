import { ArrowRight, BarChart3, Clock3, Flame, Target, Trash2, TrendingUp, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar, StatCard } from '../components/ui'
import { useApp } from '../context/AppContext'
import { formatDate, formatDuration, percent } from '../lib/utils'

export function Progress() {
  const {
    catalog,
    attempts,
    loadingAttempts,
    program,
    topic,
    programMastery,
    topicMastery,
    clearProgress,
  } = useApp()
  const [filterProgram, setFilterProgram] = useState('all')
  const [showAllHistory, setShowAllHistory] = useState(false)

  const allAnswers = attempts.flatMap((attempt) => attempt.answers)
  const answered = allAnswers.length
  const correct = allAnswers.filter((answer) => answer.correct).length
  const accuracy = percent(correct, answered)
  const totalTime = attempts.reduce((sum, item) => sum + item.durationSeconds, 0)
  const best = attempts.reduce((max, item) => Math.max(max, percent(item.score, item.total)), 0)
  const highestStreak = useMemo(() => {
    const days = new Set(attempts.map((item) => item.completedAt.slice(0, 10)))
    let streak = 0
    const cursor = new Date()
    for (;;) {
      const key = cursor.toISOString().slice(0, 10)
      if (!days.has(key)) break
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }, [attempts])

  const trend = [...attempts].reverse().slice(-12).map((attempt) => ({
    attempt,
    value: percent(attempt.score, attempt.total),
  }))

  const topicRows = catalog.topics
    .filter((item) => filterProgram === 'all' || item.programId === filterProgram)
    .map((item) => ({ topic: item, mastery: topicMastery(item.id) }))
    .sort((a, b) => {
      const aTouched = a.mastery.answered > 0 ? 1 : 0
      const bTouched = b.mastery.answered > 0 ? 1 : 0
      if (aTouched !== bTouched) return bTouched - aTouched
      return a.mastery.accuracy - b.mastery.accuracy
    })

  const history = showAllHistory ? attempts : attempts.slice(0, 8)

  if (loadingAttempts) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="size-7 animate-spin rounded-full border-2 border-line border-t-brand-500" />
          <span className="text-sm">Loading your progress…</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your numbers"
        title="Progress & analytics"
        description="Every attempt tells a story. Use these numbers to decide what to study next."
        actions={
          attempts.length > 0 ? (
            <button
              type="button"
              className="btn btn-secondary !text-rose-600 dark:!text-rose-400"
              onClick={() => {
                if (window.confirm('Delete all your saved attempts and reset your progress? This cannot be undone.')) {
                  void clearProgress()
                }
              }}
            >
              <Trash2 size={16} /> Clear progress
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Target size={18} />} label="Total attempts" value={attempts.length} hint={`${answered} questions answered`} />
        <StatCard icon={<TrendingUp size={18} />} label="Overall accuracy" value={`${accuracy}%`} hint={`${correct} correct answers`} tone="emerald" />
        <StatCard icon={<Trophy size={18} />} label="Best score" value={`${best}%`} hint="Single session high" tone="amber" />
        <StatCard icon={<Clock3 size={18} />} label="Study time" value={formatDuration(totalTime)} hint="All sessions combined" tone="cyan" />
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Your progress starts here"
          description="Complete a practice drill or mock exam and your accuracy, trends and topic mastery will show up here."
          action={<Link to="/practice" className="btn btn-primary">Start a session <ArrowRight size={15} /></Link>}
        />
      ) : (
        <>
          {/* Trend */}
          <section className="card mb-6 p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="heading text-base">Accuracy trend</h2>
                <p className="text-xs text-muted">Your last {trend.length} sessions</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="warning"><Flame size={12} /> {highestStreak}-day streak</Badge>
                <Badge tone="brand"><BarChart3 size={12} /> Avg {Math.round(trend.reduce((sum, item) => sum + item.value, 0) / Math.max(1, trend.length))}%</Badge>
              </div>
            </div>
            <div className="flex h-44 items-end gap-2">
              {trend.map(({ attempt, value }) => {
                const styles = accentStyles[program(attempt.programId)?.accent ?? 'indigo']
                return (
                  <Link
                    key={attempt.id}
                    to={`/results/${attempt.id}`}
                    className="group flex h-full min-w-6 flex-1 flex-col items-center justify-end gap-2"
                    title={`${value}% · ${formatDate(attempt.completedAt)}`}
                  >
                    <span className="text-[0.65rem] font-bold text-muted opacity-0 transition group-hover:opacity-100">{value}%</span>
                    <div
                      className={`w-full max-w-12 rounded-t-md ${styles.bar} opacity-80 transition group-hover:opacity-100`}
                      style={{ height: `${Math.max(4, value)}%` }}
                    />
                    <span className="text-[0.6rem] text-muted">{attempt.mode === 'mock' ? 'M' : 'P'}</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between text-[0.65rem] text-muted">
              <span>Older</span><span>Recent</span>
            </div>
          </section>

          {/* Program mastery */}
          <section className="mb-6">
            <h2 className="heading mb-4 text-lg">Program mastery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {catalog.programs.map((item) => {
                const mastery = programMastery(item.id)
                const styles = accentStyles[item.accent]
                return (
                  <div key={item.id} className="card p-5">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 place-items-center rounded-xl text-xl ${styles.tile}`}>{item.glyph}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold tracking-wider ${styles.text}`}>{item.code}</p>
                        <p className="truncate text-sm font-semibold">{item.shortName}</p>
                      </div>
                      <span className="text-xl font-bold">{mastery.accuracy}%</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-sm font-bold">{mastery.answered}</p><p className="text-[0.65rem] text-muted">Answers</p></div>
                      <div className="border-x border-line"><p className="text-sm font-bold">{mastery.topicsTouched}/{mastery.topicsTotal}</p><p className="text-[0.65rem] text-muted">Topics</p></div>
                      <div><p className="text-sm font-bold">{mastery.lastPracticed ? formatDate(mastery.lastPracticed) : '—'}</p><p className="text-[0.65rem] text-muted">Last practiced</p></div>
                    </div>
                    <Link to={`/practice?program=${item.id}`} className="btn btn-secondary mt-4 w-full !text-xs">
                      Review {item.code} <ArrowRight size={14} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Topic mastery */}
          <section className="card mb-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div>
                <h2 className="heading text-base">Topic mastery</h2>
                <p className="text-xs text-muted">Weakest topics appear first.</p>
              </div>
              <select className="input !w-auto min-w-40 !py-1.5 !text-xs" value={filterProgram} onChange={(event) => setFilterProgram(event.target.value)}>
                <option value="all">All programs</option>
                {catalog.programs.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
              </select>
            </div>
            <div className="divide-y divide-line">
              {topicRows.map(({ topic: item, mastery }) => (
                <Link
                  key={item.id}
                  to={`/practice?program=${item.programId}&topic=${item.id}`}
                  className="flex items-center gap-4 p-4 transition hover:bg-surface-2 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <Badge>{program(item.programId)?.code}</Badge>
                    </div>
                    <ProgressBar
                      value={mastery.accuracy}
                      className="mt-2 max-w-md"
                      barClassName={mastery.answered === 0 ? 'bg-line' : mastery.accuracy >= 75 ? 'bg-emerald-500' : mastery.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">{mastery.answered > 0 ? `${mastery.accuracy}%` : '—'}</p>
                    <p className="text-[0.65rem] text-muted">{mastery.answered} answers</p>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-muted" />
                </Link>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="heading text-base">Session history</h2>
              {attempts.length > 8 && (
                <button type="button" className="btn btn-ghost !text-xs" onClick={() => setShowAllHistory((value) => !value)}>
                  {showAllHistory ? 'Show less' : 'View all'}
                </button>
              )}
            </div>
            <div className="divide-y divide-line">
              {history.map((attempt) => {
                const score = percent(attempt.score, attempt.total)
                return (
                  <Link key={attempt.id} to={`/results/${attempt.id}`} className="flex items-center gap-3 p-4 transition hover:bg-surface-2 sm:px-5">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm ${accentStyles[program(attempt.programId)?.accent ?? 'indigo'].tile}`}>
                      {attempt.mode === 'mock' ? '⏱️' : '✏️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{attempt.mode === 'mock' ? 'Mock exam' : 'Practice'} · {program(attempt.programId)?.code}</p>
                      <p className="truncate text-[0.7rem] text-muted">
                        {attempt.topicId ? topic(attempt.topicId)?.name : 'Mixed topics'} · {formatDate(attempt.completedAt)}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted sm:block">{formatDuration(attempt.durationSeconds)}</span>
                    <span className={`w-12 text-right text-sm font-bold ${score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {score}%
                    </span>
                    <ArrowRight size={15} className="text-muted" />
                  </Link>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
