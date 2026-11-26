import { CalendarClock, Check, Download, Moon, Plus, ShieldCheck, Sun, Trash2, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Badge, PageHeader } from '../components/ui'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { ProgramId } from '../lib/types'
import { cn } from '../lib/utils'

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 p-4 text-left transition hover:border-brand-300"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
      <span className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-line',
      )}>
        <span className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )} />
      </span>
    </button>
  )
}

export function Settings() {
  const { user, isDemoMode, updateName } = useAuth()
  const {
    settings,
    updateSettings,
    attempts,
    clearProgress,
    catalog,
    examDates,
    addExamDate,
    removeExamDate,
  } = useApp()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)
  const [examProgram, setExamProgram] = useState<ProgramId>('ecele')
  const [examLabel, setExamLabel] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examError, setExamError] = useState<string | null>(null)
  const [examBusy, setExamBusy] = useState(false)

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    updateName(name)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  async function addExam(event: FormEvent) {
    event.preventDefault()
    setExamError(null)
    if (!examDate) {
      setExamError('Choose a date and time.')
      return
    }
    if (new Date(examDate).getTime() <= Date.now()) {
      setExamError('Choose a future date and time.')
      return
    }
    setExamBusy(true)
    await addExamDate({ programId: examProgram, label: examLabel, date: examDate })
    setExamBusy(false)
    setExamLabel('')
    setExamDate('')
  }

  function exportProgress() {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: { name: user?.name, email: user?.email },
      attempts,
      catalogCounts: {
        programs: catalog.programs.length,
        questions: catalog.questions.length,
        flashcards: catalog.flashcards.length,
      },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `boardprep-progress-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune your review sessions and manage your saved data."
      />

      <div className="space-y-6">
        {/* Profile */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <UserRound size={19} />
            </span>
            <div>
              <h2 className="heading text-base">Profile</h2>
              <p className="text-xs text-muted">How your name appears across BoardPrep.</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Display name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </label>
            <button type="submit" className="btn btn-primary sm:mb-0">
              {saved ? <><Check size={16} /> Saved</> : 'Save changes'}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{user?.email || 'No email — guest session'}</span>
            {user?.isGuest ? <Badge tone="warning">Guest</Badge> : <Badge tone="success">Signed in</Badge>}
            {isDemoMode && <Badge tone="brand">Demo mode</Badge>}
          </div>
        </section>

        {/* Board exam date */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <CalendarClock size={19} />
            </span>
            <div>
              <h2 className="heading text-base">Board exam date</h2>
              <p className="text-xs text-muted">Add your exam date to see a live countdown on the dashboard.</p>
            </div>
          </div>

          <form onSubmit={addExam} className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Program</span>
              <select className="input" value={examProgram} onChange={(event) => setExamProgram(event.target.value as ProgramId)}>
                {catalog.programs.map((item) => (
                  <option key={item.id} value={item.id}>{item.code} — {item.shortName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Label (optional)</span>
              <input
                className="input"
                value={examLabel}
                onChange={(event) => setExamLabel(event.target.value)}
                placeholder="e.g. March 2027 board exam"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Date and time</span>
              <input
                className="input"
                type="datetime-local"
                value={examDate}
                onChange={(event) => setExamDate(event.target.value)}
              />
            </label>
            {examError && (
              <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {examError}
              </p>
            )}
            <button type="submit" className="btn btn-primary sm:col-span-2" disabled={examBusy}>
              <Plus size={16} /> {examBusy ? 'Adding…' : 'Add exam date'}
            </button>
          </form>

          {examDates.length > 0 && (
            <div className="mt-5 divide-y divide-line border-t border-line">
              {examDates.map((item) => {
                const days = Math.ceil((new Date(item.date).getTime() - Date.now()) / 86_400_000)
                const itemProgram = catalog.programs.find((program) => program.id === item.programId)
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <Badge tone="brand">{itemProgram?.code}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.label || `${itemProgram?.shortName} board exam`}
                      </p>
                      <p className="text-xs text-muted">
                        {new Intl.DateTimeFormat('en-PH', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(item.date))}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">
                      {days > 0 ? `${days} days left` : days === 0 ? 'Today' : 'Passed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeExamDate(item.id)}
                      className="btn btn-ghost size-8 !px-0"
                      title="Remove exam date"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Study preferences */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 className="heading text-base">Study preferences</h2>
              <p className="text-xs text-muted">Applies to new sessions.</p>
            </div>
          </div>
          <div className="space-y-3">
            <Toggle
              checked={settings.instantFeedback}
              onChange={(value) => updateSettings({ instantFeedback: value })}
              label="Instant feedback in practice"
              description="Show whether an answer is correct and its explanation right away. Mock exams always hide feedback until the end."
            />
            <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 p-4">
              <span>
                <span className="block text-sm font-semibold">Mock exam duration</span>
                <span className="mt-0.5 block text-xs text-muted">Countdown timer for timed exams.</span>
              </span>
              <select
                className="input !w-auto !py-1.5 !text-xs"
                value={settings.examMinutes}
                onChange={(event) => updateSettings({ examMinutes: Number(event.target.value) })}
              >
                {[15, 30, 45, 60, 90].map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} min</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Appearance */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
              {settings.theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
            </span>
            <div>
              <h2 className="heading text-base">Appearance</h2>
              <p className="text-xs text-muted">Choose the theme that’s easiest on your eyes.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => updateSettings({ theme })}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold capitalize transition',
                  settings.theme === theme
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-line bg-surface-2 text-muted hover:border-brand-300',
                )}
              >
                {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
                {theme}
              </button>
            ))}
          </div>
        </section>

        {/* Data */}
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Download size={19} />
            </span>
            <div>
              <h2 className="heading text-base">Your data</h2>
              <p className="text-xs text-muted">{attempts.length} saved sessions in this workspace.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" onClick={exportProgress}>
              <Download size={16} /> Export progress (JSON)
            </button>
            <button
              type="button"
              className="btn btn-secondary !text-rose-600 dark:!text-rose-400"
              onClick={() => {
                if (window.confirm('Delete all saved attempts? This cannot be undone.')) void clearProgress()
              }}
            >
              <Trash2 size={16} /> Clear all attempts
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {isDemoMode
              ? 'Demo mode stores progress in this browser only. Connect Supabase to sync across devices.'
              : 'Your attempts sync to Supabase when you’re signed in.'}
          </p>
        </section>
      </div>
    </div>
  )
}
