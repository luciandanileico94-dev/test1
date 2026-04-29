import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const phaseConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  menstruation: { label: "Менструация",    bg: "#fff1f2", color: "#f43f5e", border: "#fda4af" },
  follicular:   { label: "Фолликулярная", bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
  ovulation:    { label: "Овуляция",       bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  luteal:       { label: "Лютеиновая",     bg: "#faf5ff", color: "#9333ea", border: "#d8b4fe" },
  unknown:      { label: "Неизвестно",     bg: "hsl(340,20%,95%)", color: "#aaa", border: "hsl(340,20%,88%)" },
}

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "20px 22px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
} as const

export default async function CyclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: settings } = await supabase
    .from("cycle_settings").select("*").eq("couple_id", member.couple_id).eq("user_id", user.id).maybeSingle()

  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [{ data: recentDays }, { data: todayRecord }] = await Promise.all([
    supabase.from("cycle_days").select("*")
      .eq("couple_id", member.couple_id).eq("user_id", user.id).gte("date", weekAgo)
      .order("date", { ascending: false }),
    supabase.from("cycle_days").select("*")
      .eq("couple_id", member.couple_id).eq("user_id", user.id).eq("date", today).maybeSingle(),
  ])

  if (!settings?.is_enabled) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
            Календарь цикла
          </h1>
          <Link href="/app/cycle/settings" style={{ fontSize: 18, textDecoration: "none" }}>⚙️</Link>
        </div>
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15, marginBottom: 6 }}>Трекер цикла</p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Отслеживайте цикл и настройте что видит партнёр</p>
          <Link href="/app/cycle/settings" style={{
            display: "inline-block", padding: "11px 28px", borderRadius: 12,
            background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(233,30,99,.25)",
          }}>
            Включить и настроить
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Мой цикл
        </h1>
        <Link href="/app/cycle/settings" style={{ fontSize: 18, textDecoration: "none" }}>⚙️</Link>
      </div>

      {/* Today */}
      <div style={glassCard}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#8a7880", marginBottom: 12 }}>
          Сегодня — {format(new Date(), "d MMMM", { locale: ru })}
        </div>
        {todayRecord ? (
          <div>
            {todayRecord.phase && (
              <div style={{
                display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: phaseConfig[todayRecord.phase]?.bg ?? "hsl(340,20%,95%)",
                color: phaseConfig[todayRecord.phase]?.color ?? "#aaa",
                border: `1px solid ${phaseConfig[todayRecord.phase]?.border ?? "hsl(340,20%,88%)"}`,
              }}>
                {phaseConfig[todayRecord.phase]?.label ?? todayRecord.phase}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              {todayRecord.energy_level && (
                <div style={{ fontSize: 12, color: "#8a7880" }}>
                  <span>Энергия: </span>{"⚡".repeat(todayRecord.energy_level)}
                </div>
              )}
              {todayRecord.pain_level && (
                <div style={{ fontSize: 12, color: "#8a7880" }}>
                  <span>Боль: </span>{"😣".repeat(todayRecord.pain_level)}
                </div>
              )}
            </div>
            <Link href={`/app/cycle/day/${today}`} style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: "hsl(340,75%,55%)", textDecoration: "none", fontWeight: 500 }}>
              Редактировать →
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>Сегодня ещё не заполнено</p>
            <Link href={`/app/cycle/day/${today}`} style={{
              display: "inline-block", padding: "10px 24px", borderRadius: 12,
              background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
              color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Заполнить сегодня
            </Link>
          </div>
        )}
      </div>

      {/* Recent days */}
      {recentDays && recentDays.length > 0 && (
        <div style={glassCard}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8a7880", marginBottom: 12 }}>Последние дни</div>
          <div>
            {recentDays.map((day, i) => (
              <Link key={day.id} href={`/app/cycle/day/${day.date}`} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", textDecoration: "none",
                borderBottom: i < recentDays.length - 1 ? "1px solid hsl(340,20%,96%)" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#4a3f44" }}>
                  {format(new Date(day.date), "d MMMM", { locale: ru })}
                </span>
                {day.phase && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                    background: phaseConfig[day.phase]?.bg ?? "hsl(340,20%,95%)",
                    color: phaseConfig[day.phase]?.color ?? "#aaa",
                  }}>
                    {phaseConfig[day.phase]?.label ?? day.phase}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href={`/app/cycle/day/${today}`} style={{
          ...glassCard,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px 16px", textDecoration: "none", textAlign: "center",
          background: "linear-gradient(135deg,hsl(340,100%,97%),#fff0fb)",
          border: "1px solid hsl(340,60%,90%)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#4a3f44" }}>Записать день</p>
        </Link>
        <Link href="/app/cycle/preferences" style={{
          ...glassCard,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px 16px", textDecoration: "none", textAlign: "center",
          background: "linear-gradient(135deg,#faf5ff,#fdf2f8)",
          border: "1px solid #e9d5ff",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💝</div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#4a3f44" }}>Моя поддержка</p>
        </Link>
      </div>
    </div>
  )
}
