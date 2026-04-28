import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PublicEvent } from "@/components/public-event";
import type { Event, WishlistItem, PublicClaim } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description, cover_image_url, is_public")
    .eq("slug", slug)
    .maybeSingle();
  if (!event || !event.is_public) return { title: "WishList" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160) ?? undefined,
      images: event.cover_image_url ? [event.cover_image_url] : undefined,
    },
  };
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!event || !event.is_public) notFound();

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("event_id", event.id)
    .order("position", { ascending: true });

  const itemIds = (items ?? []).map((i) => i.id);
  const { data: claims } = itemIds.length
    ? await supabase
        .from("claims")
        .select("id, item_id, guest_name, guest_message, claimed_at")
        .in("item_id", itemIds)
    : { data: [] as PublicClaim[] };

  return (
    <PublicEvent
      event={event as Event}
      items={(items ?? []) as WishlistItem[]}
      initialClaims={(claims ?? []) as PublicClaim[]}
    />
  );
}
