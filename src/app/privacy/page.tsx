import Link from "next/link"

export default function PrivacyPage() {
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
        <h1 className="font-display text-4xl font-semibold mb-2">Политика конфиденциальности</h1>
        <p className="text-white/30 text-sm mb-12">Последнее обновление: январь 2025</p>

        <div className="space-y-10 text-white/60 leading-relaxed">
          {[
            { title: "Какие данные мы собираем", content: "Мы собираем только те данные, которые вы вводите сами: email, имя, данные профиля пары, события, вишлисты и другой контент который вы создаёте в приложении. Мы не собираем данные о вашем поведении в интернете и не используем сторонние трекеры." },
            { title: "Как мы используем данные", content: "Ваши данные используются исключительно для работы приложения. Мы не продаём ваши данные третьим лицам, не используем их для рекламы и не передаём без вашего согласия." },
            { title: "Кто видит ваши данные", content: "Ваши данные доступны только участникам вашей пары. Каждый модуль имеет настройки приватности — вы сами решаете что видит партнёр. Наши сотрудники не имеют доступа к содержимому вашего пространства." },
            { title: "Безопасность", content: "Мы используем шифрование данных и Row Level Security (RLS) от Supabase. Пароли хранятся в зашифрованном виде и никогда не передаются в открытом виде." },
            { title: "Удаление данных", content: "Вы можете удалить своё пространство пары и все связанные данные в любой момент через настройки приложения. После удаления данные не могут быть восстановлены." },
            { title: "Контакт", content: "Если у вас есть вопросы по конфиденциальности, напишите нам: hello@vmeste.app" },
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
