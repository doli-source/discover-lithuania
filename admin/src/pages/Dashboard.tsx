import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Stats {
  places: number
  published: number
  drafts: number
  translations: number
  landmarks: number
  dishes: number
  facts: number
  itineraries: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [places, published, translations, landmarks, dishes, facts, itineraries] = await Promise.all([
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('place_translations').select('*', { count: 'exact', head: true }),
        supabase.from('landmarks').select('*', { count: 'exact', head: true }),
        supabase.from('dishes').select('*', { count: 'exact', head: true }),
        supabase.from('facts').select('*', { count: 'exact', head: true }),
        supabase.from('itineraries').select('*', { count: 'exact', head: true }),
      ])
      const total = places.count ?? 0
      const pub = published.count ?? 0
      setStats({
        places: total,
        published: pub,
        drafts: total - pub,
        translations: translations.count ?? 0,
        landmarks: landmarks.count ?? 0,
        dishes: dishes.count ?? 0,
        facts: facts.count ?? 0,
        itineraries: itineraries.count ?? 0,
      })
    }
    load()
  }, [])

  const cards = stats ? [
    { label: 'Total Places',    value: stats.places,       icon: '📍', color: 'bg-blue-50 text-blue-700' },
    { label: 'Published',        value: stats.published,    icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Drafts',           value: stats.drafts,       icon: '📝', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Translations',     value: stats.translations, icon: '🌍', color: 'bg-purple-50 text-purple-700' },
    { label: 'Landmarks',        value: stats.landmarks,    icon: '🏛️', color: 'bg-orange-50 text-orange-700' },
    { label: 'Dishes',           value: stats.dishes,       icon: '🍲', color: 'bg-red-50 text-red-700' },
    { label: 'Fun Facts',        value: stats.facts,        icon: '💡', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Itineraries',      value: stats.itineraries,  icon: '🗺️', color: 'bg-teal-50 text-teal-700' },
  ] : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Lithuania Discovery database overview</p>
      </div>

      {!stats ? (
        <div className="text-gray-400 text-sm">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon, color }) => (
            <div key={label} className="card p-4">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${color} mb-3`}>
                {icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick links</h2>
        <div className="grid grid-cols-3 gap-2 text-sm text-brand-600">
          <a href="/places" className="hover:text-brand-700">→ Manage Places</a>
          <a href="/landmarks" className="hover:text-brand-700">→ Manage Landmarks</a>
          <a href="/dishes" className="hover:text-brand-700">→ Manage Dishes</a>
          <a href="/facts" className="hover:text-brand-700">→ Manage Facts</a>
          <a href="/itineraries" className="hover:text-brand-700">→ Manage Itineraries</a>
        </div>
      </div>
    </div>
  )
}
