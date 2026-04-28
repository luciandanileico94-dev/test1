import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/events";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <Link href="/dashboard" className="text-lg font-bold">
            🎁 WishList
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user?.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="container py-8">{children}</div>
    </div>
  );
}
