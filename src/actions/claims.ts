"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const claimSchema = z.object({
  item_id: z.string().uuid(),
  guest_name: z.string().min(1, "Укажите имя").max(80),
  guest_message: z.string().max(500).optional().nullable(),
});

export type ClaimInput = z.infer<typeof claimSchema>;

export async function createClaim(input: ClaimInput): Promise<{ token: string; guest_name: string }> {
  const data = claimSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const { data: created, error } = await supabase
    .from("claims")
    .insert({
      item_id: data.item_id,
      guest_name: data.guest_name,
      guest_message: data.guest_message || null,
    })
    .select("guest_token, guest_name, item_id")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("Этот подарок уже забронировали");
    throw new Error(error.message);
  }

  // Find slug to revalidate the public page.
  const { data: itemRow } = await supabase
    .from("wishlist_items")
    .select("event_id, events(slug)")
    .eq("id", data.item_id)
    .single();
  const slug = (itemRow as { events?: { slug?: string } } | null)?.events?.slug;
  if (slug) revalidatePath(`/e/${slug}`);

  return { token: created.guest_token, guest_name: created.guest_name };
}

export async function unclaim(itemId: string, token: string) {
  if (!token) throw new Error("Нет токена");
  const service = createSupabaseServiceClient();

  const { data: claim } = await service
    .from("claims")
    .select("id, guest_token, item_id")
    .eq("item_id", itemId)
    .maybeSingle();

  if (!claim) return;
  if (claim.guest_token !== token) throw new Error("Неверный токен");

  const { error } = await service.from("claims").delete().eq("id", claim.id);
  if (error) throw new Error(error.message);

  const { data: itemRow } = await service
    .from("wishlist_items")
    .select("events(slug)")
    .eq("id", itemId)
    .single();
  const slug = (itemRow as { events?: { slug?: string } } | null)?.events?.slug;
  if (slug) revalidatePath(`/e/${slug}`);
}
