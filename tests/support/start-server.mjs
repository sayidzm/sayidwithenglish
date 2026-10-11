import { spawn } from "node:child_process";
import { startAuthApi } from "./auth-api.mjs";

const api = await startAuthApi();
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_local_contract_fixture",
  APP_URL: "http://127.0.0.1:3100",
  NEXT_E2E_DIST_DIR: ".next-auth-e2e",
};
const bin = "node_modules/next/dist/bin/next";
const build = spawn(process.execPath, [bin, "build"], {
  env,
  stdio: "inherit",
});
const status = await new Promise((resolve) => build.once("exit", resolve));
if (status !== 0) {
  api.close();
  process.exit(status ?? 1);
}
const app = spawn(
  process.execPath,
  [bin, "start", "--hostname", "127.0.0.1", "--port", "3100"],
  { env, stdio: "inherit" },
);
const close = () => {
  app.kill();
  api.close();
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
app.once("exit", (code) => {
  api.close();
  process.exit(code ?? 0);
});
