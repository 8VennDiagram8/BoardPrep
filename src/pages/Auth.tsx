import { ArrowRight, BookOpenCheck, Check, Layers3, ShieldCheck, Timer } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export function Auth() {
  const { user, loading, isDemoMode, signIn, signUp, continueAsGuest } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
          <span className="text-sm">Preparing your reviewer…</span>
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const message =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name || email.split('@')[0])
    setBusy(false)
    if (message) {
      setError(message)
      return
    }
    if (mode === 'signup') {
      setNotice('Account created! Check your email if confirmation is required, then sign in.')
      setMode('signin')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-28 -top-28 size-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-bold shadow-lg">
            B
          </span>
          <div>
            <p className="heading text-lg">BoardPrep</p>
            <p className="text-xs text-slate-400">Engineering board exam reviewer</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200">
            <ShieldCheck size={14} /> ECELE · ECTLE ready
          </p>
          <h1 className="heading text-4xl leading-tight xl:text-5xl">
            Pass the board exam, <span className="text-brand-300">one question at a time.</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            A focused reviewer with realistic practice questions, timed mock exams, flashcards and
            honest progress tracking — built for working engineers.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              [BookOpenCheck, 'Curated questions across every major subject'],
              [Timer, 'Timed mock exams that mirror the real thing'],
              [Layers3, 'Quick-review flashcards for weak topics'],
            ].map(([Icon, text], index) => {
              const ItemIcon = Icon as typeof BookOpenCheck
              return (
                <li key={index} className="flex items-center gap-3 text-slate-200">
                  <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-brand-300">
                    <ItemIcon size={16} />
                  </span>
                  {text as string}
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} BoardPrep. Your progress stays yours.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
              B
            </span>
            <span className="heading text-lg">BoardPrep</span>
          </div>

          <h2 className="heading text-2xl text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            {mode === 'signin'
              ? 'Sign in to continue where you left off.'
              : 'Start tracking your board exam preparation today.'}
          </p>

          <div className="mt-7 flex rounded-xl bg-bg-soft p-1">
            {(['signin', 'signup'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  setError(null)
                  setNotice(null)
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {isDemoMode && (
            <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs leading-relaxed text-brand-800 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
              <strong>Demo mode.</strong> Supabase isn’t configured yet, so accounts are disabled —
              continue as a guest and your progress will be saved in this browser.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Full name</span>
                <input
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Juan Dela Cruz"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Email address</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </label>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {notice}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={busy || isDemoMode}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted/70">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => {
              continueAsGuest()
              navigate('/')
            }}
          >
            <Check size={16} />
            Continue as guest
          </button>
          <p className="mt-3 text-center text-[0.7rem] text-muted">
            Guest progress is stored locally in this browser.
          </p>
        </div>
      </div>
    </div>
  )
}
