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
  event_date: z.string().min(1, "Выберите дату"),
  event_time: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["date", "anniversary", "trip", "sex", "conversation", "reminder", "custom"]),
})

type FormData = z.infer<typeof schema>

const typeOptions = [
  { value: "date", label: "💑 Свидание" },
  { value: "anniversary", label: "🥂 Годовщина" },
  { value: "trip", label: "✈️ Поездка" },
  { value: "sex", label: "🌹 Близость" },
  { value: "conversation", label: "💬 Разговор" },
  { value: "reminder", label: "🔔 Напоминание" },
  { value: "custom", label: "📌 Другое" },
]

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "date" },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) { router.push("/onboarding"); return }

    const { error } = await supabase.from("couple_events").insert({
      couple_id: member.couple_id,
      title: data.title,
      description: data.description || null,
      event_date: data.event_date,
      event_time: data.event_time || null,
      location: data.location || null,
      type: data.type,
      status: "planned",
      created_by: user.id,
    })

    if (error) { toast.error("Ошибка сохранения"); setLoading(false); return }
    toast.success("Событие добавлено!")
    router.push("/app/calendar")
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Новое событие</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input {...register("title")} placeholder="Название события" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип события</label>
            <select {...register("type")} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
              <input {...register("event_date")} type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
              <input {...register("event_time")} type="time" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
            <input {...register("location")} placeholder="Где?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea {...register("description")} rows={3} placeholder="Описание (необязательно)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? "Сохраняем..." : "Сохранить событие"}
          </button>
        </form>
      </div>
    </div>
  )
}
