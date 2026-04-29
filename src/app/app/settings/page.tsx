import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import SettingsClient from "./settings-client"

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "20px 22px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
} as const

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
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
        Настройки
      </h1>

      {/* Profile */}
      <div style={glassCard}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 14 }}>
          Профиль
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {profile?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#1e1217" }}>{profile?.name ?? "Без имени"}</div>
            <div style={{ fontSize: 12, color: "#8a7880", marginTop: 2 }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* Couple info */}
      <div style={glassCard}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 14 }}>
          Пара
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#1e1217", marginBottom: 12 }}>
          💝 {couple?.name ?? "Наша пара"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#8a7880" }}>Участники</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {members?.map((m: any) => (
                <span key={m.user_id} style={{
                  fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: "hsl(340,100%,97%)", color: "hsl(340,75%,45%)",
                }}>
                  {m.profiles?.name ?? "?"}
                </span>
              ))}
            </div>
          </div>
          {couple?.start_date && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#8a7880" }}>Вместе с</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#4a3f44" }}>{couple.start_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Invite code */}
      {couple?.invite_code && (
        <div style={glassCard}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 14 }}>
            Пригласить партнёра
          </div>
          <p style={{ fontSize: 12, color: "#8a7880", marginBottom: 12 }}>
            Поделитесь кодом с партнёром, чтобы он присоединился
          </p>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "hsl(340,100%,97%)", borderRadius: 14,
            padding: "14px 20px", border: "1px solid hsl(340,60%,90%)",
          }}>
            <span style={{
              fontFamily: "monospace", fontSize: 28, fontWeight: 700,
              color: "hsl(340,75%,48%)", letterSpacing: "0.2em",
            }}>
              {couple.invite_code}
            </span>
          </div>
        </div>
      )}

      {/* Module links */}
      <div style={glassCard}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 14 }}>
          Настройки модулей
        </div>
        <Link href="/app/cycle/settings" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px", borderRadius: 12, textDecoration: "none",
          background: "hsl(340,20%,98%)", transition: "background .15s",
        }}>
          <span style={{ fontSize: 13, color: "#4a3f44" }}>🌸 Настройки цикла</span>
          <span style={{ color: "#ccc", fontSize: 16 }}>›</span>
        </Link>
      </div>

      {/* Logout */}
      <SettingsClient />
    </div>
  )
}
