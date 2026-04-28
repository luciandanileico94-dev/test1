import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, MapPin, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/40 to-background">
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="text-xl font-bold">
          🎁 WishList
        </Link>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost">Войти</Button>
          </Link>
          <Link href="/login">
            <Button>Создать событие</Button>
          </Link>
        </div>
      </header>

      <section className="container py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Вишлист для любого события — красиво и в реальном времени
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          День рождения, свадьба, новоселье. Создайте страницу события, добавьте подарки со ссылками,
          укажите место — гости забронируют подарки, и все увидят это мгновенно.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login">
            <Button size="lg">Начать бесплатно</Button>
          </Link>
        </div>
      </section>

      <section className="container grid gap-6 pb-20 md:grid-cols-3">
        <Feature icon={<Gift className="h-6 w-6" />} title="Список подарков">
          Добавляйте товары по ссылке — превью подтянется автоматически. Сортируйте, отмечайте важные.
        </Feature>
        <Feature icon={<MapPin className="h-6 w-6" />} title="Место и маршрут">
          Карта с точкой события, адрес, описание как добраться. Открывается в любых картах одним кликом.
        </Feature>
        <Feature icon={<Zap className="h-6 w-6" />} title="Живые брони">
          Гость бронирует подарок — все, кто на странице, видят это мгновенно. Без коллизий и дублей.
        </Feature>
      </section>
    </main>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
