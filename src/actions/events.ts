"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify, randomSuffix } from "@/lib/utils";

const eventSchema = z.object({
  title: z.string().min(2, "Название слишком короткое").max(120),
  description: z.string().max(5000).optional().default(""),
  event_date: z.string().optional().nullable(),
  location_name: z.string().max(200).optional().default(""),
  address: z.string().max(300).optional().default(""),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  directions: z.string().max(2000).optional().default(""),
  cover_image_url: z.string().url().optional().or(z.literal("")).nullable(),
  is_public: z.coerce.boolean().optional().default(true),
});

export type EventInput = z.infer<typeof eventSchema>;

async function ensureUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function createEvent(input: EventInput) {
  const data = eventSchema.parse(input);
  const { supabase, user } = await ensureUser();

  const baseSlug = slugify(data.title) || "event";
  const slug = `${baseSlug}-${randomSuffix(5)}`;

  const { data: created, error } = await supabase
    .from("events")
    .insert({
      owner_id: user.id,
      slug,
      title: data.title,
      description: data.description,
      event_date: data.event_date || null,
      location_name: data.location_name || null,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      directions: data.directions || null,
      cover_image_url: data.cover_image_url || null,
      is_public: data.is_public,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  redirect(`/dashboard/events/${created.id}/edit`);
}

export async function updateEvent(id: string, input: EventInput) {
  const data = eventSchema.parse(input);
  const { supabase } = await ensureUser();

  const { error } = await supabase
    .from("events")
    .update({
      title: data.title,
      description: data.description,
      event_date: data.event_date || null,
      location_name: data.location_name || null,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      directions: data.directions || null,
      cover_image_url: data.cover_image_url || null,
      is_public: data.is_public,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/events/${id}/edit`);
  revalidatePath("/dashboard");
}

export async function updateEventSlug(id: string, slugInput: string) {
  const slug = slugify(slugInput);
  if (!slug) throw new Error("Некорректный slug");
  const { supabase } = await ensureUser();
  const { error } = await supabase.from("events").update({ slug }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/events/${id}/edit`);
}

export async function deleteEvent(id: string) {
  const { supabase } = await ensureUser();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
