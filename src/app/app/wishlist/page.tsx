import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

const priorityDot: Record<string, string> = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" }
const priorityLabel: Record<string, string> = { low: "Низкий", medium: "Средний", high: "Высокий" }
const typeEmoji: Record<string, string> = {
  product: "🛍️", action: "🎯", experience: "✨", date_idea: "💑", intimate_idea: "🌹", other: "📌",
}

const glassCard = {
  background: "rgba(255,255,255,.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.65)",
  borderRadius: 20,
  padding: "16px 18px",
  boxShadow: "0 4px 24px rgba(0,0,0,.06)",
} as const

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase.from("couple_members").select("couple_id").eq("user_id", user.id).single()
  if (!member) redirect("/onboarding")

  const { data: allItems } = await supabase
    .from("couple_wishlist_items").select("*").eq("couple_id", member.couple_id)
    .order("created_at", { ascending: false })

  const myItems = allItems?.filter(i => i.owner_user_id === user.id && i.status !== "hidden") ?? []
  const partnerItems = allItems?.filter(i => i.owner_user_id !== user.id && i.status !== "hidden") ?? []

  function WishItem({ item, isOwn }: { item: any; isOwn: boolean }) {
    const isReservedByMe = item.status === "reserved" && item.reserved_by === user?.id
    const isReservedByOther = item.status === "reserved" && item.reserved_by !== user?.id

    return (
      <Link href={`/app/wishlist/${item.id}`} style={{
        display: "flex", alignItems: "flex-start", gap: 12, textDecoration: "none",
        padding: "12px 0", borderBottom: "1px solid hsl(340,20%,96%)",
      }}>
        {/* Emoji box */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: "hsl(340,20%,96%)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          {typeEmoji[item.type] ?? "📌"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1217", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.title}
          </div>
          {item.description && (
            <div style={{ fontSize: 12, color: "#8a7880", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.description}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {item.price && (
              <span style={{ fontSize: 11, color: "#aaa" }}>{Number(item.price).toLocaleString("ru-RU")} ₽</span>
            )}
            {isReservedByMe && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fcd34d" }}>
                Вы зарезервировали 🎁
              </span>
            )}
            {isOwn && item.status === "reserved" && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fdf2f8", color: "#ec4899", border: "1px solid #f9a8d4" }}>
                Кто-то готовит сюрприз ✨
              </span>
            )}
            {!isOwn && isReservedByOther && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fdf2f8", color: "#ec4899", border: "1px solid #f9a8d4" }}>
                Уже забронировано
              </span>
            )}
          </div>
        </div>
        {/* Priority dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityDot[item.priority] ?? "#ccc" }} />
          <span style={{ fontSize: 10, color: "#aaa" }}>{priorityLabel[item.priority]}</span>
        </div>
      </Link>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#1e1217", margin: 0 }}>
          Вишлисты
        </h1>
        <Link href="/app/wishlist/new" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 16px", borderRadius: 12,
          background: "linear-gradient(135deg,hsl(340,75%,55%),hsl(325,65%,52%))",
          color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(233,30,99,.25)",
        }}>
          + Добавить
        </Link>
      </div>

      {/* My wishlist */}
      <div style={glassCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🎁</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3f44" }}>Мои желания</span>
          </div>
          <span style={{ fontSize: 11, color: "#bbb" }}>{myItems.length} шт.</span>
        </div>
        {myItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#bbb" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎁</div>
            <p style={{ fontSize: 13 }}>Добавьте первое желание</p>
          </div>
        ) : (
          <div>
            {myItems.map(item => <WishItem key={item.id} item={item} isOwn={true} />)}
          </div>
        )}
      </div>

      {/* Partner wishlist */}
      <div style={glassCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🎀</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3f44" }}>Желания партнёра</span>
          </div>
          <span style={{ fontSize: 11, color: "#bbb" }}>{partnerItems.length} шт.</span>
        </div>
        {partnerItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#bbb" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎀</div>
            <p style={{ fontSize: 13 }}>У партнёра пока нет желаний</p>
          </div>
        ) : (
          <div>
            {partnerItems.map(item => <WishItem key={item.id} item={item} isOwn={false} />)}
          </div>
        )}
      </div>
    </div>
  )
}
