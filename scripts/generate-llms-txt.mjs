#!/usr/bin/env node
/**
 * Generates public/llms.txt from src/data/skills.ts at build time.
 *
 * Follows the llms.txt convention (https://llmstxt.org): a flat markdown
 * file at the site root listing every agent-fetchable resource, grouped
 * by category, so AI tools that look for /llms.txt get a clean index
 * even if they can't run JS to read the landing page.
 *
 * Title and description default to upstream frontmatter / first H1 of
 * each SKILL.md (parsed from public/<source>); overrides in skills.ts
 * take precedence. Runs after fetch-skills.mjs, so the markdown is
 * already on disk.
 *
 * Origin resolution (highest to lowest priority):
 *   SITE_ORIGIN                       manual override
 *   VERCEL_PROJECT_PRODUCTION_URL     canonical production domain on Vercel
 *   VERCEL_URL                        per-deployment URL on Vercel
 *   "http://localhost:3000"           local default
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const PUBLIC_DIR = join(ROOT, "public");
const SKILLS_DATA_FILE = join(ROOT, "src/data/skills.ts");
const OUT_FILE = join(PUBLIC_DIR, "llms.txt");

const ORIGIN =
  process.env.SITE_ORIGIN ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

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
      source: get("source"),
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

/**
 * Mirror src/lib/skill-meta.ts: parse the upstream SKILL.md's frontmatter
 * `description` and first `# heading` so the llms.txt index uses the same
 * defaults as the rendered page.
 */
const readMeta = (sourcePath) => {
  const filePath = join(PUBLIC_DIR, sourcePath);
  if (!existsSync(filePath)) return { title: null, description: null };
  const content = readFileSync(filePath, "utf8");
  const fmMatch = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(content);
  let description = null;
  let body = content;
  if (fmMatch) {
    body = content.slice(fmMatch[0].length);
    for (const line of fmMatch[1].split("\n")) {
      const kv = /^([\w-]+):\s*(.*)$/.exec(line);
      if (!kv) continue;
      if (kv[1] === "description") {
        let value = kv[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        description = value;
        break;
      }
    }
  }
  const h1 = /^#\s+(.+)$/m.exec(body);
  return { title: h1 ? h1[1].trim() : null, description };
};

const skillCards = parseArray("SKILL_CARD_SOURCES").map((c) => {
  const meta = c.source ? readMeta(c.source) : { title: null, description: null };
  return {
    ...c,
    path: c.source ? `/${c.source}` : null,
    title: c.title ?? meta.title ?? c.source,
    description: c.description ?? meta.description ?? "",
  };
});
const ecosystemCards = parseArray("ECOSYSTEM_CARDS");
const filters = parseFilters();

if (skillCards.length === 0) {
  console.error("[generate-llms-txt] no SKILL_CARD_SOURCES entries parsed");
  process.exit(1);
}

// Install instructions mirrored from the Installing section on src/app/page.tsx.
// Edit both when changing install steps.
const INSTALLERS = [
  {
    name: "Claude Code",
    description: "Install using the plugin marketplace:",
    commands: [
      "/plugin marketplace add stellar/stellar-dev-skill",
      "/plugin install stellar-dev@stellar-dev-skill",
    ],
  },
  {
    name: "Cursor",
    description:
      "Install from the Cursor Marketplace, or add manually via Settings → Rules → Add Rule → Remote Rule (GitHub) with this slug:",
    commands: ["stellar/stellar-dev-skill"],
  },
  {
    name: "npx skills",
    description: "Install using the npx skills CLI:",
    commands: ["npx skills add https://github.com/stellar/stellar-dev-skill"],
  },
  {
    name: "Clone / Copy",
    description:
      "Clone the repo and copy the skills directory to your agent's skills location:",
    commands: ["git clone https://github.com/stellar/stellar-dev-skill"],
  },
];

const byCategory = new Map();
for (const c of skillCards) {
  if (!c.category) continue;
  if (!byCategory.has(c.category)) byCategory.set(c.category, []);
  byCategory.get(c.category).push(c);
}

const lines = [];
lines.push("# Stellar Skills");
lines.push("");
lines.push(
  "> Agent-readable Stellar developer documentation. Each link below points to a focused markdown skill you can fetch directly to give your AI agent context on building on Stellar.",
);
lines.push("");

lines.push("## Installing");
lines.push("");
lines.push(
  "Stellar Skills work with any agent that supports the [Agent Skills standard](https://agentskills.io), including Claude Code, OpenCode, OpenAI Codex, and Pi.",
);
lines.push("");
for (const installer of INSTALLERS) {
  lines.push(`### ${installer.name}`);
  lines.push("");
  lines.push(installer.description);
  lines.push("");
  lines.push("```");
  for (const cmd of installer.commands) {
    lines.push(cmd);
  }
  lines.push("```");
  lines.push("");
}

lines.push("## Included Stellar Skills");
lines.push("");
lines.push(
  "The skills installed via the methods above, grouped by category.",
);
lines.push("");
for (const filter of filters) {
  const cards = byCategory.get(filter);
  if (!cards || cards.length === 0) continue;
  lines.push(`### ${filter}`);
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
  lines.push("## Community Built");
  lines.push("");
  lines.push(
    "Other community-built skills that may be helpful for your build. These aren't installed via the methods above; each project has its own setup, so follow the link on each entry. Not endorsed by the Stellar Foundation; do your own research.",
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
