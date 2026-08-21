import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Dish } from '../lib/types'
import Modal from '../components/Modal'

export default function Dishes() {
  const [rows, setRows] = useState<Dish[]>([])
  const [edit, setEdit] = useState<Dish | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const { data } = await supabase.from('dishes').select('*').order('sort_order')
    setRows(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!edit) return
    setSaving(true)
    const { error } = await supabase.from('dishes').update({
      name_en: edit.name_en, name_he: edit.name_he,
      desc_en: edit.desc_en, desc_he: edit.desc_he,
      tag_en: edit.tag_en, tag_he: edit.tag_he,
      emoji: edit.emoji, sort_order: edit.sort_order,
    }).eq('id', edit.id)
    setSaving(false)
    if (error) showToast('Error: ' + error.message)
    else { showToast('Saved!'); setEdit(null); load() }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Dishes <span className="text-gray-400 text-base font-normal">({rows.length})</span></h1>

      <div className="grid gap-3">
        {rows.map(d => (
          <div key={d.id} className="card p-4 flex items-start gap-4">
            <div className="text-3xl">{d.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{d.name_en} · <span dir="rtl">{d.name_he}</span></div>
              <div className="text-sm text-gray-500 mt-0.5">{d.desc_en}</div>
              <div className="text-xs text-brand-600 mt-1">{d.tag_en}</div>
            </div>
            <button onClick={() => setEdit(d)} className="btn-secondary text-xs shrink-0">Edit</button>
          </div>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit: ${edit?.name_en ?? ''}`}>
        {edit && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name (EN)</label>
                <input className="input" value={edit.name_en} onChange={e => setEdit({ ...edit, name_en: e.target.value })} />
              </div>
              <div>
                <label className="label">Name (HE)</label>
                <input className="input" dir="rtl" value={edit.name_he ?? ''} onChange={e => setEdit({ ...edit, name_he: e.target.value || null })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tag (EN)</label>
                <input className="input" value={edit.tag_en ?? ''} onChange={e => setEdit({ ...edit, tag_en: e.target.value || null })} />
              </div>
              <div>
                <label className="label">Tag (HE)</label>
                <input className="input" dir="rtl" value={edit.tag_he ?? ''} onChange={e => setEdit({ ...edit, tag_he: e.target.value || null })} />
              </div>
            </div>
            <div>
              <label className="label">Description (EN)</label>
              <textarea className="input" value={edit.desc_en ?? ''} onChange={e => setEdit({ ...edit, desc_en: e.target.value || null })} />
            </div>
            <div>
              <label className="label">Description (HE)</label>
              <textarea className="input" dir="rtl" value={edit.desc_he ?? ''} onChange={e => setEdit({ ...edit, desc_he: e.target.value || null })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Emoji</label>
                <input className="input" value={edit.emoji ?? ''} onChange={e => setEdit({ ...edit, emoji: e.target.value || null })} />
              </div>
              <div>
                <label className="label">Sort order</label>
                <input className="input" type="number" value={edit.sort_order} onChange={e => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button onClick={() => setEdit(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  )
}
