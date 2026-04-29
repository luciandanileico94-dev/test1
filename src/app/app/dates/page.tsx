import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

const categoryEmoji: Record<string, string> = {
  "дома": "🏠", "прогулка": "🚶", "ресторан": "🍽️", "поездка": "✈️",
  "романтика": "🌹", "бесплатно": "🆓", "дорого": "💎", "интимная_идея": "🌸", "другое": "📌",
}
const statusLabel: Record<string, string> = { idea: "💡 Идея", planned: "📅 Запланировано", completed: "✅ Было" }

export default async function DateIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: ideas } = await supabase
    .from("date_ideas")
    .select("*")
    .eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const byStatus = {
    idea: ideas?.filter(i => i.status === "idea") ?? [],
    planned: ideas?.filter(i => i.status === "planned") ?? [],
    completed: ideas?.filter(i => i.status === "completed") ?? [],
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Идеи свиданий</h1>
        <Link href="/app/dates/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {ideas?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">💑</div>
          <p className="font-medium">Идей свиданий пока нет</p>
          <p className="text-sm mt-1">Сохраните идеи и превращайте их в события</p>
        </div>
      )}

      {(["idea", "planned", "completed"] as const).map(status => byStatus[status].length > 0 && (
        <section key={status} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{statusLabel[status]}</h2>
          <div className="grid grid-cols-1 gap-3">
            {byStatus[status].map(idea => (
              <Link key={idea.id} href={`/app/dates/${idea.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{categoryEmoji[idea.category] ?? "📌"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{idea.title}</p>
                    {idea.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{idea.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 capitalize">{idea.category}</span>
                      {idea.estimated_price && <span className="text-xs text-gray-400">~{idea.estimated_price} ₽</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
