"use client";

import { useState } from "react";

import { CheckCircleIcon, Copy01Icon } from "./icons";

type CopyButtonVariant = "pill" | "path";

export type CopyButtonProps = {
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
 */
export const CopyButton = ({
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
    variant === "pill" ? "SkillsCopyPill__wrapper" : "SkillsCard__pathWrapper";
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
            {copied ? <CheckCircleIcon /> : <Copy01Icon />}
          </span>
        ) : copied ? (
          <CheckCircleIcon />
        ) : (
          <Copy01Icon />
        )}
      </button>
    </div>
  );
};
