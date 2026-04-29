import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const [{ data: couple }, { data: profile }, { data: members }] = await Promise.all([
    supabase.from("couples").select("*").eq("id", member.couple_id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("couple_members").select("user_id, profiles(*)").eq("couple_id", member.couple_id),
  ])

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Настройки</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <h2 className="font-semibold text-gray-700 mb-3">Профиль</h2>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-xl font-semibold text-rose-600">
            {profile?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-medium text-gray-800">{profile?.name ?? "Без имени"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Couple info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <h2 className="font-semibold text-gray-700 mb-3">Пара — {couple?.name}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Участники</span>
            <div className="flex items-center gap-2">
              {members?.map((m: any) => (
                <span key={m.user_id} className="text-sm font-medium text-gray-700">{m.profiles?.name ?? "?"}</span>
              ))}
            </div>
          </div>
          {couple?.start_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Вместе с</span>
              <span className="text-sm text-gray-700">{couple.start_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Invite code */}
      {couple?.invite_code && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="font-semibold text-gray-700 mb-2">Пригласить партнёра</h2>
          <p className="text-xs text-gray-500 mb-3">Поделитесь кодом с партнёром чтобы он присоединился</p>
          <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-3">
            <span className="font-mono text-xl font-bold text-rose-600 tracking-widest flex-1 text-center">
              {couple.invite_code}
            </span>
          </div>
        </div>
      )}

      {/* Module links */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <h2 className="font-semibold text-gray-700 mb-3">Настройки модулей</h2>
        <div className="space-y-2">
          <Link href="/app/cycle/settings" className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-xl px-2 transition-colors">
            <span className="text-sm text-gray-700">🌸 Настройки цикла</span>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <SettingsClient />
    </div>
  )
}
