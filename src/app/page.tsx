import { Badge, Card, Logo } from "@stellar/design-system";

import {
  ECOSYSTEM_CARDS,
  FILTERS,
  SKILL_CARD_SOURCES,
} from "@/data/skills";
import { readSkillMeta } from "@/lib/skill-meta";

import { CopyButton } from "./_components/CopyButton";
import { GitHubIcon, LinkExternal01Icon } from "./_components/icons";
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

const githubSourceUrl = (source: string) =>
  `https://github.com/stellar/stellar-dev-skill/blob/${SKILLS_REF}/${source}`;

export default function LandingPage() {
  const host = hostFromOrigin(SITE_ORIGIN);
  const heroValue = `Read ${host} before you start building on Stellar.`;

  const skillCards = SKILL_CARD_SOURCES.map((s) => {
    const meta = readSkillMeta(s.source);
    const sitePath = `/${s.source}`;
    return {
      title: s.title ?? meta.title ?? s.source,
      description: s.description ?? meta.description ?? "",
      category: s.category,
      pathLabel: `${host}${sitePath}`,
      copyValue: `${SITE_ORIGIN}${sitePath}`,
      sourceUrl: githubSourceUrl(s.source),
    };
  });

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
          <SkillsFilter filters={FILTERS}>
            {skillCards.map((c) => (
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

        <section className="SkillsLanding__installing" aria-label="Installing">
          <h2 className="SkillsLanding__sectionTitle">Installing Stellar Skills</h2>
          <p className="SkillsLanding__sectionDescription">
            Stellar Skills work with any agent that supports the{" "}
            <a
              href="https://agentskills.io"
              target="_blank"
              rel="noopener noreferrer"
              className="SkillsLanding__inlineLink"
            >
              Agent Skills standard
            </a>
            , including Claude Code, OpenCode, OpenAI Codex, and Pi.
          </p>
          <div className="SkillsLanding__installerGrid">
            <Card>
              <div className="SkillsCard">
                <h3 className="SkillsCard__title">Claude Code</h3>
                <p className="SkillsCard__description">
                  Install using the plugin marketplace:
                </p>
                <div className="SkillsCard__commands">
                  <CopyButton
                    variant="path"
                    value="/plugin marketplace add stellar/stellar-dev-skill"
                  />
                  <CopyButton
                    variant="path"
                    value="/plugin install stellar-dev@stellar-dev-skill"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="SkillsCard">
                <h3 className="SkillsCard__title">Cursor</h3>
                <p className="SkillsCard__description">
                  Install from the Cursor Marketplace, or add manually via
                  Settings → Rules → Add Rule → Remote Rule (GitHub) with this
                  slug:
                </p>
                <div className="SkillsCard__commands">
                  <CopyButton variant="path" value="stellar/stellar-dev-skill" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="SkillsCard">
                <h3 className="SkillsCard__title">npx skills</h3>
                <p className="SkillsCard__description">
                  Install using the npx skills CLI:
                </p>
                <div className="SkillsCard__commands">
                  <CopyButton
                    variant="path"
                    value="npx skills add https://github.com/stellar/stellar-dev-skill"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="SkillsCard">
                <h3 className="SkillsCard__title">Clone / Copy</h3>
                <p className="SkillsCard__description">
                  Clone the repo and copy the skills directory to your
                  agent&apos;s skills location:
                </p>
                <div className="SkillsCard__commands">
                  <CopyButton
                    variant="path"
                    value="git clone https://github.com/stellar/stellar-dev-skill"
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="SkillsLanding__ecosystem" aria-label="Community">
          <h2 className="SkillsLanding__sectionTitle">Community skills</h2>
          <p className="SkillsLanding__sectionDescription">
            Skills built and maintained by the Stellar community. Each project
            has its own install instructions, so follow the link on a card to
            set it up with your agent. The resources listed here are
            community-contributed and are not endorsed by the Stellar
            Foundation. Always do your own research (DYOR) before using any
            tool or resource. Inclusion in this list does not imply any
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
        <a
          href="https://github.com/stellar/stellar-dev-skill"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="SkillsLanding__footerGithub"
        >
          <GitHubIcon />
        </a>
      </footer>
    </div>
  );
}
