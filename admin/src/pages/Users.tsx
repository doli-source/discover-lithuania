import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminUser, UserRole } from '../lib/types'

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'admin',  label: 'Admin',          desc: 'Full access to everything' },
  { value: 'editor', label: 'Content Editor', desc: 'Edit places, dishes, itineraries — no user management' },
  { value: 'owner',  label: 'Place Owner',    desc: 'Can only edit their own place' },
]

const ROLE_BADGE: Record<UserRole, string> = {
  admin:  'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  owner:  'bg-amber-100 text-amber-700',
}

interface PlaceOption { id: string; name: string }

export default function Users() {
  const [users, setUsers]   = useState<AdminUser[]>([])
  const [places, setPlaces] = useState<PlaceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<AdminUser | null>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // form state
  const [email, setEmail]       = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole]         = useState<UserRole>('editor')
  const [placeIds, setPlaceIds] = useState<string[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from('users').select('*').order('created_at'),
      supabase.from('places').select('id, slug').order('slug'),
    ])
    setUsers((u as AdminUser[]) ?? [])
    // fetch place names from translations
    const placeIds = (p ?? []).map((x: { id: string }) => x.id)
    if (placeIds.length) {
      const { data: tr } = await supabase
        .from('place_translations')
        .select('place_id, name')
        .eq('lang', 'en')
        .in('place_id', placeIds)
      const nameMap = Object.fromEntries((tr ?? []).map((t: { place_id: string; name: string }) => [t.place_id, t.name]))
      setPlaces((p ?? []).map((x: { id: string; slug: string }) => ({ id: x.id, name: nameMap[x.id] || x.slug })))
    }
    setLoading(false)
  }

  function openAdd() {
    setEditing(null); setEmail(''); setDisplayName(''); setRole('editor'); setPlaceIds([]); setError(null); setShowModal(true)
  }

  function openEdit(u: AdminUser) {
    setEditing(u); setEmail(u.email); setDisplayName(u.display_name ?? ''); setRole(u.role); setPlaceIds(u.place_ids ?? []); setError(null); setShowModal(true)
  }

  function togglePlace(id: string) {
    setPlaceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function save() {
    if (!email.trim()) { setError('Email is required'); return }
    if (role === 'owner' && placeIds.length === 0) { setError('Select at least one place for this owner'); return }
    setSaving(true); setError(null)
    const payload = {
      email: email.trim().toLowerCase(),
      display_name: displayName.trim() || null,
      role,
      place_ids: role === 'owner' ? placeIds : [],
      is_active: true,
    }
    let err
    if (editing) {
      ;({ error: err } = await supabase.from('users').update(payload).eq('id', editing.id))
    } else {
      ;({ error: err } = await supabase.from('users').insert({ ...payload, id: crypto.randomUUID() }))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    setShowModal(false); load()
  }

  async function toggleActive(u: AdminUser) {
    await supabase.from('users').update({ is_active: !u.is_active }).eq('id', u.id)
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Only listed users can access this admin panel</p>
        </div>
        <button onClick={openAdd} className="btn-primary gap-2">
          <span>+</span> Add User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Place</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.display_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                      {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.place_ids?.length
                      ? u.place_ids.map(pid => places.find(p => p.id === pid)?.name ?? pid.slice(0, 6) + '…').join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <span className="ml-2 text-xs text-gray-500">{u.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => toggleActive(u)} className={`text-xs hover:underline ${u.is_active ? 'text-red-500' : 'text-green-600'}`}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit User' : 'Add User'}</h2>

            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="user@example.com" disabled={!!editing} />
            </div>

            <div>
              <label className="label">Name (optional)</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="input" placeholder="Display name" />
            </div>

            <div>
              <label className="label">Role</label>
              <div className="space-y-2 mt-1">
                {ROLES.map(r => (
                  <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === r.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="role" value={r.value} checked={role === r.value}
                      onChange={() => setRole(r.value)} className="mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {role === 'owner' && (
              <div>
                <label className="label">Assigned Places</label>
                <div className="mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-50">
                  {places.map(p => (
                    <label key={p.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${placeIds.includes(p.id) ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={placeIds.includes(p.id)}
                        onChange={() => togglePlace(p.id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{p.name}</span>
                    </label>
                  ))}
                </div>
                {placeIds.length > 0 && (
                  <p className="text-xs text-amber-700 mt-1">{placeIds.length} place{placeIds.length > 1 ? 's' : ''} selected</p>
                )}
              </div>
            )}

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                {saving ? 'Saving…' : (editing ? 'Save changes' : 'Add user')}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
