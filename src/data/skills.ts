/**
 * Static content for the Stellar Skills landing page.
 *
 * Edit this file to add, remove, or reorder skills. No React knowledge
 * required; just keep the shape of each entry consistent.
 */

export type FilterType =
  | "All"
  | "Agentic Payments"
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
  "Soroban",
  "Agentic Payments",
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
      "Top-level Stellar reference that ties every other skill together. Covers Soroban contracts, JavaScript/Python/Go SDKs, RPC, wallets, assets, security, ZK, and agent payments via x402 and MPP.",
    path: "/skills/SKILL.md",
    category: "All",
  },
  {
    title: "Curated Resources",
    description:
      "Source-of-truth links for everything Stellar. Official docs, RPC and Horizon API references, client and contract SDKs, the Stellar CLI, oracle providers, security guides, and bug bounty programs.",
    path: "/skills/resources.md",
    category: "Ecosystem",
  },
  {
    title: "Build Smart Contracts",
    description:
      "Write Soroban smart contracts in Rust. Walks through project setup, storage types, authorization, constructors, cross-contract calls, events, error handling, and deployment with the Stellar CLI.",
    path: "/skills/contracts-soroban.md",
    category: "Soroban",
  },
  {
    title: "Advanced Contract Patterns",
    description:
      "Architecture playbook for production Soroban contracts. Covers upgrades and migrations, factory and deployer systems, governance timelocks, DeFi vaults and AMMs, oracle integrations, and compliance-aware tokens.",
    path: "/skills/advanced-patterns.md",
    category: "Soroban",
  },
  {
    title: "Avoid Common Pitfalls",
    description:
      "Diagnose and fix the Stellar errors developers actually hit in practice. Contract size limits, TTL exhaustion, authorization failures, network passphrase mismatches, trustline issues, sequence numbers, and simulation gotchas.",
    path: "/skills/common-pitfalls.md",
    category: "Soroban",
  },
  {
    title: "Test Contract Logic",
    description:
      "Test Soroban contracts at every layer. Unit tests with soroban-sdk testutils, local networks via Stellar Quickstart Docker, testnet runs, plus fuzz, property-based, snapshot, and fork testing patterns.",
    path: "/skills/testing.md",
    category: "Soroban",
  },
  {
    title: "Frontend Integration",
    description:
      "Build Stellar dApps in Next.js or React. SDK setup, Freighter and Stellar Wallets Kit integration, transaction building and submission, passkey smart accounts, and a production transaction UX checklist.",
    path: "/skills/frontend-stellar-sdk.md",
    category: "Frontend",
  },
  {
    title: "Stellar Assets",
    description:
      "Issue and manage Stellar Classic assets. Covers asset types, trustlines, auth flags, liquidity pool shares, and bridging to Soroban contracts through the Stellar Asset Contract (SAC).",
    path: "/skills/stellar-assets.md",
    category: "Assets",
  },
  {
    title: "RPC & Horizon APIs",
    description:
      "Pick the right Stellar data API and use it correctly. Stellar RPC for new projects (accounts, transactions, simulation, events, streaming) and Horizon for historical or legacy data, with a step-by-step Horizon-to-RPC migration path.",
    path: "/skills/api-rpc-horizon.md",
    category: "APIs",
  },
  {
    title: "Security Checklist",
    description:
      "Harden Soroban and Classic Stellar code against real attack patterns. Missing authorization, reinitialization, integer overflow, TTL exhaustion, trustline and clawback risks, plus tooling such as Scout and Sunbeam and recommended audit programs.",
    path: "/skills/security.md",
    category: "Security",
  },
  {
    title: "SEPs & CAPs Reference",
    description:
      "Map any feature to the right Stellar standard. Token interfaces, web auth, anchor and on/off-ramp flows, passkeys, contract upgradeability, NFTs, and regulated tokens, all linked to current SEPs and CAPs.",
    path: "/skills/standards-reference.md",
    category: "Standards",
  },
  {
    title: "ZK Proofs",
    description:
      "Plan zero-knowledge proof verification on Stellar with awareness of evolving protocol support. CAP-0059, CAP-0074, and CAP-0075 readiness, Groth16 and PLONK integration patterns, and capability-gated contract design.",
    path: "/skills/zk-proofs.md",
    category: "ZK",
  },
  {
    title: "MPP Agent Payments",
    description:
      "Settle AI agent payments directly on Stellar with no facilitator dependency. Charge mode pays per request via Soroban SAC transfers; channel mode batches hundreds of off-chain payments into a single deposit and close.",
    path: "/skills/mpp.md",
    category: "Agentic Payments",
  },
  {
    title: "x402 Payments",
    description:
      "Add HTTP 402 paywalls to any API on Stellar with the fastest possible setup. The OZ Channels facilitator sponsors network fees so clients (including AI agents) pay with zero XLM, and the implementation stays interoperable with the broader x402 ecosystem.",
    path: "/skills/x402.md",
    category: "Agentic Payments",
  },
  {
    title: "Ecosystem Projects",
    description:
      "Browse the Stellar ecosystem to find the right integration for your app. DeFi protocols like Blend and Soroswap, data services like Reflector and Mercury, OpenZeppelin contracts, wallets, oracles, and audit firms, with use cases and links.",
    path: "/skills/ecosystem.md",
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
      "Scaffold a Soroban project with OpenZeppelin's audited Stellar contract libraries. Walks through Rust toolchain setup, Stellar CLI install, workspace dependencies, and applying the pausable and ownable macros to your contract.",
    pathLabel: "OpenZeppelin/openzeppelin-skills",
    copyValue:
      "https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/setup-stellar-contracts/SKILL.md",
    category: "Ecosystem",
  },
  {
    title: "DeFindex SDK",
    description:
      "Integrate DeFindex vaults on Stellar with the @defindex/sdk TypeScript package. Covers vault deposits and withdrawals, balance and APY queries, programmatic vault creation, and the unsigned-XDR signing pattern for backend and bot integrations.",
    pathLabel: "paltalabs/defindex-sdk",
    copyValue:
      "https://github.com/paltalabs/defindex-sdk/blob/main/defindex-sdk-skill.md",
    category: "Ecosystem",
  },
  {
    title: "Soroswap SDK",
    description:
      "Trade on Soroswap DEX from a backend, bot, or swap widget using the @soroswap/sdk TypeScript package. Covers token swaps, liquidity pool operations, price and route queries, API key handling, and signing flows for both server keypairs and browser wallets.",
    pathLabel: "soroswap/sdk",
    copyValue: "https://github.com/soroswap/sdk/blob/main/soroswap-sdk-skill.md",
    category: "Ecosystem",
  },
  {
    title: "Trustless Work Escrow",
    description:
      "Build escrow and milestone-based payment workflows on Stellar with the Trustless Work platform. Covers single-release and multi-release escrows, trustline configuration, dispute handling, and three integration paths: REST API, React SDK hooks, and pre-built Blocks UI components.",
    pathLabel: "Trustless-Work/trustless-work-dev-skill",
    copyValue:
      "https://github.com/Trustless-Work/trustless-work-dev-skill/blob/main/SKILL.md",
    category: "Ecosystem",
  },
] as const;
