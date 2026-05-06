"use client";

import {
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Icon,
  Logo,
  ThemeSwitch,
} from "@stellar/design-system";

import { Hydration } from "@/components/Hydration";
import {
  ECOSYSTEM_CARDS,
  FILTERS,
  FilterType,
  SKILL_CARD_SOURCES,
} from "@/data/skills";

import "./styles.scss";

const LOCAL_STORAGE_SAVED_THEME = "stellarTheme:Laboratory";

type ModeType = "human" | "agent";

/**
 * Origin used during SSR (and the brief moment before useEffect replaces it
 * with `window.location.origin` on the client). Resolves at build time from
 * the same precedence as scripts/generate-llms-txt.mjs:
 *
 *   NEXT_PUBLIC_SITE_URL                       manual override
 *   NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL  canonical production domain
 *   NEXT_PUBLIC_VERCEL_URL                     per-deployment URL
 *   "http://localhost:3000"                    local default
 *
 * The NEXT_PUBLIC_VERCEL_* vars are auto-exposed by Vercel for any Next.js
 * project, so production deployments need no manual config once a domain
 * is attached to the Vercel project.
 */
const FALLBACK_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000");

const hostFromOrigin = (origin: string) => origin.replace(/^https?:\/\//, "");

/**
 * Map a stellarskills.com path back to its source-of-truth file in
 * stellar/stellar-dev-skill. The upstream repo is flat under `skill/`,
 * so the basename of the site path is the upstream filename.
 */
const getGitHubSourceUrl = (sitePath: string) => {
  const filename = sitePath.split("/").pop() ?? "";
  return `https://github.com/stellar/stellar-dev-skill/blob/main/skill/${filename}`;
};

const getModeContent = (
  origin: string,
): Record<ModeType, { value: string; displayValue?: string }> => {
  const host = hostFromOrigin(origin);
  return {
    human: {
      value: `Read ${host} before you start building on Stellar.`,
    },
    agent: {
      value: `${origin}/SKILL.md`,
      displayValue: `${host}/SKILL.md`,
    },
  };
};

const getSkillMdContent = (origin: string) => {
  const host = hostFromOrigin(origin);
  return `# Stellar Skills

Agent-readable documentation for building on the Stellar network.

## Available Skills

- Soroban: ${host}/soroban/SKILL.md
- Wallets: ${host}/wallets/SKILL.md
- Security: ${host}/security/SKILL.md
- Testing: ${host}/testing/SKILL.md
- Trustlines: ${host}/trustlines/SKILL.md
- x402: ${host}/x402/SKILL.md
- MPP: ${host}/mpp/SKILL.md

## Usage

Fetch any skill file to get detailed, up-to-date context for your AI agent.
`;
};

type SkillCard = {
  title: string;
  description: string;
  pathLabel: string;
  copyValue: string;
  category: FilterType;
  sourceUrl: string;
};

type CopyButtonVariant = "pill" | "path";

type CopyButtonProps = {
  /** The string written to the clipboard. */
  value: string;
  /** Optional label shown to the user; defaults to `value`. */
  displayValue?: string;
  /**
   * Visual variant.
   * - `pill`: prominent hero-style copy chip.
   * - `path`: smaller path-style chip used inside skill cards.
   */
  variant?: CopyButtonVariant;
  /** Accessible label override. */
  ariaLabel?: string;
};

/**
 * Button that copies a string to the clipboard and shows a transient
 * "copied" affordance. Used for both the hero pill and per-card path
 * pills.
 *
 * @example
 * <CopyButton value="https://stellarskills.com/SKILL.md" variant="pill" />
 */
const CopyButton = ({
  value,
  displayValue,
  variant = "pill",
  ariaLabel,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const wrapperClass =
    variant === "pill"
      ? "SkillsCopyPill__wrapper"
      : "SkillsCard__pathWrapper";
  const buttonClass =
    variant === "pill" ? "SkillsCopyPill" : "SkillsCard__pathButton";
  const textClass =
    variant === "pill" ? "SkillsCopyPill__text" : "SkillsCard__pathText";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        className={buttonClass}
        onClick={handleCopy}
        aria-label={ariaLabel ?? `Copy ${displayValue ?? value}`}
        data-copied={copied}
      >
        <span className={textClass}>{displayValue ?? value}</span>
        {variant === "pill" ? (
          <span className="SkillsCopyPill__copyIcon">
            {copied ? <Icon.CheckCircle /> : <Icon.Copy01 />}
          </span>
        ) : copied ? (
          <Icon.CheckCircle />
        ) : (
          <Icon.Copy01 />
        )}
      </button>
    </div>
  );
};

const filterTabId = (filter: FilterType) => `skills-filter-tab-${filter}`;
const filterPanelId = (filter: FilterType) => `skills-filter-panel-${filter}`;

export default function LandingPage() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const mode: ModeType = urlMode === "agent" ? "agent" : "human";

  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [origin, setOrigin] = useState<string>(FALLBACK_ORIGIN);
  const tabRefs = useRef<Record<FilterType, HTMLButtonElement | null>>(
    {} as Record<FilterType, HTMLButtonElement | null>,
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const skillCards = useMemo<SkillCard[]>(() => {
    const host = hostFromOrigin(origin);
    return SKILL_CARD_SOURCES.map((s) => ({
      title: s.title,
      description: s.description,
      category: s.category,
      pathLabel: `${host}${s.path}`,
      copyValue: `${origin}${s.path}`,
      sourceUrl: getGitHubSourceUrl(s.path),
    }));
  }, [origin]);

  const activeModeContent = getModeContent(origin)[mode];

  /**
   * Standard ARIA tabs keyboard pattern: ArrowLeft/ArrowRight cycle
   * through the tablist, Home/End jump to the ends. The newly focused
   * tab is also activated (manual activation would also be valid;
   * automatic activation matches this page's existing UX).
   *
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
   */
  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % FILTERS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + FILTERS.length) % FILTERS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = FILTERS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextFilter = FILTERS[nextIndex];
      setActiveFilter(nextFilter);
      tabRefs.current[nextFilter]?.focus();
    }
  };

  // Agent mode: show raw SKILL.md content only
  if (mode === "agent") {
    return (
      <div className="SkillsLanding__agentView">
        <pre className="SkillsLanding__agentContent">{getSkillMdContent(origin)}</pre>
      </div>
    );
  }

  const filteredSkillCards = skillCards
    .slice(1)
    .filter((c) => activeFilter === "All" || c.category === activeFilter)
    .slice(0, activeFilter === "All" ? undefined : 5);

  return (
    <div className="SkillsLanding">
      <header className="SkillsLanding__header">
        <div className="SkillsLanding__logo">
          <Logo.Stellar />
          <Badge variant="secondary" size="md">Skills</Badge>
        </div>

        <div className="SkillsLanding__headerActions">
          <Hydration>
            <ThemeSwitch storageKeyId={LOCAL_STORAGE_SAVED_THEME} />
          </Hydration>

          <Button
            variant="tertiary"
            size="md"
            icon={<Icon.LinkExternal01 />}
            iconPosition="right"
            onClick={() => window.open("https://developers.stellar.org/docs", "_blank", "noopener,noreferrer")}
          >
            Developer docs
          </Button>
        </div>
      </header>

      <main className="SkillsLanding__main">
        <section className="SkillsLanding__hero">
          <h1 className="SkillsLanding__title">Give your AI the right Stellar context before it writes code. Works with any AI agent.</h1>

          <div className="SkillsLanding__pill">
            <CopyButton
              variant="pill"
              value={activeModeContent.value}
              displayValue={activeModeContent.displayValue}
            />
          </div>
        </section>

        <section className="SkillsLanding__cards" aria-label="Skills list" data-fixed-height={activeFilter !== "All"}>
          {/* First card - always visible */}
          <Card key={skillCards[0].title}>
            <div className="SkillsCard">
              <div className="SkillsCard__header">
                <h2 className="SkillsCard__title">{skillCards[0].title}</h2>
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={<Icon.LinkExternal01 />}
                  aria-label={`View ${skillCards[0].title} source`}
                  onClick={() =>
                    window.open(
                      skillCards[0].sourceUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                />
              </div>

              <p className="SkillsCard__description">{skillCards[0].description}</p>

              <CopyButton
                variant="path"
                value={skillCards[0].copyValue}
                displayValue={skillCards[0].pathLabel}
              />
            </div>
          </Card>

          {/* Filter tabs */}
          <div className="SkillsLanding__filters" role="tablist" aria-label="Filter skills">
            {FILTERS.map((filter, index) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  id={filterTabId(filter)}
                  aria-controls={filterPanelId(filter)}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  ref={(el) => {
                    tabRefs.current[filter] = el;
                  }}
                  className="SkillsLanding__filterTab"
                  data-is-active={isActive}
                  onClick={() => setActiveFilter(filter)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Filtered skill cards */}
          <div
            role="tabpanel"
            id={filterPanelId(activeFilter)}
            aria-labelledby={filterTabId(activeFilter)}
            className="SkillsLanding__filterPanel"
          >
            {filteredSkillCards.map((c, idx) => (
              <Card key={`${c.title}-${idx}`}>
                <div className="SkillsCard">
                  <div className="SkillsCard__header">
                    <h2 className="SkillsCard__title">{c.title}</h2>
                    <Button
                      variant="tertiary"
                      size="sm"
                      icon={<Icon.LinkExternal01 />}
                      aria-label={`View ${c.title} source`}
                      onClick={() =>
                        window.open(
                          c.sourceUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    />
                  </div>

                  <p className="SkillsCard__description">{c.description}</p>

                  <CopyButton
                    variant="path"
                    value={c.copyValue}
                    displayValue={c.pathLabel}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Ecosystem section - always visible below skills */}
        <section className="SkillsLanding__ecosystem" aria-label="Ecosystem">
          <h2 className="SkillsLanding__sectionTitle">Ecosystem skills</h2>
          <p className="SkillsLanding__sectionDescription">
            Skills built and maintained by the Stellar community. The resources listed here are community-contributed and are not endorsed by the Stellar Foundation. Always do your own research (DYOR) before using any tool or resource. Inclusion in this list does not imply any warranty, security audit, or official recommendation. (Text TBD)
          </p>
          <div className="SkillsLanding__ecosystemGrid">
            {ECOSYSTEM_CARDS.map((c, idx) => (
              <Card key={`ecosystem-${c.title}-${idx}`}>
                <div className="SkillsCard">
                  <div className="SkillsCard__header">
                    <h3 className="SkillsCard__title">{c.title}</h3>
                    <Button
                      variant="tertiary"
                      size="sm"
                      icon={<Icon.LinkExternal01 />}
                      aria-label={`View ${c.title} source`}
                      onClick={() =>
                        window.open(
                          c.copyValue,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    />
                  </div>

                  <p className="SkillsCard__description">{c.description}</p>

                  <CopyButton
                    variant="path"
                    value={c.copyValue}
                    displayValue={c.pathLabel}
                  />
                </div>
              </Card>
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
