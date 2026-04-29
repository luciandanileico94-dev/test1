import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

const statusLabel: Record<string, string> = {
  active: "✅ Действует",
  needs_discussion: "💬 На обсуждении",
  archived: "📦 Архив",
}

export default async function AgreementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: agreements } = await supabase
    .from("agreements")
    .select("*")
    .eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const active = agreements?.filter(a => a.status === "active") ?? []
  const discussion = agreements?.filter(a => a.status === "needs_discussion") ?? []
  const archived = agreements?.filter(a => a.status === "archived") ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Договорённости</h1>
        <Link href="/app/agreements/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {agreements?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🤝</div>
          <p className="font-medium">Договорённостей пока нет</p>
          <p className="text-sm mt-1">Зафиксируйте важные правила вашей пары</p>
        </div>
      )}

      {[
        { items: active, title: "Действующие" },
        { items: discussion, title: "На обсуждении" },
        { items: archived, title: "Архив" },
      ].map(({ items, title }) => items.length > 0 && (
        <section key={title} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
          <div className="space-y-3">
            {items.map(a => (
              <Link key={a.id} href={`/app/agreements/${a.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{a.title}</p>
                    {a.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                  </div>
                  <span className="text-xs shrink-0 bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{statusLabel[a.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
