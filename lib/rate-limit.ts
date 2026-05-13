"use server";
import { supabaseServer } from "./supabase-server";

export type RateLimitAction = "create_libro" | "create_prestito";

const LIMITS: Record<RateLimitAction, { max: number; windowMinutes: number }> = {
  create_libro: { max: 3, windowMinutes: 60 },
  create_prestito: { max: 5, windowMinutes: 60 },
};

export async function checkRateLimit(
  ip: string,
  action: RateLimitAction
): Promise<{ allowed: boolean }> {
  const { max, windowMinutes } = LIMITS[action];
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error } = await supabaseServer
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("action", action)
    .gte("created_at", since);

  if (error) {
    // Fail open on DB error — don't block legitimate users
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }

  if ((count ?? 0) >= max) return { allowed: false };

  await supabaseServer.from("rate_limits").insert({ ip, action });

  return { allowed: true };
}
