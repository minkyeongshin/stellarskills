import { Badge, Logo } from "@stellar/design-system";

import {
  ECOSYSTEM_CARDS,
  FILTERS,
  SKILL_CARD_SOURCES,
} from "@/data/skills";
import { readSkillMeta } from "@/lib/skill-meta.mjs";

import { GitHubIcon, LinkExternal01Icon } from "./_components/icons";
import { InstallTabs } from "./_components/InstallTabs";
import { SkillCard } from "./_components/SkillCard";
import { SkillsFilter } from "./_components/SkillsFilter";
import { ThemeSwitchIsland } from "./_components/ThemeSwitchIsland";

import "./styles.scss";

/**
 * Origin used to render absolute URLs server-side. `SITE_ORIGIN` is a
 * manual override; otherwise we fall back to the local dev origin.
 * Mirrored in scripts/generate-llms-txt.mjs.
 */
const SITE_ORIGIN = process.env.SITE_ORIGIN || "http://localhost:3000";

const hostFromOrigin = (origin: string) => origin.replace(/^https?:\/\//, "");

const githubSourceUrl = (source: string) =>
  `https://github.com/stellar/stellar-dev-skill/blob/main/${source}`;

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
        </section>

        <section className="SkillsLanding__installing" aria-label="Installing">
          <InstallTabs pasteCommand={heroValue} />
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
