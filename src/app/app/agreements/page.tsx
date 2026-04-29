import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  active:           { label: "✅ Действует",    bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
  needs_discussion: { label: "💬 Обсуждается",  bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  archived:         { label: "📦 Архив",         bg: "hsl(340,20%,95%)", color: "#aaa", border: "hsl(340,20%,88%)" },
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

export default async function AgreementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: agreements } = await supabase
    .from("agreements").select("*").eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const groups = [
    { key: "active",           items: agreements?.filter(a => a.status === "active")           ?? [], title: "Действующие" },
    { key: "needs_discussion", items: agreements?.filter(a => a.status === "needs_discussion") ?? [], title: "На обсуждении" },
    { key: "archived",         items: agreements?.filter(a => a.status === "archived")         ?? [], title: "Архив" },
  ]

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Договорённости
        </h1>
        <Link href="/app/agreements/new" style={{
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Добавить
        </Link>
      </div>

      {agreements?.length === 0 && (
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15 }}>Договорённостей пока нет</p>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Зафиксируйте важные правила вашей пары</p>
        </div>
      )}

      {groups.map(({ key, items, title }) => items.length > 0 && (
        <div key={key}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#bbb", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>
            {title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(a => (
              <Link key={a.id} href={`/app/agreements/${a.id}`} style={{
                ...glassCard,
                display: "block",
                textDecoration: "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1217" }}>{a.title}</div>
                    {a.description && (
                      <div style={{ fontSize: 12, color: "#8a7880", marginTop: 4, lineHeight: 1.5 }}>
                        {a.description}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
                    background: statusConfig[a.status]?.bg ?? "hsl(340,20%,95%)",
                    color: statusConfig[a.status]?.color ?? "#aaa",
                    border: `1px solid ${statusConfig[a.status]?.border ?? "hsl(340,20%,88%)"}`,
                  }}>
                    {statusConfig[a.status]?.label ?? a.status}
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
