import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const auditRoot = resolve("test-results/theme-audit");
const contactSheetRoot = join(auditRoot, "contact-sheets");

async function findScreenshots(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  );
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findScreenshots(path);
      return entry.isFile() && entry.name.endsWith(".png") ? [path] : [];
    }),
  );
  return files.flat();
}

const screenshots = (await findScreenshots(auditRoot)).filter((path) =>
  path.split(sep).includes("screenshots"),
);
const groups = new Map();

for (const path of screenshots) {
  const theme = path.endsWith("--dark.png") ? "dark" : "light";
  const project = path.includes("mobile-safari") ? "mobile-safari" : "chromium";
  const key = `${project}--${theme}`;
  const items = groups.get(key) ?? [];
  items.push(path);
  groups.set(key, items);
}

await mkdir(contactSheetRoot, { recursive: true });

for (const [name, paths] of groups) {
  paths.sort((left, right) => left.localeCompare(right));
  const cards = paths
    .map((path) => {
      const src = relative(contactSheetRoot, path).split(sep).join("/");
      const label = path
        .split(sep)
        .at(-1)
        ?.replace(/--(light|dark)\.png$/, "");
      return `<figure><img src="${src}" alt="${label}"><figcaption>${label}</figcaption></figure>`;
    })
    .join("\n");
  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StateFlow ${name} visual audit</title>
<style>
  body{margin:0;padding:24px;background:#111214;color:#f2f2f3;font:14px system-ui,sans-serif}
  h1{margin:0 0 20px;font-size:22px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;align-items:start}
  figure{margin:0;padding:10px;background:#202226;border:1px solid #484b51;border-radius:12px}img{display:block;width:100%;height:auto;border-radius:7px}figcaption{padding:9px 2px 1px;color:#c5c7ca}
</style>
<body><h1>StateFlow · ${name}</h1><main>${cards}</main></body>
</html>`;
  await writeFile(join(contactSheetRoot, `${name}.html`), html);

  const isMobile = name.startsWith("mobile-safari");
  const cellWidth = isMobile ? 300 : 400;
  const cellHeight = isMobile ? 920 : 760;
  const columns = 3;
  const rows = Math.ceil(paths.length / columns);
  const tiles = paths
    .map((path, index) => {
      const src = relative(contactSheetRoot, path).split(sep).join("/");
      const label = path
        .split(sep)
        .at(-1)
        ?.replace(/--(light|dark)\.png$/, "");
      const x = (index % columns) * cellWidth;
      const y = Math.floor(index / columns) * cellHeight;
      return `<text x="${x + 10}" y="${y + 24}">${label}</text><image href="${src}" x="${x + 8}" y="${y + 36}" width="${cellWidth - 16}" height="${cellHeight - 44}" preserveAspectRatio="xMidYMin meet"/>`;
    })
    .join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * cellWidth}" height="${rows * cellHeight}" viewBox="0 0 ${columns * cellWidth} ${rows * cellHeight}">
<rect width="100%" height="100%" fill="#111214"/><style>text{fill:#f2f2f3;font:14px system-ui,sans-serif}</style>${tiles}</svg>`;
  await writeFile(join(contactSheetRoot, `${name}.svg`), svg);
}

console.log(
  `Created ${groups.size} HTML/SVG contact-sheet sets from ${screenshots.length} screenshots in ${relative(process.cwd(), contactSheetRoot)}.`,
);
