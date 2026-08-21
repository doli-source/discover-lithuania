import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Itinerary } from '../lib/types'
import Modal from '../components/Modal'

interface Stop {
  id: string
  itinerary_id: string
  place_id: string | null
  landmark_id: string | null
  time: string | null
  note_en: string | null
  note_he: string | null
  sort_order: number
  place_name?: string
}

export default function Itineraries() {
  const [rows, setRows] = useState<Itinerary[]>([])
  const [selected, setSelected] = useState<Itinerary | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function load() {
    const { data } = await supabase.from('itineraries').select('*').order('sort_order')
    setRows(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function openItinerary(it: Itinerary) {
    setSelected(it)
    const { data: stopsData } = await supabase
      .from('itinerary_stops')
      .select('*, places(slug, places_en:place_translations(name))')
      .eq('itinerary_id', it.id)
      .order('sort_order')

    const mapped: Stop[] = (stopsData ?? []).map((s: any) => ({
      ...s,
      place_name: s.place_id ? s.places?.slug : s.landmark_id,
    }))
    setStops(mapped)
  }

  async function saveItinerary() {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('itineraries').update({
      title_en: selected.title_en,
      title_he: selected.title_he,
      tagline_en: selected.tagline_en,
      tagline_he: selected.tagline_he,
      duration: selected.duration,
      sort_order: selected.sort_order,
    }).eq('id', selected.id)
    setSaving(false)
    if (error) showToast('Error: ' + error.message)
    else { showToast('Saved!'); load() }
  }

  const DURATIONS = ['day', 'weekend', 'week']

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Itineraries <span className="text-gray-400 text-base font-normal">({rows.length})</span></h1>

      <div className="grid gap-3">
        {rows.map(it => (
          <div key={it.id} className="card p-4 flex items-start gap-4">
            <div className="text-2xl">🗺️</div>
            <div className="flex-1">
              <div className="font-semibold">{it.title_en}</div>
              <div className="text-sm text-right" dir="rtl">{it.title_he}</div>
              <div className="text-xs text-gray-500 mt-1">{it.tagline_en} · <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{it.duration}</span></div>
            </div>
            <button onClick={() => openItinerary(it)} className="btn-secondary text-xs shrink-0">Edit</button>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id ?? ''} size="xl">
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Title (EN)</label>
                <input className="input" value={selected.title_en} onChange={e => setSelected({ ...selected, title_en: e.target.value })} />
              </div>
              <div>
                <label className="label">Title (HE)</label>
                <input className="input" dir="rtl" value={selected.title_he ?? ''} onChange={e => setSelected({ ...selected, title_he: e.target.value || null })} />
              </div>
              <div>
                <label className="label">Tagline (EN)</label>
                <input className="input" value={selected.tagline_en ?? ''} onChange={e => setSelected({ ...selected, tagline_en: e.target.value || null })} />
              </div>
              <div>
                <label className="label">Tagline (HE)</label>
                <input className="input" dir="rtl" value={selected.tagline_he ?? ''} onChange={e => setSelected({ ...selected, tagline_he: e.target.value || null })} />
              </div>
              <div>
                <label className="label">Duration</label>
                <select className="input" value={selected.duration} onChange={e => setSelected({ ...selected, duration: e.target.value })}>
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sort order</label>
                <input className="input" type="number" value={selected.sort_order} onChange={e => setSelected({ ...selected, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Stops ({stops.length})</h3>
            <div className="space-y-2 mb-4">
              {stops.map(s => (
                <div key={s.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm flex items-start gap-3">
                  <span className="text-gray-400 font-mono text-xs w-20 shrink-0 mt-0.5">{s.time}</span>
                  <div className="flex-1">
                    <div className="font-medium">{s.note_en}</div>
                    <div className="text-xs text-gray-400">{s.place_name ?? s.landmark_id}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              <button onClick={saveItinerary} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  )
}
