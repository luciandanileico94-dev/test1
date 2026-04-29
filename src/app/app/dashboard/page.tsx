import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { differenceInDays, format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar, Gift, Camera, Heart, CheckSquare, Moon, Plus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .single()

  if (!member) redirect("/onboarding")

  const coupleId = member.couple_id

  const [
    { data: couple },
    { data: profile },
    { data: nextEvent },
    { data: recentWishlist },
    { data: recentMemories },
    { data: myCheckin },
    { data: partnerCheckin },
    { data: cycleSettings },
    { data: todayCycleDay },
    { data: cycleSupportPrefs },
  ] = await Promise.all([
    supabase.from("couples").select("*").eq("id", coupleId).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("couple_events")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("status", "planned")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("couple_wishlist_items")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("status", "wanted")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("albums")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase.from("check_ins")
      .select("id")
      .eq("couple_id", coupleId)
      .eq("user_id", user.id)
      .gte("week_start", getWeekStart())
      .maybeSingle(),
    supabase.from("check_ins")
      .select("id")
      .eq("couple_id", coupleId)
      .neq("user_id", user.id)
      .gte("week_start", getWeekStart())
      .maybeSingle(),
    supabase.from("cycle_settings")
      .select("*")
      .eq("couple_id", coupleId)
      .neq("user_id", user.id)
      .eq("show_on_partner_dashboard", true)
      .maybeSingle(),
    supabase.from("cycle_days")
      .select("*")
      .eq("couple_id", coupleId)
      .neq("user_id", user.id)
      .eq("date", new Date().toISOString().split("T")[0])
      .maybeSingle(),
    supabase.from("cycle_support_preferences")
      .select("*")
      .eq("couple_id", coupleId)
      .neq("user_id", user.id)
      .maybeSingle(),
  ])

  const daysTogetherCount = couple?.start_date
    ? differenceInDays(new Date(), new Date(couple.start_date))
    : null

  const showCycleCard = cycleSettings?.show_on_partner_dashboard && (todayCycleDay || cycleSupportPrefs)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Couple header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
            {couple?.photo_url ? (
              <img src={couple.photo_url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : "💑"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{couple?.name ?? "Наша пара"}</h1>
            {couple?.start_date && (
              <p className="text-sm text-gray-500">
                Вместе с {format(new Date(couple.start_date), "d MMMM yyyy", { locale: ru })}
              </p>
            )}
            {daysTogetherCount !== null && (
              <p className="text-sm font-medium text-rose-500">{daysTogetherCount} дней вместе 💕</p>
            )}
          </div>
        </div>
      </div>

      {/* Cycle support card */}
      {showCycleCard && (
        <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100">
          <h2 className="text-sm font-semibold text-pink-700 mb-2 flex items-center gap-2">
            <Moon size={16} /> Как поддержать сегодня
          </h2>
          {cycleSupportPrefs?.custom_partner_message && (
            <p className="text-sm text-pink-800 italic mb-3">
              &ldquo;{cycleSupportPrefs.custom_partner_message}&rdquo;
            </p>
          )}
          {cycleSupportPrefs?.partner_should_do && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Что поможет: </span>{cycleSupportPrefs.partner_should_do}
            </div>
          )}
          {cycleSupportPrefs?.partner_should_avoid && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Лучше избегать: </span>{cycleSupportPrefs.partner_should_avoid}
            </div>
          )}
          <p className="text-xs text-pink-400 mt-2">Она сама выбрала эти рекомендации</p>
        </div>
      )}

      {/* Next event */}
      {nextEvent && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} /> Ближайшее событие</h2>
            <Link href="/app/calendar" className="text-xs text-rose-400 hover:underline">Все события</Link>
          </div>
          <p className="font-medium text-gray-800">{nextEvent.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(nextEvent.event_date), "d MMMM", { locale: ru })}
            {nextEvent.location && ` · ${nextEvent.location}`}
          </p>
        </div>
      )}

      {/* Check-in status */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><CheckSquare size={16} /> Check-in этой недели</h2>
          <Link href="/app/checkin" className="text-xs text-rose-400 hover:underline">Перейти</Link>
        </div>
        <div className="flex gap-3">
          <div className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${myCheckin ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
            {myCheckin ? "✓ Вы заполнили" : "Вы не заполнили"}
          </div>
          <div className={`flex-1 rounded-xl py-2 text-center text-xs font-medium ${partnerCheckin ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
            {partnerCheckin ? "✓ Партнёр заполнил" : "Ожидаем партнёра"}
          </div>
        </div>
      </div>

      {/* Recent wishlist */}
      {recentWishlist && recentWishlist.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Gift size={16} /> Последние желания</h2>
            <Link href="/app/wishlist" className="text-xs text-rose-400 hover:underline">Все желания</Link>
          </div>
          <div className="space-y-2">
            {recentWishlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.title}</span>
                <span className="text-xs text-gray-400 capitalize">{item.priority === "high" ? "🔴" : item.priority === "medium" ? "🟡" : "🟢"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent albums */}
      {recentMemories && recentMemories.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Camera size={16} /> Воспоминания</h2>
            <Link href="/app/memories" className="text-xs text-rose-400 hover:underline">Все альбомы</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recentMemories.map((album) => (
              <Link key={album.id} href={`/app/memories/${album.id}`} className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-gray-700 hover:bg-rose-100 transition-colors">
                📁 {album.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/app/calendar/new", label: "Добавить событие", icon: "📅" },
            { href: "/app/wishlist/new", label: "Добавить желание", icon: "🎁" },
            { href: "/app/memories/new", label: "Добавить воспоминание", icon: "📸" },
            { href: "/app/intimacy/new", label: "Отметить близость", icon: "❤️" },
            { href: "/app/checkin", label: "Заполнить check-in", icon: "✅" },
            { href: "/app/cycle", label: "Обновить цикл", icon: "🌸" },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 text-sm text-gray-700 hover:bg-rose-100 transition-colors"
            >
              <span>{icon}</span>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split("T")[0]
}
