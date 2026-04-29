import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const typeEmoji: Record<string, string> = {
  date: "💑", anniversary: "🥂", trip: "✈️",
  sex: "🌹", conversation: "💬", reminder: "🔔", custom: "📌",
}
const typeLabel: Record<string, string> = {
  date: "Свидание", anniversary: "Годовщина", trip: "Поездка",
  sex: "Близость", conversation: "Разговор", reminder: "Напоминание", custom: "Другое",
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

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: events } = await supabase
    .from("couple_events").select("*").eq("couple_id", member.couple_id)
    .order("event_date", { ascending: true })

  const today = new Date().toISOString().split("T")[0]
  const upcoming = events?.filter(e => e.event_date >= today && e.status === "planned") ?? []
  const past = events?.filter(e => e.event_date < today || e.status !== "planned") ?? []

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Календарь
        </h1>
        <Link href="/app/calendar/new" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Добавить
        </Link>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15 }}>Событий пока нет</p>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Добавьте первое событие или свидание</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>
            Предстоящие
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(event => (
              <Link key={event.id} href={`/app/calendar/${event.id}`} style={{
                ...glassCard,
                display: "block",
                textDecoration: "none",
                ...(event.type === "anniversary" ? {
                  background: "linear-gradient(135deg,hsl(340,100%,97%),#fff0fb)",
                  border: "1px solid hsl(340,60%,90%)",
                } : {}),
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: event.type === "anniversary" ? "hsl(340,100%,94%)" : "hsl(340,20%,96%)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {typeEmoji[event.type] ?? "📌"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1217" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "#8a7880", marginTop: 3 }}>
                      {format(new Date(event.event_date), "d MMMM yyyy", { locale: ru })}
                      {event.event_time && ` · ${event.event_time.slice(0, 5)}`}
                    </div>
                    {event.location && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>📍 {event.location}</div>}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                    background: event.type === "anniversary" ? "hsl(340,75%,55%)" : "hsl(340,20%,94%)",
                    color: event.type === "anniversary" ? "#fff" : "#8a7880",
                    flexShrink: 0,
                  }}>
                    {typeLabel[event.type] ?? "Другое"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>
            Прошедшие
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {past.map(event => (
              <Link key={event.id} href={`/app/calendar/${event.id}`} style={{
                ...glassCard,
                display: "block",
                textDecoration: "none",
                opacity: 0.75,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "hsl(340,10%,94%)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    filter: "grayscale(40%)",
                  }}>
                    {typeEmoji[event.type] ?? "📌"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#4a3f44" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>
                      {format(new Date(event.event_date), "d MMMM yyyy", { locale: ru })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                    background: "hsl(340,10%,92%)", color: "#aaa", flexShrink: 0,
                  }}>
                    {event.status === "completed" ? "Состоялось" : event.status === "cancelled" ? "Отменено" : "Прошло"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
