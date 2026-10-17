import { useMemo } from "react";
import { Empty, Skeleton, Tree } from "antd";
import type { TreeDataNode } from "antd";
import { useOrgChart } from "../../../shared/hooks/use-my-employee-queries";
import type { OrgNodeResponse } from "../../../shared/models/api/response/coworker-response.model";

function toTreeData(nodes: OrgNodeResponse[]): TreeDataNode[] {
  return nodes.map((n) => ({
    key: n.id,
    title: n.positionName ? `${n.fullName} · ${n.positionName}` : n.fullName,
    children: toTreeData(n.reports),
  }));
}

export default function OrgChartTab() {
  const { data, isLoading } = useOrgChart(true);
  const treeData = useMemo(() => toTreeData(data ?? []), [data]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (treeData.length === 0) return <Empty description="No org chart yet" />;
  return <Tree showLine selectable={false} treeData={treeData} />;
}
