import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar, ProgressRing, StatCard } from '../components/ui'
import { formatDate, formatDuration, greeting, percent } from '../lib/utils'

export function Dashboard() {
  const { user } = useAuth()
  const {
    catalog,
    attempts,
    program,
    subject,
    topic,
    programMastery,
    topicMastery,
  } = useApp()

  const allAnswers = attempts.flatMap((attempt) => attempt.answers)
  const answered = allAnswers.length
  const correct = allAnswers.filter((answer) => answer.correct).length
  const accuracy = percent(correct, answered)
  const mocks = attempts.filter((attempt) => attempt.mode === 'mock').length
  const touchedTopics = new Set(
    allAnswers
      .map((answer) => catalog.questions.find((question) => question.id === answer.questionId)?.topicId)
      .filter(Boolean),
  ).size

  const weakTopics = catalog.topics
    .map((item) => ({ topic: item, mastery: topicMastery(item.id) }))
    .filter((item) => item.mastery.answered > 0)
    .sort((a, b) => a.mastery.accuracy - b.mastery.accuracy)
    .slice(0, 3)

  const firstName = (user?.name ?? 'Engineer').split(' ')[0]

  return (
    <div>
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Your review dashboard"
        description="Pick up where you left off or start a fresh drill. Small, steady sessions beat cramming."
        actions={
          <span className="chip">
            <CalendarDays size={13} />
            {new Intl.DateTimeFormat('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            }).format(new Date())}
          </span>
        }
      />

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-600 p-6 text-white shadow-xl shadow-brand-700/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 right-32 size-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Badge className="mb-3 border-white/20 bg-white/15 text-white">
              <Sparkles size={12} /> Exam-ready routine
            </Badge>
            <h2 className="heading text-2xl leading-snug sm:text-3xl">
              {answered === 0
                ? 'Start with a short diagnostic drill.'
                : `You’ve answered ${answered.toLocaleString()} questions. Keep the streak alive.`}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Choose a program, work through a topic, then test yourself under time pressure. Every
              attempt sharpens your weak spots.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/practice" className="btn bg-white text-brand-700 hover:bg-white/90">
                <Play size={16} fill="currentColor" /> Start practicing
              </Link>
              <Link
                to="/practice?mode=mock"
                className="btn border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <Clock3 size={16} /> Timed mock exam
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="grid size-12 place-items-center rounded-xl bg-white/15">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold leading-none">{accuracy}%</p>
              <p className="mt-1 text-xs text-white/75">Overall accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Target size={18} />} label="Questions answered" value={answered.toLocaleString()} hint="Across all programs" />
        <StatCard icon={<Zap size={18} />} label="Accuracy" value={`${accuracy}%`} hint="Correct over attempted" tone="emerald" />
        <StatCard icon={<Clock3 size={18} />} label="Mock exams" value={mocks} hint="Timed full-length runs" tone="amber" />
        <StatCard icon={<BookOpen size={18} />} label="Topics covered" value={`${touchedTopics}/${catalog.topics.length}`} hint="Unique topics practiced" tone="cyan" />
      </div>

      {/* Programs */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="heading text-lg">Your programs</h2>
            <p className="text-xs text-muted">Two boards, one focused workspace.</p>
          </div>
          <Link to="/programs" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Browse all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {catalog.programs.map((item) => {
            const styles = accentStyles[item.accent]
            const mastery = programMastery(item.id)
            const questionCount = catalog.questions.filter((q) => q.programId === item.id).length
            const cardCount = catalog.flashcards.filter((f) => f.programId === item.id).length
            const progress = percent(mastery.topicsTouched, mastery.topicsTotal)
            return (
              <div key={item.id} className="card animate-fade-up p-5">
                <div className="flex items-start gap-4">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ${styles.tile}`}>
                    {item.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold tracking-wider ${styles.text}`}>{item.code}</span>
                      {item.id === 'ecele' && <Badge tone="brand">Most popular</Badge>}
                    </div>
                    <h3 className="heading mt-1 text-base leading-snug">{item.shortName}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{item.description}</p>
                  </div>
                  <ProgressRing value={progress} barClassName={styles.ring} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
                  <div>
                    <p className="text-sm font-bold">{mastery.topicsTotal}</p>
                    <p className="text-[0.65rem] text-muted">Topics</p>
                  </div>
                  <div className="border-x border-line">
                    <p className="text-sm font-bold">{questionCount}</p>
                    <p className="text-[0.65rem] text-muted">Questions</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{cardCount}</p>
                    <p className="text-[0.65rem] text-muted">Flashcards</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/programs/${item.id}`} className="btn btn-secondary flex-1">
                    Review topics <ArrowRight size={15} />
                  </Link>
                  <Link to={`/practice?program=${item.id}&mode=mock`} className="btn btn-primary">
                    <Clock3 size={15} /> Mock exam
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Weak topics */}
        <section>
          <h2 className="heading mb-4 text-lg">Focus areas</h2>
          {weakTopics.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No focus areas yet"
              description="Answer a few questions and we’ll surface the topics that need the most attention."
              action={<Link to="/practice" className="btn btn-primary">Take a drill <ArrowRight size={15} /></Link>}
            />
          ) : (
            <div className="card divide-y divide-line">
              {weakTopics.map(({ topic: item, mastery }) => {
                const parentSubject = subject(item.subjectId)
                const styles = accentStyles[program(item.programId)?.accent ?? 'indigo']
                return (
                  <Link
                    key={item.id}
                    to={`/practice?program=${item.programId}&topic=${item.id}`}
                    className="flex items-center gap-3 p-4 transition hover:bg-surface-2"
                  >
                    <span className={`size-2 shrink-0 rounded-full ${styles.bar}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="truncate text-[0.7rem] text-muted">
                        {program(item.programId)?.code} · {parentSubject?.name}
                      </p>
                      <ProgressBar
                        value={mastery.accuracy}
                        className="mt-2 h-1"
                        barClassName={mastery.accuracy < 60 ? 'bg-rose-500' : 'bg-amber-500'}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{mastery.accuracy}%</p>
                      <p className="text-[0.65rem] text-muted">{mastery.answered} answered</p>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading text-lg">Recent activity</h2>
            <Link to="/progress" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
              View all
            </Link>
          </div>
          {attempts.length === 0 ? (
            <EmptyState icon="📈" title="Nothing here yet" description="Your completed drills and mock exams will appear here." />
          ) : (
            <div className="card divide-y divide-line">
              {attempts.slice(0, 4).map((attempt) => {
                const item = program(attempt.programId)
                const styles = accentStyles[item?.accent ?? 'indigo']
                const score = percent(attempt.score, attempt.total)
                return (
                  <div key={attempt.id} className="flex items-center gap-3 p-4">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm ${styles.tile}`}>
                      {attempt.mode === 'mock' ? '⏱️' : '✏️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {attempt.mode === 'mock' ? 'Mock exam' : 'Practice drill'} · {item?.code}
                      </p>
                      <p className="truncate text-[0.7rem] text-muted">
                        {attempt.topicId ? topic(attempt.topicId)?.name : 'Mixed topics'} ·{' '}
                        {formatDate(attempt.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {score}%
                      </p>
                      <p className="text-[0.65rem] text-muted">{formatDuration(attempt.durationSeconds)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
