/** A published version of the Terms of Service (tokens already filled in). */
export interface PublishedTermsResponse {
  version: number;
  renderedMarkdown: string;
  changeSummary: string | null;
  requiresReacceptance: boolean;
  effectiveAtUtc: string | null;
  publishedAtUtc: string | null;
}

/** Where the current company stands with the Terms. */
export interface TermsStatusResponse {
  currentVersion: number | null;
  currentEffectiveAtUtc: string | null;
  changeSummary: string | null;
  acceptedVersion: number | null;
  acceptedAtUtc: string | null;
  acceptedBy: string | null;
  requiresAcceptance: boolean;
  /** Whether the Terms are in effect at all (the Platform Console's switch). */
  isLive: boolean;
}
