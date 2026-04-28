import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Calendar } from "lucide-react";
import type { Event } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Мои события</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="h-4 w-4" /> Новое событие
          </Button>
        </Link>
      </div>

      {!events?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">У вас пока нет событий</p>
            <Link href="/dashboard/events/new">
              <Button>
                <Plus className="h-4 w-4" /> Создать первое событие
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(events as Event[]).map((e) => (
            <Card key={e.id} className="overflow-hidden">
              {e.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.cover_image_url} alt={e.title} className="h-32 w-full object-cover" />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{e.title}</CardTitle>
                  {e.is_public ? <Badge variant="secondary">публичное</Badge> : <Badge variant="outline">черновик</Badge>}
                </div>
                <CardDescription className="flex items-center gap-1">
                  {e.event_date && (
                    <>
                      <Calendar className="h-3 w-3" />
                      {new Date(e.event_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/dashboard/events/${e.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Редактировать
                  </Button>
                </Link>
                <Link href={`/e/${e.slug}`} target="_blank">
                  <Button variant="ghost" size="icon" aria-label="Открыть публичную страницу">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
