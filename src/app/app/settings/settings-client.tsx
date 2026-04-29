"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SettingsClient() {
  const router = useRouter()

  async function onLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
      <button
        onClick={onLogout}
        className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}
