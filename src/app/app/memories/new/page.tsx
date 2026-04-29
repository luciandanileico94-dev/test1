"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewAlbumPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
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

    const { error } = await supabase.from("albums").insert({
      couple_id: member.couple_id,
      title: title.trim(),
      description: description.trim() || null,
      created_by: user.id,
    })

    if (error) { toast.error("Ошибка создания альбома"); setLoading(false); return }
    toast.success("Альбом создан!")
    router.push("/app/memories")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новый альбом</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название альбома *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Наш отпуск, Свидания..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="О чём этот альбом..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>
          <button type="submit" disabled={loading || !title.trim()} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Создаём..." : "Создать альбом"}
          </button>
        </form>
      </div>
    </div>
  )
}
