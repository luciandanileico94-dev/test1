"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createItem, updateItem, deleteItem, reorderItems } from "@/actions/items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Plus, Pencil, Trash2, Star, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { WishlistItem, Claim } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type FormState = {
  id?: string;
  title: string;
  description: string;
  product_url: string;
  image_url: string;
  price: string;
  priority: 0 | 1;
};

const empty: FormState = { title: "", description: "", product_url: "", image_url: "", price: "", priority: 0 };

export function WishlistEditor({
  eventId,
  initialItems,
  initialClaims,
}: {
  eventId: string;
  initialItems: WishlistItem[];
  initialClaims: Claim[];
}) {
  const [items, setItems] = useState(initialItems);
  const [claims] = useState(initialClaims);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [prefetching, setPrefetching] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const claimsByItem = new Map(claims.map((c) => [c.item_id, c]));

  function openNew() {
    setForm(empty);
    setOpen(true);
  }

  function openEdit(it: WishlistItem) {
    setForm({
      id: it.id,
      title: it.title,
      description: it.description ?? "",
      product_url: it.product_url ?? "",
      image_url: it.image_url ?? "",
      price: it.price?.toString() ?? "",
      priority: (it.priority as 0 | 1) ?? 0,
    });
    setOpen(true);
  }

  async function prefetchOg() {
    if (!form.product_url) {
      toast.info("Сначала вставьте ссылку на товар");
      return;
    }
    setPrefetching(true);
    try {
      const res = await fetch(`/api/og-prefetch?url=${encodeURIComponent(form.product_url)}`);
      if (!res.ok) throw new Error("Не удалось получить превью");
      const og = await res.json();
      setForm((f) => ({
        ...f,
        title: f.title || og.title || f.title,
        description: f.description || og.description || f.description,
        image_url: f.image_url || og.image || f.image_url,
      }));
      toast.success("Превью подтянуто");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setPrefetching(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        event_id: eventId,
        title: form.title,
        description: form.description || null,
        image_url: form.image_url || null,
        product_url: form.product_url || null,
        price: form.price ? Number(form.price) : null,
        priority: form.priority,
      };
      if (form.id) {
        await updateItem(form.id, payload);
        setItems((xs) =>
          xs.map((x) =>
            x.id === form.id
              ? { ...x, ...payload, description: payload.description, image_url: payload.image_url, product_url: payload.product_url, price: payload.price }
              : x,
          ),
        );
      } else {
        const created = await createItem(payload);
        if (created) setItems((xs) => [...xs, created as WishlistItem]);
      }
      setOpen(false);
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить подарок?")) return;
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== id));
    try {
      await deleteItem(id);
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    try {
      await reorderItems(eventId, next.map((i) => i.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Перетаскивайте за <GripVertical className="inline h-3 w-3" /> для изменения порядка.
        </p>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Добавить подарок
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Пока нет подарков. Добавьте первый!
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  claim={claimsByItem.get(item.id) ?? null}
                  onEdit={() => openEdit(item)}
                  onDelete={() => remove(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Редактировать подарок" : "Новый подарок"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="product_url">Ссылка на товар</Label>
              <div className="flex gap-2">
                <Input
                  id="product_url"
                  type="url"
                  placeholder="https://shop.com/product"
                  value={form.product_url}
                  onChange={(e) => setForm({ ...form, product_url: e.target.value })}
                />
                <Button variant="outline" onClick={prefetchOg} disabled={prefetching} type="button">
                  <Sparkles className="h-4 w-4" /> {prefetching ? "..." : "Подтянуть"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Картинка (URL)</Label>
              <Input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
              {form.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="" className="h-32 w-32 rounded-md object-cover" />
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Приоритет</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.priority === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, priority: 0 })}
                  >
                    Хочу
                  </Button>
                  <Button
                    type="button"
                    variant={form.priority === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, priority: 1 })}
                  >
                    <Star className="h-3 w-3" /> Очень хочу
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={save} disabled={saving || !form.title}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableRow({
  item,
  claim,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  claim: Claim | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardContent className="flex items-center gap-3 p-3">
        <button
          {...attributes}
          {...listeners}
          className="flex h-10 w-6 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
          aria-label="Перетащить"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="h-14 w-14 rounded-md object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-md bg-muted" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{item.title}</span>
            {item.priority === 1 && (
              <Badge variant="secondary">
                <Star className="mr-1 h-3 w-3" /> Очень хочу
              </Badge>
            )}
            {claim && <Badge variant="outline">Бронь: {claim.guest_name}</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.price != null && <span>{formatPrice(item.price)}</span>}
            {item.product_url && (
              <a href={item.product_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                <Link2 className="h-3 w-3" /> Ссылка
              </a>
            )}
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Редактировать">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Удалить">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}
