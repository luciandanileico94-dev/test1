import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Plus } from "lucide-react"

export default async function MemoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: albums } = await supabase
    .from("albums")
    .select("*, media(count)")
    .eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Воспоминания</h1>
        <Link href="/app/memories/new" className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          <Plus size={16} /> Создать альбом
        </Link>
      </div>

      {!albums || albums.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📸</div>
          <p className="font-medium">Воспоминаний пока нет</p>
          <p className="text-sm mt-1">Создайте первый альбом</p>
          <Link href="/app/memories/new" className="inline-block mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
            Создать альбом
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.map(album => (
            <Link key={album.id} href={`/app/memories/${album.id}`} className="block bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-rose-50 flex items-center justify-center">
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📁</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-800 text-sm">{album.title}</p>
                {album.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{album.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{format(new Date(album.created_at), "d MMMM yyyy", { locale: ru })}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
