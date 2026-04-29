"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split("T")[0]
}

const questions = [
  { key: "mood",               label: "Как я себя чувствую в отношениях на этой неделе?", placeholder: "Напиши честно, как тебе было..." },
  { key: "gratitude",          label: "Что я ценил(а) на этой неделе?",                   placeholder: "Что партнёр сделал, что тебя тронуло..." },
  { key: "missing",            label: "Чего мне не хватало?",                             placeholder: "Чего ты хотел(а) больше..." },
  { key: "want_to_discuss",    label: "Что хочу обсудить?",                               placeholder: "Темы, вопросы, переживания..." },
  { key: "want_to_do_together",label: "Что хочу сделать вместе?",                         placeholder: "Планы, свидания, активности..." },
]

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)" as string,
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "20px 22px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
}

export default function CheckInPage() {
  const router = useRouter()
  const weekStart = getWeekStart()
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [myCheckin, setMyCheckin]   = useState<any>(null)
  const [partnerCheckin, setPartnerCheckin] = useState<any>(null)
  const [form, setForm] = useState({ mood: "", gratitude: "", missing: "", want_to_discuss: "", want_to_do_together: "" })
  const [userId, setUserId]   = useState("")
  const [coupleId, setCoupleId] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
      if (!member) { router.push("/onboarding"); return }
      setCoupleId(member.couple_id)

      const { data: my } = await supabase.from("check_ins").select("*").eq("couple_id", member.couple_id).eq("user_id", user.id).eq("week_start", weekStart).maybeSingle()
      setMyCheckin(my)
      if (my) setForm({ mood: my.mood ?? "", gratitude: my.gratitude ?? "", missing: my.missing ?? "", want_to_discuss: my.want_to_discuss ?? "", want_to_do_together: my.want_to_do_together ?? "" })

      const { data: partner } = await supabase.from("check_ins").select("*").eq("couple_id", member.couple_id).neq("user_id", user.id).eq("week_start", weekStart).maybeSingle()
      setPartnerCheckin(partner)
      setLoading(false)
    }
    load()
  }, [])

  async function onSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("check_ins").upsert({ couple_id: coupleId, user_id: userId, week_start: weekStart, ...form })
    if (error) { toast.error("Ошибка сохранения"); setSaving(false); return }
    toast.success("Check-in заполнен! 💕")
    setMyCheckin({ ...form })
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256, color: "#bbb", fontSize: 14 }}>
        Загрузка...
      </div>
    )
  }

  const bothCompleted = myCheckin && partnerCheckin

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
        Check-in недели
      </h1>

      {/* Status chips */}
      <div style={glassCard}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{
            borderRadius: 12, padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
            ...(myCheckin
              ? { background: "hsl(152,60%,93%)", color: "hsl(152,60%,30%)", border: "1px solid hsl(152,50%,82%)" }
              : { background: "hsl(340,20%,95%)", color: "#aaa", border: "1px solid hsl(340,20%,88%)" }),
          }}>
            {myCheckin ? "✓ Вы заполнили" : "Вы не заполнили"}
          </div>
          <div style={{
            borderRadius: 12, padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600,
            ...(partnerCheckin
              ? { background: "hsl(152,60%,93%)", color: "hsl(152,60%,30%)", border: "1px solid hsl(152,50%,82%)" }
              : { background: "hsl(340,20%,95%)", color: "#aaa", border: "1px solid hsl(340,20%,88%)" }),
          }}>
            {partnerCheckin ? "✓ Партнёр заполнил" : "Ожидаем партнёра"}
          </div>
        </div>
        {!bothCompleted && (
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
            Ответы партнёра видны только после того, как оба заполнят check-in
          </p>
        )}
      </div>

      {/* Form */}
      <div style={glassCard}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4a3f44", marginBottom: 16 }}>Ваши ответы</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {questions.map(q => (
            <div key={q.key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#4a3f44", marginBottom: 6 }}>
                {q.label}
              </label>
              <textarea
                value={form[q.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [q.key]: e.target.value }))}
                rows={2}
                placeholder={q.placeholder}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: "1.5px solid hsl(340,20%,88%)", fontSize: 13,
                  fontFamily: "'Inter', sans-serif", resize: "none",
                  outline: "none", boxSizing: "border-box",
                  background: "hsl(340,20%,99%)", color: "#333",
                  transition: "border-color .15s",
                }}
                onFocus={e => { e.target.style.borderColor = "hsl(340,75%,70%)" }}
                onBlur={e => { e.target.style.borderColor = "hsl(340,20%,88%)" }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 14,
            background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
            color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(233,30,99,.25)",
            opacity: saving ? 0.6 : 1,
            transition: "opacity .15s",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {saving ? "Сохраняем..." : myCheckin ? "Обновить ответы" : "Отправить check-in"}
        </button>
      </div>

      {/* Partner answers */}
      {bothCompleted && partnerCheckin && (
        <div style={{
          ...glassCard,
          background: "linear-gradient(135deg,hsl(340,100%,97%),#fff0fb)",
          border: "1px solid hsl(340,60%,90%)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(340,75%,45%)", marginBottom: 16 }}>
            💕 Ответы партнёра
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {questions.map(q => partnerCheckin[q.key] && (
              <div key={q.key}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#8a7880", marginBottom: 4 }}>{q.label}</p>
                <p style={{ fontSize: 13, color: "#333", background: "rgba(255,255,255,.7)", borderRadius: 10, padding: "8px 12px", margin: 0 }}>
                  {partnerCheckin[q.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
