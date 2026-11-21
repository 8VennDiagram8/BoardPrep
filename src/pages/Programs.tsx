import { ArrowRight, BookOpen, Clock3, Layers3, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import { accentStyles, Badge, PageHeader, ProgressBar } from '../components/ui'
import { useApp } from '../context/AppContext'
import { percent } from '../lib/utils'

export function Programs() {
  const { catalog, programMastery, questionsForProgram, flashcardsForProgram, subjectsForProgram } = useApp()

  return (
    <div>
      <PageHeader
        eyebrow="Choose your board"
        title="Review programs"
        description="Each program has its own subjects, question bank, mock exams and flashcards. Add more programs any time."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {catalog.programs.map((program) => {
          const styles = accentStyles[program.accent]
          const mastery = programMastery(program.id)
          const progress = percent(mastery.topicsTouched, mastery.topicsTotal)
          return (
            <div key={program.id} className="card group animate-fade-up overflow-hidden">
              <div className={`h-1.5 w-full ${styles.bar}`} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${styles.tile}`}>
                    {program.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="heading text-xl">{program.code}</h2>
                      <Badge tone="brand">{subjectsForProgram(program.id).length} subjects</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink/90">{program.shortName}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted">{program.description}</p>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
                  <div>
                    <p className="text-base font-bold">{mastery.topicsTotal}</p>
                    <p className="text-[0.65rem] text-muted">Topics</p>
                  </div>
                  <div className="border-x border-line">
                    <p className="text-base font-bold">{questionsForProgram(program.id).length}</p>
                    <p className="text-[0.65rem] text-muted">Questions</p>
                  </div>
                  <div>
                    <p className="text-base font-bold">{flashcardsForProgram(program.id).length}</p>
                    <p className="text-[0.65rem] text-muted">Flashcards</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted">Your coverage</span>
                    <span className={`font-bold ${styles.text}`}>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} barClassName={styles.bar} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/programs/${program.id}`} className="btn btn-primary">
                    <BookOpen size={16} /> Explore subjects <ArrowRight size={15} />
                  </Link>
                  <Link to={`/practice?program=${program.id}&mode=mock`} className="btn btn-secondary">
                    <Clock3 size={16} /> Mock exam
                  </Link>
                  <Link to={`/flashcards?program=${program.id}`} className="btn btn-secondary">
                    <Layers3 size={16} /> Flashcards
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="heading mb-4 text-lg">How BoardPrep works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ListChecks,
              title: '1. Practice by topic',
              text: 'Drill a single topic with instant feedback and clear explanations after every answer.',
            },
            {
              icon: Clock3,
              title: '2. Simulate the exam',
              text: 'Run a timed mock exam across all subjects to build stamina and pacing.',
            },
            {
              icon: Layers3,
              title: '3. Review and improve',
              text: 'Track accuracy per topic and use flashcards to shore up your weakest areas.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <span className="mb-3 grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon size={19} />
              </span>
              <h3 className="heading text-sm">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
