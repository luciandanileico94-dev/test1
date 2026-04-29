import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "16px 18px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
} as const

export default async function MemoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: albums } = await supabase
    .from("albums").select("*, media(count)").eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Воспоминания
        </h1>
        <Link href="/app/memories/new" style={{
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Создать альбом
        </Link>
      </div>

      {!albums || albums.length === 0 ? (
        <div style={{ ...glassCard, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
          <p style={{ fontWeight: 600, color: "#4a3f44", fontSize: 15 }}>Воспоминаний пока нет</p>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>Создайте первый альбом и добавьте фото</p>
          <Link href="/app/memories/new" style={{
            display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 12,
            background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            Создать альбом
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {albums.map(album => (
            <Link key={album.id} href={`/app/memories/${album.id}`} style={{
              display: "block", textDecoration: "none",
              background: "rgba(255,255,255,.82)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.65)",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,.06)",
            }}>
              {/* Cover */}
              <div style={{
                aspectRatio: "16/10", overflow: "hidden",
                background: "linear-gradient(135deg,hsl(340,100%,97%),#fff0fb)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 40 }}>📁</span>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#1e1217", margin: 0 }}>{album.title}</p>
                {album.description && (
                  <p style={{ fontSize: 11, color: "#8a7880", marginTop: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                    {album.description}
                  </p>
                )}
                <p style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                  {format(new Date(album.created_at), "d MMMM yyyy", { locale: ru })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
