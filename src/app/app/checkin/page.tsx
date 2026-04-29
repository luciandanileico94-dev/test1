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
  { key: "mood", label: "Как я себя чувствую в отношениях на этой неделе?", placeholder: "Напиши честно, как тебе было..." },
  { key: "gratitude", label: "Что я ценил(а) на этой неделе?", placeholder: "Что партнёр сделал, что тебя тронуло..." },
  { key: "missing", label: "Чего мне не хватало?", placeholder: "Чего ты хотел(а) больше..." },
  { key: "want_to_discuss", label: "Что хочу обсудить?", placeholder: "Темы, вопросы, переживания..." },
  { key: "want_to_do_together", label: "Что хочу сделать вместе?", placeholder: "Планы, свидания, активности..." },
]

export default function CheckInPage() {
  const router = useRouter()
  const weekStart = getWeekStart()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [myCheckin, setMyCheckin] = useState<any>(null)
  const [partnerCheckin, setPartnerCheckin] = useState<any>(null)
  const [form, setForm] = useState({ mood: "", gratitude: "", missing: "", want_to_discuss: "", want_to_do_together: "" })
  const [userId, setUserId] = useState("")
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
    const { error } = await supabase.from("check_ins").upsert({
      couple_id: coupleId,
      user_id: userId,
      week_start: weekStart,
      ...form,
    })
    if (error) { toast.error("Ошибка сохранения"); setSaving(false); return }
    toast.success("Check-in заполнен!")
    setMyCheckin(form)
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Загрузка...</div>

  const bothCompleted = myCheckin && partnerCheckin

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Check-in недели</h1>

      {/* Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
        <div className="flex gap-3">
          <div className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${myCheckin ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
            {myCheckin ? "✓ Вы заполнили" : "Вы не заполнили"}
          </div>
          <div className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${partnerCheckin ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
            {partnerCheckin ? "✓ Партнёр заполнил" : "Ожидаем партнёра"}
          </div>
        </div>
        {!bothCompleted && (
          <p className="text-xs text-gray-400 text-center mt-2">Ответы партнёра видны только после того, как оба заполнят check-in</p>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-4">
        <h2 className="font-semibold text-gray-700">Ваши ответы</h2>
        {questions.map(q => (
          <div key={q.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{q.label}</label>
            <textarea
              value={form[q.key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [q.key]: e.target.value }))}
              rows={2}
              placeholder={q.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>
        ))}
        <button onClick={onSave} disabled={saving} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
          {saving ? "Сохраняем..." : myCheckin ? "Обновить ответы" : "Отправить check-in"}
        </button>
      </div>

      {/* Partner answers — visible only when both completed */}
      {bothCompleted && partnerCheckin && (
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 space-y-4">
          <h2 className="font-semibold text-rose-700">Ответы партнёра</h2>
          {questions.map(q => partnerCheckin[q.key] && (
            <div key={q.key}>
              <p className="text-xs font-medium text-gray-500 mb-1">{q.label}</p>
              <p className="text-sm text-gray-700 bg-white rounded-xl px-3 py-2">{partnerCheckin[q.key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
