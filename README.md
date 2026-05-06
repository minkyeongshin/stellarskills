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
`pnpm dev` reuses cached files until you run `pnpm fetch:skills`.

### Pinning the upstream version

The `SKILLS_REF` environment variable controls which version of
`stellar/stellar-dev-skill` the build pulls. It defaults to `main`,
which means every deploy picks up whatever's currently on the upstream
default branch. For production you should pin it to a specific commit
SHA so the site cannot pick up unreviewed upstream changes.

`SKILLS_REF` does two things at build time:

1. `scripts/fetch-skills.mjs` downloads the markdown at that ref.
2. `src/app/page.tsx` builds each card's "view source" link as
   `github.com/stellar/stellar-dev-skill/blob/<SKILLS_REF>/skill/<file>.md`,
   so what users see on GitHub matches what the site is serving.

**To track a new upstream version (Vercel):**

1. Find the commit you want to ship. On
   [stellar/stellar-dev-skill](https://github.com/stellar/stellar-dev-skill),
   open the commits page and copy the 40-char SHA of the latest commit
   you've reviewed.
2. Pull and review locally:
   ```sh
   SKILLS_REF=<the-sha> pnpm fetch:skills
   git diff public/skills/
   ```
   Read the diff. The skill markdown is fetched and used by AI agents,
   so make sure no commit has injected anything you wouldn't want an
   agent to act on.
3. In Vercel → Project → Settings → Environment Variables, set
   `SKILLS_REF` to that SHA for Production (and Preview if you want
   previews pinned too).
4. Redeploy. The build pulls the pinned commit, and every card links
   to that commit's exact file.

If `SKILLS_REF` is left unset, the build pulls `main`. This is fine
for local dev but not recommended for production deploys.

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
