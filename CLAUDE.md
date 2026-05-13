# Claude Code Instructions for Stellar Skills

A single static landing page at
[stellarskills.com](https://stellarskills.com) listing agent-readable
Stellar developer documentation. See [README.md](README.md) for the
public-facing overview.

## SSR is the point

The page is a server component, statically generated at build time
(`○` in the Next.js output). The full HTML returned by `GET /` already
contains every card's title, description, URL, and `data-category`. AI
agents and crawlers do not need to run JavaScript. The same data builds
`public/llms.txt`. Both UI and llms.txt read from `src/data/skills.ts`.

When making changes: anything that should be visible to agents must
render on the server in `src/app/page.tsx` or `src/app/_components/SkillCard.tsx`.
Don't move card data into a client component.

## Where things live

- `src/data/skills.ts`: single source of truth.
  `SKILL_CARD_SOURCES` (main list), `ECOSYSTEM_CARDS` (community
  section), `FilterType` / `FILTERS` (category tabs).
- `src/lib/skill-meta.mjs`: parses each upstream SKILL.md's frontmatter
  `description` and first `# heading` so cards default to upstream
  metadata when `title` / `description` aren't overridden in skills.ts.
  Shared by `src/app/page.tsx` and `scripts/generate-llms-txt.mjs`.
- `src/app/page.tsx`: server-rendered landing page.
- `src/app/_components/`: `SkillCard` (server), `icons` (server, inline
  SVGs), `CopyButton` / `SkillsFilter` / `ThemeSwitchIsland` (client
  islands). The filter is a CSS-driven tablist keyed off `data-category`.
- `scripts/fetch-skills.mjs`: downloads upstream `main` markdown into
  `public/skills/` at build time. Uses `spawn("tar")` (no shell) so
  the tarball stream never touches a shell interpreter.
- `scripts/generate-llms-txt.mjs`: writes `public/llms.txt` from
  `src/data/skills.ts`. Imports the frontmatter parser from
  `src/lib/skill-meta.mjs` so the index and the page agree.
- `next.config.js`: scoped `frame-ancestors`, plus
  `X-Content-Type-Options: nosniff` and `Referrer-Policy`. No
  middleware.

There is no routing beyond `/`, no API routes, no backend, no test
runner.

## Quick reference

```bash
pnpm dev                # predev: cached fetch + regen llms.txt
pnpm build              # prebuild: strict fetch + regen llms.txt
pnpm lint               # eslint
pnpm lint:ts            # tsc --noEmit
pnpm fetch:skills       # refresh public/skills/ from upstream
pnpm generate:llms-txt  # regenerate public/llms.txt
```

## Upstream sync

Skill markdown lives in
[`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill).
Each `SKILL_CARD_SOURCES` entry carries a `source` field — an
upstream-relative path like `skills/soroban/SKILL.md` — and
`fetch-skills.mjs` downloads `main` and mirrors that path verbatim into
`public/`, so the upstream layout drives the site URL.

This sync layer is temporary. The plan is to colocate the site under
`/site` of the skills repo, at which point `fetch-skills.mjs` (and the
`predev` / `prebuild` hooks that call it) go away and the skill
markdown is read straight from `../skills/`. Until then, every build
pulls the current `main`.

If a markdown file is removed upstream while still listed in
`SKILL_CARD_SOURCES`, `pnpm build` fails with a "missing source" error.
Restore it upstream or remove the entry here.

`ECOSYSTEM_CARDS` link to external URLs and do not touch the fetch
pipeline.

## Adding a skill

**Main list:** add `skills/<your-skill>/SKILL.md` upstream first, then
append to `SKILL_CARD_SOURCES`:

```ts
{
  source: "skills/<your-skill>/SKILL.md",
  category: "Soroban", // any FilterType value
  // Optional overrides — both default to the upstream SKILL.md's
  // first H1 (title) and frontmatter `description`.
  title: "Your Skill Title",
  description: "Verb-led summary of what this skill teaches.",
}
```

`pnpm fetch:skills && pnpm dev` to verify. New category? Add it to the
`FilterType` union and the `FILTERS` array.

**Ecosystem:** external link, no upstream fetch.

```ts
{
  title: "Project Name",
  description: "Verb-led summary of what the skill does.",
  pathLabel: "owner/repo",
  copyValue: "https://github.com/owner/repo/blob/main/path/to/SKILL.md",
  category: "Ecosystem",
}
```

## Conventions

- Use `@stellar/design-system` components; don't hand-roll UI primitives.
- SCSS files only; no inline `style={}`.
- `@/` path alias for imports from `src/`.
- `"use client"` only for components using hooks, `window`, or
  `useSearchParams`.
- PascalCase components, camelCase helpers, `use` prefix for hooks.
- Skill descriptions: lead with a verb, list concrete topics, no em-dashes.

## Don't add

- No state libraries (Zustand, React Query). Plain `useState` is enough.
- No `@stellar/stellar-sdk`, no XDR, no transaction logic. The app makes
  no network requests at runtime.
- No Jest, Playwright, Sentry, or pre-commit hooks unless asked.
- No middleware. CSP lives in `next.config.js`.

## Before merging

- `pnpm lint:ts` passes
- `pnpm lint` passes
- `pnpm build` succeeds
- Card data still rendered server-side (visible in `curl /`)
- No em-dashes in descriptions or docs
