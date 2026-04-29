import { createClient } from './server'

export async function getCurrentCouple() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('couple_members')
    .select('couple_id, couples(*)')
    .eq('user_id', user.id)
    .single()

  return data?.couples ?? null
}

export async function getCoupleMembers(coupleId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('couple_members')
    .select('*, profiles(*)')
    .eq('couple_id', coupleId)

  return data ?? []
}

export async function getPartnerProfile(coupleId: string, myUserId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('couple_members')
    .select('user_id, profiles(*)')
    .eq('couple_id', coupleId)
    .neq('user_id', myUserId)
    .single()

  return data?.profiles ?? null
}
