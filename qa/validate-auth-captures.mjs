import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const sourceDirs = ["app", "components", "lib", "styles"];
async function files(dir) {
  const list = await readdir(dir, { withFileTypes:true });
  return (await Promise.all(list.map(item=>item.isDirectory()?files(join(dir,item.name)):[join(dir,item.name)]))).flat();
}
const sources = (await Promise.all(sourceDirs.map(dir=>files(join(root,dir))))).flat();
const latestSource = Math.max(...(await Promise.all(sources.map(path=>stat(path)))).map(value=>value.mtimeMs));
const captures=[];
for(const directory of ["qa/auth","qa/screenshots"]) {
  for(const path of (await files(join(root,directory))).filter(path=>path.endsWith(".png"))) {
    const content=await readFile(path);
    if(content.subarray(0,8).toString("hex")!=="89504e470d0a1a0a") throw new Error(`Invalid PNG: ${path}`);
    const width=content.readUInt32BE(16),height=content.readUInt32BE(20);
    if(![1440,768,390,320].includes(width)) throw new Error(`Unexpected width: ${path}`);
    if((await stat(path)).mtimeMs < latestSource) throw new Error(`Stale capture: ${path}`);
    captures.push({ path,width,height,fresh:true });
  }
}
if(captures.length!==71) throw new Error(`Expected 71 current captures, found ${captures.length}`);
await writeFile(join(root,"qa/phase2-capture-manifest.json"),JSON.stringify({count:captures.length,latestSourceTime:new Date(latestSource).toISOString(),generatedAt:new Date().toISOString(),captures},null,2));
console.log("71 current Auth/shell PNGs verified at all four viewports.");
