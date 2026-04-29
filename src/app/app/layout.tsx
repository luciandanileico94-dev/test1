import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppNav from "@/components/app-nav"
import Link from "next/link"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .single()

  if (!member) redirect("/onboarding")

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fff8fa 0%, #fdf4ff 100%)" }}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* Desktop sidebar — exact AppNav.jsx spec */}
        <aside className="hidden md:flex" style={{
          width: 230,
          flexShrink: 0,
          flexDirection: "column",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRight: "1px solid hsl(340,30%,92%)",
          boxShadow: "1px 0 0 rgba(233,30,99,.04)",
        }}>
          {/* Logo */}
          <div style={{
            padding: "18px 18px 14px",
            borderBottom: "1px solid hsl(340,20%,95%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Link href="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <span style={{ fontSize: 24 }}>💝</span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 600,
                color: "hsl(340,75%,48%)",
              }}>Вместе</span>
            </Link>
          </div>

          <AppNav variant="sidebar" />

          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid hsl(340,20%,95%)",
            fontSize: 10,
            color: "#bbb",
            textAlign: "center",
          }}>
            Приватно · Только для вас
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }} className="md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden" style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid hsl(340,30%,92%)",
        zIndex: 50,
      }}>
        <AppNav variant="bottom" />
      </div>
    </div>
  )
}
