import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Страница не найдена или закрыта от публичного доступа.</p>
      <Link href="/" className="mt-6">
        <Button>На главную</Button>
      </Link>
    </main>
  );
}
