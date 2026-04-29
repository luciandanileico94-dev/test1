import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { differenceInDays, format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar, Gift, Camera, Heart, CheckSquare, Moon, ArrowRight } from "lucide-react"

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split("T")[0]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const coupleId = member.couple_id

  const [
    { data: couple },
    { data: nextEvent },
    { data: recentWishlist },
    { data: recentAlbums },
    { data: myCheckin },
    { data: partnerCheckin },
    { data: cycleSettings },
    { data: cycleSupportPrefs },
  ] = await Promise.all([
    supabase.from("couples").select("*").eq("id", coupleId).single(),
    supabase.from("couple_events").select("*").eq("couple_id", coupleId).eq("status", "planned")
      .gte("event_date", new Date().toISOString().split("T")[0]).order("event_date", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("couple_wishlist_items").select("*").eq("couple_id", coupleId).eq("status", "wanted")
      .order("created_at", { ascending: false }).limit(3),
    supabase.from("albums").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }).limit(3),
    supabase.from("check_ins").select("id").eq("couple_id", coupleId).eq("user_id", user.id).gte("week_start", getWeekStart()).maybeSingle(),
    supabase.from("check_ins").select("id").eq("couple_id", coupleId).neq("user_id", user.id).gte("week_start", getWeekStart()).maybeSingle(),
    supabase.from("cycle_settings").select("*").eq("couple_id", coupleId).neq("user_id", user.id).eq("show_on_partner_dashboard", true).maybeSingle(),
    supabase.from("cycle_support_preferences").select("*").eq("couple_id", coupleId).neq("user_id", user.id).maybeSingle(),
  ])

  const daysTogetherCount = couple?.start_date ? differenceInDays(new Date(), new Date(couple.start_date)) : null
  const showCycleCard = cycleSettings?.show_on_partner_dashboard

  const quickActions = [
    { href: "/app/calendar/new", label: "Добавить событие", icon: "📅", color: "from-blue-50 to-indigo-50 border-blue-100 text-blue-600" },
    { href: "/app/wishlist/new", label: "Добавить желание", icon: "🎁", color: "from-amber-50 to-orange-50 border-amber-100 text-amber-600" },
    { href: "/app/memories/new", label: "Создать альбом", icon: "📸", color: "from-pink-50 to-rose-50 border-pink-100 text-pink-600" },
    { href: "/app/intimacy/new", label: "Отметить близость", icon: "❤️", color: "from-rose-50 to-red-50 border-rose-100 text-rose-600" },
    { href: "/app/checkin", label: "Заполнить check-in", icon: "✅", color: "from-green-50 to-teal-50 border-green-100 text-green-600" },
    { href: "/app/dates/new", label: "Идея свидания", icon: "💑", color: "from-purple-50 to-pink-50 border-purple-100 text-purple-600" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Couple header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-rose">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl border border-white/30">
            {couple?.photo_url
              ? <img src={couple.photo_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              : "💑"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{couple?.name ?? "Наша пара"}</h1>
            {couple?.start_date && (
              <p className="text-rose-100 text-sm mt-0.5">
                С {format(new Date(couple.start_date), "d MMMM yyyy", { locale: ru })}
              </p>
            )}
            {daysTogetherCount !== null && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
                <span>💕</span>
                <span>{daysTogetherCount} дней вместе</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cycle support card */}
      {showCycleCard && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Moon size={16} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-purple-700">Как поддержать сегодня</h2>
          </div>
          {cycleSupportPrefs?.custom_partner_message && (
            <p className="text-sm text-purple-800 italic mb-3 bg-white/60 rounded-xl px-3 py-2 border border-purple-100">
              &ldquo;{cycleSupportPrefs.custom_partner_message}&rdquo;
            </p>
          )}
          {cycleSupportPrefs?.partner_should_do && (
            <div className="text-xs text-gray-600 mb-1.5">
              <span className="font-semibold text-green-600">✓ Что поможет: </span>{cycleSupportPrefs.partner_should_do}
            </div>
          )}
          {cycleSupportPrefs?.partner_should_avoid && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-red-400">✗ Лучше избегать: </span>{cycleSupportPrefs.partner_should_avoid}
            </div>
          )}
          <p className="text-xs text-purple-300 mt-3">Она сама выбрала эти рекомендации</p>
        </div>
      )}

      {/* Check-in */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-rose-400" />
            <h2 className="text-sm font-semibold text-gray-700">Check-in этой недели</h2>
          </div>
          <Link href="/app/checkin" className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1">
            Перейти <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl py-2.5 text-center text-xs font-medium border ${myCheckin ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
            {myCheckin ? "✓ Вы заполнили" : "Вы не заполнили"}
          </div>
          <div className={`rounded-xl py-2.5 text-center text-xs font-medium border ${partnerCheckin ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
            {partnerCheckin ? "✓ Партнёр заполнил" : "Ожидаем партнёра"}
          </div>
        </div>
      </div>

      {/* Next event */}
      {nextEvent && (
        <Link href={`/app/calendar/${nextEvent.id}`} className="block bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/60 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-rose-400" />
              <h2 className="text-sm font-semibold text-gray-700">Ближайшее событие</h2>
            </div>
            <ArrowRight size={14} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-800 mt-2">{nextEvent.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(nextEvent.event_date), "d MMMM", { locale: ru })}
            {nextEvent.event_time && ` · ${nextEvent.event_time.slice(0, 5)}`}
            {nextEvent.location && ` · 📍 ${nextEvent.location}`}
          </p>
        </Link>
      )}

      {/* Recent wishlist */}
      {recentWishlist && recentWishlist.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-rose-400" />
              <h2 className="text-sm font-semibold text-gray-700">Последние желания</h2>
            </div>
            <Link href="/app/wishlist" className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {(recentWishlist as { id: string; title: string; priority: string }[]).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{item.title}</span>
                <span className="text-xs">{item.priority === "high" ? "🔴" : item.priority === "medium" ? "🟡" : "🟢"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums */}
      {recentAlbums && recentAlbums.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-rose-400" />
              <h2 className="text-sm font-semibold text-gray-700">Воспоминания</h2>
            </div>
            <Link href="/app/memories" className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(recentAlbums as { id: string; title: string; cover_image_url: string | null }[]).map((album) => (
              <Link key={album.id} href={`/app/memories/${album.id}`} className="aspect-square rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 flex items-center justify-center hover:shadow-sm transition-all overflow-hidden">
                {album.cover_image_url
                  ? <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                  : <span className="text-2xl">📁</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/60">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map(({ href, label, icon, color }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br border transition-all hover:-translate-y-0.5 hover:shadow-sm text-center ${color}`}>
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
