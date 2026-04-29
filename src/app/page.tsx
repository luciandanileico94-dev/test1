import Link from "next/link"

const features = [
  { icon: "🏠", title: "Личное пространство", desc: "Только вы двое — никаких чужих глаз" },
  { icon: "📅", title: "Общий календарь", desc: "Планируйте события, свидания и поездки вместе" },
  { icon: "🎁", title: "Вишлисты", desc: "Делитесь желаниями и делайте сюрпризы" },
  { icon: "📸", title: "Воспоминания", desc: "Фотографии, альбомы и лента отношений" },
  { icon: "💑", title: "Идеи свиданий", desc: "Сохраняйте идеи и превращайте их в планы" },
  { icon: "🌸", title: "Трекер цикла", desc: "Понимание и поддержка — под контролем девушки" },
  { icon: "💬", title: "Еженедельный check-in", desc: "Говорите честно о том, что важно" },
  { icon: "🤝", title: "Договорённости", desc: "Фиксируйте важные правила вашей пары" },
  { icon: "❤️", title: "Трекер близости", desc: "Приватный журнал — только для вас" },
  { icon: "✨", title: "Поддержка каждый день", desc: "Рекомендации и забота в нужный момент" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="text-xl font-semibold text-rose-600">Вместе</div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            Начать
          </Link>
        </div>
      </header>

      <section className="text-center px-6 pt-16 pb-20 max-w-3xl mx-auto">
        <div className="text-5xl mb-6">💝</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          Личное пространство<br />для вашей пары
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Планируйте свидания, сохраняйте воспоминания, поддерживайте друг друга
          и становитесь ближе каждый день.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-rose-500 text-white rounded-2xl text-base font-medium hover:bg-rose-600 transition-colors shadow-sm"
          >
            Создать пространство пары
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-rose-500 border border-rose-200 rounded-2xl text-base font-medium hover:bg-rose-50 transition-colors"
          >
            Войти
          </Link>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-semibold text-gray-700 mb-10">
          Всё что нужно — в одном месте
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{f.title}</div>
              <div className="text-xs text-gray-400">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center px-6 pb-20">
        <div className="max-w-md mx-auto bg-rose-500 rounded-3xl p-10 text-white shadow-lg">
          <div className="text-4xl mb-4">🌹</div>
          <h3 className="text-2xl font-semibold mb-3">Начните вместе сейчас</h3>
          <p className="text-rose-100 mb-6 text-sm">
            Создайте пространство пары и пригласите партнёра по ссылке или коду
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-rose-500 rounded-xl font-medium hover:bg-rose-50 transition-colors"
          >
            Создать пространство пары
          </Link>
        </div>
      </section>

      <footer className="text-center pb-8 text-xs text-gray-400">
        Вместе © 2025 · Приватно и безопасно
      </footer>
    </div>
  )
}
