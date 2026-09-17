import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "edgeone-dist");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(resolve(projectRoot, "app/prototype.html"), resolve(outputDir, "index.html"));
await cp(resolve(projectRoot, "public/favicon.svg"), resolve(outputDir, "favicon.svg"));
await cp(resolve(projectRoot, "edgeone/edge-functions"), resolve(outputDir, "edge-functions"), {
  recursive: true,
});

console.log(`EdgeOne upload bundle created at ${outputDir}`);
