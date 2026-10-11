// Local HTTP contract fixture. Production has no bypass or fake session path.
import { createServer } from "node:http";
import { createHmac, randomUUID } from "node:crypto";

const secret = "local-contract-fixture-only";
const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
function jwt(id, seconds = 3600) {
  const data = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now() / 1000) + seconds, iat: Math.floor(Date.now() / 1000) })}`;
  return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
}
export const fixtureKey = jwt("anon-fixture");
export function startAuthApi(port = 54329) {
  const users = new Map();
  const refresh = new Map();
  const issued = new Map();
  const consumed = new Set();
  let lastRedirect = "";
  const createUser = (email, password, name = "Sayid") => {
    const id = randomUUID();
    const user = {
      id,
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { display_name: name },
      identities: [{ id, user_id: id, provider: "email" }],
      created_at: new Date().toISOString(),
    };
    const profile = {
      id: randomUUID(),
      user_id: id,
      display_name: name,
      avatar_url: null,
      native_language: "tr",
      learning_language: "en",
      current_level: "B1",
      target_level: "B2",
      daily_new_card_limit: 5,
      daily_review_goal: 30,
      preferred_accent: "us",
      created_at: user.created_at,
      updated_at: user.created_at,
    };
    const record = {
      user, profile, password,
      vocabulary: {
        entries: [], entry_meanings: [], entry_examples: [], similar_expressions: [],
        entry_sources: [], decks: [], deck_entries: [], tags: [], entry_tags: [],
      },
    };
    users.set(email, record);
    return record;
  };
  const session = (record) => {
    const access_token = jwt(record.user.id);
    const refresh_token = randomUUID();
    issued.set(access_token, record);
    refresh.set(refresh_token, record);
    return {
      access_token,
      refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: record.user,
    };
  };
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("X-Supabase-Api-Version", "2024-01-01");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const send = (status, data) => {
      res.statusCode = status;
      res.end(data === undefined ? "" : JSON.stringify(data));
    };
    if (req.method === "OPTIONS") return send(204);
    const url = new URL(req.url, "http://127.0.0.1");
    let body = {};
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) body = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      return send(400, { message: "invalid body" });
    }
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    const record = issued.get(token);
    if (url.pathname === "/health") return send(200, { ok: true });
    if (url.pathname === "/test/redirect")
      return send(200, { redirect: lastRedirect });
    if (url.pathname === "/auth/v1/.well-known/jwks.json")
      return send(200, { keys: [] });
    if (url.pathname === "/auth/v1/token") {
      if (url.searchParams.get("grant_type") === "refresh_token") {
        const value = refresh.get(body.refresh_token);
        return value
          ? send(200, session(value))
          : send(400, {
              code: "refresh_token_not_found",
              message: "invalid refresh",
            });
      }
      if (url.searchParams.get("grant_type") === "pkce") {
        const valid =
          body.auth_code?.startsWith("fixture-valid-code-") &&
          body.code_verifier &&
          !consumed.has(body.auth_code);
        const value = createUser(
          `${body.auth_code}@example.test`,
          "Password123!",
        );
        if (valid) consumed.add(body.auth_code);
        return valid
          ? send(200, session(value))
          : send(400, {
              code: "flow_state_not_found",
              message: "invalid code",
            });
      }
      // Unique fixtures are auto-created only for the known contract password.
      const value =
        users.get(body.email) ||
        (body.password === "Password123!" &&
        body.email?.endsWith("@example.test")
          ? createUser(body.email, body.password)
          : null);
      return value?.password === body.password
        ? send(200, session(value))
        : send(400, {
            code: "invalid_credentials",
            message: "Invalid login credentials",
          });
    }
    if (url.pathname === "/auth/v1/signup") {
      lastRedirect = url.searchParams.get("redirect_to") || "";
      const value = createUser(
        body.email,
        body.password,
        body.data?.display_name,
      );
      return send(200, { user: value.user, session: null });
    }
    if (url.pathname === "/auth/v1/recover") {
      lastRedirect = url.searchParams.get("redirect_to") || "";
      return body.email === "limited@example.test"
        ? send(429, {
            code: "over_email_send_rate_limit",
            message: "rate limit",
          })
        : send(200, {});
    }
    if (url.pathname === "/auth/v1/verify") {
      if (
        !body.token_hash?.startsWith("fixture-valid-hash-") ||
        consumed.has(body.token_hash)
      )
        return send(403, { code: "otp_expired", message: "invalid link" });
      consumed.add(body.token_hash);
      const value = createUser(
        `${body.token_hash}@example.test`,
        "Password123!",
      );
      return send(200, session(value));
    }
    if (url.pathname === "/auth/v1/user") {
      if (!record)
        return send(401, { code: "bad_jwt", message: "invalid session" });
      if (req.method === "PUT") record.password = body.password;
      return send(200, record.user);
    }
    if (url.pathname === "/auth/v1/logout") {
      if (record) {
        for (const [key, value] of refresh)
          if (value === record) refresh.delete(key);
        for (const [key, value] of issued)
          if (value === record) issued.delete(key);
      }
      return send(204);
    }
    if (url.pathname === "/rest/v1/profiles") {
      if (!record) return send(401, { message: "unauthorized" });
      const owner = url.searchParams.get("user_id");
      if (owner && owner !== `eq.${record.user.id}`) return send(200, []);
      if (req.method === "PATCH")
        Object.assign(record.profile, body, {
          updated_at: new Date().toISOString(),
        });
      const singular = req.headers.accept?.includes("vnd.pgrst.object");
      return send(200, singular ? record.profile : [record.profile]);
    }
    const table = url.pathname.replace(/^\/rest\/v1\//, "");
    if (record && table in record.vocabulary) {
      const store = record.vocabulary;
      const rows = store[table];
      const singular = req.headers.accept?.includes("vnd.pgrst.object");
      const ownedEntry = (entryId) => store.entries.some((entry) =>
        entry.id === entryId && entry.user_id === record.user.id);
      const permitted = (row) => {
        if (table === "entries" || table === "decks" || table === "tags")
          return row.user_id === record.user.id;
        if (table === "deck_entries")
          return ownedEntry(row.entry_id) && store.decks.some((deck) =>
            deck.id === row.deck_id && deck.user_id === record.user.id);
        if (table === "entry_tags")
          return ownedEntry(row.entry_id) && store.tags.some((tag) =>
            tag.id === row.tag_id && tag.user_id === record.user.id);
        return ownedEntry(row.entry_id);
      };
      const filtered = () => rows.filter((row) => permitted(row) &&
        [...url.searchParams].every(([key, expression]) => {
          if (key === "select" || key === "order" || key === "limit" || key === "offset") return true;
          if (expression === "is.null") return row[key] === null;
          if (expression.startsWith("eq.")) return String(row[key]) === expression.slice(3);
          return true;
        }));
      const decorate = (entry) => ({
        ...entry,
        entry_meanings: store.entry_meanings.filter((item) => item.entry_id === entry.id),
        entry_examples: store.entry_examples.filter((item) => item.entry_id === entry.id),
        similar_expressions: store.similar_expressions.filter((item) => item.entry_id === entry.id),
        entry_sources: store.entry_sources.filter((item) => item.entry_id === entry.id),
        deck_entries: store.deck_entries.filter((item) => item.entry_id === entry.id).map((item) => ({
          ...item, decks: store.decks.find((deck) => deck.id === item.deck_id) || null,
        })),
        entry_tags: store.entry_tags.filter((item) => item.entry_id === entry.id).map((item) => ({
          ...item, tags: store.tags.find((tag) => tag.id === item.tag_id) || null,
        })),
      });
      if (req.method === "GET") {
        const found = filtered();
        if (table === "entries") found.sort((a, b) => b.created_at.localeCompare(a.created_at));
        const selected = table === "entries" ? found.map(decorate) : found;
        return send(200, singular ? selected[0] || null : selected);
      }
      if (req.method === "POST") {
        const payload = Array.isArray(body) ? body : [body];
        const created = [];
        for (const item of payload) {
          if (table === "entries") {
            const normalized_expression = item.expression
              .replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
              .replace(/[‐‑–—]/g, "-").replace(/\s+/g, " ")
              .trim().toLowerCase().replace(/^[\p{P}]+|[\p{P}]+$/gu, "");
            if (rows.some((entry) => entry.normalized_expression === normalized_expression && !entry.deleted_at))
              return send(409, { code: "23505", message: "duplicate key value violates unique constraint" });
            item.normalized_expression = normalized_expression;
            item.user_id = record.user.id;
            item.deleted_at = null;
            item.learning_status = "new";
            item.is_difficult = false;
            item.is_mastered = false;
          }
          if (table === "decks" || table === "tags") {
            item.user_id = record.user.id;
            if (rows.some((row) => row.name.toLowerCase() === item.name.toLowerCase()))
              return send(409, { code: "23505", message: "duplicate name" });
          }
          if (table === "deck_entries" && !ownedEntry(item.entry_id)) return send(403, { message: "forbidden" });
          if (table === "entry_tags" && !ownedEntry(item.entry_id)) return send(403, { message: "forbidden" });
          if (!["entries", "decks", "tags"].includes(table) && !["deck_entries", "entry_tags"].includes(table) && !ownedEntry(item.entry_id))
            return send(403, { message: "forbidden" });
          const row = { id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item };
          rows.push(row);
          created.push(row);
        }
        return send(201, singular ? created[0] : created);
      }
      if (req.method === "PATCH") {
        const found = filtered();
        if (table === "entries") {
          for (const row of found) {
            if (body.expression) {
              const normalized = body.expression.trim().toLowerCase().replace(/^[\p{P}]+|[\p{P}]+$/gu, "");
              if (rows.some((other) => other.id !== row.id && !other.deleted_at && other.normalized_expression === normalized))
                return send(409, { code: "23505", message: "duplicate key" });
              row.normalized_expression = normalized;
            }
            Object.assign(row, body, { updated_at: new Date().toISOString() });
          }
        }
        return send(200, singular ? found[0] || null : found);
      }
    }
    return send(404, { message: "fixture route not implemented" });
  });
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () => resolve(server)),
  );
}
