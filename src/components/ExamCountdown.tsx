import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function ExamCountdown({ date }: { date: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const time = new Date(date).getTime()
  const remaining = time - now
  const { days, hours, minutes, seconds } = parts(remaining)

  if (!Number.isFinite(time)) {
    return <p className="text-sm text-muted">Invalid exam date.</p>
  }

  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={18} /> Exam day has arrived — good luck!
      </div>
    )
  }

  const tiles = [
    { value: days, label: 'days' },
    { value: hours, label: 'hours' },
    { value: minutes, label: 'mins' },
    { value: seconds, label: 'secs' },
  ]

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-white/15 p-2.5 text-center backdrop-blur-sm">
            <p className="font-display text-2xl font-bold tabular-nums leading-none sm:text-3xl">
              {tile.value.toString().padStart(tile.label === 'days' ? 1 : 2, '0')}
            </p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
              {tile.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/80">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} />
          {new Intl.DateTimeFormat('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date(date))}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} />
          {new Intl.DateTimeFormat('en-PH', {
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(date))}
        </span>
      </div>
    </div>
  )
}
