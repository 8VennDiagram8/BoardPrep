import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createId, readLocal, removeLocal, writeLocal } from '../lib/local'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isDemoMode: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signOut: () => Promise<void>
  continueAsGuest: (name?: string) => void
  updateName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const GUEST_KEY = 'guest-profile'

function profileFromSession(session: Session | null): UserProfile | null {
  if (!session?.user) return null
  const metadata = session.user.user_metadata ?? {}
  const name =
    typeof metadata.display_name === 'string' && metadata.display_name.trim()
      ? metadata.display_name.trim()
      : (session.user.email ?? 'Engineer').split('@')[0]
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name,
    isGuest: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() =>
    supabase ? null : readLocal<UserProfile | null>(GUEST_KEY, null),
  )
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(profileFromSession(data.session))
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(profileFromSession(session))
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Authentication is unavailable in demo mode.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) return 'Authentication is unavailable in demo mode.'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    removeLocal(GUEST_KEY)
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }, [])

  const continueAsGuest = useCallback((name = 'Guest Engineer') => {
    const profile: UserProfile = {
      id: `guest-${createId()}`,
      email: '',
      name: name.trim() || 'Guest Engineer',
      isGuest: true,
    }
    writeLocal(GUEST_KEY, profile)
    setUser(profile)
  }, [])

  const updateName = useCallback(
    (name: string) => {
      setUser((current) => {
        if (!current) return current
        const next = { ...current, name: name.trim() || current.name }
        if (current.isGuest) writeLocal(GUEST_KEY, next)
        return next
      })

      if (user && !user.isGuest && supabase) {
        void supabase.auth.updateUser({ data: { display_name: name } })
      }
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemoMode: !supabase,
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      updateName,
    }),
    [user, loading, signIn, signUp, signOut, continueAsGuest, updateName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
