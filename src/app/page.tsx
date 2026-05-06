import { Badge, Logo } from "@stellar/design-system";

import {
  ECOSYSTEM_CARDS,
  FILTERS,
  SKILL_CARD_SOURCES,
} from "@/data/skills";

import { CopyButton } from "./_components/CopyButton";
import { LinkExternal01Icon } from "./_components/icons";
import { SkillCard } from "./_components/SkillCard";
import { SkillsFilter } from "./_components/SkillsFilter";
import { ThemeSwitchIsland } from "./_components/ThemeSwitchIsland";

import "./styles.scss";

/**
 * Origin used to render absolute URLs server-side. Resolved at build time
 * with the same precedence as scripts/generate-llms-txt.mjs:
 *
 *   SITE_ORIGIN                       manual override
 *   VERCEL_PROJECT_PRODUCTION_URL     canonical production domain on Vercel
 *   VERCEL_URL                        per-deployment URL on Vercel
 *   "http://localhost:3000"           local default
 *
 * Read non-prefixed env vars because page.tsx is a server component:
 * Vercel auto-exposes these on the server, but the `NEXT_PUBLIC_*`
 * mirrors are not all available (notably no auto-mirror of
 * `VERCEL_PROJECT_PRODUCTION_URL`).
 */
const SITE_ORIGIN =
  process.env.SITE_ORIGIN ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const hostFromOrigin = (origin: string) => origin.replace(/^https?:\/\//, "");

/**
 * Upstream ref used by scripts/fetch-skills.mjs at build time. Mirroring
 * it here keeps the per-card "view source" links pointing at the exact
 * commit (or branch) we shipped, so what users see on GitHub matches
 * the markdown the site is actually serving. Set SKILLS_REF=<sha> in
 * Vercel to pin both the build and the source links to one commit.
 */
const SKILLS_REF = process.env.SKILLS_REF || "main";

/**
 * Map a stellarskills.com path back to its source-of-truth file in
 * stellar/stellar-dev-skill. The upstream repo is flat under `skill/`,
 * so the basename of the site path is the upstream filename.
 */
const getGitHubSourceUrl = (sitePath: string) => {
  const filename = sitePath.split("/").pop() ?? "";
  return `https://github.com/stellar/stellar-dev-skill/blob/${SKILLS_REF}/skill/${filename}`;
};

export default function LandingPage() {
  const host = hostFromOrigin(SITE_ORIGIN);
  const heroValue = `Read ${host} before you start building on Stellar.`;

  const skillCards = SKILL_CARD_SOURCES.map((s) => ({
    title: s.title,
    description: s.description,
    category: s.category,
    pathLabel: `${host}${s.path}`,
    copyValue: `${SITE_ORIGIN}${s.path}`,
    sourceUrl: getGitHubSourceUrl(s.path),
  }));

  const [first, ...rest] = skillCards;

  return (
    <div className="SkillsLanding">
      <header className="SkillsLanding__header">
        <div className="SkillsLanding__logo">
          <Logo.Stellar />
          <Badge variant="secondary" size="md">
            Skills
          </Badge>
        </div>

        <div className="SkillsLanding__headerActions">
          <ThemeSwitchIsland />

          <a
            href="https://developers.stellar.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="SkillsLanding__headerLink"
          >
            Developer docs
            <LinkExternal01Icon />
          </a>
        </div>
      </header>

      <main className="SkillsLanding__main">
        <section className="SkillsLanding__hero">
          <h1 className="SkillsLanding__title">
            Give your AI the right Stellar context before it writes code. Works
            with any AI agent.
          </h1>

          <div className="SkillsLanding__pill">
            <CopyButton variant="pill" value={heroValue} />
          </div>
        </section>

        <section className="SkillsLanding__cards" aria-label="Skills list">
          <SkillCard {...first} />

          <SkillsFilter filters={FILTERS}>
            {rest.map((c) => (
              <div
                key={c.copyValue}
                data-category={c.category}
                className="SkillsLanding__filterItem"
              >
                <SkillCard {...c} />
              </div>
            ))}
          </SkillsFilter>
        </section>

        <section className="SkillsLanding__ecosystem" aria-label="Ecosystem">
          <h2 className="SkillsLanding__sectionTitle">Ecosystem skills</h2>
          <p className="SkillsLanding__sectionDescription">
            Skills built and maintained by the Stellar community. The resources
            listed here are community-contributed and are not endorsed by the
            Stellar Foundation. Always do your own research (DYOR) before using
            any tool or resource. Inclusion in this list does not imply any
            warranty, security audit, or official recommendation.
          </p>
          <div className="SkillsLanding__ecosystemGrid">
            {ECOSYSTEM_CARDS.map((c) => (
              <SkillCard
                key={c.copyValue}
                title={c.title}
                description={c.description}
                pathLabel={c.pathLabel}
                copyValue={c.copyValue}
                sourceUrl={c.copyValue}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="SkillsLanding__footer">
        <span className="SkillsLanding__footerText">
          Powered by{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="SkillsLanding__footerLink"
          >
            Stellar
          </a>
        </span>
      </footer>
    </div>
  );
}
