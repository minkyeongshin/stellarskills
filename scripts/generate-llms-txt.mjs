#!/usr/bin/env node
/**
 * Generates public/llms.txt from src/data/skills.ts at build time.
 *
 * Follows the llms.txt convention (https://llmstxt.org): a flat markdown
 * file at the site root listing every agent-fetchable resource, grouped
 * by category, so AI tools that look for /llms.txt get a clean index
 * even if they can't run JS to read the landing page.
 *
 * Built from the same data source as the page UI; runs alongside
 * fetch-skills.mjs in the predev/prebuild lifecycle.
 *
 * Env:
 *   SITE_ORIGIN   absolute origin to use in link URLs (default
 *                 "https://stellarskills.com")
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const SKILLS_DATA_FILE = join(ROOT, "src/data/skills.ts");
const OUT_FILE = join(ROOT, "public/llms.txt");
const ORIGIN = process.env.SITE_ORIGIN ?? "https://stellarskills.com";

const source = readFileSync(SKILLS_DATA_FILE, "utf8");

const parseArray = (arrayName) => {
  const re = new RegExp(
    `${arrayName}[^=]*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s+const`,
  );
  const m = re.exec(source);
  if (!m) return [];
  const body = m[1];
  const entries = [];
  const objectRe = /\{([\s\S]*?)\},/g;
  let om;
  while ((om = objectRe.exec(body)) !== null) {
    const fields = om[1];
    const get = (key) => {
      const fr = new RegExp(`\\b${key}:\\s*"([^"]+)"`);
      const fm = fr.exec(fields);
      return fm ? fm[1] : null;
    };
    entries.push({
      title: get("title"),
      description: get("description"),
      path: get("path"),
      copyValue: get("copyValue"),
      category: get("category"),
    });
  }
  return entries;
};

const parseFilters = () => {
  const re = /FILTERS:\s*readonly[^=]*=\s*\[([\s\S]*?)\]\s*as\s+const/;
  const m = re.exec(source);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};

const skillCards = parseArray("SKILL_CARD_SOURCES");
const ecosystemCards = parseArray("ECOSYSTEM_CARDS");
const filters = parseFilters();

if (skillCards.length === 0) {
  console.error("[generate-llms-txt] no SKILL_CARD_SOURCES entries parsed");
  process.exit(1);
}

const byCategory = new Map();
for (const c of skillCards) {
  if (!c.category) continue;
  if (!byCategory.has(c.category)) byCategory.set(c.category, []);
  byCategory.get(c.category).push(c);
}

const sectionTitle = (filter) => (filter === "All" ? "Overview" : filter);

const lines = [];
lines.push("# Stellar Skills");
lines.push("");
lines.push(
  "> Agent-readable Stellar developer documentation. Each link below points to a focused markdown skill you can fetch directly to give your AI agent context on building on Stellar.",
);
lines.push("");

for (const filter of filters) {
  const cards = byCategory.get(filter);
  if (!cards || cards.length === 0) continue;
  lines.push(`## ${sectionTitle(filter)}`);
  lines.push("");
  for (const c of cards) {
    if (!c.path) continue;
    lines.push(`- [${c.title}](${ORIGIN}${c.path}): ${c.description}`);
  }
  lines.push("");
}

// Skip placeholder ecosystem entries whose URLs contain literal `<provider>`.
const realEcosystem = ecosystemCards.filter(
  (c) => c.copyValue && !c.copyValue.includes("<"),
);
if (realEcosystem.length > 0) {
  lines.push("## Optional");
  lines.push("");
  lines.push(
    "Community-contributed skills hosted on third-party sites. Not endorsed by the Stellar Foundation; do your own research.",
  );
  lines.push("");
  for (const c of realEcosystem) {
    lines.push(`- [${c.title}](${c.copyValue}): ${c.description}`);
  }
  lines.push("");
}

writeFileSync(OUT_FILE, lines.join("\n"));
console.log(
  `[generate-llms-txt] wrote ${OUT_FILE} (${skillCards.length} skills, ${realEcosystem.length} ecosystem)`,
);
