"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const moods = [
  { value: "romantic", label: "🌹 Романтично" },
  { value: "playful", label: "😄 Игриво" },
  { value: "tender", label: "🥰 Нежно" },
  { value: "passionate", label: "🔥 Страстно" },
  { value: "calm", label: "😌 Спокойно" },
  { value: "tired", label: "😴 Устали" },
]

export default function NewIntimacyPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [mood, setMood] = useState("")
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState("")
  const [visibility, setVisibility] = useState<"shared" | "private">("shared")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) { router.push("/onboarding"); return }

    const { error } = await supabase.from("intimacy_records").insert({
      couple_id: member.couple_id,
      date,
      mood: mood || null,
      rating: rating || null,
      notes: notes.trim() || null,
      visibility,
      created_by: user.id,
    })

    if (error) { toast.error("Ошибка сохранения"); setLoading(false); return }
    toast.success("Записано!")
    router.push("/app/intimacy")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новая запись</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Настроение</label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map(m => (
                <button key={m.value} type="button" onClick={() => setMood(mood === m.value ? "" : m.value)} className={`px-3 py-2 rounded-xl text-xs border transition-colors ${mood === m.value ? "bg-rose-50 border-rose-300 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)} className={`text-2xl transition-opacity ${n <= rating ? "opacity-100" : "opacity-30"}`}>★</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Личные заметки (необязательно)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Видимость</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setVisibility("shared")} className={`py-2.5 rounded-xl text-sm border transition-colors ${visibility === "shared" ? "bg-rose-50 border-rose-300 text-rose-700 font-medium" : "border-gray-200 text-gray-600"}`}>
                👥 Видно партнёру
              </button>
              <button type="button" onClick={() => setVisibility("private")} className={`py-2.5 rounded-xl text-sm border transition-colors ${visibility === "private" ? "bg-gray-100 border-gray-300 text-gray-700 font-medium" : "border-gray-200 text-gray-600"}`}>
                🔒 Только для меня
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  )
}
