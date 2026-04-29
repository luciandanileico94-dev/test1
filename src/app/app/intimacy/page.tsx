import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Plus, Lock } from "lucide-react"

export default async function IntimacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: records } = await supabase
    .from("intimacy_records")
    .select("*")
    .eq("couple_id", member.couple_id)
    .order("date", { ascending: false })
    .limit(30)

  const moodEmoji: Record<string, string> = {
    romantic: "🌹", playful: "😄", tender: "🥰", passionate: "🔥", calm: "😌", tired: "😴",
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Близость</h1>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Lock size={12} /> Приватный раздел</p>
        </div>
        <Link href="/app/intimacy/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Отметить
        </Link>
      </div>

      <div className="bg-rose-50 rounded-2xl p-4 mb-6 text-sm text-rose-700 border border-rose-100">
        Записи с видимостью &quot;только для меня&quot; не видны партнёру. Общие записи видны обоим.
      </div>

      {!records || records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">❤️</div>
          <p className="font-medium">Записей пока нет</p>
          <Link href="/app/intimacy/new" className="inline-block mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
            Добавить запись
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{record.mood ? (moodEmoji[record.mood] ?? "💕") : "💕"}</span>
                  <span className="font-medium text-gray-800">{format(new Date(record.date), "d MMMM yyyy", { locale: ru })}</span>
                </div>
                <div className="flex items-center gap-2">
                  {record.rating && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-xs ${i < record.rating ? "text-rose-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  )}
                  {record.visibility === "private" && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={10} />Только я</span>
                  )}
                </div>
              </div>
              {record.notes && record.created_by === user.id && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
