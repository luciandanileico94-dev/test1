import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { differenceInDays, format } from "date-fns"
import { ru } from "date-fns/locale"

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split("T")[0]
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

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as const

const cardTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#4a3f44",
} as const

const linkBtn = {
  fontSize: 12,
  color: "hsl(340,75%,55%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter',sans-serif",
  fontWeight: 500,
  textDecoration: "none",
} as const

const quickActions = [
  { href: "/app/calendar/new", label: "Добавить событие",  emoji: "📅", from: "#eff6ff", to: "#eef2ff", border: "#bfdbfe", color: "#3b82f6" },
  { href: "/app/wishlist/new", label: "Добавить желание",   emoji: "🎁", from: "#fffbeb", to: "#fff7ed", border: "#fcd34d", color: "#d97706" },
  { href: "/app/memories/new", label: "Создать альбом",     emoji: "📸", from: "#fdf2f8", to: "#fff0f5", border: "#f9a8d4", color: "#ec4899" },
  { href: "/app/intimacy/new", label: "Отметить близость",  emoji: "❤️", from: "#fff1f2", to: "#ffe4e6", border: "#fda4af", color: "#f43f5e" },
  { href: "/app/checkin",      label: "Заполнить check-in", emoji: "✅", from: "#f0fdf4", to: "#ecfdf5", border: "#86efac", color: "#22c55e" },
  { href: "/app/dates/new",    label: "Идея свидания",      emoji: "💑", from: "#faf5ff", to: "#fdf2f8", border: "#d8b4fe", color: "#a855f7" },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const coupleId = member.couple_id

  const [
    { data: couple },
    { data: nextEvent },
    { data: recentWishlist },
    { data: myCheckin },
    { data: partnerCheckin },
    { data: cycleSupportPrefs },
    { data: cycleSettings },
  ] = await Promise.all([
    supabase.from("couples").select("*").eq("id", coupleId).single(),
    supabase.from("couple_events").select("*").eq("couple_id", coupleId).eq("status", "planned")
      .gte("event_date", new Date().toISOString().split("T")[0]).order("event_date", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("couple_wishlist_items").select("*").eq("couple_id", coupleId).eq("status", "wanted")
      .order("created_at", { ascending: false }).limit(3),
    supabase.from("check_ins").select("id").eq("couple_id", coupleId).eq("user_id", user.id).gte("week_start", getWeekStart()).maybeSingle(),
    supabase.from("check_ins").select("id").eq("couple_id", coupleId).neq("user_id", user.id).gte("week_start", getWeekStart()).maybeSingle(),
    supabase.from("cycle_support_preferences").select("*").eq("couple_id", coupleId).neq("user_id", user.id).maybeSingle(),
    supabase.from("cycle_settings").select("*").eq("couple_id", coupleId).neq("user_id", user.id).eq("show_on_partner_dashboard", true).maybeSingle(),
  ])

  const daysCount = couple?.start_date ? differenceInDays(new Date(), new Date(couple.start_date)) : null

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Couple hero card */}
      <div style={{
        background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
        borderRadius: 24,
        padding: "20px 22px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(233,30,99,.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(255,255,255,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, border: "1px solid rgba(255,255,255,.3)", flexShrink: 0,
          }}>
            {couple?.photo_url
              ? <img src={couple.photo_url} alt="" style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }} />
              : "💑"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>{couple?.name ?? "Наша пара"}</div>
            {couple?.start_date && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
                С {format(new Date(couple.start_date), "d MMMM yyyy", { locale: ru })}
              </div>
            )}
            {daysCount !== null && (
              <div style={{
                marginTop: 8, display: "inline-block",
                background: "rgba(255,255,255,.2)", borderRadius: 20,
                padding: "4px 12px", fontSize: 12, fontWeight: 600,
              }}>
                💕 {daysCount} дней вместе
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cycle support card */}
      {cycleSettings && (
        <div style={{
          ...glassCard,
          background: "linear-gradient(135deg,#faf5ff,#fdf2f8)",
          border: "1px solid #e9d5ff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🌙</span>
            <span style={cardTitle}>Как поддержать сегодня</span>
          </div>
          {cycleSupportPrefs?.custom_partner_message && (
            <p style={{ fontSize: 13, color: "#6b21a8", fontStyle: "italic", marginBottom: 10, background: "rgba(255,255,255,.6)", borderRadius: 12, padding: "8px 12px", border: "1px solid #e9d5ff" }}>
              &ldquo;{cycleSupportPrefs.custom_partner_message}&rdquo;
            </p>
          )}
          {cycleSupportPrefs?.partner_should_do && (
            <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: "#16a34a" }}>✓ Что поможет: </span>{cycleSupportPrefs.partner_should_do}
            </div>
          )}
          {cycleSupportPrefs?.partner_should_avoid && (
            <div style={{ fontSize: 12, color: "#555" }}>
              <span style={{ fontWeight: 600, color: "#f43f5e" }}>✗ Лучше избегать: </span>{cycleSupportPrefs.partner_should_avoid}
            </div>
          )}
          <p style={{ fontSize: 10, color: "#c084fc", marginTop: 10 }}>Она сама выбрала эти рекомендации</p>
        </div>
      )}

      {/* Check-in status */}
      <div style={glassCard}>
        <div style={cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <span style={cardTitle}>Check-in этой недели</span>
          </div>
          <Link href="/app/checkin" style={linkBtn}>Перейти →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <div style={{
            borderRadius: 12, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
            ...(myCheckin
              ? { background: "hsl(152,60%,93%)", color: "hsl(152,60%,30%)", border: "1px solid hsl(152,50%,82%)" }
              : { background: "hsl(340,20%,95%)", color: "#aaa", border: "1px solid hsl(340,20%,88%)" }),
          }}>
            {myCheckin ? "✓ Вы заполнили" : "Вы не заполнили"}
          </div>
          <div style={{
            borderRadius: 12, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
            ...(partnerCheckin
              ? { background: "hsl(152,60%,93%)", color: "hsl(152,60%,30%)", border: "1px solid hsl(152,50%,82%)" }
              : { background: "hsl(340,20%,95%)", color: "#aaa", border: "1px solid hsl(340,20%,88%)" }),
          }}>
            {partnerCheckin ? "✓ Партнёр заполнил" : "Ожидаем партнёра"}
          </div>
        </div>
      </div>

      {/* Next event */}
      {nextEvent && (
        <Link href={`/app/calendar/${nextEvent.id}`} style={{
          ...glassCard,
          display: "block",
          textDecoration: "none",
          cursor: "pointer",
        }}>
          <div style={cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <span style={cardTitle}>Ближайшее событие</span>
            </div>
            <span style={{ color: "#ccc", fontSize: 16 }}>›</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#1e1217", marginTop: 8 }}>{nextEvent.title}</div>
          <div style={{ fontSize: 12, color: "#8a7880", marginTop: 3 }}>
            {format(new Date(nextEvent.event_date), "d MMMM", { locale: ru })}
            {nextEvent.event_time && ` · ${nextEvent.event_time.slice(0, 5)}`}
            {nextEvent.location && ` · 📍 ${nextEvent.location}`}
          </div>
        </Link>
      )}

      {/* Recent wishlist */}
      {recentWishlist && recentWishlist.length > 0 && (
        <div style={glassCard}>
          <div style={cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>🎁</span>
              <span style={cardTitle}>Последние желания</span>
            </div>
            <Link href="/app/wishlist" style={linkBtn}>Все →</Link>
          </div>
          {(recentWishlist as { id: string; title: string; priority: string }[]).map((item, i) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: i < recentWishlist.length - 1 ? "1px solid hsl(340,20%,96%)" : "none",
            }}>
              <span style={{ fontSize: 13, color: "#333" }}>{item.title}</span>
              <span style={{ fontSize: 14 }}>
                {item.priority === "high" ? "🔴" : item.priority === "medium" ? "🟡" : "🟢"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={glassCard}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#bbb", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>
          Быстрые действия
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {quickActions.map(a => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 6px", borderRadius: 14, cursor: "pointer",
                fontFamily: "'Inter',sans-serif", textDecoration: "none",
                background: `linear-gradient(135deg,${a.from},${a.to})`,
                border: `1px solid ${a.border}`,
                color: a.color,
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{a.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.3, textAlign: "center" }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
