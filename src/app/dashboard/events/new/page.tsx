"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent } from "@/actions/events";
import { toast } from "sonner";

export default function NewEventPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createEvent({
        title: String(fd.get("title") ?? ""),
        description: String(fd.get("description") ?? ""),
        event_date: (fd.get("event_date") as string) || null,
        is_public: true,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Новое событие</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input id="title" name="title" placeholder="День рождения Маши" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Дата и время</Label>
            <Input id="event_date" name="event_date" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание</Label>
            <Textarea id="description" name="description" placeholder="Несколько слов о событии..." rows={4} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Создаём..." : "Создать"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
