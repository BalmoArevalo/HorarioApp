import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and set values."
    );
  }
  client = createClient(url, key);
  return client;
}

/** Lazy-initialized so build can succeed without env. Use in client components only. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as unknown as Record<string, unknown>)[prop as string];
  },
});
