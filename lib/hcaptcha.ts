"use server";

export async function verifyHcaptcha(token: string): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    // Dev: skip verification if key not configured
    return true;
  }

  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`,
  });
  const data = await res.json();
  return data.success === true;
}
