"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Неверный email или пароль")
      setLoading(false)
      return
    }
    router.push("/app/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(160deg, #fff1f5 0%, #fdf4ff 50%, #f0f4ff 100%)" }}>
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-400 to-pink-600 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">💝</span>
          <span className="font-display text-2xl font-semibold text-white">Вместе</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold text-white mb-4 leading-tight">
            Рады видеть<br />вас снова
          </h2>
          <p className="text-rose-100 text-lg">Ваше личное пространство ждёт вас</p>
          <div className="mt-10 space-y-3">
            {["Общий календарь и планы", "Вишлисты и сюрпризы", "Воспоминания и фото", "Поддержка каждый день"].map(t => (
              <div key={t} className="flex items-center gap-3 text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-rose-200 text-sm">Приватно · Безопасно · Только для вас двоих</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <span className="text-2xl">💝</span>
            <span className="font-display text-xl font-semibold text-rose-600">Вместе</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Войти</h1>
            <p className="text-gray-500 text-sm">Введите данные вашего аккаунта</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-all shadow-rose hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Входим..." : "Войти"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-rose-500 font-semibold hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
