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
 *   SKILLS_REF   git ref or commit SHA to fetch (default "main"). For
 *                production, pin to a 40-char commit SHA so the build
 *                cannot pick up unreviewed upstream changes. Validated
 *                against a strict character set; never interpolated
 *                into a shell command.
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
const SKILLS_DATA_FILE = join(ROOT, "src/data/skills.ts");

const REPO = "stellar/stellar-dev-skill";
const REF = process.env.SKILLS_REF ?? "main";
const SOURCE_SUBDIR = "skill";

// Reject anything that could be interpreted as shell syntax. GitHub refs
// (branches, tags, SHAs) only need [A-Za-z0-9._/-].
if (!/^[A-Za-z0-9._\/-]+$/.test(REF)) {
  console.error(
    `[fetch-skills] invalid SKILLS_REF=${JSON.stringify(REF)}; must match [A-Za-z0-9._/-]`,
  );
  process.exit(1);
}

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
  // Useful for spotting unexpected upstream drift; not load-bearing
  // because SKILLS_REF=<sha> is already content-addressed.
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
    cpSync(src, dest, { dereference: false });
  }

  // Apache-2.0 attribution alongside the content.
  const upstreamLicense = join(tmp, "LICENSE");
  if (existsSync(upstreamLicense)) {
    cpSync(upstreamLicense, join(PUBLIC_DIR, "skills", "LICENSE"), {
      dereference: false,
    });
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
