import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

// Diagnostic pairs only: the source is an angled, photographed collage.
// Resizing establishes a common canvas, not a pixel-perfect fidelity claim.
const root = process.cwd();
const cli = process.argv[2];
if (!cli) throw new Error("Pass the installed visual-qa.mjs CLI path");
const reference = join(root, "docs/reference/sayidwithenglish-ui-reference.png.png");
const regions = [
  ["dashboard", [48, 163, 552, 385], "desktop-dashboard"],
  ["add", [618, 112, 469, 445], "desktop-add"],
  ["library", [1097, 108, 536, 402], "desktop-library"],
  ["detail", [27, 556, 420, 365], "desktop-library-drawer"],
  ["review", [455, 564, 358, 358], "desktop-review"],
  ["tutor", [822, 562, 405, 367], "desktop-tutor-correction"],
  ["statistics", [1230, 566, 426, 364], "desktop-statistics"],
];
await mkdir(join(root, "qa/reference"), { recursive: true });
await mkdir(join(root, "qa/diff"), { recursive: true });
const reports = [];
for (const [name, [left, top, width, height], actualName] of regions) {
  const target = join(root, `qa/reference/${name}.png`);
  await sharp(reference).extract({ left, top, width, height }).resize({ width: 1100 }).png().toFile(target);
  const dimensions = await sharp(target).metadata();
  const actual = join(root, `qa/diff/${name}-normalized.png`);
  await sharp(join(root, `qa/final/${actualName}.png`)).resize(dimensions.width, dimensions.height, { fit: "fill" }).png().toFile(actual);
  const report = JSON.parse(execFileSync(process.execPath, [cli, "image-diff", target, actual], { encoding: "utf8" }));
  await writeFile(join(root, `qa/diff/${name}.json`), JSON.stringify(report, null, 2));
  await sharp({ create: { width: dimensions.width * 2, height: dimensions.height, channels: 3, background: "#080c14" } }).composite([{ input: target, left: 0, top: 0 }, { input: actual, left: dimensions.width, top: 0 }]).png().toFile(join(root, `qa/diff/${name}-pair.png`));
  reports.push({ region: name, dimensionsMatch: report.dimensionsMatch, diffRatio: report.diffRatio, similarityScore: report.similarityScore, alphaChannelIntact: report.alphaChannelIntact });
}
await writeFile(join(root, "qa/diff/summary.json"), JSON.stringify({ scope: "Photographic reference diagnostic; scores do not measure product composition fidelity. Mobile is extrapolated from docs03.", reports }, null, 2));
console.log("7 reference/actual pairs and diagnostic diff reports created.");
