import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(items: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            for (const { name, value, options } of items) {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            }
          } catch { /* server component */ }
        },
      },
    },
  )
}

// backward compat
export const createSupabaseServerClient = createClient

export function createSupabaseServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
