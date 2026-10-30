import type { ReactNode } from "react";
import { useTermsLive } from "../../hooks/use-terms-queries";

interface TermsLinkProps {
  /** A numbered section of the Terms ("## N."), linked as /terms#section-N. */
  section?: number;
  className?: string;
  children: ReactNode;
}

/**
 * A link to the Terms of Service, opened in a new tab -- or nothing while the Terms aren't live
 * (the Platform Console's switch), so no screen points at Terms that aren't in effect.
 */
export function TermsLink({ section, className, children }: TermsLinkProps) {
  const live = useTermsLive();
  if (!live) return null;
  return (
    <a
      href={section ? `/terms#section-${section}` : "/terms"}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
