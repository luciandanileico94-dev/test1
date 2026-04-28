import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventEditor } from "@/components/event-editor";
import type { Event, WishlistItem, Claim } from "@/lib/types";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("event_id", id)
    .order("position", { ascending: true });

  const itemIds = (items ?? []).map((i) => i.id);
  const { data: claims } = itemIds.length
    ? await supabase.from("claims").select("*").in("item_id", itemIds)
    : { data: [] as Claim[] };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const publicUrl = `${siteUrl}/e/${(event as Event).slug}`;

  return (
    <EventEditor
      event={event as Event}
      items={(items ?? []) as WishlistItem[]}
      claims={(claims ?? []) as Claim[]}
      publicUrl={publicUrl}
    />
  );
}
