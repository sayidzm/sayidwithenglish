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
    const record = { user, profile, password };
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
    return send(404, { message: "fixture route not implemented" });
  });
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () => resolve(server)),
  );
}
