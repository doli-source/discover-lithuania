export interface Place {
  id: string
  slug: string
  region_id: string
  category_id: string
  lat: number | null
  lng: number | null
  map_url: string | null
  rating: number | null
  review_count: number | null
  price_range: number | null
  emoji: string | null
  website: string | null
  hours_en: string | null
  hours_he: string | null
  status: string | null
  source: string
  is_published: boolean
  created_at: string
  updated_at: string
  // from places_en view
  name?: string
  type_label?: string
  niv_tip?: string
}

export interface PlaceTranslation {
  id?: string
  place_id: string
  lang: string
  name: string
  type_label: string | null
  description: string | null
  niv_tip: string | null
}

export interface Landmark {
  id: string
  region_id: string | null
  name_en: string
  name_he: string | null
  lat: number | null
  lng: number | null
  image_url: string | null
}

export interface Dish {
  id: string
  name_en: string
  name_he: string | null
  desc_en: string | null
  desc_he: string | null
  tag_en: string | null
  tag_he: string | null
  emoji: string | null
  bg_css: string | null
  image_url: string | null
  sort_order: number
}

export interface Fact {
  id: string
  text_en: string
  text_he: string | null
  sort_order: number
}

export interface Itinerary {
  id: string
  region_id: string | null
  duration: string
  title_en: string
  title_he: string | null
  tagline_en: string | null
  tagline_he: string | null
  sort_order: number
}

export interface Region {
  id: string
  name_en: string
  name_he: string | null
  description_en: string | null
  cover_image_url: string | null
}

export interface Category {
  id: string
  name_en: string
  name_he: string | null
  emoji: string | null
}

export type UserRole = 'admin' | 'editor' | 'owner'

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  place_ids: string[]
  is_active: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  place_ids: string[]
  is_active: boolean
  created_at: string
}
