# WishList — события и подарки

Веб-приложение: организатор создаёт страницу события (день рождения, свадьба, новоселье и т.п.),
добавляет вишлист с подарками и ссылками на товары, указывает место и время.
Гости заходят по публичной ссылке, бронируют подарки — и все остальные видят бронь **в реальном времени**.

## Стек

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + минимальные shadcn-совместимые UI-примитивы
- **Supabase**: Postgres + Auth (magic link) + Realtime
- **react-leaflet** + OpenStreetMap (без API-ключей)
- **@dnd-kit** — drag-and-drop для сортировки подарков
- **open-graph-scraper** — авто-превью товаров по ссылке
- **sonner** — toast-уведомления

## Локальный запуск

### 1. Установка

```bash
npm install
```

### 2. Создайте Supabase-проект

Идите на https://supabase.com/dashboard → New project (бесплатный план достаточен).

Из **Settings → API** скопируйте:
- `Project URL`
- `anon public` ключ
- `service_role` ключ (секретный)

### 3. Переменные окружения

```bash
cp .env.example .env.local
```

Заполните `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Применить миграцию БД

В Supabase Dashboard → **SQL Editor** → New query → скопируйте содержимое
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.

Это создаст таблицы `events`, `wishlist_items`, `claims`, политики RLS и подключит
таблицу `claims` к Realtime-публикации.

### 5. Realtime

Откройте **Database → Replication** в Supabase. Убедитесь, что таблица `public.claims`
включена в публикацию `supabase_realtime` (миграция должна это сделать автоматически).
Если нет — нажмите toggle.

### 6. Auth Redirect URLs

**Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: добавьте `http://localhost:3000/auth/callback`

(При деплое на Vercel добавьте сюда же продакшн-домен.)

### 7. Запуск

```bash
npm run dev
```

Откройте http://localhost:3000.

## Как пользоваться

1. На главной нажмите «Создать событие» → войдите по magic-link.
2. На дашборде создайте новое событие.
3. На странице редактирования заполните вкладки:
   - **Описание** — название, дата, обложка (URL картинки), описание.
   - **Место** — кликните по карте, чтобы поставить точку. Заполните адрес и «как добраться».
   - **Вишлист** — добавляйте подарки. Вставьте URL товара и нажмите «Подтянуть» — название/картинка подтянутся автоматически. Перетаскивайте за иконку слева для сортировки.
   - **Настройки** — изменить slug, переключить публичность, удалить событие.
4. Скопируйте публичную ссылку (`/e/<slug>`) и пошлите гостям.
5. Гости бронируют подарки — указав имя. Бронь видна всем мгновенно (Realtime).
6. Гость может отменить свою бронь с того же устройства (токен в localStorage).

## Структура проекта

```
src/
├── app/
│   ├── page.tsx                       # лендинг
│   ├── login/page.tsx                 # вход (magic link)
│   ├── auth/callback/route.ts         # обмен code → session
│   ├── dashboard/                     # защищённая зона организатора
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # список событий
│   │   └── events/
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   ├── e/[slug]/page.tsx              # публичная страница события
│   ├── api/og-prefetch/route.ts       # OG-парсер по URL
│   ├── layout.tsx                     # корневой
│   ├── globals.css
│   └── not-found.tsx
├── actions/                           # Next.js server actions
│   ├── events.ts
│   ├── items.ts
│   └── claims.ts
├── components/
│   ├── ui/                            # минимальные shadcn-совместимые
│   ├── event-editor.tsx
│   ├── wishlist-editor.tsx
│   ├── public-event.tsx
│   ├── map-picker.tsx
│   └── map-view.tsx
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── types.ts
│   └── utils.ts
└── middleware.ts                      # gate /dashboard
supabase/
└── migrations/0001_init.sql
```

## Деплой на Vercel

1. Запушьте в GitHub.
2. На Vercel **Import project** → выберите репозиторий.
3. Добавьте те же env-переменные (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app).
4. В Supabase **Authentication → URL Configuration** добавьте продакшн-URL в Redirect URLs.
5. Deploy.

## Что не входит в MVP (идеи на будущее)

- Email/Telegram-уведомления организатору о новой брони.
- Множественные подарки (количество > 1).
- Краудфандинг подарка (несколько гостей скидываются).
- Темы оформления страницы события.
- Загрузка обложки/картинок в Supabase Storage (сейчас — URL).
- Markdown-рендеринг описания.

## Команды

```bash
npm run dev         # dev-сервер
npm run build       # прод-сборка
npm start           # запуск прод-сборки
npm run typecheck   # проверка типов
npm run lint        # линт
```
