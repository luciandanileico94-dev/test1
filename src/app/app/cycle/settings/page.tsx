"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function CycleSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    is_enabled: false,
    cycle_length: 28,
    period_length: 5,
    last_period_start: "",
    partner_visibility: "private" as "private" | "show_status" | "show_support" | "show_full",
    recommendations_enabled: true,
    show_on_partner_dashboard: false,
    partner_notifications_enabled: false,
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
      if (!member) { router.push("/onboarding"); return }

      const { data } = await supabase.from("cycle_settings").select("*").eq("couple_id", member.couple_id).eq("user_id", user.id).maybeSingle()
      if (data) setSettings({ ...settings, ...data, last_period_start: data.last_period_start ?? "" })
      setLoading(false)
    }
    load()
  }, [])

  async function onSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
    if (!member) return

    const { error } = await supabase.from("cycle_settings").upsert({
      couple_id: member.couple_id,
      user_id: user.id,
      ...settings,
      last_period_start: settings.last_period_start || null,
    })

    if (error) { toast.error("Ошибка сохранения"); setSaving(false); return }
    toast.success("Настройки сохранены!")
    setSaving(false)
    router.push("/app/cycle")
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Загрузка...</div>

  const visibilityOptions = [
    { value: "private", label: "🔒 Только я", desc: "Партнёр ничего не видит" },
    { value: "show_status", label: "📊 Общий статус", desc: "Партнёр видит только общее состояние" },
    { value: "show_support", label: "💝 Рекомендации", desc: "Партнёр видит как поддержать" },
    { value: "show_full", label: "📋 Полный доступ", desc: "Партнёр видит все данные цикла" },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Назад</button>
        <h1 className="text-xl font-bold text-gray-800">Настройки цикла</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Включить трекер цикла</p>
            <p className="text-xs text-gray-500">Ты управляешь всеми данными</p>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, is_enabled: !s.is_enabled }))} className={`w-12 h-6 rounded-full transition-colors relative ${settings.is_enabled ? "bg-rose-500" : "bg-gray-200"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${settings.is_enabled ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </div>

      {settings.is_enabled && (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-4">
            <h2 className="font-semibold text-gray-700">Параметры цикла</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Длина цикла (дней)</label>
                <input type="number" value={settings.cycle_length} onChange={e => setSettings(s => ({ ...s, cycle_length: parseInt(e.target.value) || 28 }))} min={21} max={45} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Длина менструации</label>
                <input type="number" value={settings.period_length} onChange={e => setSettings(s => ({ ...s, period_length: parseInt(e.target.value) || 5 }))} min={1} max={10} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Начало последней менструации</label>
              <input type="date" value={settings.last_period_start} onChange={e => setSettings(s => ({ ...s, last_period_start: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-3">
            <h2 className="font-semibold text-gray-700">Что видит партнёр</h2>
            <p className="text-xs text-gray-400">Ты полностью контролируешь эти настройки</p>
            {visibilityOptions.map(opt => (
              <button key={opt.value} onClick={() => setSettings(s => ({ ...s, partner_visibility: opt.value as typeof s.partner_visibility }))} className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${settings.partner_visibility === opt.value ? "border-rose-300 bg-rose-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 space-y-3">
            <h2 className="font-semibold text-gray-700">Дополнительно</h2>
            {[
              { key: "recommendations_enabled" as const, label: "Включить рекомендации для партнёра", desc: "Он видит советы основанные на твоих настройках" },
              { key: "show_on_partner_dashboard" as const, label: "Показывать карточку на дашборде", desc: "Карточка \"Как поддержать\" у партнёра" },
              { key: "partner_notifications_enabled" as const, label: "Уведомления для партнёра", desc: "Напоминания о поддержке" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ml-3 ${settings[key] ? "bg-rose-500" : "bg-gray-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${settings[key] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={onSave} disabled={saving} className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50">
        {saving ? "Сохраняем..." : "Сохранить настройки"}
      </button>
    </div>
  )
}
