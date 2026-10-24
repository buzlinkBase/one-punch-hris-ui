import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";

/** How many levels start expanded. */
export const DEFAULT_EXPANDED_DEPTH = 2;

export const orgNodeDomId = (id: string) => `org-node-${id}`;

/** Everyone below `node`, not just direct reports. */
export function countDescendants(node: OrgNodeResponse): number {
  return node.reports.reduce((sum, r) => sum + 1 + countDescendants(r), 0);
}

/** Ids of every node that has reports and sits above `depth` levels (roots are level 1). */
export function expandedToDepth(
  nodes: OrgNodeResponse[],
  depth = DEFAULT_EXPANDED_DEPTH,
  level = 1,
): Set<string> {
  const ids = new Set<string>();
  if (level >= depth) return ids;
  for (const node of nodes) {
    if (node.reports.length === 0) continue;
    ids.add(node.id);
    expandedToDepth(node.reports, depth, level + 1).forEach((id) =>
      ids.add(id),
    );
  }
  return ids;
}

/** Ids of every node that has reports, i.e. everything "Expand all" opens. */
export function allParentIds(nodes: OrgNodeResponse[]): Set<string> {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (node.reports.length === 0) continue;
    ids.add(node.id);
    allParentIds(node.reports).forEach((id) => ids.add(id));
  }
  return ids;
}

/** Ids of the managers above `targetId` (nearest last), or null if the person isn't in the chart. */
export function ancestorsOf(
  nodes: OrgNodeResponse[],
  targetId: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return trail;
    const found = ancestorsOf(node.reports, targetId, [...trail, node.id]);
    if (found) return found;
  }
  return null;
}

const matches = (node: OrgNodeResponse, term: string) =>
  `${node.fullName} ${node.positionName}`.toLowerCase().includes(term);

/**
 * Keeps only the people matching `term` (name or position) plus the managers above them, so a
 * match is always shown in context. `matchedIds` is who actually matched, for highlighting.
 */
export function filterOrgTree(
  nodes: OrgNodeResponse[],
  term: string,
): { tree: OrgNodeResponse[]; matchedIds: Set<string> } {
  const needle = term.trim().toLowerCase();
  const matchedIds = new Set<string>();
  if (!needle) return { tree: nodes, matchedIds };

  const prune = (list: OrgNodeResponse[]): OrgNodeResponse[] =>
    list.flatMap((node) => {
      const reports = prune(node.reports);
      const self = matches(node, needle);
      if (self) matchedIds.add(node.id);
      return self || reports.length > 0 ? [{ ...node, reports }] : [];
    });

  return { tree: prune(nodes), matchedIds };
}

/** "Maria Dela Cruz" -> "MD". */
export function initialsOf(fullName: string): string {
  const words = fullName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
