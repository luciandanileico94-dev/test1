"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Star, Link2, Gift, X } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createClaim, unclaim } from "@/actions/claims";
import { formatPrice } from "@/lib/utils";
import type { Event, WishlistItem, AnonymousClaim } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map-view").then((m) => m.MapView), { ssr: false });

export function PublicEvent({
  event,
  items,
  initialClaims,
}: {
  event: Event;
  items: WishlistItem[];
  initialClaims: AnonymousClaim[];
}) {
  const [claims, setClaims] = useState<AnonymousClaim[]>(initialClaims);
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<WishlistItem | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const claimsByItem = useMemo(() => new Map(claims.map((c) => [c.item_id, c])), [claims]);
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  // Restore guest name from previous visits
  useEffect(() => {
    const saved = localStorage.getItem("wishlist:guest_name");
    if (saved) setName(saved);
  }, []);

  // Realtime subscription on claims for this event's items
  useEffect(() => {
    if (itemIds.length === 0) return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`claims-event-${event.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "claims" },
        (payload) => {
          const claim = payload.new as AnonymousClaim & { guest_token?: string; guest_name?: string; guest_message?: string };
          if (!itemIds.includes(claim.item_id)) return;
          setClaims((prev) => {
            if (prev.some((c) => c.id === claim.id)) return prev;
            return [...prev, { id: claim.id, item_id: claim.item_id, claimed_at: claim.claimed_at }];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "claims" },
        (payload) => {
          const oldClaim = payload.old as { id: string };
          setClaims((prev) => prev.filter((c) => c.id !== oldClaim.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, itemIds]);

  function openClaim(item: WishlistItem) {
    setActiveItem(item);
    setMessage("");
    setOpen(true);
  }

  async function submitClaim() {
    if (!activeItem) return;
    if (!name.trim()) {
      toast.error("Укажите имя");
      return;
    }
    setSubmitting(true);
    try {
      const { token, guest_name } = await createClaim({
        item_id: activeItem.id,
        guest_name: name.trim(),
        guest_message: message.trim() || null,
      });
      localStorage.setItem(`claim_token:${activeItem.id}`, token);
      localStorage.setItem("wishlist:guest_name", name.trim());
      // Optimistic update — Realtime will dedupe
      setClaims((prev) => {
        if (prev.some((c) => c.item_id === activeItem.id)) return prev;
        return [
          ...prev,
          { id: `local-${activeItem.id}`, item_id: activeItem.id, claimed_at: new Date().toISOString() },
        ];
      });
      setOpen(false);
      toast.success("Подарок забронирован!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  async function onUnclaim(itemId: string) {
    const token = localStorage.getItem(`claim_token:${itemId}`);
    if (!token) {
      toast.error("Нет права отменить эту бронь");
      return;
    }
    try {
      await unclaim(itemId, token);
      localStorage.removeItem(`claim_token:${itemId}`);
      setClaims((prev) => prev.filter((c) => c.item_id !== itemId));
      toast.success("Бронь отменена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const mapsLinks = useMemo(() => {
    if (event.lat == null || event.lng == null) return null;
    const q = `${event.lat},${event.lng}`;
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${q}`,
      yandex: `https://yandex.ru/maps/?pt=${event.lng},${event.lat}&z=16&l=map`,
      apple: `https://maps.apple.com/?ll=${q}&q=${encodeURIComponent(event.location_name ?? event.title)}`,
    };
  }, [event.lat, event.lng, event.title, event.location_name]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/30 to-background pb-16">
      {event.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.cover_image_url} alt="" className="h-64 w-full object-cover md:h-80" />
      ) : (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent" />
      )}

      <section className="container -mt-16 space-y-8">
        <Card>
          <CardContent className="space-y-3 p-6 md:p-8">
            <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>
            {event.event_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(event.event_date).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
            {event.description && (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {event.description}
              </p>
            )}
          </CardContent>
        </Card>

        {(event.lat != null && event.lng != null) || event.address || event.directions ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5" /> Где это будет
              </h2>
              {event.location_name && <p className="font-medium">{event.location_name}</p>}
              {event.address && <p className="text-muted-foreground">{event.address}</p>}
              {event.lat != null && event.lng != null && (
                <div className="h-64 overflow-hidden rounded-md border">
                  <MapView lat={event.lat} lng={event.lng} />
                </div>
              )}
              {mapsLinks && (
                <div className="flex flex-wrap gap-2">
                  <a href={mapsLinks.google} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">Google Maps</Button>
                  </a>
                  <a href={mapsLinks.yandex} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">Яндекс Карты</Button>
                  </a>
                  <a href={mapsLinks.apple} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">Apple Maps</Button>
                  </a>
                </div>
              )}
              {event.directions && (
                <div>
                  <h3 className="mb-1 text-sm font-medium">Как добраться</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{event.directions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Gift className="h-6 w-6" /> Вишлист
          </h2>
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Пока в списке нет подарков.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const claim = claimsByItem.get(item.id) ?? null;
                const myToken = typeof window !== "undefined"
                  ? localStorage.getItem(`claim_token:${item.id}`)
                  : null;
                const isMine = !!claim && !!myToken;
                return (
                  <Card key={item.id} className="flex flex-col overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="" className="h-44 w-full object-cover" />
                    ) : (
                      <div className="h-44 w-full bg-muted" />
                    )}
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium leading-snug">{item.title}</h3>
                        {item.priority === 1 && (
                          <Badge variant="secondary">
                            <Star className="mr-1 h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <div className="mt-1 flex items-center justify-between text-sm">
                        {item.price != null && <span className="font-medium">{formatPrice(item.price)}</span>}
                        {item.product_url && (
                          <a
                            href={item.product_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Link2 className="h-3 w-3" /> Открыть
                          </a>
                        )}
                      </div>
                      <div className="mt-auto pt-2">
                        {claim ? (
                          <div className="space-y-2">
                            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                              Уже забронировано
                            </div>
                            {isMine && (
                              <Button variant="outline" size="sm" onClick={() => onUnclaim(item.id)} className="w-full">
                                <X className="h-3 w-3" /> Отменить мою бронь
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button onClick={() => openClaim(item)} className="w-full">
                            Забронировать
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бронь подарка</DialogTitle>
            <DialogDescription>{activeItem?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="guest_name">Ваше имя</Label>
              <Input
                id="guest_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest_message">Сообщение (необязательно)</Label>
              <Textarea
                id="guest_message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Поздравление или комментарий"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              После брони этот подарок станет недоступен другим гостям. Отменить можно с этого же устройства.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={submitClaim} disabled={submitting}>
              {submitting ? "Бронируем..." : "Забронировать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
