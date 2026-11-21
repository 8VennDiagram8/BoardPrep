import { ArrowLeft, ArrowRight, ChevronDown, Clock3, Layers3, Play, Target } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accentStyles, Badge, EmptyState, PageHeader, ProgressBar, ProgressRing } from '../components/ui'
import { useApp } from '../context/AppContext'
import { percent } from '../lib/utils'

export function ProgramDetail() {
  const { programId = '' } = useParams()
  const {
    catalog,
    program,
    subjectsForProgram,
    topicsForSubject,
    questionsForTopic,
    programMastery,
    topicMastery,
  } = useApp()
  const [openSubjects, setOpenSubjects] = useState<string[]>([])

  const selected = program(programId)
  if (!selected) {
    return (
      <EmptyState
        icon="🔍"
        title="Program not found"
        description="That program isn’t in the catalog yet."
        action={<Link to="/programs" className="btn btn-primary">Back to programs</Link>}
      />
    )
  }

  const styles = accentStyles[selected.accent]
  const subjects = subjectsForProgram(selected.id)
  const mastery = programMastery(selected.id)
  const progress = percent(mastery.topicsTouched, mastery.topicsTotal)
  const questionCount = catalog.questions.filter((question) => question.programId === selected.id).length
  const cardCount = catalog.flashcards.filter((card) => card.programId === selected.id).length

  function toggleSubject(id: string) {
    setOpenSubjects((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <div>
      <Link to="/programs" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} /> All programs
      </Link>

      <PageHeader
        eyebrow={selected.code}
        title={selected.shortName}
        description={selected.description}
        actions={
          <>
            <Link to={`/practice?program=${selected.id}`} className="btn btn-primary">
              <Target size={16} /> Practice
            </Link>
            <Link to={`/practice?program=${selected.id}&mode=mock`} className="btn btn-secondary">
              <Clock3 size={16} /> Mock exam
            </Link>
          </>
        }
      />

      <div className="card mb-7 overflow-hidden">
        <div className={`h-1.5 w-full ${styles.bar}`} />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className={`grid size-16 shrink-0 place-items-center rounded-2xl text-3xl ${styles.tile}`}>
              {selected.glyph}
            </span>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted">{selected.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="neutral">{subjects.length} subjects</Badge>
                <Badge tone="neutral">{mastery.topicsTotal} topics</Badge>
                <Badge tone="neutral">{questionCount} questions</Badge>
                <Badge tone="neutral">{cardCount} flashcards</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
            <ProgressRing value={progress} barClassName={styles.ring} size={72} />
            <div>
              <p className="text-xs font-semibold text-muted">Syllabus coverage</p>
              <p className="heading mt-0.5 text-lg">{mastery.topicsTouched} of {mastery.topicsTotal} topics</p>
              <p className="mt-0.5 text-xs text-muted">
                {mastery.answered === 0 ? 'Start your first drill' : `${mastery.answered} answers · ${mastery.accuracy}% correct`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="heading text-lg">Subjects & topics</h2>
        <Link to={`/flashcards?program=${selected.id}`} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <Layers3 size={14} /> Study flashcards <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {subjects.map((item) => {
          const topics = topicsForSubject(item.id)
          const questionTotal = topics.reduce((sum, topic) => sum + questionsForTopic(topic.id).length, 0)
          const correct = topics.reduce((sum, topic) => sum + topicMastery(topic.id).correct, 0)
          const answered = topics.reduce((sum, topic) => sum + topicMastery(topic.id).answered, 0)
          const open = openSubjects.includes(item.id)

          return (
            <div key={item.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSubject(item.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface-2 sm:p-5"
                aria-expanded={open}
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-lg ${styles.tile}`}>
                  {item.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="heading text-sm sm:text-base">{item.name}</h3>
                    <Badge>{item.code}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{item.description}</p>
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                  <div className="mb-1 flex justify-between text-[0.65rem] font-semibold text-muted">
                    <span>{topics.length} topics</span>
                    <span>{questionTotal} items</span>
                  </div>
                  <ProgressBar value={percent(correct, answered)} barClassName={styles.bar} className="h-1" />
                </div>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="animate-fade-up border-t border-line bg-surface-2/50 px-3 py-3 sm:px-5">
                  <div className="grid gap-2">
                    {topics.map((topic) => {
                      const topicQuestions = questionsForTopic(topic.id)
                      const topicStats = topicMastery(topic.id)
                      return (
                        <div
                          key={topic.id}
                          className="flex flex-col gap-3 rounded-xl bg-surface p-3.5 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">{topic.name}</p>
                              {topicStats.answered > 0 && (
                                <Badge tone={topicStats.accuracy >= 75 ? 'success' : topicStats.accuracy >= 50 ? 'warning' : 'danger'}>
                                  {topicStats.accuracy}%
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted">{topic.description}</p>
                            <div className="mt-2 flex items-center gap-3">
                              <ProgressBar value={topicStats.accuracy} className="h-1 max-w-52" barClassName={styles.bar} />
                              <span className="text-[0.65rem] text-muted">{topicQuestions.length} questions</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Link
                              to={`/practice?program=${selected.id}&topic=${topic.id}`}
                              className="btn btn-secondary !px-3 !py-1.5 !text-xs"
                            >
                              <Play size={13} /> Practice
                            </Link>
                            <Link
                              to={`/flashcards?program=${selected.id}&topic=${topic.id}`}
                              className="btn btn-secondary !px-3 !py-1.5 !text-xs"
                            >
                              <Layers3 size={13} /> Cards
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
