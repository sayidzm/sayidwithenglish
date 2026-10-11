import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd();
const routes = ["dashboard", "add", "library", "learn", "review", "tutor", "statistics", "settings"];
const viewports = { desktop: [1440, 900], tablet: [768, 1024], mobile: [390, 844], "mobile-small": [320, 720] };
const expected = Object.entries(viewports).flatMap(([name, dimensions]) =>
  [...routes, "palette", ...(name.startsWith("mobile") ? ["menu"] : []), ...(name === "desktop" ? ["collapsed"] : [])]
    .map((state) => ({ name: `${name}-${state}.png`, dimensions })),
);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : Promise.resolve([path]);
  }));
  return groups.flat();
}

const sources = (await Promise.all(["app", "components", "lib", "styles"].map((directory) => sourceFiles(join(root, directory))))).flat();
sources.push(join(root, "next.config.ts"));
const latestSourceTime = Math.max(...await Promise.all(sources.map(async (path) => (await stat(path)).mtimeMs)));
const captures = await Promise.all(expected.map(async ({ name, dimensions }) => {
  const path = join(root, "qa", "screenshots", name);
  const bytes = await readFile(path);
  const signatureValid = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const modifiedAt = (await stat(path)).mtimeMs;
  if (!signatureValid || width !== dimensions[0] || height !== dimensions[1] || modifiedAt < latestSourceTime) {
    throw new Error(`Invalid, incorrectly sized, or stale capture: ${name}`);
  }
  return { path: resolve(path), width, height, signatureValid, fresh: true, modifiedAt: new Date(modifiedAt).toISOString() };
}));

const manifest = { captureCount: captures.length, latestSourceTime: new Date(latestSourceTime).toISOString(), generatedAt: new Date().toISOString(), captures };
await writeFile(join(root, "qa", "capture-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${captures.length} PNG captures: signatures, viewport dimensions, and source freshness verified.`);
