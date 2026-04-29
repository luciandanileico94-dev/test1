"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const categories = [
  { value: "дома", label: "🏠 Дома" },
  { value: "прогулка", label: "🚶 Прогулка" },
  { value: "ресторан", label: "🍽️ Ресторан" },
  { value: "поездка", label: "✈️ Поездка" },
  { value: "романтика", label: "🌹 Романтика" },
  { value: "бесплатно", label: "🆓 Бесплатно" },
  { value: "дорого", label: "💎 Особое" },
  { value: "интимная_идея", label: "🌸 Интимная идея" },
  { value: "другое", label: "📌 Другое" },
]

export default function NewDateIdeaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "", description: "", category: "другое", estimated_price: "", location: "", priority: "medium",
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) { router.push("/onboarding"); return }

    const { error } = await supabase.from("date_ideas").insert({
      couple_id: member.couple_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      estimated_price: form.estimated_price ? parseFloat(form.estimated_price) : null,
      location: form.location.trim() || null,
      priority: form.priority,
      status: "idea",
      created_by: user.id,
    })

    if (error) { toast.error("Ошибка сохранения"); setLoading(false); return }
    toast.success("Идея добавлена!")
    router.push("/app/dates")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новая идея свидания</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Идея свидания" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(c => (
                <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, category: c.value }))} className={`px-2 py-2 rounded-xl text-xs border transition-colors ${form.category === c.value ? "bg-rose-50 border-rose-300 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Подробности..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Где?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Примерная цена</label>
              <input type="number" value={form.estimated_price} onChange={e => setForm(f => ({ ...f, estimated_price: e.target.value }))} placeholder="₽" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>
          <button type="submit" disabled={loading || !form.title.trim()} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Сохраняем..." : "Сохранить идею"}
          </button>
        </form>
      </div>
    </div>
  )
}
