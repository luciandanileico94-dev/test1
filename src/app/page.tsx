import Link from "next/link"

const features = [
  {
    icon: "📅",
    title: "Общий календарь",
    desc: "Планируйте свидания, годовщины и поездки в одном месте. Никогда не забудете важный день.",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
  },
  {
    icon: "🎁",
    title: "Вишлисты",
    desc: "Делитесь желаниями и делайте сюрпризы. Режим тайного резервирования скроет ваш подарок.",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-100",
  },
  {
    icon: "📸",
    title: "Воспоминания",
    desc: "Создавайте альбомы, сохраняйте фото и смотрите на путь, который вы прошли вместе.",
    color: "from-pink-50 to-rose-50",
    border: "border-pink-100",
  },
  {
    icon: "🌸",
    title: "Трекер цикла",
    desc: "Понимание и забота в нужный момент. Девушка сама решает что видит партнёр.",
    color: "from-purple-50 to-pink-50",
    border: "border-purple-100",
  },
  {
    icon: "💬",
    title: "Еженедельный check-in",
    desc: "Раз в неделю отвечайте на простые вопросы. Ответы партнёра появятся когда оба заполнят.",
    color: "from-green-50 to-teal-50",
    border: "border-green-100",
  },
  {
    icon: "🤝",
    title: "Договорённости",
    desc: "Фиксируйте важные правила вашей пары — как вы решаете конфликты, что важно в близости.",
    color: "from-rose-50 to-pink-50",
    border: "border-rose-100",
  },
]

const steps = [
  { num: "01", title: "Создай пространство", desc: "Зарегистрируйся и создай профиль вашей пары" },
  { num: "02", title: "Пригласи партнёра", desc: "Поделись кодом — партнёр присоединяется за секунды" },
  { num: "03", title: "Живите вместе", desc: "Планируйте, делитесь, поддерживайте друг друга" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(160deg, #fff1f5 0%, #fdf4ff 50%, #f0f4ff 100%)" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💝</span>
            <span className="font-display text-xl font-semibold text-rose-600">Вместе</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors px-4 py-2">
              Войти
            </Link>
            <Link href="/register" className="text-sm font-medium bg-rose-500 text-white px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-all shadow-rose hover:shadow-lg hover:-translate-y-0.5">
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-100 rounded-full px-4 py-1.5 text-sm text-rose-600 font-medium mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            Личное пространство для пары
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold text-gray-800 mb-6 leading-tight">
            Всё для вас{" "}
            <span className="text-gradient italic">двоих</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Планируйте свидания, сохраняйте воспоминания, поддерживайте друг друга.
            Приватное пространство только для вас двоих.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-rose-500 text-white rounded-2xl font-semibold text-base hover:bg-rose-600 transition-all shadow-rose hover:shadow-xl hover:-translate-y-1 text-center">
              Создать пространство пары →
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/80 text-gray-700 border border-gray-200 rounded-2xl font-semibold text-base hover:bg-white transition-all hover:shadow-soft text-center">
              Уже есть аккаунт
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-5">Бесплатно · Без рекламы · Приватно</p>
        </div>

        {/* Floating cards */}
        <div className="relative mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="animate-float col-span-1 bg-white/90 rounded-2xl p-4 shadow-card border border-white/60">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-xs font-semibold text-gray-700">Свидание в пятницу</p>
              <p className="text-xs text-gray-400 mt-0.5">Ресторан · 19:00</p>
              <div className="mt-2 text-xs bg-rose-50 text-rose-500 rounded-lg px-2 py-1 inline-block">Запланировано</div>
            </div>
            <div className="animate-float-delayed col-span-1 bg-white/90 rounded-2xl p-4 shadow-card border border-white/60 mt-8">
              <div className="text-2xl mb-2">💝</div>
              <p className="text-xs font-semibold text-gray-700">3 года вместе</p>
              <p className="text-xs text-rose-400 font-medium mt-0.5">1096 дней 💕</p>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map(i => <span key={i} className="text-xs text-rose-400">★</span>)}
              </div>
            </div>
            <div className="animate-float col-span-1 bg-white/90 rounded-2xl p-4 shadow-card border border-white/60">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-xs font-semibold text-gray-700">Check-in недели</p>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden"><div className="h-full bg-rose-400 rounded-full w-full" /></div>
                <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden"><div className="h-full bg-rose-300 rounded-full w-3/4" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
            Всё что нужно паре
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Один сервис вместо десяти приложений
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className={`bg-gradient-to-br ${f.color} rounded-2xl p-6 border ${f.border} hover:shadow-soft transition-all hover:-translate-y-1 group`}>
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
              Начать просто
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-rose-200 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-card border border-rose-100 mb-4">
                  <span className="font-display text-xl font-semibold text-rose-400">{s.num}</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-white/70 border border-rose-100 rounded-3xl p-10 md:p-16 text-center shadow-soft">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Приватность — наш приоритет
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Ваши данные видны только вам двоим. Никакой рекламы, никакой слежки.
            Каждый раздел имеет настройки приватности — вы решаете что видит партнёр.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Без рекламы", "Только ваша пара", "Шифрование данных", "Контроль приватности"].map(t => (
              <div key={t} className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-4 py-2">
                <span className="text-rose-400">✓</span>
                <span className="text-sm font-medium text-gray-700">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-12 md:p-16 shadow-rose">
            <div className="text-5xl mb-6">💑</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              Начните прямо сейчас
            </h2>
            <p className="text-rose-100 mb-8 text-lg">
              Создайте пространство и пригласите партнёра — это займёт минуту
            </p>
            <Link href="/register" className="inline-block px-10 py-4 bg-white text-rose-500 rounded-2xl font-semibold text-base hover:bg-rose-50 transition-all hover:-translate-y-1 shadow-lg">
              Создать пространство пары →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-6 border-t border-rose-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">💝</span>
          <span className="font-display text-lg font-semibold text-rose-500">Вместе</span>
        </div>
        <p className="text-sm text-gray-400">© 2025 · Сделано с любовью · Приватно и безопасно</p>
      </footer>
    </div>
  )
}
