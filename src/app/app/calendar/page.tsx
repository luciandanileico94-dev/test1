import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Plus } from "lucide-react"

const eventTypeLabels: Record<string, string> = {
  date: "Свидание", anniversary: "Годовщина", trip: "Поездка",
  sex: "Близость", conversation: "Разговор", reminder: "Напоминание", custom: "Другое",
}
const eventTypeEmoji: Record<string, string> = {
  date: "💑", anniversary: "🥂", trip: "✈️",
  sex: "🌹", conversation: "💬", reminder: "🔔", custom: "📌",
}
const statusLabels: Record<string, string> = {
  planned: "Запланировано", completed: "Состоялось", cancelled: "Отменено",
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: events } = await supabase
    .from("couple_events")
    .select("*")
    .eq("couple_id", member.couple_id)
    .order("event_date", { ascending: true })

  const upcoming = events?.filter(e => e.event_date >= new Date().toISOString().split("T")[0] && e.status === "planned") ?? []
  const past = events?.filter(e => e.event_date < new Date().toISOString().split("T")[0] || e.status !== "planned") ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Календарь</h1>
        <Link href="/app/calendar/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">Событий пока нет</p>
          <p className="text-sm mt-1">Добавьте первое событие или свидание</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Предстоящие</h2>
          <div className="space-y-3">
            {upcoming.map(event => (
              <Link key={event.id} href={`/app/calendar/${event.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{eventTypeEmoji[event.type] ?? "📌"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(event.event_date), "d MMMM yyyy", { locale: ru })}
                      {event.event_time && ` · ${event.event_time.slice(0, 5)}`}
                    </p>
                    {event.location && <p className="text-xs text-gray-400 mt-0.5">📍 {event.location}</p>}
                  </div>
                  <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{eventTypeLabels[event.type]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Прошедшие</h2>
          <div className="space-y-3">
            {past.map(event => (
              <Link key={event.id} href={`/app/calendar/${event.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-75">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{eventTypeEmoji[event.type] ?? "📌"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{event.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {format(new Date(event.event_date), "d MMMM yyyy", { locale: ru })}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{statusLabels[event.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
