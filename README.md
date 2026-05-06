# Stellar Skills

[![Apache 2.0 licensed](https://img.shields.io/badge/license-apache%202.0-blue.svg)](LICENSE)

[stellarskills.com](https://stellarskills.com) is a directory of
agent-readable Stellar developer documentation. Each card on the page
points to a focused markdown file an AI agent (or a human) can fetch
directly for Stellar context.

The page is statically rendered, so `curl /` returns the full catalog
inline. The same data also drives `/llms.txt` ([llms.txt
convention](https://llmstxt.org)).

## Local development

Prerequisites: Node.js >= 22.22.0, pnpm >= 10.15.1.

```sh
pnpm install
pnpm dev
```

Scripts:

```sh
pnpm dev                # next dev (cached upstream fetch)
pnpm build              # production build (fresh upstream fetch)
pnpm lint               # eslint
pnpm lint:ts            # tsc --noEmit
pnpm fetch:skills       # refresh public/skills/ from upstream
pnpm generate:llms-txt  # regenerate public/llms.txt
```

## How content stays in sync

Skill markdown lives in
[`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill),
not here. `scripts/fetch-skills.mjs` downloads it into `public/skills/` at
build time, mapping each entry in `src/data/skills.ts` by basename.
`scripts/generate-llms-txt.mjs` then writes `public/llms.txt` from the
same data. Both `public/skills/` and `public/llms.txt` are gitignored.

**Upstream changes are not auto-deployed.** A change in
`stellar-dev-skill` reaches production only when a build runs here:
push a commit to `main`, or click "Redeploy" in Vercel. Locally,
`pnpm dev` reuses cached files until you run `pnpm fetch:skills`. Pin
the upstream ref with `SKILLS_REF=<branch|tag|sha>` (default `main`).

## Adding a skill

All cards are defined in [`src/data/skills.ts`](src/data/skills.ts).

**Main list (`SKILL_CARD_SOURCES`):** add `skill/<your-skill>.md` to
`stellar/stellar-dev-skill` first, then append:

```ts
{
  title: "Your Skill Title",
  description: "What this skill teaches.",
  path: "/skills/<your-skill>.md",
  category: "Soroban", // any FilterType value
}
```

Run `pnpm fetch:skills && pnpm dev` to verify. `pnpm build` fails if the
upstream file is missing. New category? Add it to the `FilterType` union
and the `FILTERS` array.

**Ecosystem (`ECOSYSTEM_CARDS`):** external links, no upstream fetch
needed.

```ts
{
  title: "Project Name",
  description: "What the skill does.",
  pathLabel: "owner/repo",
  copyValue: "https://github.com/owner/repo/blob/main/path/to/SKILL.md",
  category: "Ecosystem",
}
```

## Tech stack

Next.js 15 (App Router), React 19, TypeScript 5, Stellar Design System,
Sass. Deployed via Vercel. See `package.json` for exact versions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0. See [LICENSE](LICENSE).
