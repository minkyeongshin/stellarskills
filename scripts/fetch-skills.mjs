#!/usr/bin/env node
/**
 * Fetches skill markdown from stellar/stellar-dev-skill at build time and
 * mirrors each file under public/, so the URLs advertised in
 * src/data/skills.ts (e.g. /skills/soroban/SKILL.md) resolve as static
 * assets.
 *
 * Each card in skills.ts carries a `source` field — an upstream-relative
 * path like "skills/soroban/SKILL.md". We copy that exact path into
 * public/ unchanged; the upstream layout drives the site layout.
 *
 * This is a temporary bridge: once the site is colocated under /site of
 * the skills repo, this fetch step (and the whole script) goes away.
 *
 * Flags:
 *   --cached   skip the network if every advertised source already exists.
 *              Used by `predev` so subsequent dev starts work offline.
 *   --lenient  warn instead of failing when an advertised source has no
 *              corresponding upstream file. Used by `predev` for DX.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
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
const PUBLIC_SKILLS_DIR = join(PUBLIC_DIR, "skills");
const SKILLS_DATA_FILE = join(ROOT, "src/data/skills.ts");

const REPO = "stellar/stellar-dev-skill";
const REF = "main";

// `source:` only appears in SKILL_CARD_SOURCES — ECOSYSTEM_CARDS uses
// `pathLabel:` / `copyValue:`, which the word boundary excludes.
const skillsSource = readFileSync(SKILLS_DATA_FILE, "utf8");
const sources = [...skillsSource.matchAll(/\bsource:\s*"([^"]+)"/g)].map(
  (m) => m[1],
);
if (sources.length === 0) {
  console.error(`[fetch-skills] no sources found in ${SKILLS_DATA_FILE}`);
  process.exit(1);
}

if (cached && sources.every((s) => existsSync(join(PUBLIC_DIR, s)))) {
  console.log(
    `[fetch-skills] cached (${sources.length} files) — run \`pnpm fetch:skills\` to refresh`,
  );
  process.exit(0);
}

// Clean stale files before writing fresh ones so removed skills don't
// linger in public/.
rmSync(PUBLIC_SKILLS_DIR, { recursive: true, force: true });

const tmp = mkdtempSync(join(tmpdir(), "stellar-dev-skill-"));
try {
  const tarUrl = `https://codeload.github.com/${REPO}/tar.gz/${encodeURIComponent(REF)}`;
  console.log(`[fetch-skills] fetching ${REPO}@${REF}`);

  const res = await fetch(tarUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    throw new Error(
      `[fetch-skills] download failed: ${res.status} ${res.statusText}`,
    );
  }
  const tarball = Buffer.from(await res.arrayBuffer());

  // Log the tarball hash on every run so it shows up in build logs.
  // Useful for spotting unexpected upstream drift between deploys.
  const actualSha = createHash("sha256").update(tarball).digest("hex");
  console.log(`[fetch-skills] tarball sha256=${actualSha}`);

  await new Promise((resolve, reject) => {
    const proc = spawn(
      "tar",
      ["-xz", "--strip-components=1", "-C", tmp],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    proc.on("error", reject);
    proc.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`tar exited with code ${code}`)),
    );
    proc.stdin.end(tarball);
  });

  const missing = [];
  for (const source of sources) {
    const src = join(tmp, source);
    const dest = join(PUBLIC_DIR, source);
    if (!existsSync(src)) {
      missing.push(source);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { dereference: false });
  }

  // Apache-2.0 attribution alongside the content.
  const upstreamLicense = join(tmp, "LICENSE");
  if (existsSync(upstreamLicense)) {
    mkdirSync(PUBLIC_SKILLS_DIR, { recursive: true });
    cpSync(upstreamLicense, join(PUBLIC_SKILLS_DIR, "LICENSE"), {
      dereference: false,
    });
  }

  if (missing.length > 0) {
    const lines = missing.map((s) => `  ${s}`).join("\n");
    const msg = `[fetch-skills] ${missing.length} advertised source(s) missing in ${REPO}@${REF}:\n${lines}`;
    if (strict) throw new Error(msg);
    console.warn(msg);
  }

  const ok = sources.length - missing.length;
  console.log(`[fetch-skills] wrote ${ok}/${sources.length} files`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
