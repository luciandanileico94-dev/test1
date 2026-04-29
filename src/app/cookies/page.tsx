import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0d0d14] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">💝</span>
            <span className="font-display text-lg font-semibold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Вместе</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">← На главную</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-semibold mb-2">Политика cookies</h1>
        <p className="text-white/30 text-sm mb-12">Последнее обновление: январь 2025</p>

        <div className="space-y-10 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Что такое cookies</h2>
            <p>Cookies — это небольшие файлы, которые сохраняются в вашем браузере. Мы используем их только для работы приложения.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Как мы используем cookies</h2>
            <p>Мы используем только необходимые cookies для хранения вашей сессии (авторизации). Мы не используем аналитические или рекламные cookies.</p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Управление cookies</h2>
            <p>Вы можете очистить cookies в настройках браузера. Это приведёт к выходу из аккаунта.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
