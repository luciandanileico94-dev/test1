"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal("")).nullable(),
  product_url: z.string().url().optional().or(z.literal("")).nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  priority: z.coerce.number().int().min(0).max(1).optional().default(0),
});

export type ItemInput = z.infer<typeof itemSchema>;

async function ensureUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function createItem(input: ItemInput) {
  const data = itemSchema.parse(input);
  const { supabase } = await ensureUser();

  const { data: maxRow } = await supabase
    .from("wishlist_items")
    .select("position")
    .eq("event_id", data.event_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: created, error } = await supabase
    .from("wishlist_items")
    .insert({
      event_id: data.event_id,
      title: data.title,
      description: data.description || null,
      image_url: data.image_url || null,
      product_url: data.product_url || null,
      price: data.price ?? null,
      priority: data.priority ?? 0,
      position,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/events/${data.event_id}/edit`);
  return created;
}

export async function updateItem(id: string, input: Partial<ItemInput>) {
  const { supabase } = await ensureUser();
  const { error, data } = await supabase
    .from("wishlist_items")
    .update({
      title: input.title,
      description: input.description ?? null,
      image_url: input.image_url || null,
      product_url: input.product_url || null,
      price: input.price ?? null,
      priority: input.priority ?? 0,
    })
    .eq("id", id)
    .select("event_id")
    .single();
  if (error) throw new Error(error.message);
  if (data) revalidatePath(`/dashboard/events/${data.event_id}/edit`);
}

export async function deleteItem(id: string) {
  const { supabase } = await ensureUser();
  const { data, error } = await supabase.from("wishlist_items").delete().eq("id", id).select("event_id").single();
  if (error) throw new Error(error.message);
  if (data) revalidatePath(`/dashboard/events/${data.event_id}/edit`);
}

export async function reorderItems(eventId: string, orderedIds: string[]) {
  const { supabase } = await ensureUser();
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("wishlist_items").update({ position }).eq("id", id).eq("event_id", eventId),
    ),
  );
  revalidatePath(`/dashboard/events/${eventId}/edit`);
}
