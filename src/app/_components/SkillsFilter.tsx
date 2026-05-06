"use client";

import { KeyboardEvent, ReactNode, useRef, useState } from "react";

import type { FilterType } from "@/data/skills";

type Props = {
  filters: readonly FilterType[];
  /** Pre-rendered card markup (server). Each child should carry a
   * `data-category` attribute matching one of `filters` so CSS can hide
   * non-matching cards based on the panel's `data-active-filter`. */
  children: ReactNode;
};

const FILTER_PANEL_ID = "skills-filter-panel";
const filterTabId = (filter: FilterType) => `skills-filter-tab-${filter}`;

/**
 * Client island that owns the active-filter state and the ARIA tablist
 * keyboard handling. The cards themselves render server-side and are
 * passed in as `children`; this component just toggles a `data-active-
 * filter` attribute on the wrapping panel so CSS can hide non-matching
 * entries.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
export const SkillsFilter = ({ filters, children }: Props) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const tabRefs = useRef<Record<FilterType, HTMLButtonElement | null>>(
    {} as Record<FilterType, HTMLButtonElement | null>,
  );

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % filters.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + filters.length) % filters.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = filters.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextFilter = filters[nextIndex];
      setActiveFilter(nextFilter);
      tabRefs.current[nextFilter]?.focus();
    }
  };

  return (
    <>
      <div
        className="SkillsLanding__filters"
        role="tablist"
        aria-label="Filter skills"
      >
        {filters.map((filter, index) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              id={filterTabId(filter)}
              aria-controls={FILTER_PANEL_ID}
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

      <div
        role="tabpanel"
        id={FILTER_PANEL_ID}
        aria-labelledby={filterTabId(activeFilter)}
        className="SkillsLanding__filterPanel"
        data-active-filter={activeFilter}
      >
        {children}
      </div>
    </>
  );
};
