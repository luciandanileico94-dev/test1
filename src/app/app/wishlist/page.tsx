import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

const priorityLabel: Record<string, string> = { low: "🟢 Низкий", medium: "🟡 Средний", high: "🔴 Высокий" }
const typeEmoji: Record<string, string> = {
  product: "🛍️", action: "🎯", experience: "✨", date_idea: "💑", intimate_idea: "🌹", other: "📌",
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: allItems } = await supabase
    .from("couple_wishlist_items")
    .select("*")
    .eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const myItems = allItems?.filter(i => i.owner_user_id === user.id && i.status !== "hidden") ?? []
  const partnerItems = allItems?.filter(i => {
    if (i.owner_user_id === user.id) return false
    if (i.status === "hidden") return false
    // hide reserved_by for surprise items owned by partner
    return true
  }) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Вишлисты</h1>
        <Link href="/app/wishlist/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {/* My wishlist */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Мои желания</h2>
        {myItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-100 text-gray-400">
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-sm">Добавьте первое желание</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myItems.map(item => (
              <Link key={item.id} href={`/app/wishlist/${item.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{typeEmoji[item.type] ?? "📌"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <span className="text-xs">{priorityLabel[item.priority]}</span>
                    </div>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                    {item.price && <p className="text-xs text-gray-400 mt-1">{item.price} ₽</p>}
                    {item.status === "reserved" && (
                      <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Зарезервировано</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Partner wishlist */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Желания партнёра</h2>
        {partnerItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400">
            <div className="text-3xl mb-2">🎀</div>
            <p className="text-sm">У партнёра пока нет желаний</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partnerItems.map(item => (
              <Link key={item.id} href={`/app/wishlist/${item.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{typeEmoji[item.type] ?? "📌"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <span className="text-xs">{priorityLabel[item.priority]}</span>
                    </div>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                    {item.price && <p className="text-xs text-gray-400 mt-1">{item.price} ₽</p>}
                    {/* Hide who reserved for surprise mode */}
                    {item.status === "reserved" && item.reserved_by !== user.id && (
                      <span className="inline-block mt-1 text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">В списке желаний</span>
                    )}
                    {item.status === "reserved" && item.reserved_by === user.id && (
                      <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Вы зарезервировали 🎁</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
