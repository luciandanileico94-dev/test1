"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const examples = [
  "Как мы решаем конфликты",
  "Как часто ходим на свидания",
  "Как делим расходы",
  "Что важно в близости",
  "Какие темы обсуждаем честно",
]

export default function NewAgreementPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"active" | "needs_discussion">("active")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) { router.push("/onboarding"); return }

    const { error } = await supabase.from("agreements").insert({
      couple_id: member.couple_id,
      title: title.trim(),
      description: description.trim() || null,
      status,
      created_by: user.id,
    })

    if (error) { toast.error("Ошибка сохранения"); setLoading(false); return }
    toast.success("Договорённость добавлена!")
    router.push("/app/agreements")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новая договорённость</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тема *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="О чём договорились?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <div className="flex flex-wrap gap-2 mt-2">
              {examples.map(ex => (
                <button key={ex} type="button" onClick={() => setTitle(ex)} className="text-xs px-2 py-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Подробности договорённости..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStatus("active")} className={`py-2.5 rounded-xl text-sm border transition-colors ${status === "active" ? "bg-green-50 border-green-300 text-green-700 font-medium" : "border-gray-200 text-gray-600"}`}>
                ✅ Действует
              </button>
              <button type="button" onClick={() => setStatus("needs_discussion")} className={`py-2.5 rounded-xl text-sm border transition-colors ${status === "needs_discussion" ? "bg-amber-50 border-amber-300 text-amber-700 font-medium" : "border-gray-200 text-gray-600"}`}>
                💬 На обсуждении
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || !title.trim()} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  )
}
