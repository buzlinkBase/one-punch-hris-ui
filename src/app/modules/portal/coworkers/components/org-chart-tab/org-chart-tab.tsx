import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Skeleton, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";
import {
  useMyEmployee,
  useOrgChart,
} from "../../../shared/hooks/use-my-employee-queries";
import { OrgPersonNode, OrgUnitNode } from "./org-node";
import { buildFlow, layoutFlow } from "./org-chart-layout";
import {
  allParentIds,
  ancestorsOf,
  expandedToDepth,
  filterOrgTree,
} from "./org-chart-utils";

const NODE_TYPES = { unit: OrgUnitNode, person: OrgPersonNode };

function OrgChartCanvas() {
  const { data, isLoading } = useOrgChart(true);
  const { data: me } = useMyEmployee();
  const { fitView } = useReactFlow();
  const isMobile = useIsMobile();
  const roots = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState("");
  // null until the user touches expand/collapse, so the default follows the loaded data.
  const [manual, setManual] = useState<Set<string> | null>(null);
  // A fresh object per click, so "Find me" re-centers even for the same person.
  const [focus, setFocus] = useState<{ id: string }>();

  const { tree, matchedIds } = useMemo(
    () => filterOrgTree(roots, search),
    [roots, search],
  );
  const searching = search.trim().length > 0;

  // While searching, everything in the pruned tree is open so matches are visible.
  const expanded = useMemo(
    () => (searching ? allParentIds(tree) : (manual ?? expandedToDepth(roots))),
    [searching, tree, manual, roots],
  );

  const update = useCallback(
    (change: (current: Set<string>) => void) => {
      const next = new Set(manual ?? expandedToDepth(roots));
      change(next);
      setManual(next);
    },
    [manual, roots],
  );

  const toggle = useCallback(
    (id: string) =>
      update((s) => {
        if (!s.delete(id)) s.add(id);
      }),
    [update],
  );

  const flow = useMemo(() => {
    const built = buildFlow(tree, {
      expanded,
      matchedIds,
      meId: me?.id,
      onToggle: toggle,
    });
    return { nodes: layoutFlow(built.nodes, built.edges), edges: built.edges };
  }, [tree, expanded, matchedIds, me?.id, toggle]);

  const findMe = () => {
    const path = me?.id ? ancestorsOf(roots, me.id) : null;
    if (!me?.id || !path) {
      message.info("You aren't part of the org chart yet.");
      return;
    }
    setSearch("");
    update((s) => path.forEach((id) => s.add(id)));
    setFocus({ id: me.id });
  };

  // Runs after the render that opened the ancestors, so the node exists in the chart.
  useEffect(() => {
    if (!focus) return;
    fitView({ nodes: [{ id: focus.id }], duration: 400, maxZoom: 1.2 });
  }, [focus, fitView]);

  // Re-frame the chart when the search narrows or widens what is shown.
  useEffect(() => {
    if (searching) fitView({ duration: 300 });
  }, [searching, tree, fitView]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (roots.length === 0) return <Empty description="No org chart yet" />;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by name, position, department or section"
          className="sm:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button onClick={findMe} disabled={!me?.id}>
            Find me
          </Button>
          <Button
            disabled={searching}
            onClick={() => setManual(allParentIds(roots))}
          >
            Expand all
          </Button>
          <Button disabled={searching} onClick={() => setManual(new Set())}>
            Collapse all
          </Button>
        </div>
      </div>

      {tree.length === 0 ? (
        <Empty description="No one matches your search" />
      ) : (
        <div className="h-[60dvh] min-h-80 overflow-hidden rounded-lg border border-solid border-(--border-subtle) md:h-[70vh] md:min-h-105">
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            nodeTypes={NODE_TYPES}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            minZoom={0.1}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            {/* Top-left on phones: the bottom edge can sit below the visible screen. */}
            <Controls
              showInteractive={false}
              position={isMobile ? "top-left" : "bottom-left"}
            />
            {!isMobile && <MiniMap pannable zoomable />}
          </ReactFlow>
        </div>
      )}
    </div>
  );
}

export default function OrgChartTab() {
  return (
    <ReactFlowProvider>
      <OrgChartCanvas />
    </ReactFlowProvider>
  );
}
