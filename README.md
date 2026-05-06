# Stellar Skills

[![Apache 2.0 licensed](https://img.shields.io/badge/license-apache%202.0-blue.svg)](LICENSE)

[stellarskills.com](https://stellarskills.com) is a directory of agent-readable
documentation ("skills") for building on the Stellar network. Each skill is a
plain markdown file that can be fetched directly by an AI agent (or read by a
human) to provide focused, up-to-date Stellar context — covering Soroban smart
contracts, frontend integrations, assets, APIs, security, standards, and the
broader ecosystem.

This repo was forked from [Stellar Lab](https://github.com/stellar/laboratory)
and stripped down to a single static landing page that lists and links to those
skill files.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) with [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Stellar Design System](https://design-system.stellar.org/) for UI
- [Sass](https://sass-lang.com/) for styling
- Deployed via Vercel

See `package.json` for exact versions.

## Local development

Prerequisites: Node.js >= 22.22.0, pnpm >= 10.15.1.

```sh
pnpm install
pnpm dev
```

The first `pnpm dev` (and every `pnpm build`) runs
[`scripts/fetch-skills.mjs`](scripts/fetch-skills.mjs) automatically to
download skill markdown from
[`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill)
into `public/`. Subsequent dev starts reuse the cached files and work
offline.

Other scripts:

```sh
pnpm build           # production build (refetches skills)
pnpm start           # run production build locally
pnpm lint            # eslint
pnpm lint:ts         # typescript check
pnpm fetch:skills    # manually refresh skill markdown from upstream
```

## Skill content

The skill markdown files served at `/skill/SKILL.md` and
`/skills/<category>/<file>.md` are **not** stored in this repo. The source of
truth is
[`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill);
files are fetched into `public/` at build time. Production deploys pick up
changes automatically — push any commit here, or click "Redeploy" in the
Vercel dashboard, to refresh content.

To pin to a specific ref, set `SKILLS_REF` (e.g. `SKILLS_REF=v1.0.0 pnpm build`).

## Adding a new skill card

The landing page renders skill cards from two arrays in
[`src/data/skills.ts`](src/data/skills.ts):

- `SKILL_CARD_SOURCES` — the main, filterable list of skills
- `ECOSYSTEM_CARDS` — the community-contributed "Ecosystem" section at the
  bottom

To add a card to the main list:

1. Add (or confirm) the markdown file in
   [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill)
   under `skill/<your-skill>.md`.
2. Append an entry to `SKILL_CARD_SOURCES`:

   ```ts
   {
     title: "Your Skill Title",
     description: "One-line description shown on the card.",
     path: "/skills/<category>/<your-skill>.md",
     category: "Soroban", // must be one of the FilterType values
   }
   ```

The fetch script maps each entry by its filename: `path` ending in
`/<your-skill>.md` is sourced from `skill/<your-skill>.md` upstream.
`pnpm build` fails loudly if any advertised path has no matching file.

If you introduce a new category, add it to both the `FilterType` union and
the `FILTERS` array in `src/data/skills.ts`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0 — see [LICENSE](LICENSE).
