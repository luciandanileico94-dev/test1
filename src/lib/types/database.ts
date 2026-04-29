export type Profile = {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Couple = {
  id: string
  name: string
  start_date: string | null
  photo_url: string | null
  invite_code: string
  created_by: string
  created_at: string
  updated_at: string
}

export type CoupleMember = {
  id: string
  couple_id: string
  user_id: string
  role: string
  joined_at: string
}

export type CoupleEvent = {
  id: string
  couple_id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  type: EventType
  status: EventStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type EventType = 'date' | 'anniversary' | 'trip' | 'sex' | 'conversation' | 'reminder' | 'custom'
export type EventStatus = 'planned' | 'completed' | 'cancelled'

export type EventReview = {
  id: string
  event_id: string
  couple_id: string
  user_id: string
  what_was_good: string | null
  what_was_bad: string | null
  what_to_repeat: string | null
  rating: number | null
  private_notes: string | null
  created_at: string
  updated_at: string
}

export type WishlistItem = {
  id: string
  couple_id: string
  owner_user_id: string
  title: string
  description: string | null
  type: WishlistItemType
  priority: Priority
  price: number | null
  link: string | null
  image_url: string | null
  status: WishlistStatus
  reserved_by: string | null
  is_surprise: boolean
  created_at: string
  updated_at: string
}

export type WishlistItemType = 'product' | 'action' | 'experience' | 'date_idea' | 'intimate_idea' | 'other'
export type Priority = 'low' | 'medium' | 'high'
export type WishlistStatus = 'wanted' | 'reserved' | 'completed' | 'hidden'

export type Album = {
  id: string
  couple_id: string
  title: string
  description: string | null
  cover_image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  couple_id: string
  album_id: string | null
  event_id: string | null
  file_url: string
  file_type: 'image' | 'video'
  caption: string | null
  uploaded_by: string
  created_at: string
}

export type IntimacyRecord = {
  id: string
  couple_id: string
  date: string
  mood: string | null
  notes: string | null
  rating: number | null
  visibility: 'shared' | 'private'
  created_by: string
  created_at: string
  updated_at: string
}

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'
export type PartnerVisibility = 'private' | 'show_status' | 'show_support' | 'show_full'

export type CycleSettings = {
  id: string
  couple_id: string
  user_id: string
  is_enabled: boolean
  cycle_length: number
  period_length: number
  last_period_start: string | null
  partner_visibility: PartnerVisibility
  recommendations_enabled: boolean
  show_on_partner_dashboard: boolean
  partner_notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export type CycleDay = {
  id: string
  couple_id: string
  user_id: string
  date: string
  cycle_day: number | null
  phase: CyclePhase | null
  mood: string | null
  energy_level: number | null
  pain_level: number | null
  symptoms: string[] | null
  notes: string | null
  intimacy_preference: IntimacyPreference
  communication_preference: CommunicationPreference
  created_at: string
  updated_at: string
}

export type IntimacyPreference = 'do_not_initiate' | 'ask_gently' | 'romantic_only' | 'open' | 'private'
export type CommunicationPreference = 'need_space' | 'need_attention' | 'normal' | 'sensitive' | 'wants_support'

export type CycleSupportPreferences = {
  id: string
  couple_id: string
  user_id: string
  phase: CyclePhase
  what_helps: string | null
  what_makes_worse: string | null
  partner_should_do: string | null
  partner_should_avoid: string | null
  food_preferences: string | null
  drink_preferences: string | null
  comfort_food_preferences: string | null
  attention_preferences: string | null
  space_preferences: string | null
  physical_contact_preferences: string | null
  intimacy_boundaries: string | null
  custom_partner_message: string | null
  created_at: string
  updated_at: string
}

export type CheckIn = {
  id: string
  couple_id: string
  week_start: string
  user_id: string
  mood: string | null
  gratitude: string | null
  missing: string | null
  want_to_discuss: string | null
  want_to_do_together: string | null
  created_at: string
  updated_at: string
}

export type Agreement = {
  id: string
  couple_id: string
  title: string
  description: string | null
  status: 'active' | 'needs_discussion' | 'archived'
  created_by: string
  created_at: string
  updated_at: string
}

export type DateIdea = {
  id: string
  couple_id: string
  title: string
  description: string | null
  category: DateIdeaCategory
  estimated_price: number | null
  location: string | null
  priority: Priority
  status: DateIdeaStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type DateIdeaCategory = 'дома' | 'прогулка' | 'ресторан' | 'поездка' | 'романтика' | 'бесплатно' | 'дорого' | 'интимная_идея' | 'другое'
export type DateIdeaStatus = 'idea' | 'planned' | 'completed'
