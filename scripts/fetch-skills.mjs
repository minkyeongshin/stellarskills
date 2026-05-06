#!/usr/bin/env node
/**
 * Fetches skill markdown from stellar/stellar-dev-skill at build time and
 * writes each file under public/ so the URLs advertised in
 * src/data/skills.ts (e.g. /skill/SKILL.md) resolve as static assets.
 *
 * The source repo layout is flat (skill/<file>.md); the site URLs nest by
 * category (/skills/<category>/<file>.md). We map by basename — each
 * source filename appears exactly once in skills.ts.
 *
 * Flags:
 *   --cached   skip the network if every advertised path already exists.
 *              Used by `predev` so subsequent dev starts work offline.
 *   --lenient  warn instead of failing when an advertised path has no
 *              corresponding source file. Used by `predev` for DX.
 *
 * Env:
 *   SKILLS_REF   git ref to fetch (default "main")
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = new Set(process.argv.slice(2));
const cached = args.has("--cached");
const strict = !args.has("--lenient");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const PUBLIC_DIR = join(ROOT, "public");
const SKILLS_DATA_FILE = join(ROOT, "src/data/skills.ts");

const REPO = "stellar/stellar-dev-skill";
const REF = process.env.SKILLS_REF ?? "main";
const SOURCE_SUBDIR = "skill";

// `path:` only appears in SKILL_CARD_SOURCES — ECOSYSTEM_CARDS uses
// `pathLabel:` / `copyValue:`, which the word boundary excludes.
const skillsSource = readFileSync(SKILLS_DATA_FILE, "utf8");
const sitePaths = [...skillsSource.matchAll(/\bpath:\s*"([^"]+)"/g)].map(
  (m) => m[1],
);
if (sitePaths.length === 0) {
  console.error(`[fetch-skills] no paths found in ${SKILLS_DATA_FILE}`);
  process.exit(1);
}

if (cached && sitePaths.every((p) => existsSync(join(PUBLIC_DIR, p)))) {
  console.log(
    `[fetch-skills] cached (${sitePaths.length} files) — run \`pnpm fetch:skills\` to refresh`,
  );
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), "stellar-dev-skill-"));
try {
  const tarUrl = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}`;
  console.log(`[fetch-skills] fetching ${REPO}@${REF}`);
  execSync(
    `set -o pipefail && curl -fsSL --retry 3 --retry-delay 2 --max-time 60 ${tarUrl} | tar -xz --strip-components=1 -C "${tmp}"`,
    { stdio: "inherit", shell: "/bin/bash" },
  );

  const sourceDir = join(tmp, SOURCE_SUBDIR);
  if (!existsSync(sourceDir)) {
    throw new Error(
      `[fetch-skills] expected '${SOURCE_SUBDIR}/' directory at the root of ${REPO}@${REF}`,
    );
  }

  const missing = [];
  for (const sitePath of sitePaths) {
    const filename = sitePath.split("/").pop();
    const src = join(sourceDir, filename);
    const dest = join(PUBLIC_DIR, sitePath);
    if (!existsSync(src)) {
      missing.push({ sitePath, expected: `${SOURCE_SUBDIR}/${filename}` });
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }

  // Apache-2.0 attribution alongside the content.
  const upstreamLicense = join(tmp, "LICENSE");
  if (existsSync(upstreamLicense)) {
    cpSync(upstreamLicense, join(PUBLIC_DIR, "skills", "LICENSE"));
  }

  if (missing.length > 0) {
    const lines = missing
      .map((m) => `  ${m.sitePath} (expected ${m.expected})`)
      .join("\n");
    const msg = `[fetch-skills] ${missing.length} advertised path(s) missing in ${REPO}@${REF}:\n${lines}`;
    if (strict) throw new Error(msg);
    console.warn(msg);
  }

  const ok = sitePaths.length - missing.length;
  console.log(`[fetch-skills] wrote ${ok}/${sitePaths.length} files`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
