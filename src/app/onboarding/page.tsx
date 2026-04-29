"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const createSchema = z.object({
  coupleName: z.string().min(2, "Введите название пары"),
  myName: z.string().min(2, "Введите ваше имя"),
  partnerName: z.string().min(2, "Введите имя партнёра"),
  startDate: z.string().optional(),
})

const joinSchema = z.object({
  inviteCode: z.string().min(4, "Введите код приглашения"),
  myName: z.string().min(2, "Введите ваше имя"),
})

type CreateData = z.infer<typeof createSchema>
type JoinData = z.infer<typeof joinSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose")
  const [loading, setLoading] = useState(false)

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) })
  const joinForm = useForm<JoinData>({ resolver: zodResolver(joinSchema) })

  async function handleCreate(data: CreateData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    await supabase.from("profiles").upsert({ id: user.id, name: data.myName })

    const { data: couple, error } = await supabase
      .from("couples")
      .insert({ name: data.coupleName, start_date: data.startDate || null, created_by: user.id })
      .select()
      .single()

    if (error || !couple) { toast.error("Ошибка создания пары"); setLoading(false); return }

    await supabase.from("couple_members").insert({ couple_id: couple.id, user_id: user.id, role: "creator" })

    toast.success("Пространство пары создано!")
    router.push("/app/dashboard")
  }

  async function handleJoin(data: JoinData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: couple } = await supabase
      .from("couples")
      .select("id")
      .eq("invite_code", data.inviteCode.toUpperCase())
      .single()

    if (!couple) { toast.error("Неверный код приглашения"); setLoading(false); return }

    const { data: existing } = await supabase
      .from("couple_members")
      .select("id")
      .eq("couple_id", couple.id)

    if (existing && existing.length >= 2) {
      toast.error("В этом пространстве уже два партнёра")
      setLoading(false)
      return
    }

    await supabase.from("profiles").upsert({ id: user.id, name: data.myName })
    await supabase.from("couple_members").insert({ couple_id: couple.id, user_id: user.id, role: "partner" })

    toast.success("Вы присоединились к паре!")
    router.push("/app/dashboard")
  }

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">💑</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Начнём!</h1>
          <p className="text-gray-500 text-sm mb-8">Создайте пространство пары или присоединитесь по коду</p>
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full py-3 bg-rose-500 text-white rounded-2xl font-medium hover:bg-rose-600 transition-colors"
            >
              Создать пространство пары
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-3 bg-white text-rose-500 border border-rose-200 rounded-2xl font-medium hover:bg-rose-50 transition-colors"
            >
              Присоединиться по коду
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button onClick={() => setMode("choose")} className="text-sm text-gray-400 mb-4 hover:text-gray-600">← Назад</button>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏠</div>
            <h1 className="text-xl font-bold text-gray-800">Создать пространство пары</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название пары</label>
                <input {...createForm.register("coupleName")} placeholder="Маша и Ваня" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                {createForm.formState.errors.coupleName && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.coupleName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                <input {...createForm.register("myName")} placeholder="Как вас зовут" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                {createForm.formState.errors.myName && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.myName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя партнёра</label>
                <input {...createForm.register("partnerName")} placeholder="Как зовут партнёра" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                {createForm.formState.errors.partnerName && <p className="text-xs text-red-500 mt-1">{createForm.formState.errors.partnerName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала отношений</label>
                <input {...createForm.register("startDate")} type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
                {loading ? "Создаём..." : "Создать"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => setMode("choose")} className="text-sm text-gray-400 mb-4 hover:text-gray-600">← Назад</button>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔗</div>
          <h1 className="text-xl font-bold text-gray-800">Присоединиться по коду</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <form onSubmit={joinForm.handleSubmit(handleJoin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
              <input {...joinForm.register("myName")} placeholder="Как вас зовут" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              {joinForm.formState.errors.myName && <p className="text-xs text-red-500 mt-1">{joinForm.formState.errors.myName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Код приглашения</label>
              <input {...joinForm.register("inviteCode")} placeholder="Например: AB12CD34" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-rose-300" />
              {joinForm.formState.errors.inviteCode && <p className="text-xs text-red-500 mt-1">{joinForm.formState.errors.inviteCode.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
              {loading ? "Присоединяемся..." : "Присоединиться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
