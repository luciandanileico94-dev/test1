import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const moodEmoji: Record<string, string> = {
  romantic: "🌹", playful: "😄", tender: "🥰", passionate: "🔥", calm: "😌", tired: "😴",
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

export default async function IntimacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: records } = await supabase
    .from("intimacy_records").select("*").eq("couple_id", member.couple_id)
    .order("date", { ascending: false }).limit(30)

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
            Близость
          </h1>
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
            🔒 Приватный раздел
          </p>
        </div>
        <Link href="/app/intimacy/new" style={{
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Отметить
        </Link>
      </div>

      {/* Privacy notice */}
      <div style={{
        ...glassCard,
        background: "linear-gradient(135deg,hsl(340,100%,97%),#fff0fb)",
        border: "1px solid hsl(340,60%,90%)",
        fontSize: 12, color: "hsl(340,75%,45%)", padding: "12px 16px",
      }}>
        Записи с видимостью «только для меня» не видны партнёру. Общие записи видны обоим.
      </div>

      {!records || records.length === 0 ? (
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15 }}>Записей пока нет</p>
          <Link href="/app/intimacy/new" style={{
            display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 12,
            background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Добавить запись
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map(record => (
            <div key={record.id} style={glassCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "hsl(340,100%,97%)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {record.mood ? (moodEmoji[record.mood] ?? "💕") : "💕"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1217" }}>
                      {format(new Date(record.date), "d MMMM yyyy", { locale: ru })}
                    </div>
                    {record.notes && record.created_by === user.id && (
                      <div style={{ fontSize: 12, color: "#8a7880", marginTop: 2 }}>{record.notes}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {record.rating && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 12, color: i < record.rating ? "hsl(340,75%,55%)" : "#e5e7eb" }}>★</span>
                      ))}
                    </div>
                  )}
                  {record.visibility === "private" && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "hsl(340,20%,95%)", color: "#aaa" }}>
                      🔒 Только я
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
