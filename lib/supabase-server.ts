import { createClient } from "@supabase/supabase-js";

// Server-only client using service role key — never expose to the client
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
