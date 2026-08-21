import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Fact } from '../lib/types'

export default function Facts() {
  const [rows, setRows] = useState<Fact[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [newFact, setNewFact] = useState({ text_en: '', text_he: '' })
  const [adding, setAdding] = useState(false)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const { data } = await supabase.from('facts').select('*').order('sort_order')
    setRows(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function updateFact(fact: Fact) {
    setSaving(fact.id)
    await supabase.from('facts').update({ text_en: fact.text_en, text_he: fact.text_he, sort_order: fact.sort_order }).eq('id', fact.id)
    setSaving(null)
    showToast('Saved!')
  }

  async function deleteFact(id: string) {
    if (!confirm('Delete this fact?')) return
    await supabase.from('facts').delete().eq('id', id)
    load()
  }

  async function addFact() {
    if (!newFact.text_en) return
    const maxOrder = Math.max(0, ...rows.map(r => r.sort_order))
    await supabase.from('facts').insert({ id: crypto.randomUUID(), text_en: newFact.text_en, text_he: newFact.text_he || null, sort_order: maxOrder + 1 })
    setNewFact({ text_en: '', text_he: '' })
    setAdding(false)
    showToast('Added!')
    load()
  }

  function updateRow(id: string, field: keyof Fact, value: string | number) {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Fun Facts <span className="text-gray-400 text-base font-normal">({rows.length})</span></h1>
        <button onClick={() => setAdding(true)} className="btn-primary">+ Add fact</button>
      </div>

      {adding && (
        <div className="card p-4 mb-4 border-brand-200 bg-brand-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">English</label>
              <textarea className="input" placeholder="Type fact in English..." value={newFact.text_en} onChange={e => setNewFact({ ...newFact, text_en: e.target.value })} />
            </div>
            <div>
              <label className="label">Hebrew</label>
              <textarea className="input" dir="rtl" placeholder="עובדה בעברית..." value={newFact.text_he} onChange={e => setNewFact({ ...newFact, text_he: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addFact} className="btn-primary">Add</button>
            <button onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.id} className="card p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">English</label>
                <textarea className="input text-sm" value={r.text_en} onChange={e => updateRow(r.id, 'text_en', e.target.value)} />
              </div>
              <div>
                <label className="label">Hebrew</label>
                <textarea className="input text-sm" dir="rtl" value={r.text_he ?? ''} onChange={e => updateRow(r.id, 'text_he', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="label mb-0">Order:</label>
                <input className="input w-16 text-center" type="number" value={r.sort_order} onChange={e => updateRow(r.id, 'sort_order', parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteFact(r.id)} className="btn-danger text-xs px-2 py-1">Delete</button>
                <button onClick={() => updateFact(r)} disabled={saving === r.id} className="btn-primary text-xs px-2 py-1">
                  {saving === r.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  )
}
