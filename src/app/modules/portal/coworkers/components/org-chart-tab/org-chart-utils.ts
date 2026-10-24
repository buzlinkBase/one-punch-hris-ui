import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";

/** How many levels start expanded (company = 1, so this opens company and departments). */
export const DEFAULT_EXPANDED_DEPTH = 3;

/** Ids of every node that has children and sits above `depth` levels (roots are level 1). */
export function expandedToDepth(
  nodes: OrgNodeResponse[],
  depth = DEFAULT_EXPANDED_DEPTH,
  level = 1,
): Set<string> {
  const ids = new Set<string>();
  if (level >= depth) return ids;
  for (const node of nodes) {
    if (node.children.length === 0) continue;
    ids.add(node.id);
    expandedToDepth(node.children, depth, level + 1).forEach((id) =>
      ids.add(id),
    );
  }
  return ids;
}

/** Ids of every node that has children, i.e. everything "Expand all" opens. */
export function allParentIds(nodes: OrgNodeResponse[]): Set<string> {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (node.children.length === 0) continue;
    ids.add(node.id);
    allParentIds(node.children).forEach((id) => ids.add(id));
  }
  return ids;
}

/** Ids of the boxes above `targetId` (nearest last), or null if it isn't in the chart. */
export function ancestorsOf(
  nodes: OrgNodeResponse[],
  targetId: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return trail;
    const found = ancestorsOf(node.children, targetId, [...trail, node.id]);
    if (found) return found;
  }
  return null;
}

const matches = (node: OrgNodeResponse, term: string) =>
  `${node.name} ${node.positionName}`.toLowerCase().includes(term);

/**
 * Keeps what matches `term` (name or position) plus the boxes above it, so a match is always
 * shown in context. A matching department or section keeps everything under it.
 * `matchedIds` is what actually matched, for highlighting.
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
      const self = matches(node, needle);
      if (self) matchedIds.add(node.id);
      if (self && node.kind !== "employee") return [node];
      const children = prune(node.children);
      return self || children.length > 0 ? [{ ...node, children }] : [];
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
