"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  name: z.string().min(2, "Введите ваше имя"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(160deg, #fff1f5 0%, #fdf4ff 50%, #f0f4ff 100%)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">💝</span>
          <span className="font-display text-2xl font-semibold text-white">Вместе</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold text-white mb-4 leading-tight">
            Начните ваш<br />путь вместе
          </h2>
          <p className="text-pink-100 text-lg mb-10">Создайте пространство для вашей пары за минуту</p>
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">💑</div>
              <div>
                <p className="text-white font-semibold text-sm">Маша и Ваня</p>
                <p className="text-pink-200 text-xs">365 дней вместе 💕</p>
              </div>
            </div>
            <p className="text-white/80 text-sm italic">&ldquo;Это приложение помогло нам стать ближе&rdquo;</p>
          </div>
        </div>
        <p className="text-pink-200 text-sm">Бесплатно · Без рекламы · Только для вас двоих</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <span className="text-2xl">💝</span>
            <span className="font-display text-xl font-semibold text-rose-600">Вместе</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Создать аккаунт</h1>
            <p className="text-gray-500 text-sm">Начните своё совместное пространство</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ваше имя</label>
                <input
                  {...register("name")}
                  placeholder="Как вас зовут?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
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
                {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Регистрируясь, вы соглашаетесь с условиями использования
          </p>

          <p className="text-center text-sm text-gray-500 mt-3">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-rose-500 font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
