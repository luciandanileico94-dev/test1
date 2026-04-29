import Link from "next/link"

export default function TermsPage() {
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
        <h1 className="font-display text-4xl font-semibold mb-2">Условия использования</h1>
        <p className="text-white/30 text-sm mb-12">Последнее обновление: январь 2025</p>

        <div className="space-y-10 text-white/60 leading-relaxed">
          {[
            { title: "Принятие условий", content: "Используя приложение «Вместе», вы соглашаетесь с настоящими условиями. Если вы не согласны с условиями — пожалуйста, не используйте приложение." },
            { title: "Использование приложения", content: "Приложение предназначено для использования парами. Создавая пространство, вы соглашаетесь использовать его добросовестно. Запрещается использование приложения в незаконных целях, для harassment или нарушения прав других пользователей." },
            { title: "Аккаунт", content: "Вы несёте ответственность за безопасность вашего аккаунта и пароля. Не передавайте данные для входа третьим лицам. При подозрении на компрометацию аккаунта немедленно смените пароль." },
            { title: "Контент", content: "Вы сохраняете права на контент который создаёте в приложении. Загружая контент, вы даёте нам право хранить и отображать его в рамках работы приложения. Запрещается загрузка незаконного контента." },
            { title: "Ограничение ответственности", content: "Приложение предоставляется «как есть». Мы не несём ответственности за потерю данных, прерывание работы сервиса или любой ущерб от использования приложения." },
            { title: "Изменения", content: "Мы можем обновлять условия использования. При существенных изменениях мы уведомим вас через приложение. Продолжение использования означает принятие новых условий." },
            { title: "Контакт", content: "По вопросам условий использования: hello@vmeste.app" },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-white font-semibold text-lg mb-3">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
