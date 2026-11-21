import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Flashcards } from './pages/Flashcards'
import { Practice } from './pages/Practice'
import { QuestionGenerator } from './pages/QuestionGenerator'
import { ProgramDetail } from './pages/ProgramDetail'
import { Programs } from './pages/Programs'
import { Progress } from './pages/Progress'
import { Results } from './pages/Results'
import { Settings } from './pages/Settings'

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand-500" />
        <span className="text-sm">Loading BoardPrep…</span>
      </div>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <Protected>
                  <Layout />
                </Protected>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:programId" element={<ProgramDetail />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/generate" element={<QuestionGenerator />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/results/:attemptId" element={<Results />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
