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
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff8fa 0%, #fdf4ff 100%)" }}>
      <div className="flex h-screen overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 flex-col bg-white/80 backdrop-blur-sm border-r border-rose-100/50 shrink-0 shadow-sm">
          <div className="px-5 py-5 border-b border-rose-50">
            <Link href="/app/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl">💝</span>
              <span className="font-display text-xl font-semibold text-rose-500">Вместе</span>
            </Link>
          </div>
          <AppNav variant="sidebar" />
          <div className="px-4 py-4 border-t border-rose-50">
            <div className="text-xs text-gray-400 text-center">Приватно · Только для вас</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-rose-100/50 z-50 shadow-lg">
        <AppNav variant="bottom" />
      </div>
    </div>
  )
}
