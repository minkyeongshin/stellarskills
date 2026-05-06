# Claude Code Instructions for Stellar Skills

## What this repo is

A single-page marketing/directory site at
[stellarskills.com](https://stellarskills.com) that lists "skills" — markdown
files of Stellar developer documentation written to be fetched and consumed by
AI agents. The repo was forked from
[Stellar Lab](https://github.com/stellar/laboratory) and almost all of the Lab
source has been deleted. See [README.md](README.md) for the public-facing
overview and setup steps.

## Quick reference

```bash
pnpm install
pnpm dev             # next dev (predev fetches skill markdown if needed)
pnpm build           # production build (prebuild always refetches)
pnpm start           # serve production build
pnpm lint            # next lint (eslint)
pnpm lint:ts         # tsc --noEmit
pnpm fetch:skills    # manually refresh skill markdown from upstream
```

There is no test runner configured. There are no e2e tests.

## Architecture

The entire app is essentially:

- `src/app/layout.tsx` — root layout, imports Stellar Design System styles,
  optionally loads Google Tag Manager in production. Server component.
- `src/app/page.tsx` — the landing page. Client component (`"use client"`).
  Renders a hero, a filterable grid of skill `Card`s, and an "Ecosystem"
  section. Also supports `?mode=agent` which returns a raw `SKILL.md`-style
  text dump.
- `src/data/skills.ts` — the data behind the cards: `SKILL_CARD_SOURCES`
  (filterable main list), `ECOSYSTEM_CARDS` (community section), and the
  `FilterType` / `FILTERS` category tabs.
- `src/app/error.tsx`, `not-found.tsx`, `global-error.tsx` — standard Next.js
  error boundaries using design system components.
- `src/components/Hydration.tsx` — small wrapper that delays children until
  after client hydration (used to gate `ThemeSwitch`).
- `src/components/layout/Box/` — thin flex/grid wrapper carried over from
  Stellar Lab.
- `src/styles/globals.scss` + `src/app/styles.scss` — all styling.
- `src/middleware.ts` does not exist. CSP is set via `headers()` in
  `next.config.js` (`frame-ancestors *` to allow iframe embedding).
- `public/skill/` and `public/skills/` are populated at build time by
  `scripts/fetch-skills.mjs`, which downloads markdown from
  [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill).
  Both directories are gitignored. Don't commit anything under them.

That's the whole app. There is no routing beyond `/`, no API routes, no
backend.

## Skill content pipeline

The skill markdown files served by this site are not stored here. They live
in `stellar/stellar-dev-skill` (flat layout: `skill/<file>.md`). The fetch
script maps each entry in `SKILL_CARD_SOURCES` by filename — the basename of
the `path` field is looked up in the upstream `skill/` directory.

- `predev` runs the script with `--cached --lenient` (skip if files exist;
  warn on missing).
- `prebuild` runs it strict (always fetch; fail on any missing file).
- Override the ref via `SKILLS_REF=<branch|tag|sha>`; defaults to `main`.

If asked to add a new skill card, the matching markdown file must already
exist in `stellar/stellar-dev-skill` — adding only an entry here will fail
the next `pnpm build`.

## Conventions to follow

- Use `@stellar/design-system` components (`Button`, `Card`, `Icon`, `Logo`,
  `Badge`, `ThemeSwitch`, etc.) — don't hand-roll UI primitives.
- Style via SCSS files; never use inline `style={}`.
- Use the `@/` path alias for imports from `src/` (configured in
  `tsconfig.json`).
- Page components that use hooks / `window` / `useSearchParams` need
  `"use client"`.
- Naming: PascalCase for components, camelCase for helpers, `use` prefix for
  hooks.

## What NOT to do

The original Lab CLAUDE.md described many patterns that no longer exist here.
Do not reintroduce them unless explicitly asked:

- No Zustand store, no `zustand-querystring`, no `StoreProvider`. Use plain
  `useState` / `useSearchParams` for the small amount of UI state this page
  needs.
- No TanStack React Query, no `useRpc*` / `useGetRpc*` hooks, no Horizon
  hooks. The app makes no network requests.
- No `@stellar/stellar-sdk`, no XDR helpers, no transaction / keypair /
  contract logic. None of `src/helpers/`, `src/query/`, `src/store/`,
  `src/validate/`, `src/hooks/`, or `src/constants/networkLimits.ts` exists
  anymore.
- No Jest, no Playwright, no Sentry, no Husky pre-commit hooks. Don't add a
  `pnpm test` script unless the user asks.
- No CSP nonce middleware. Iframe / CSP behavior lives in `next.config.js` —
  edit that file if you need to change headers.

## Adding or editing skill cards

Skill data lives in `src/data/skills.ts`:

- `SKILL_CARD_SOURCES` drives the main filterable list.
- `ECOSYSTEM_CARDS` drives the community section.
- `FilterType` / `FILTERS` define the category tabs — keep them in sync if
  you add a new category.

Each card's copy button produces `https://stellarskills.com<path>`. The
corresponding markdown file is fetched from `stellar/stellar-dev-skill` at
build time (see "Skill content pipeline" above). Don't try to commit
markdown into `public/skill/` or `public/skills/` — those are gitignored
and overwritten on every build.

## Task completion checklist

- [ ] `pnpm lint:ts` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] No new `style={}` props, no new global state libraries
- [ ] No reintroduction of Lab-era code paths
