"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal" | "unknown"

const phases: { value: CyclePhase; label: string; emoji: string }[] = [
  { value: "menstruation", label: "Менструация", emoji: "🩸" },
  { value: "follicular", label: "Фолликулярная", emoji: "🌱" },
  { value: "ovulation", label: "Овуляция", emoji: "🌻" },
  { value: "luteal", label: "Лютеиновая", emoji: "🍂" },
]

type Prefs = {
  what_helps: string
  what_makes_worse: string
  partner_should_do: string
  partner_should_avoid: string
  food_preferences: string
  drink_preferences: string
  comfort_food_preferences: string
  attention_preferences: string
  space_preferences: string
  physical_contact_preferences: string
  intimacy_boundaries: string
  custom_partner_message: string
}

const empty: Prefs = {
  what_helps: "", what_makes_worse: "", partner_should_do: "", partner_should_avoid: "",
  food_preferences: "", drink_preferences: "", comfort_food_preferences: "",
  attention_preferences: "", space_preferences: "", physical_contact_preferences: "",
  intimacy_boundaries: "", custom_partner_message: "",
}

export default function CyclePreferencesPage() {
  const router = useRouter()
  const [activePhase, setActivePhase] = useState<CyclePhase>("menstruation")
  const [allPrefs, setAllPrefs] = useState<Record<CyclePhase, Prefs>>({
    menstruation: { ...empty }, follicular: { ...empty }, ovulation: { ...empty }, luteal: { ...empty }, unknown: { ...empty },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coupleId, setCoupleId] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
      if (!member) { router.push("/onboarding"); return }
      setCoupleId(member.couple_id)

      const { data } = await supabase.from("cycle_support_preferences").select("*").eq("couple_id", member.couple_id).eq("user_id", user.id)
      if (data) {
        const map = { ...allPrefs }
        data.forEach((row: any) => {
          if (row.phase in map) map[row.phase as CyclePhase] = {
            what_helps: row.what_helps ?? "", what_makes_worse: row.what_makes_worse ?? "",
            partner_should_do: row.partner_should_do ?? "", partner_should_avoid: row.partner_should_avoid ?? "",
            food_preferences: row.food_preferences ?? "", drink_preferences: row.drink_preferences ?? "",
            comfort_food_preferences: row.comfort_food_preferences ?? "",
            attention_preferences: row.attention_preferences ?? "", space_preferences: row.space_preferences ?? "",
            physical_contact_preferences: row.physical_contact_preferences ?? "",
            intimacy_boundaries: row.intimacy_boundaries ?? "", custom_partner_message: row.custom_partner_message ?? "",
          }
        })
        setAllPrefs(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  function update(field: keyof Prefs, value: string) {
    setAllPrefs(prev => ({ ...prev, [activePhase]: { ...prev[activePhase], [field]: value } }))
  }

  async function onSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("cycle_support_preferences").upsert({
      couple_id: coupleId, user_id: userId, phase: activePhase,
      ...allPrefs[activePhase],
    })
    if (error) { toast.error("Ошибка сохранения"); setSaving(false); return }
    toast.success("Сохранено!")
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Загрузка...</div>

  const cur = allPrefs[activePhase]
  const fields: { key: keyof Prefs; label: string; placeholder: string }[] = [
    { key: "what_helps", label: "Что помогает", placeholder: "Чай, грелка, любимая еда, тишина..." },
    { key: "what_makes_worse", label: "Что ухудшает", placeholder: "Споры, давление, шум..." },
    { key: "partner_should_do", label: "Партнёру стоит", placeholder: "Обнять, принести вкусное, помочь по дому..." },
    { key: "partner_should_avoid", label: "Партнёру лучше избегать", placeholder: "Давить, спорить, шутить про гормоны..." },
    { key: "comfort_food_preferences", label: "Любимая еда и сладкое", placeholder: "Шоколад, пицца, любимое мучное..." },
    { key: "drink_preferences", label: "Любимые напитки", placeholder: "Чай с лимоном, какао..." },
    { key: "attention_preferences", label: "Внимание", placeholder: "Хочу больше внимания / хочу пространства..." },
    { key: "physical_contact_preferences", label: "Физический контакт", placeholder: "Обнять, не трогать, только рядом быть..." },
    { key: "intimacy_boundaries", label: "Близость — границы", placeholder: "Не инициировать / спросить / открыта к..." },
    { key: "custom_partner_message", label: "Сообщение партнёру", placeholder: "Сегодня мне может быть тяжело. Мне поможет..." },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Моя поддержка по фазам</h1>
          <p className="text-xs text-gray-400">Всё что ты выберешь здесь — видит только партнёр, если ты разрешишь</p>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {phases.map(p => (
          <button key={p.value} onClick={() => setActivePhase(p.value)} className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activePhase === p.value ? "bg-rose-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <textarea
              value={cur[f.key]}
              onChange={e => update(f.key, e.target.value)}
              rows={f.key === "custom_partner_message" ? 3 : 2}
              placeholder={f.placeholder}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>
        ))}
      </div>

      <button onClick={onSave} disabled={saving} className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
        {saving ? "Сохраняем..." : "Сохранить"}
      </button>
    </div>
  )
}
