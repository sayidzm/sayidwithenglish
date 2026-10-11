import "server-only";

/** Trusted deployment config; never construct email URLs from user input/Host. */
export function appOrigin() {
  const url = new URL(process.env.APP_URL || "http://localhost:3000");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:"))
    throw new Error("APP_URL must be HTTPS or localhost.");
  if (url.username || url.password)
    throw new Error("APP_URL cannot include credentials.");
  return url.origin;
}
