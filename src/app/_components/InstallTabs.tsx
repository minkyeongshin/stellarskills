"use client";

import { useState } from "react";

import { CopyButton } from "./CopyButton";

type TabId = "oneTime" | "everyChat";

type Props = {
  /** The "paste this" command for one-time use. */
  pasteCommand: string;
};

const INSTALL_COMMANDS = [
  {
    tool: "Claude Code",
    commands: [
      "/plugin marketplace add stellar/stellar-dev-skill",
      "/plugin install stellar-dev@stellar-dev-skill",
    ],
  },
  {
    tool: "Cursor",
    commands: ["stellar/stellar-dev-skill"],
  },
  {
    tool: "npx skills",
    commands: ["npx skills add https://github.com/stellar/stellar-dev-skill"],
  },
  {
    tool: "Clone repo",
    commands: ["git clone https://github.com/stellar/stellar-dev-skill"],
  },
];

const TABS = [
  { id: "oneTime" as TabId, label: "For this chat only" },
  { id: "everyChat" as TabId, label: "Install for every chat" },
];

export const InstallTabs = ({ pasteCommand }: Props) => {
  const [activeTab, setActiveTab] = useState<TabId>("oneTime");

  return (
    <div className="InstallTabs">
      <div className="InstallTabs__tabBar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className="InstallTabs__tab"
            data-active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="InstallTabs__content" role="tabpanel" data-tab={activeTab}>
        {activeTab === "oneTime" ? (
          <div className="InstallTabs__oneTime">
            <CopyButton variant="path" value={pasteCommand} />
          </div>
        ) : (
          <div className="InstallTabs__rows">
            {INSTALL_COMMANDS.map((item, index) => (
              <div
                key={item.tool}
                className="InstallTabs__row"
                data-first={index === 0}
              >
                <span className="InstallTabs__toolName">{item.tool}</span>
                <div className="InstallTabs__commands">
                  {item.commands.map((cmd) => (
                    <CopyButton key={cmd} variant="path" value={cmd} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
