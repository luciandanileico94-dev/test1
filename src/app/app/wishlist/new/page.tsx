"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const schema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  type: z.enum(["product", "action", "experience", "date_idea", "intimate_idea", "other"]),
  priority: z.enum(["low", "medium", "high"]),
  price: z.string().optional(),
  link: z.string().url("Введите корректную ссылку").or(z.literal("")).optional(),
})

type FormData = z.infer<typeof schema>

export default function NewWishlistItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "product", priority: "medium" },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) { router.push("/onboarding"); return }

    const { error } = await supabase.from("couple_wishlist_items").insert({
      couple_id: member.couple_id,
      owner_user_id: user.id,
      title: data.title,
      description: data.description || null,
      type: data.type,
      priority: data.priority,
      price: data.price ? parseFloat(data.price) : null,
      link: data.link || null,
      status: "wanted",
    })

    if (error) { toast.error("Ошибка сохранения"); setLoading(false); return }
    toast.success("Желание добавлено!")
    router.push("/app/wishlist")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новое желание</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input {...register("title")} placeholder="Что вы хотите?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select {...register("type")} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="product">🛍️ Товар</option>
                <option value="action">🎯 Действие</option>
                <option value="experience">✨ Впечатление</option>
                <option value="date_idea">💑 Идея свидания</option>
                <option value="intimate_idea">🌹 Интимная идея</option>
                <option value="other">📌 Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <select {...register("priority")} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea {...register("description")} rows={2} placeholder="Подробности (необязательно)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
              <input {...register("price")} type="number" placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка</label>
              <input {...register("link")} type="url" placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              {errors.link && <p className="text-xs text-red-500 mt-1">{errors.link.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Сохраняем..." : "Сохранить желание"}
          </button>
        </form>
      </div>
    </div>
  )
}
