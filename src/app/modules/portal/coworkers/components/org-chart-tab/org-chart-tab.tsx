import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Skeleton, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  useMyEmployee,
  useOrgChart,
} from "../../../shared/hooks/use-my-employee-queries";
import OrgNode from "./org-node";
import {
  allParentIds,
  ancestorsOf,
  expandedToDepth,
  filterOrgTree,
  orgNodeDomId,
} from "./org-chart-utils";

export default function OrgChartTab() {
  const { data, isLoading } = useOrgChart(true);
  const { data: me } = useMyEmployee();
  const roots = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState("");
  // null until the user touches expand/collapse, so the default follows the loaded data.
  const [manual, setManual] = useState<Set<string> | null>(null);
  // A fresh object per click, so "Find me" scrolls again even for the same person.
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

  const update = (change: (current: Set<string>) => void) => {
    const next = new Set(manual ?? expandedToDepth(roots));
    change(next);
    setManual(next);
  };

  const toggle = (id: string) =>
    update((s) => {
      if (!s.delete(id)) s.add(id);
    });

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

  // Runs after the render that opened the ancestors, so the node exists in the DOM.
  useEffect(() => {
    if (!focus) return;
    document
      .getElementById(orgNodeDomId(focus.id))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (roots.length === 0) return <Empty description="No org chart yet" />;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by name or position"
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
        <ul className="m-0 flex flex-col gap-2 p-0">
          {tree.map((root) => (
            <OrgNode
              key={root.id}
              node={root}
              expanded={expanded}
              matchedIds={matchedIds}
              meId={me?.id}
              onToggle={toggle}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
