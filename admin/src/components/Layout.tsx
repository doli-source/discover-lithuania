import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import type { UserRole } from '../lib/types'

const nav: { to: string; label: string; icon: string; roles: UserRole[] }[] = [
  { to: '/',            label: 'Dashboard',   icon: '📊', roles: ['admin', 'editor'] },
  { to: '/places',      label: 'Places',      icon: '📍', roles: ['admin', 'editor', 'owner'] },
  { to: '/landmarks',   label: 'Landmarks',   icon: '🏛️', roles: ['admin', 'editor'] },
  { to: '/dishes',      label: 'Dishes',      icon: '🍲', roles: ['admin', 'editor'] },
  { to: '/facts',       label: 'Facts',       icon: '💡', roles: ['admin', 'editor'] },
  { to: '/itineraries', label: 'Itineraries', icon: '🗺️', roles: ['admin', 'editor'] },
  { to: '/users',       label: 'Users',       icon: '👥', roles: ['admin'] },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="text-white font-semibold text-sm">🇱🇹 LT Admin</div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{profile?.email ?? ''}</div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.filter(item => item.roles.includes(profile?.role as UserRole)).map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
