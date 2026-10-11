export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error("Supabase environment variables are missing.");
  if (key.startsWith("sb_secret_"))
    throw new Error("Use only a public Supabase key.");
  if (key.startsWith("eyJ")) {
    const payload: unknown = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("role" in payload) ||
      payload.role !== "anon"
    ) {
      throw new Error("Use only a public Supabase anon key.");
    }
  }
  return { url, key };
}
