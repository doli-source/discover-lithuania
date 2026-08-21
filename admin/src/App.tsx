import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Places from './pages/Places'
import Landmarks from './pages/Landmarks'
import Dishes from './pages/Dishes'
import Facts from './pages/Facts'
import Itineraries from './pages/Itineraries'
import Users from './pages/Users'

function NotAuthorized() {
  const { signOut } = useAuth()
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="text-5xl mb-4">🚫</div>
        <p className="text-white text-xl font-semibold">Access Denied</p>
        <p className="text-gray-400 text-sm mt-2">Your account doesn't have admin permissions.</p>
        <button onClick={signOut} className="mt-6 text-amber-400 text-sm hover:underline">
          Sign out
        </button>
      </div>
    </div>
  )
}

const DEV_BYPASS = false // set to import.meta.env.DEV for local preview without login

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (DEV_BYPASS) return <>{children}</>
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!profile || !profile.is_active) return <NotAuthorized />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  if (DEV_BYPASS) return <>{children}</>
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="places" element={<Places />} />
          <Route path="landmarks" element={<Landmarks />} />
          <Route path="dishes" element={<Dishes />} />
          <Route path="facts" element={<Facts />} />
          <Route path="itineraries" element={<Itineraries />} />
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
