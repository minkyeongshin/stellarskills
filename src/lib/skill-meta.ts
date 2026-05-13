import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pull the title and description for a card out of its upstream
 * markdown. Reads:
 *   - frontmatter `description` (preferred over the body for the card
 *     summary because upstream tunes it for skill consumers)
 *   - the first `# heading` of the body (used as the card title)
 *
 * Run on the server at SSG time only — uses node:fs.
 */

const PUBLIC_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

type Frontmatter = Record<string, string>;

const parseFrontmatter = (
  content: string,
): { frontmatter: Frontmatter; body: string } => {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(content);
  if (!match) return { frontmatter: {}, body: content };
  const frontmatter: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[kv[1]] = value;
  }
  return { frontmatter, body: content.slice(match[0].length) };
};

const firstH1 = (body: string): string | null => {
  const m = /^#\s+(.+)$/m.exec(body);
  return m ? m[1].trim() : null;
};

export type SkillMeta = {
  title: string | null;
  description: string | null;
};

export const readSkillMeta = (source: string): SkillMeta => {
  const filePath = join(PUBLIC_DIR, source);
  const content = readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(content);
  return {
    title: firstH1(body),
    description: frontmatter.description ?? null,
  };
};
