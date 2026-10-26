import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import { SectionNav, type SectionNavGroup } from "./section-nav";

interface SectionTabsProps {
  groups: SectionNavGroup[];
  /** Content of each section, keyed like the groups' items. */
  panes: Record<string, ReactNode>;
  /**
   * Sections that stay mounted while hidden, so their form state and validation survive a
   * switch. Every other section mounts only while it is open.
   */
  keepMounted?: readonly string[];
  defaultActive?: string;
  /** Extra classes for the outer wrapper, e.g. a top margin when the parent has no gap. */
  className?: string;
}

/**
 * A page of several sections with the grouped section list beside it (a dropdown on phones),
 * in place of a row of tabs. Use for record and settings pages with four or more sections;
 * short view switches (e.g. Pending / Processed) stay as plain tabs.
 */
export function SectionTabs({
  groups,
  panes,
  keepMounted = [],
  defaultActive,
  className = "",
}: SectionTabsProps) {
  const isMobile = useIsMobile();
  const available = groups.flatMap((g) => g.items.map((i) => i.key));
  const [chosen, setChosen] = useState(defaultActive ?? available[0]);
  const active = available.includes(chosen) ? chosen : available[0];

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-start ${className}`}
    >
      <SectionNav
        groups={groups}
        active={active}
        onChange={setChosen}
        isMobile={isMobile}
      />
      <div className="min-w-0 flex-1">
        {available.map((key) =>
          key === active || keepMounted.includes(key) ? (
            <div key={key} hidden={key !== active}>
              {panes[key]}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
