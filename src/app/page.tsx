import Link from "next/link"

const features = [
  { icon: "📅", title: "Общий календарь", desc: "Планируйте свидания, годовщины и поездки вместе. Никогда не забудете важный момент." },
  { icon: "🎁", title: "Вишлисты с сюрпризами", desc: "Делитесь желаниями и делайте сюрпризы. Режим тайного резервирования скроет ваш подарок." },
  { icon: "📸", title: "Воспоминания", desc: "Создавайте альбомы и сохраняйте фото. Смотрите на путь, который прошли вместе." },
  { icon: "🌸", title: "Трекер цикла", desc: "Понимание и забота в нужный момент. Девушка сама решает что видит партнёр." },
  { icon: "💬", title: "Еженедельный check-in", desc: "Раз в неделю отвечайте на важные вопросы об отношениях. Честно и приватно." },
  { icon: "🤝", title: "Договорённости", desc: "Фиксируйте правила вашей пары — как решаете конфликты, что важно в близости." },
]

const steps = [
  { num: "01", icon: "✍️", title: "Создайте аккаунт", desc: "Зарегистрируйтесь бесплатно за 30 секунд. Никаких лишних данных." },
  { num: "02", icon: "💌", title: "Пригласите партнёра", desc: "Поделитесь уникальным кодом или ссылкой — партнёр присоединится мгновенно." },
  { num: "03", icon: "💑", title: "Живите вместе", desc: "Планируйте, делитесь воспоминаниями и поддерживайте друг друга каждый день." },
]

const reviews = [
  { name: "Анна и Дмитрий", time: "8 месяцев вместе", text: "Наконец-то одно приложение для всего. Раньше держали всё в разных местах, теперь всё в одном.", stars: 5 },
  { name: "Катя", time: "1 год вместе", text: "Модуль цикла — это что-то особенное. Мой парень стал намного внимательнее, потому что понимает что происходит.", stars: 5 },
  { name: "Миша и Лиза", time: "2 года вместе", text: "Check-in каждую неделю помог нам начать говорить о том о чём раньше молчали. Очень рекомендую.", stars: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d14] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: "rgba(13,13,20,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💝</span>
            <span className="font-display text-xl font-semibold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Вместе</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#about" className="hover:text-white transition-colors">О приложении</a>
            <a href="#how" className="hover:text-white transition-colors">Как использовать</a>
            <a href="#features" className="hover:text-white transition-colors">Возможности</a>
            <a href="#reviews" className="hover:text-white transition-colors">Отзывы</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Войти
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-rose-500/20">
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden" id="about">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-sm text-white/60 mb-8">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Приватное пространство для пары
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-6">
              Всё для вас{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent italic">двоих</span>
              <br />в одном месте
            </h1>

            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
              Планируйте свидания, сохраняйте воспоминания и поддерживайте
              друг друга каждый день. Приватно и безопасно.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:-translate-y-1 shadow-xl shadow-rose-500/25 text-center">
                Создать пространство пары →
              </Link>
              <a href="#how" className="w-full sm:w-auto px-8 py-4 border border-white/10 bg-white/5 text-white/80 rounded-2xl font-semibold hover:bg-white/10 transition-all text-center">
                Как это работает
              </a>
            </div>
            <p className="text-sm text-white/30 mt-5">Бесплатно · Без рекламы · Только для вас двоих</p>
          </div>

          {/* Phone mockup cards */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 mx-auto max-w-sm shadow-2xl">
              {/* Mock app screen */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg">💑</div>
                <div>
                  <p className="font-semibold text-sm">Маша и Ваня</p>
                  <p className="text-xs text-white/40">365 дней вместе 💕</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-xs font-semibold">Свидание в пятницу</p>
                    <p className="text-xs text-white/40">Ресторан · 19:00</p>
                  </div>
                  <div className="ml-auto text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-lg">Запланировано</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="text-xs font-semibold">Check-in недели</p>
                    <p className="text-xs text-white/40">Оба заполнили</p>
                  </div>
                  <div className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-lg">Готово</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <span className="text-xl">🌸</span>
                  <div>
                    <p className="text-xs font-semibold">Как поддержать сегодня</p>
                    <p className="text-xs text-white/40">Будь мягче и внимательнее</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -left-4 top-8 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hidden lg:block animate-float">
              <p className="text-xs text-white/60 mb-1">Вишлист партнёра</p>
              <p className="text-sm font-semibold">🎁 Зарезервировано!</p>
            </div>
            <div className="absolute -right-4 top-16 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hidden lg:block animate-float-delayed">
              <p className="text-xs text-white/60 mb-1">Новое воспоминание</p>
              <p className="text-sm font-semibold">📸 Наш отпуск</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 relative" id="how">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold text-rose-400 border border-rose-400/30 bg-rose-400/10 rounded-full px-4 py-1.5 mb-4">Как использовать</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">Начать просто</h2>
            <p className="text-white/40 text-lg">Три шага до вашего личного пространства</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative bg-white/[0.03] border border-white/8 rounded-2xl p-8 hover:bg-white/[0.06] transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="absolute top-6 right-6 font-display text-5xl font-bold text-white/5">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-white/20 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold text-purple-400 border border-purple-400/30 bg-purple-400/10 rounded-full px-4 py-1.5 mb-4">Возможности</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">Всё что нужно паре</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Один сервис вместо десяти разных приложений</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/15 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-purple-500/5 pointer-events-none" />
            <div className="text-5xl mb-6">🔒</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">Приватность — наш приоритет</h2>
            <p className="text-white/40 max-w-xl mx-auto mb-8 leading-relaxed">
              Ваши данные видны только вам двоим. Никакой рекламы, никакой слежки.
              Каждый раздел имеет настройки приватности.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Без рекламы", "Только ваша пара", "Шифрование данных", "Контроль приватности"].map(t => (
                <div key={t} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-rose-400 text-sm">✓</span>
                  <span className="text-sm text-white/70">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-6" id="reviews">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold text-pink-400 border border-pink-400/30 bg-pink-400/10 rounded-full px-4 py-1.5 mb-4">Отзывы</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">Что говорят пары</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.06] transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <span key={i} className="text-rose-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4 italic">&ldquo;{r.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-white/30 text-xs">{r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" id="faq">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold text-white/50 border border-white/15 bg-white/5 rounded-full px-4 py-1.5 mb-4">FAQ</div>
            <h2 className="font-display text-4xl font-semibold">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "Это бесплатно?", a: "Да, базовая версия полностью бесплатна. Мы не показываем рекламу." },
              { q: "Мои данные в безопасности?", a: "Ваши данные хранятся в зашифрованном виде и видны только участникам пары. Мы используем Supabase с Row Level Security." },
              { q: "Что если партнёр не хочет использовать?", a: "Некоторые модули работают и для одного пользователя — трекер цикла, вишлист, идеи свиданий." },
              { q: "Можно удалить данные?", a: "Да, в настройках есть полное удаление пространства пары со всеми данными." },
              { q: "Есть ли мобильное приложение?", a: "Сейчас это веб-приложение, оптимизированное для телефона. Мобильное приложение в планах." },
            ].map((item) => (
              <div key={item.q} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <p className="font-semibold text-sm mb-2">{item.q}</p>
                <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-rose-500/10 rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/20 rounded-3xl p-12 md:p-16">
            <div className="text-5xl mb-6">💑</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Начните прямо сейчас
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Создайте пространство и пригласите партнёра — это займёт минуту
            </p>
            <Link href="/register" className="inline-block px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:-translate-y-1 shadow-xl shadow-rose-500/25">
              Создать пространство пары →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💝</span>
                <span className="font-display text-xl font-semibold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Вместе</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                Личное пространство для пары. Планируйте, сохраняйте воспоминания и поддерживайте друг друга.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4 text-white/70">Приложение</p>
              <div className="space-y-2.5">
                <a href="#about" className="block text-sm text-white/30 hover:text-white/70 transition-colors">О приложении</a>
                <a href="#features" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Возможности</a>
                <a href="#how" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Как использовать</a>
                <a href="#reviews" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Отзывы</a>
                <a href="#faq" className="block text-sm text-white/30 hover:text-white/70 transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4 text-white/70">Правовое</p>
              <div className="space-y-2.5">
                <Link href="/privacy" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Политика конфиденциальности</Link>
                <Link href="/terms" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Условия использования</Link>
                <Link href="/cookies" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Политика cookies</Link>
                <a href="mailto:hello@vmeste.app" className="block text-sm text-white/30 hover:text-white/70 transition-colors">Связаться с нами</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-sm">© 2025 Вместе · Все права защищены</p>
            <p className="text-white/20 text-sm">Сделано с ❤️ для пар</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
