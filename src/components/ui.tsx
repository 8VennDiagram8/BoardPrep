import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useApp } from '../context/AppContext'
import type { Program } from '../lib/types'
import { cn } from '../lib/utils'

/* Accent maps are static so Tailwind's scanner can see every class. */
export const accentStyles = {
  indigo: {
    tile: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    text: 'text-brand-600 dark:text-brand-300',
    bar: 'bg-brand-500',
    ring: 'stroke-brand-500',
    glow: 'from-brand-500/15',
    border: 'border-brand-200 dark:border-brand-800',
  },
  cyan: {
    tile: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    text: 'text-cyan-600 dark:text-cyan-300',
    bar: 'bg-cyan-500',
    ring: 'stroke-cyan-500',
    glow: 'from-cyan-500/15',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
} as const

export type Accent = Program['accent']

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-bg-soft', className)}>
      <div
        className={cn('h-full rounded-full bg-brand-500 transition-[width] duration-500', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function ProgressRing({
  value,
  size = 68,
  stroke = 7,
  barClassName = 'stroke-brand-500',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  barClassName?: string
  children?: ReactNode
}) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-bg-soft"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-[stroke-dashoffset] duration-700', barClassName)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-center text-sm font-bold">
        {children ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
  className?: string
}) {
  const tones = {
    neutral: 'bg-bg-soft text-muted border-line',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-800',
    brand: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-fade-up">
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1 className="heading text-2xl text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'brand',
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
  tone?: 'brand' | 'emerald' | 'amber' | 'cyan'
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
  }
  return (
    <div className="card animate-fade-up p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}>{icon}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
      {hint && <p className="mt-1 text-[0.7rem] text-muted/80">{hint}</p>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-bg-soft text-2xl">{icon}</div>
      <h3 className="heading text-lg text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ThemeToggle() {
  const { settings, updateSettings } = useApp()
  const isDark = settings.theme === 'dark'
  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
      className="btn btn-ghost size-9 !px-0"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || 'G'}
    </span>
  )
}
