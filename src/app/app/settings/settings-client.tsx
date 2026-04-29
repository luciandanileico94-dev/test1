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
    <div style={{
      background: "rgba(255,255,255,.82)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,.65)",
      borderRadius: 20,
      padding: "20px 22px",
      boxShadow: "0 4px 24px rgba(0,0,0,.06)",
    }}>
      <button
        onClick={onLogout}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 12,
          border: "1.5px solid hsl(0,72%,80%)", background: "transparent",
          color: "hsl(0,72%,51%)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "'Inter', sans-serif",
          transition: "background .15s",
        }}
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}
