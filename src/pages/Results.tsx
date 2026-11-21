import { ArrowLeft, ArrowRight, Check, Clock3, Flag, RotateCcw, Target, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar, ProgressRing } from '../components/ui'
import { useApp } from '../context/AppContext'
import { formatDateTime, formatDuration, percent } from '../lib/utils'

export function Results() {
  const { attemptId = '' } = useParams()
  const { attempts, catalog, program, subject, topic } = useApp()
  const [showAll, setShowAll] = useState(false)

  const attempt = attempts.find((item) => item.id === attemptId)

  if (!attempt) {
    return (
      <EmptyState
        icon="📭"
        title="Result not available"
        description="This session may belong to a different account, or its data was cleared. Your other results are safe in Progress."
        action={<Link to="/progress" className="btn btn-primary">View progress <ArrowRight size={15} /></Link>}
      />
    )
  }

  const score = percent(attempt.score, attempt.total)
  const itemProgram = program(attempt.programId)
  const styles = accentStyles[itemProgram?.accent ?? 'indigo']
  const wrong = attempt.answers.filter((answer) => !answer.correct).length
  const skipped = attempt.answers.filter((answer) => answer.selectedIndex === null).length
  const flagged = attempt.answers.filter((answer) => answer.flagged).length

  const verdict =
    score >= 85
      ? { title: 'Excellent work!', text: 'You’re in strong shape for this area. Keep the momentum with timed runs.', tone: 'success' as const }
      : score >= 70
        ? { title: 'Solid pass', text: 'Review the missed items below, then take another drill to lock in the concepts.', tone: 'brand' as const }
        : score >= 50
          ? { title: 'Getting there', text: 'Focus on the explanations and weak topics — a few more sessions will move the needle.', tone: 'warning' as const }
          : { title: 'Keep going', text: 'Everyone starts somewhere. Work through the topic notes and flashcards, then retry.', tone: 'danger' as const }

  const retakeParams = new URLSearchParams({ program: attempt.programId })
  if (attempt.mode === 'mock') retakeParams.set('mode', 'mock')
  else if (attempt.topicId) retakeParams.set('topic', attempt.topicId)

  const visibleAnswers = showAll ? attempt.answers : attempt.answers.slice(0, 5)

  return (
    <div>
      <Link to="/progress" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} /> All results
      </Link>

      <PageHeader
        eyebrow={attempt.mode === 'mock' ? 'Mock exam complete' : 'Practice complete'}
        title="Session results"
        description={`${itemProgram?.code} · ${attempt.topicId ? topic(attempt.topicId)?.name : 'Mixed topics'} · ${formatDateTime(attempt.completedAt)}`}
        actions={
          <>
            <Link to={`/practice?${retakeParams.toString()}`} className="btn btn-secondary">
              <RotateCcw size={16} /> Retake
            </Link>
            <Link to="/practice" className="btn btn-primary">
              <Target size={16} /> New session
            </Link>
          </>
        }
      />

      <div className="card mb-6 overflow-hidden">
        <div className={`h-1.5 w-full ${styles.bar}`} />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <ProgressRing value={score} size={96} stroke={9} barClassName={styles.ring}>
              <span>
                <span className="text-2xl font-bold">{score}%</span>
              </span>
            </ProgressRing>
            <div>
              <Badge tone={verdict.tone} className="mb-2">
                <Trophy size={12} /> {verdict.title}
              </Badge>
              <h2 className="heading text-xl">
                {attempt.score} correct out of {attempt.total}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted">{verdict.text}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Correct', value: attempt.score, tone: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Incorrect', value: wrong, tone: 'text-rose-600 dark:text-rose-400' },
              { label: 'Skipped', value: skipped, tone: 'text-amber-600 dark:text-amber-400' },
              { label: 'Time', value: formatDuration(attempt.durationSeconds), tone: 'text-ink' },
            ].map((item) => (
              <div key={item.label} className="min-w-20 rounded-xl bg-surface-2 p-3 text-center">
                <p className={`text-lg font-bold ${item.tone}`}>{item.value}</p>
                <p className="text-[0.65rem] text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-subject breakdown */}
      {(() => {
        const breakdown = new Map<string, { correct: number; total: number }>()
        for (const answer of attempt.answers) {
          const question = catalog.questions.find((item) => item.id === answer.questionId)
          if (!question) continue
          const entry = breakdown.get(question.subjectId) ?? { correct: 0, total: 0 }
          entry.total += 1
          if (answer.correct) entry.correct += 1
          breakdown.set(question.subjectId, entry)
        }
        if (breakdown.size === 0) return null
        return (
          <section className="card mb-6 p-5 sm:p-6">
            <h2 className="heading mb-4 text-base">Subject breakdown</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[...breakdown.entries()].map(([subjectId, stats]) => {
                const accuracy = percent(stats.correct, stats.total)
                return (
                  <div key={subjectId}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold">{subject(subjectId)?.name ?? subjectId}</span>
                      <span className="text-muted">{stats.correct}/{stats.total} · {accuracy}%</span>
                    </div>
                    <ProgressBar
                      value={accuracy}
                      barClassName={accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Answer review */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="heading text-lg">Answer review</h2>
            <p className="text-xs text-muted">
              {flagged > 0 ? `${flagged} item${flagged > 1 ? 's' : ''} flagged for follow-up.` : 'Work through each explanation.'}
            </p>
          </div>
          {attempt.answers.length > 5 && (
            <button type="button" className="btn btn-secondary !text-xs" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Show less' : `Show all ${attempt.answers.length}`}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {visibleAnswers.map((answer, index) => {
            const question = catalog.questions.find((item) => item.id === answer.questionId)
            if (!question) return null
            const chosen = answer.selectedIndex
            return (
              <div key={answer.questionId} className="card p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="chip">Item {index + 1}</span>
                  <Badge tone="neutral">{topic(question.topicId)?.name}</Badge>
                  <Badge tone={answer.correct ? 'success' : 'danger'}>
                    {answer.correct ? <Check size={11} /> : <X size={11} />}
                    {answer.correct ? 'Correct' : chosen === null ? 'Skipped' : 'Incorrect'}
                  </Badge>
                  {answer.flagged && <Badge tone="warning"><Flag size={11} /> Flagged</Badge>}
                  <span className="ml-auto flex items-center gap-1 text-[0.7rem] text-muted">
                    <Clock3 size={12} /> {answer.timeSeconds}s
                  </span>
                </div>

                <p className="mb-3 text-sm font-semibold leading-relaxed">{question.prompt}</p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.answerIndex
                    const isChosen = optionIndex === chosen
                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'
                            : isChosen
                              ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-200'
                              : 'border-line bg-surface-2 text-muted'
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && <Check size={13} />}
                        {isChosen && !isCorrect && <X size={13} />}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                  <strong className="text-ink">Explanation: </strong>
                  {question.explanation}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
