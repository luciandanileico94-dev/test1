import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, addDays } from "date-fns"
import { ru } from "date-fns/locale"
import { Settings } from "lucide-react"

const phaseLabels: Record<string, string> = {
  menstruation: "Менструация", follicular: "Фолликулярная", ovulation: "Овуляция", luteal: "Лютеиновая", unknown: "Неизвестно",
}
const phaseColors: Record<string, string> = {
  menstruation: "bg-red-50 text-red-700 border-red-100",
  follicular: "bg-green-50 text-green-700 border-green-100",
  ovulation: "bg-yellow-50 text-yellow-700 border-yellow-100",
  luteal: "bg-purple-50 text-purple-700 border-purple-100",
  unknown: "bg-gray-50 text-gray-600 border-gray-100",
}

export default async function CyclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: settings } = await supabase
    .from("cycle_settings")
    .select("*")
    .eq("couple_id", member.couple_id)
    .eq("user_id", user.id)
    .maybeSingle()

  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const { data: recentDays } = await supabase
    .from("cycle_days")
    .select("*")
    .eq("couple_id", member.couple_id)
    .eq("user_id", user.id)
    .gte("date", weekAgo)
    .order("date", { ascending: false })

  const { data: todayRecord } = await supabase
    .from("cycle_days")
    .select("*")
    .eq("couple_id", member.couple_id)
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (!settings?.is_enabled) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Календарь цикла</h1>
          <Link href="/app/cycle/settings" className="text-gray-400 hover:text-gray-600"><Settings size={20} /></Link>
        </div>
        <div className="bg-white rounded-2xl p-8 text-center border border-rose-100">
          <div className="text-4xl mb-3">🌸</div>
          <h2 className="font-semibold text-gray-700 mb-2">Трекер цикла</h2>
          <p className="text-sm text-gray-500 mb-5">Отслеживайте цикл и настройте что видит партнёр</p>
          <Link href="/app/cycle/settings" className="inline-block px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
            Включить и настроить
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Мой цикл</h1>
        <Link href="/app/cycle/settings" className="text-gray-400 hover:text-gray-600"><Settings size={20} /></Link>
      </div>

      {/* Today */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Сегодня — {format(new Date(), "d MMMM", { locale: ru })}</h2>
        {todayRecord ? (
          <div>
            {todayRecord.phase && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${phaseColors[todayRecord.phase]}`}>
                {phaseLabels[todayRecord.phase]}
              </span>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {todayRecord.energy_level && (
                <div className="text-sm"><span className="text-gray-500">Энергия: </span>{"⚡".repeat(todayRecord.energy_level)}</div>
              )}
              {todayRecord.pain_level && (
                <div className="text-sm"><span className="text-gray-500">Боль: </span>{"😣".repeat(todayRecord.pain_level)}</div>
              )}
            </div>
            <Link href={`/app/cycle/day/${today}`} className="inline-block mt-3 text-sm text-rose-500 hover:underline">Редактировать</Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">Сегодня ещё не заполнено</p>
            <Link href={`/app/cycle/day/${today}`} className="inline-block px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
              Заполнить сегодня
            </Link>
          </div>
        )}
      </div>

      {/* Recent days */}
      {recentDays && recentDays.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Последние дни</h2>
          <div className="space-y-2">
            {recentDays.map(day => (
              <Link key={day.id} href={`/app/cycle/day/${day.date}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                <span className="text-sm text-gray-600">{format(new Date(day.date), "d MMMM", { locale: ru })}</span>
                <div className="flex items-center gap-2">
                  {day.phase && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${phaseColors[day.phase]}`}>{phaseLabels[day.phase]}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/app/cycle/day/${today}`} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">📝</div>
          <p className="text-xs font-medium text-gray-700">Записать день</p>
        </Link>
        <Link href="/app/cycle/preferences" className="bg-white rounded-2xl p-4 text-center shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">💝</div>
          <p className="text-xs font-medium text-gray-700">Моя поддержка</p>
        </Link>
      </div>
    </div>
  )
}
