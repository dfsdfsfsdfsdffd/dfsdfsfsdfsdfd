import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [bucketBaseUrl, sourceDir = "public/profile-decorations", outputFile = "profile-decorations.manifest.json"] = process.argv.slice(2);

if (!bucketBaseUrl) {
  console.error("Usage: node scripts/build-decoration-manifest.mjs <supabase-public-folder-url> [source-dir] [output-file]");
  console.error("Example: node scripts/build-decoration-manifest.mjs https://PROJECT.supabase.co/storage/v1/object/public/profile-decorations");
  process.exit(1);
}

const cleanBaseUrl = bucketBaseUrl.replace(/\/+$/, "");
const files = (await readdir(sourceDir))
  .filter((file) => /\.(png|webp|gif|jpg|jpeg)$/i.test(file))
  .sort((a, b) => a.localeCompare(b));

const manifest = files.map((file) => ({
  name: path.basename(file, path.extname(file)).replace(/[_-]+/g, " "),
  url: `${cleanBaseUrl}/${encodeURIComponent(file)}`,
}));

const outputDir = path.dirname(outputFile);
const aliasFile = path.join(outputDir, "manifest.json");
const contents = `${JSON.stringify(manifest, null, 2)}\n`;

await writeFile(outputFile, contents);
if (path.basename(outputFile) !== "manifest.json") {
  await writeFile(aliasFile, contents);
}
console.log(`Wrote ${manifest.length} decorations to ${outputFile}`);
if (aliasFile !== outputFile) {
  console.log(`Wrote ${manifest.length} decorations to ${aliasFile}`);
}
