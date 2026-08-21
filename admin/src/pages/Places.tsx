import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Place, PlaceTranslation, Region, Category } from '../lib/types'
import Modal from '../components/Modal'

type PlaceRow = Place & { name?: string; type_label?: string }

const SOURCES = ['niv', 'business', 'agent']
const STATUSES = ['open', 'closed', 'seasonal', 'unknown']

export default function Places() {
  const [places, setPlaces] = useState<PlaceRow[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterPublished, setFilterPublished] = useState('')
  const [editPlace, setEditPlace] = useState<PlaceRow | null>(null)
  const [translations, setTranslations] = useState<{ en: PlaceTranslation; he: PlaceTranslation } | null>(null)
  const [tab, setTab] = useState<'info' | 'en' | 'he' | 'hours'>('info')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadPlaces = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('places_en').select('*').order('slug')
    setPlaces((data as PlaceRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPlaces()
    supabase.from('regions').select('*').order('name_en').then(({ data }) => setRegions(data ?? []))
    supabase.from('categories').select('*').order('name_en').then(({ data }) => setCategories(data ?? []))
  }, [loadPlaces])

  async function openEdit(place: PlaceRow) {
    setEditPlace({ ...place })
    setTab('info')
    const { data } = await supabase.from('place_translations').select('*').eq('place_id', place.id)
    const en = data?.find(t => t.lang === 'en') ?? { place_id: place.id, lang: 'en', name: '', type_label: null, description: null, niv_tip: null }
    const he = data?.find(t => t.lang === 'he') ?? { place_id: place.id, lang: 'he', name: '', type_label: null, description: null, niv_tip: null }
    setTranslations({ en, he })
  }

  async function savePlace() {
    if (!editPlace) return
    setSaving(true)

    const { error: placeErr } = await supabase.from('places').update({
      slug: editPlace.slug,
      region_id: editPlace.region_id,
      category_id: editPlace.category_id,
      lat: editPlace.lat,
      lng: editPlace.lng,
      website: editPlace.website,
      rating: editPlace.rating,
      review_count: editPlace.review_count,
      price_range: editPlace.price_range,
      emoji: editPlace.emoji,
      hours_en: editPlace.hours_en,
      hours_he: editPlace.hours_he,
      status: editPlace.status,
      source: editPlace.source,
      is_published: editPlace.is_published,
    }).eq('id', editPlace.id)

    if (placeErr) { showToast('Error: ' + placeErr.message); setSaving(false); return }

    if (translations) {
      for (const tr of [translations.en, translations.he]) {
        if (tr.id) {
          await supabase.from('place_translations').update({
            name: tr.name, type_label: tr.type_label, niv_tip: tr.niv_tip, description: tr.description,
          }).eq('id', tr.id)
        } else {
          await supabase.from('place_translations').insert({
            place_id: editPlace.id, lang: tr.lang, name: tr.name, type_label: tr.type_label, niv_tip: tr.niv_tip, description: tr.description,
          })
        }
      }
    }

    setSaving(false)
    setEditPlace(null)
    showToast('Saved!')
    loadPlaces()
  }

  async function togglePublished(place: PlaceRow) {
    await supabase.from('places').update({ is_published: !place.is_published }).eq('id', place.id)
    showToast(place.is_published ? 'Unpublished' : 'Published')
    loadPlaces()
  }

  const filtered = places.filter(p => {
    if (filterRegion && p.region_id !== filterRegion) return false
    if (filterPublished === 'published' && !p.is_published) return false
    if (filterPublished === 'draft' && p.is_published) return false
    if (search) {
      const q = search.toLowerCase()
      return p.slug.includes(q) || (p.name ?? '').toLowerCase().includes(q)
    }
    return true
  })

  function updateTr(lang: 'en' | 'he', field: keyof PlaceTranslation, value: string) {
    if (!translations) return
    setTranslations({ ...translations, [lang]: { ...translations[lang], [field]: value } })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Places</h1>
          <p className="text-sm text-gray-500 mt-0.5">{places.length} total, {places.filter(p => p.is_published).length} published</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input w-48"
          placeholder="Search slug or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-36" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="">All regions</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name_en}</option>)}
        </select>
        <select className="input w-32" value={filterPublished} onChange={e => setFilterPublished(e.target.value)}>
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <span className="text-sm text-gray-400 self-center">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-3 py-2.5 w-8"></th>
                <th className="px-3 py-2.5">Name / Slug</th>
                <th className="px-3 py-2.5">Region</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5">Published</th>
                <th className="px-3 py-2.5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-lg">{p.emoji ?? '📍'}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{p.name ?? '—'}</div>
                    <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{p.region_id}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      p.source === 'niv' ? 'bg-blue-100 text-blue-700' :
                      p.source === 'business' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{p.source}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${p.is_published ? 'bg-brand-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.is_published ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => openEdit(p)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editPlace} onClose={() => setEditPlace(null)} title={`Edit: ${editPlace?.slug ?? ''}`} size="xl">
        {editPlace && (
          <div>
            {/* Tabs */}
            <div className="flex gap-1 border-b mb-4">
              {(['info','en','he','hours'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >{t === 'info' ? '⚙️ Info' : t === 'en' ? '🇬🇧 English' : t === 'he' ? '🇮🇱 Hebrew' : '🕐 Hours'}</button>
              ))}
            </div>

            {/* Info tab */}
            {tab === 'info' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Slug</label>
                  <input className="input font-mono text-xs" value={editPlace.slug} onChange={e => setEditPlace({ ...editPlace, slug: e.target.value })} />
                </div>
                <div>
                  <label className="label">Emoji</label>
                  <input className="input" value={editPlace.emoji ?? ''} onChange={e => setEditPlace({ ...editPlace, emoji: e.target.value })} />
                </div>
                <div>
                  <label className="label">Region</label>
                  <select className="input" value={editPlace.region_id} onChange={e => setEditPlace({ ...editPlace, region_id: e.target.value })}>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={editPlace.category_id} onChange={e => setEditPlace({ ...editPlace, category_id: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Latitude</label>
                  <input className="input" type="number" step="0.000001" value={editPlace.lat ?? ''} onChange={e => setEditPlace({ ...editPlace, lat: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input" type="number" step="0.000001" value={editPlace.lng ?? ''} onChange={e => setEditPlace({ ...editPlace, lng: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div>
                  <label className="label">Rating</label>
                  <input className="input" type="number" step="0.1" min="0" max="5" value={editPlace.rating ?? ''} onChange={e => setEditPlace({ ...editPlace, rating: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div>
                  <label className="label">Reviews</label>
                  <input className="input" type="number" value={editPlace.review_count ?? ''} onChange={e => setEditPlace({ ...editPlace, review_count: e.target.value ? parseInt(e.target.value) : null })} />
                </div>
                <div>
                  <label className="label">Price (1-4)</label>
                  <input className="input" type="number" min="1" max="4" value={editPlace.price_range ?? ''} onChange={e => setEditPlace({ ...editPlace, price_range: e.target.value ? parseInt(e.target.value) : null })} />
                </div>
                <div>
                  <label className="label">Source</label>
                  <select className="input" value={editPlace.source} onChange={e => setEditPlace({ ...editPlace, source: e.target.value })}>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editPlace.status ?? ''} onChange={e => setEditPlace({ ...editPlace, status: e.target.value || null })}>
                    <option value="">—</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Published</label>
                  <select className="input" value={editPlace.is_published ? 'yes' : 'no'} onChange={e => setEditPlace({ ...editPlace, is_published: e.target.value === 'yes' })}>
                    <option value="yes">Published</option>
                    <option value="no">Draft</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Website</label>
                  <input className="input" value={editPlace.website ?? ''} onChange={e => setEditPlace({ ...editPlace, website: e.target.value || null })} />
                </div>
              </div>
            )}

            {/* EN / HE translation tabs */}
            {(tab === 'en' || tab === 'he') && translations && (
              <div className="space-y-3">
                <div>
                  <label className="label">Name ({tab.toUpperCase()})</label>
                  <input className="input" value={translations[tab].name} onChange={e => updateTr(tab, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Type label</label>
                  <input className="input" value={translations[tab].type_label ?? ''} onChange={e => updateTr(tab, 'type_label', e.target.value)} />
                </div>
                <div>
                  <label className="label">Niv tip</label>
                  <textarea className="input min-h-[80px]" value={translations[tab].niv_tip ?? ''} onChange={e => updateTr(tab, 'niv_tip', e.target.value)} dir={tab === 'he' ? 'rtl' : 'ltr'} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-[80px]" value={translations[tab].description ?? ''} onChange={e => updateTr(tab, 'description', e.target.value)} dir={tab === 'he' ? 'rtl' : 'ltr'} />
                </div>
              </div>
            )}

            {/* Hours tab */}
            {tab === 'hours' && (
              <div className="space-y-3">
                <div>
                  <label className="label">Hours (English)</label>
                  <textarea className="input min-h-[80px]" value={editPlace.hours_en ?? ''} onChange={e => setEditPlace({ ...editPlace, hours_en: e.target.value || null })} />
                </div>
                <div>
                  <label className="label">Hours (Hebrew)</label>
                  <textarea className="input min-h-[80px]" value={editPlace.hours_he ?? ''} onChange={e => setEditPlace({ ...editPlace, hours_he: e.target.value || null })} dir="rtl" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
              <button onClick={() => setEditPlace(null)} className="btn-secondary">Cancel</button>
              <button onClick={savePlace} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
