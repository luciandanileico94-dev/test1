import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppNav from "@/components/app-nav"

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
    <div className="min-h-screen bg-rose-50/30">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 flex-col bg-white border-r border-rose-100 shrink-0">
          <div className="px-5 py-5 border-b border-rose-100">
            <span className="text-lg font-semibold text-rose-600">💝 Вместе</span>
          </div>
          <AppNav variant="sidebar" />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 z-50">
        <AppNav variant="bottom" />
      </div>
    </div>
  )
}
