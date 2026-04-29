"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Phase = "menstruation" | "follicular" | "ovulation" | "luteal" | "unknown"
type IntimacyPref = "do_not_initiate" | "ask_gently" | "romantic_only" | "open" | "private"
type CommPref = "need_space" | "need_attention" | "normal" | "sensitive" | "wants_support"

const phaseOptions: { value: Phase; label: string }[] = [
  { value: "menstruation", label: "🩸 Менструация" },
  { value: "follicular", label: "🌱 Фолликулярная" },
  { value: "ovulation", label: "🌻 Овуляция" },
  { value: "luteal", label: "🍂 Лютеиновая" },
  { value: "unknown", label: "❓ Не знаю" },
]

const intimacyOptions: { value: IntimacyPref; label: string }[] = [
  { value: "do_not_initiate", label: "🚫 Не инициировать" },
  { value: "ask_gently", label: "💭 Спросить мягко" },
  { value: "romantic_only", label: "🌹 Только романтика" },
  { value: "open", label: "✨ Открыта" },
  { value: "private", label: "🔒 Личное" },
]

const commOptions: { value: CommPref; label: string }[] = [
  { value: "need_space", label: "🕊️ Нужно пространство" },
  { value: "need_attention", label: "💕 Нужно внимание" },
  { value: "normal", label: "😊 Обычный день" },
  { value: "sensitive", label: "🌊 Чувствительный день" },
  { value: "wants_support", label: "🤗 Хочу поддержки" },
]

export default function CycleDayPage() {
  const router = useRouter()
  const params = useParams()
  const date = params.date as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    phase: "" as Phase | "",
    mood: "",
    energy_level: 0,
    pain_level: 0,
    notes: "",
    intimacy_preference: "private" as IntimacyPref,
    communication_preference: "normal" as CommPref,
    symptoms: [] as string[],
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
      if (!member) { router.push("/onboarding"); return }

      const { data } = await supabase.from("cycle_days").select("*").eq("couple_id", member.couple_id).eq("user_id", user.id).eq("date", date).maybeSingle()
      if (data) {
        setForm({
          phase: data.phase ?? "",
          mood: data.mood ?? "",
          energy_level: data.energy_level ?? 0,
          pain_level: data.pain_level ?? 0,
          notes: data.notes ?? "",
          intimacy_preference: data.intimacy_preference ?? "private",
          communication_preference: data.communication_preference ?? "normal",
          symptoms: data.symptoms ?? [],
        })
      }
      setLoading(false)
    }
    load()
  }, [date])

  async function onSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) return

    const { error } = await supabase.from("cycle_days").upsert({
      couple_id: member.couple_id,
      user_id: user.id,
      date,
      phase: form.phase || null,
      mood: form.mood || null,
      energy_level: form.energy_level || null,
      pain_level: form.pain_level || null,
      notes: form.notes || null,
      intimacy_preference: form.intimacy_preference,
      communication_preference: form.communication_preference,
      symptoms: form.symptoms.length > 0 ? form.symptoms : null,
    })

    if (error) { toast.error("Ошибка сохранения"); setSaving(false); return }
    toast.success("День записан!")
    router.push("/app/cycle")
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Загрузка...</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Запись дня — {date}</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Фаза цикла</label>
          <div className="grid grid-cols-2 gap-2">
            {phaseOptions.map(p => (
              <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, phase: f.phase === p.value ? "" : p.value }))} className={`px-3 py-2 rounded-xl text-sm border transition-colors text-left ${form.phase === p.value ? "bg-rose-50 border-rose-300 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Настроение</label>
          <input value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))} placeholder="Как ты себя чувствуешь?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Энергия {form.energy_level > 0 ? `${form.energy_level}/5` : ""}</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, energy_level: f.energy_level === n ? 0 : n }))} className={`flex-1 h-8 rounded-lg text-sm transition-colors ${n <= form.energy_level ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-400"}`}>⚡</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Боль {form.pain_level > 0 ? `${form.pain_level}/5` : ""}</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, pain_level: f.pain_level === n ? 0 : n }))} className={`flex-1 h-8 rounded-lg text-sm transition-colors ${n <= form.pain_level ? "bg-red-400 text-white" : "bg-gray-100 text-gray-400"}`}>😣</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Близость</label>
          <div className="space-y-1.5">
            {intimacyOptions.map(o => (
              <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, intimacy_preference: o.value }))} className={`w-full px-3 py-2 rounded-xl text-sm border transition-colors text-left ${form.intimacy_preference === o.value ? "bg-rose-50 border-rose-300 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Общение</label>
          <div className="space-y-1.5">
            {commOptions.map(o => (
              <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, communication_preference: o.value }))} className={`w-full px-3 py-2 rounded-xl text-sm border transition-colors text-left ${form.communication_preference === o.value ? "bg-rose-50 border-rose-300 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Личные заметки..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
        </div>
      </div>

      <button onClick={onSave} disabled={saving} className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
        {saving ? "Сохраняем..." : "Сохранить день"}
      </button>
    </div>
  )
}
