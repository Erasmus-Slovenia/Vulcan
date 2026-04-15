import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './features/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TasksPage from './pages/TasksPage'
import KanbanPage from './pages/KanbanPage'

function Protected({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function Public({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"             element={<Public><LoginPage /></Public>} />
          <Route path="/dashboard"       element={<Protected><Dashboard /></Protected>} />
          <Route path="/projects"        element={<Protected><ProjectsPage /></Protected>} />
          <Route path="/projects/:id"    element={<Protected><ProjectDetailPage /></Protected>} />
          <Route path="/tasks"           element={<Protected><TasksPage /></Protected>} />
          <Route path="/kanban"          element={<Protected><KanbanPage /></Protected>} />
          <Route path="/admin"           element={<Protected adminOnly><AdminPanel /></Protected>} />
          <Route path="*"                element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
