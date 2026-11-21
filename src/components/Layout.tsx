import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Layers3,
  LogOut,
  Menu,
  PanelLeftClose,
  Settings2,
  Target,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { Avatar, ThemeToggle, accentStyles } from './ui'

const mainNav = [
  { to: '/', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/programs', label: 'Programs', icon: BookOpen, end: false },
  { to: '/practice', label: 'Practice', icon: Target, end: false },
  { to: '/flashcards', label: 'Flashcards', icon: Layers3, end: false },
  { to: '/progress', label: 'Progress', icon: GraduationCap, end: false },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { catalog } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-600/25">
          B
        </div>
        <div className="min-w-0">
          <p className="heading truncate text-base leading-tight text-ink">BoardPrep</p>
          <p className="text-[0.68rem] font-medium text-muted">Exam reviewer</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted/70">
          Study
        </p>
        <ul className="space-y-1">
          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="px-3 pb-2 pt-6 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted/70">
          Your programs
        </p>
        <ul className="space-y-1">
          {catalog.programs.map((program) => {
            const styles = accentStyles[program.accent]
            return (
              <li key={program.id}>
                <NavLink
                  to={`/programs/${program.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-surface-2 text-ink'
                        : 'text-muted hover:bg-surface-2 hover:text-ink',
                    )
                  }
                >
                  <span className={cn('grid size-7 place-items-center rounded-lg text-sm', styles.tile)}>
                    {program.glyph}
                  </span>
                  <span className="truncate">{program.code}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                : 'text-muted hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <Settings2 size={18} />
          Settings
        </NavLink>
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
          <Avatar name={user?.name ?? 'Guest'} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-[0.65rem] text-muted">
              {user?.isGuest ? 'Demo mode' : user?.email || 'Signed in'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              void signOut().then(() => navigate('/auth'))
            }}
            className="btn btn-ghost size-8 !px-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <aside className="animate-pop-in absolute inset-y-0 left-0 w-72 border-r border-line bg-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn btn-ghost absolute right-3 top-4 size-8 !px-0"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn btn-secondary size-9 !px-0 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                B
              </span>
              <span className="heading text-sm">BoardPrep</span>
            </div>
            <span className="hidden items-center gap-2 text-xs font-medium text-muted lg:flex">
              <PanelLeftClose size={15} />
              Stay consistent — a little practice every day adds up.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NavLink to="/settings" className="btn btn-ghost hidden size-9 !px-0 sm:inline-flex" title="Settings">
              <Settings2 size={17} />
            </NavLink>
            <NavLink to="/practice" className="btn btn-primary !px-3 sm:!px-4">
              <Target size={16} />
              <span className="hidden sm:inline">Start practice</span>
              <span className="sm:hidden">Practice</span>
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>

        <footer className="border-t border-line px-6 py-4 text-center text-[0.7rem] text-muted">
          BoardPrep · Built for engineers, by engineers. Review responsibly.
        </footer>
      </div>
    </div>
  )
}
