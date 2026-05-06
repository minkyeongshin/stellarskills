/**
 * Static content for the Stellar Skills landing page.
 *
 * Edit this file to add, remove, or reorder skills. No React knowledge
 * required — just keep the shape of each entry consistent.
 */

export type FilterType =
  | "All"
  | "Agents"
  | "Soroban"
  | "Frontend"
  | "Assets"
  | "APIs"
  | "Security"
  | "Standards"
  | "ZK"
  | "Ecosystem";

/**
 * Filter tabs displayed above the skill cards. The order here is the order
 * shown in the UI.
 */
export const FILTERS: readonly FilterType[] = [
  "All",
  "Agents",
  "Soroban",
  "Frontend",
  "Assets",
  "APIs",
  "Security",
  "Standards",
  "ZK",
  "Ecosystem",
] as const;

/**
 * A skill entry that lives at a path under the current origin
 * (e.g. /skills/soroban/contracts-soroban.md). The full URL is constructed
 * at render time so the same data works in dev, preview, and production.
 */
export type SkillCardSource = {
  title: string;
  description: string;
  /** Path under the site origin, e.g. "/skills/soroban/foo.md". */
  path: string;
  category: FilterType;
};

/**
 * An ecosystem-contributed skill. Unlike SkillCardSource, these point at
 * fully-qualified external URLs (typically GitHub) and are displayed
 * verbatim.
 */
export type EcosystemCardSource = {
  title: string;
  description: string;
  /** Display label for the link (shorter than the full URL). */
  pathLabel: string;
  /** Full URL copied to clipboard when the user clicks the pill. */
  copyValue: string;
  category: FilterType;
};

/**
 * Skills authored and maintained by the Stellar Skills project. Hosted
 * under this site's origin.
 */
export const SKILL_CARD_SOURCES: readonly SkillCardSource[] = [
  {
    title: "Stellar Development Skill",
    description:
      "End-to-end Stellar playbook—Soroban contracts, JS/Python/Go SDKs, RPC, wallets, assets, ZK, and agentic payments (x402, MPP).",
    path: "/skill/SKILL.md",
    category: "All",
  },
  {
    title: "Build Smart Contracts",
    description:
      "Soroban contracts in Rust—storage types, auth, constructors, cross-contract calls, events, and Stellar CLI deploy.",
    path: "/skills/soroban/contracts-soroban.md",
    category: "Soroban",
  },
  {
    title: "Advanced Contract Patterns",
    description:
      "Soroban architecture patterns—upgrades, factories, governance timelocks, DeFi vaults/AMMs, oracles, and compliance tokens.",
    path: "/skills/soroban/advanced-patterns.md",
    category: "Soroban",
  },
  {
    title: "Avoid Common Pitfalls",
    description:
      "Fix Soroban, SDK, wallet, and CLI errors—size limits, TTL, auth, passphrase, trustlines, sequence numbers, simulation.",
    path: "/skills/soroban/common-pitfalls.md",
    category: "Soroban",
  },
  {
    title: "Test Contract Logic",
    description:
      "Test Soroban contracts—soroban-sdk testutils, Quickstart local network, testnet, fuzz, proptest, snapshots, and fork testing.",
    path: "/skills/soroban/testing.md",
    category: "Soroban",
  },
  {
    title: "Frontend Integration",
    description:
      "Next.js and React patterns for Stellar SDK setup, Freighter and Stellar Wallets Kit, passkey smart accounts, and transaction UX.",
    path: "/skills/frontend/frontend-stellar-sdk.md",
    category: "Frontend",
  },
  {
    title: "Stellar Assets",
    description:
      "Issue Classic assets, manage trustlines and auth flags, and bridge to Soroban via the Stellar Asset Contract (SAC).",
    path: "/skills/assets/stellar-assets.md",
    category: "Assets",
  },
  {
    title: "RPC & Horizon APIs",
    description:
      "Query Stellar via RPC and Horizon—accounts, transactions, events, simulation, streaming, and migrating from Horizon to RPC.",
    path: "/skills/apis/api-rpc-horizon.md",
    category: "APIs",
  },
  {
    title: "Security Checklist",
    description:
      "Soroban and Classic security—auth checks, reinit, overflow, TTL, trustline and clawback risks, plus audit programs and tools like Scout and Sunbeam.",
    path: "/skills/security/security.md",
    category: "Security",
  },
  {
    title: "SEPs & CAPs Reference",
    description:
      "Map use cases to Stellar SEPs and CAPs—token interfaces, web auth, anchor flows, passkeys, and contract upgradeability.",
    path: "/skills/standards/standards-reference.md",
    category: "Standards",
  },
  {
    title: "ZK Proofs",
    description:
      "Status-aware ZK on Stellar—CAP-0059/0074/0075 readiness, Groth16 verifier patterns, capability-gated design.",
    path: "/skills/zk/zk-proofs.md",
    category: "ZK",
  },
  {
    title: "MPP Agent Payments",
    description:
      "Machine Payments Protocol on Stellar—charge mode per-request and channel mode for high-frequency AI agents.",
    path: "/skills/agents/mpp.md",
    category: "Agents",
  },
  {
    title: "x402 Payments",
    description:
      "Monetize APIs with HTTP 402 on Stellar—auth-entry signing, OZ Channels facilitator, zero-XLM clients.",
    path: "/skills/agents/x402.md",
    category: "Agents",
  },
  {
    title: "Ecosystem Projects",
    description:
      "Stellar ecosystem catalog—Blend, Soroswap, Reflector, Mercury, OpenZeppelin contracts, wallets, oracles, and audit firms.",
    path: "/skills/ecosystem/ecosystem.md",
    category: "Ecosystem",
  },
  {
    title: "Curated Resources",
    description:
      "Source-of-truth links for Stellar—docs, SDKs, CLI, SEPs/CAPs, RPC providers, audit bank, and bug bounties.",
    path: "/skills/ecosystem/resources.md",
    category: "Ecosystem",
  },
] as const;

/**
 * Community-contributed skills hosted on third-party sites (e.g. GitHub).
 * Displayed in the "Ecosystem skills" section at the bottom of the page.
 */
export const ECOSYSTEM_CARDS: readonly EcosystemCardSource[] = [
  {
    title: "OpenZeppelin Contracts",
    description:
      "Bootstrap a Soroban project with OpenZeppelin's Stellar crates—Rust toolchain, Stellar CLI, workspace deps, and pausable/ownable macros.",
    pathLabel: "OpenZeppelin/openzeppelin-skills",
    copyValue:
      "https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md",
    category: "Ecosystem",
  },
  {
    title: "On/off-ramp integration",
    description:
      "Connect users to fiat banking rails via Stellar anchor services using SEP-24 and SEP-31.",
    pathLabel: "github.com/<provider>/SKILL.md",
    copyValue: "https://github.com/<provider>/SKILL.md",
    category: "Ecosystem",
  },
  {
    title: "Smart wallet / Smart account setup",
    description:
      "Build programmable smart accounts with multi-sig, spending limits, and account abstraction on Stellar.",
    pathLabel: "github.com/<project>/SKILL.md",
    copyValue: "https://github.com/<project>/SKILL.md",
    category: "Ecosystem",
  },
  {
    title: "USDC on Stellar",
    description:
      "Issue, transfer, and integrate Circle's USDC within Stellar apps and Soroban contracts.",
    pathLabel: "github.com/<project>/SKILL.md",
    copyValue: "https://github.com/<project>/SKILL.md",
    category: "Ecosystem",
  },
  {
    title: "Cross-chain bridging",
    description:
      "Bridge assets between Stellar and other blockchains using atomic swaps and lock-and-mint patterns.",
    pathLabel: "github.com/<project>/SKILL.md",
    copyValue: "https://github.com/<project>/SKILL.md",
    category: "Ecosystem",
  },
] as const;
