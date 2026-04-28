"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateEvent, updateEventSlug, deleteEvent } from "@/actions/events";
import { WishlistEditor } from "@/components/wishlist-editor";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import type { Event, WishlistItem, Claim } from "@/lib/types";

const MapPicker = dynamic(() => import("@/components/map-picker").then((m) => m.MapPicker), { ssr: false });

export function EventEditor({
  event,
  items,
  claims,
  publicUrl,
}: {
  event: Event;
  items: WishlistItem[];
  claims: Claim[];
  publicUrl: string;
}) {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    title: event.title,
    description: event.description ?? "",
    event_date: event.event_date ? toLocalInput(event.event_date) : "",
    cover_image_url: event.cover_image_url ?? "",
    location_name: event.location_name ?? "",
    address: event.address ?? "",
    lat: event.lat,
    lng: event.lng,
    directions: event.directions ?? "",
    is_public: event.is_public,
  });
  const [slug, setSlug] = useState(event.slug);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);

  async function saveDetails() {
    setSavingDetails(true);
    try {
      await updateEvent(event.id, {
        ...form,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      });
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSavingDetails(false);
    }
  }

  async function saveLocation() {
    setSavingLocation(true);
    try {
      await updateEvent(event.id, {
        ...form,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      });
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSavingLocation(false);
    }
  }

  async function saveSlug() {
    setSavingSlug(true);
    try {
      await updateEventSlug(event.id, slug);
      toast.success("Адрес обновлён");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSavingSlug(false);
    }
  }

  async function togglePublic(v: boolean) {
    setForm((f) => ({ ...f, is_public: v }));
    try {
      await updateEvent(event.id, {
        ...form,
        is_public: v,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDelete() {
    if (!confirm("Удалить событие безвозвратно?")) return;
    try {
      await deleteEvent(event.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{form.title || "Без названия"}</h1>
          <p className="text-sm text-muted-foreground">
            Публичная ссылка:{" "}
            <a className="underline" href={publicUrl} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
            <button
              className="ml-2 inline-flex items-center text-xs text-primary hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Скопировано");
              }}
            >
              <Copy className="mr-1 h-3 w-3" /> копировать
            </button>
          </p>
        </div>
        <a href={publicUrl} target="_blank" rel="noreferrer">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4" /> Открыть
          </Button>
        </a>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="details">Описание</TabsTrigger>
          <TabsTrigger value="location">Место</TabsTrigger>
          <TabsTrigger value="wishlist">
            Вишлист{" "}
            <Badge variant="secondary" className="ml-2">
              {items.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Описание события</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_date">Дата и время</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover">Обложка (URL картинки)</Label>
                <Input
                  id="cover"
                  type="url"
                  placeholder="https://..."
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                />
                {form.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover_image_url} alt="" className="h-40 w-full rounded-md object-cover" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание (можно использовать markdown)</Label>
                <Textarea
                  id="description"
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <Button onClick={saveDetails} disabled={savingDetails}>
                {savingDetails ? "Сохраняем..." : "Сохранить"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Место и маршрут</CardTitle>
              <CardDescription>Кликните по карте, чтобы поставить точку.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location_name">Название места</Label>
                  <Input
                    id="location_name"
                    value={form.location_name}
                    onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="h-72 overflow-hidden rounded-md border">
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={(lat, lng) => setForm({ ...form, lat, lng })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Координаты: {form.lat?.toFixed(5) ?? "—"}, {form.lng?.toFixed(5) ?? "—"}
              </p>
              <div className="space-y-2">
                <Label htmlFor="directions">Как добраться</Label>
                <Textarea
                  id="directions"
                  rows={4}
                  placeholder="Метро такое-то, выход 3, 5 минут пешком..."
                  value={form.directions}
                  onChange={(e) => setForm({ ...form, directions: e.target.value })}
                />
              </div>
              <Button onClick={saveLocation} disabled={savingLocation}>
                {savingLocation ? "Сохраняем..." : "Сохранить"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistEditor eventId={event.id} initialItems={items} initialClaims={claims} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Адрес страницы</CardTitle>
                <CardDescription>Изменение адреса сделает старую ссылку недействительной.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  <Button onClick={saveSlug} disabled={savingSlug}>
                    Сохранить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Видимость</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_public">Публичная страница</Label>
                  <p className="text-sm text-muted-foreground">
                    Если выключено — страница недоступна гостям.
                  </p>
                </div>
                <Switch id="is_public" checked={form.is_public} onCheckedChange={togglePublic} />
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive">Опасная зона</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" /> Удалить событие
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
