import { Graph, layout } from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";

export const NODE_WIDTH = 220;
export const UNIT_HEIGHT = 64;
export const PERSON_HEIGHT = 72;

/** What each chart box needs to draw itself. */
export type OrgFlowData = {
  node: OrgNodeResponse;
  isOpen: boolean;
  isMe: boolean;
  isMatch: boolean;
  onToggle: (id: string) => void;
};

export type OrgFlowNode = Node<OrgFlowData, "unit" | "person">;

interface FlowOptions {
  expanded: ReadonlySet<string>;
  matchedIds: ReadonlySet<string>;
  meId?: string;
  onToggle: (id: string) => void;
}

/** Only the boxes reachable through expanded parents, plus the lines between them. */
export function buildFlow(
  roots: OrgNodeResponse[],
  { expanded, matchedIds, meId, onToggle }: FlowOptions,
): { nodes: OrgFlowNode[]; edges: Edge[] } {
  const nodes: OrgFlowNode[] = [];
  const edges: Edge[] = [];

  const visit = (node: OrgNodeResponse, parentId?: string) => {
    const isOpen = node.children.length > 0 && expanded.has(node.id);
    nodes.push({
      id: node.id,
      type: node.kind === "employee" ? "person" : "unit",
      position: { x: 0, y: 0 },
      data: {
        node,
        isOpen,
        isMe: node.id === meId,
        isMatch: matchedIds.has(node.id),
        onToggle,
      },
    });
    if (parentId) {
      edges.push({
        id: `${parentId}->${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
      });
    }
    if (isOpen) node.children.forEach((child) => visit(child, node.id));
  };
  roots.forEach((root) => visit(root));

  return { nodes, edges };
}

const heightOf = (node: OrgFlowNode) =>
  node.type === "person" ? PERSON_HEIGHT : UNIT_HEIGHT;

/** Top-down tree layout; returns the nodes with their positions filled in. */
export function layoutFlow(nodes: OrgFlowNode[], edges: Edge[]): OrgFlowNode[] {
  const graph = new Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 24, ranksep: 56 });
  nodes.forEach((n) =>
    graph.setNode(n.id, { width: NODE_WIDTH, height: heightOf(n) }),
  );
  edges.forEach((e) => graph.setEdge(e.source, e.target));
  layout(graph);

  return nodes.map((n) => {
    const { x, y } = graph.node(n.id);
    return {
      ...n,
      position: { x: x - NODE_WIDTH / 2, y: y - heightOf(n) / 2 },
    };
  });
}
