import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Landmark, Region } from '../lib/types'
import Modal from '../components/Modal'

const blank = (): Omit<Landmark, 'id'> => ({ region_id: null, name_en: '', name_he: null, lat: null, lng: null, image_url: null })

export default function Landmarks() {
  const [rows, setRows] = useState<Landmark[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [edit, setEdit] = useState<Landmark | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const { data } = await supabase.from('landmarks').select('*').order('name_en')
    setRows(data ?? [])
  }

  useEffect(() => {
    load()
    supabase.from('regions').select('*').order('name_en').then(({ data }) => setRegions(data ?? []))
  }, [])

  async function save() {
    setSaving(true)
    if (edit) {
      const { error } = await supabase.from('landmarks').update(edit).eq('id', edit.id)
      if (!error) { showToast('Saved!'); setEdit(null); load() }
      else showToast('Error: ' + error.message)
    } else {
      const { error } = await supabase.from('landmarks').insert({ ...draft, id: draft.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
      if (!error) { showToast('Created!'); setCreating(false); setDraft(blank()); load() }
      else showToast('Error: ' + error.message)
    }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this landmark?')) return
    await supabase.from('landmarks').delete().eq('id', id)
    load()
  }

  const form = edit ?? draft as any

  function update(field: string, value: unknown) {
    if (edit) setEdit({ ...edit, [field]: value } as Landmark)
    else setDraft({ ...draft, [field]: value } as typeof draft)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Landmarks <span className="text-gray-400 text-base font-normal">({rows.length})</span></h1>
        <button onClick={() => { setCreating(true); setEdit(null) }} className="btn-primary">+ Add landmark</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-3 py-2.5">ID</th>
              <th className="px-3 py-2.5">English name</th>
              <th className="px-3 py-2.5">Hebrew name</th>
              <th className="px-3 py-2.5">Region</th>
              <th className="px-3 py-2.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-gray-400">{r.id}</td>
                <td className="px-3 py-2 font-medium">{r.name_en}</td>
                <td className="px-3 py-2 text-right" dir="rtl">{r.name_he ?? '—'}</td>
                <td className="px-3 py-2 text-gray-500">{r.region_id ?? '—'}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button onClick={() => { setEdit(r); setCreating(false) }} className="btn-secondary text-xs px-2 py-1">Edit</button>
                  <button onClick={() => del(r.id)} className="btn-danger text-xs px-2 py-1">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!(edit || creating)} onClose={() => { setEdit(null); setCreating(false) }} title={edit ? `Edit: ${edit.id}` : 'New Landmark'}>
        <div className="space-y-3">
          {creating && (
            <div>
              <label className="label">ID (slug)</label>
              <input className="input font-mono" value={(draft as any).id ?? ''} onChange={e => setDraft({ ...draft, ...(e.target.value ? { id: e.target.value } : {}) } as any)} placeholder="auto-generated" />
            </div>
          )}
          <div>
            <label className="label">English name</label>
            <input className="input" value={form.name_en} onChange={e => update('name_en', e.target.value)} />
          </div>
          <div>
            <label className="label">Hebrew name</label>
            <input className="input" dir="rtl" value={form.name_he ?? ''} onChange={e => update('name_he', e.target.value || null)} />
          </div>
          <div>
            <label className="label">Region</label>
            <select className="input" value={form.region_id ?? ''} onChange={e => update('region_id', e.target.value || null)}>
              <option value="">—</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name_en}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Lat</label>
              <input className="input" type="number" step="0.000001" value={form.lat ?? ''} onChange={e => update('lat', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div>
              <label className="label">Lng</label>
              <input className="input" type="number" step="0.000001" value={form.lng ?? ''} onChange={e => update('lng', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
          <button onClick={() => { setEdit(null); setCreating(false) }} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  )
}
