import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

const categoryEmoji: Record<string, string> = {
  "дома": "🏠", "прогулка": "🚶", "ресторан": "🍽️", "поездка": "✈️",
  "романтика": "🌹", "бесплатно": "🆓", "дорого": "💎", "интимная_идея": "🌸", "другое": "📌",
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  idea:      { label: "💡 Идея",          bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  planned:   { label: "📅 Запланировано", bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe" },
  completed: { label: "✅ Было",          bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
}

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "16px 18px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
} as const

export default async function DateIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: ideas } = await supabase
    .from("date_ideas").select("*").eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const byStatus = {
    idea:      ideas?.filter(i => i.status === "idea")      ?? [],
    planned:   ideas?.filter(i => i.status === "planned")   ?? [],
    completed: ideas?.filter(i => i.status === "completed") ?? [],
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Идеи свиданий
        </h1>
        <Link href="/app/dates/new" style={{
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Добавить
        </Link>
      </div>

      {ideas?.length === 0 && (
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💑</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15 }}>Идей свиданий пока нет</p>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Сохраните идеи и превращайте их в события</p>
        </div>
      )}

      {(["idea", "planned", "completed"] as const).map(status => byStatus[status].length > 0 && (
        <div key={status}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>
            {statusConfig[status].label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {byStatus[status].map(idea => (
              <Link key={idea.id} href={`/app/dates/${idea.id}`} style={{
                ...glassCard,
                display: "block",
                textDecoration: "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#faf5ff,#fdf2f8)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {categoryEmoji[idea.category] ?? "📌"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1217" }}>{idea.title}</div>
                    {idea.description && (
                      <div style={{ fontSize: 12, color: "#8a7880", marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {idea.description}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#bbb", textTransform: "capitalize" }}>{idea.category}</span>
                      {idea.estimated_price && (
                        <span style={{ fontSize: 11, color: "#bbb" }}>~{Number(idea.estimated_price).toLocaleString("ru-RU")} ₽</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
                    background: statusConfig[status].bg,
                    color: statusConfig[status].color,
                    border: `1px solid ${statusConfig[status].border}`,
                  }}>
                    {statusConfig[status].label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
