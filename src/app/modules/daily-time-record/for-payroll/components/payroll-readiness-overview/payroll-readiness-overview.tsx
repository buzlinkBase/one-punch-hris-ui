import { useMemo } from "react";
import { Empty, Skeleton, Tag, Typography, theme } from "antd";
import {
  countByStatus,
  type ReadinessRow,
} from "../../utils/payroll-readiness.util";

const { Text } = Typography;

interface GroupOption {
  value: string;
  label: string;
  fullLabel?: string;
}

interface Props {
  groups: GroupOption[];
  // Every in-scope readiness row of the cutoff, across all groups.
  rows: ReadinessRow[];
  loading?: boolean;
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

// One tile per payroll group with anyone in the cutoff, showing how many employees are ready to
// be paid vs. still waiting -- so the payroll master can see which group to run without opening
// the DTR batches. Clicking a tile selects that group.
export default function PayrollReadinessOverview({
  groups,
  rows,
  loading,
  selectedGroupId,
  onSelect,
}: Props) {
  const { token } = theme.useToken();

  const tiles = useMemo(() => {
    const byGroup = new Map<string, ReadinessRow[]>();
    for (const r of rows) {
      if (!r.payrollGroupId) continue;
      const list = byGroup.get(r.payrollGroupId) ?? [];
      list.push(r);
      byGroup.set(r.payrollGroupId, list);
    }
    return (
      groups
        .filter((g) => byGroup.has(g.value))
        .map((g) => {
          const counts = countByStatus(byGroup.get(g.value)!);
          return {
            ...g,
            counts,
            ready: counts.Ready + counts.Partial,
            waiting: counts.Pending + counts.NoDtr,
            done: counts.Paid + counts.FixedSalaryAlreadyPaid,
            total: byGroup.get(g.value)!.length,
          };
        })
        // Groups with someone to pay first, then by name.
        .sort(
          (a, b) =>
            (b.ready > 0 ? 1 : 0) - (a.ready > 0 ? 1 : 0) ||
            a.label.localeCompare(b.label),
        )
    );
  }, [groups, rows]);

  if (loading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!tiles.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No employees in any payroll group for this cutoff."
      />
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const selected = t.value === selectedGroupId;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onSelect(t.value)}
            className="text-left rounded-lg p-3 cursor-pointer transition-colors"
            style={{
              border: `1px solid ${selected ? token.colorPrimary : token.colorBorderSecondary}`,
              background: selected
                ? token.colorPrimaryBg
                : token.colorBgContainer,
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <Text strong ellipsis>
                {t.label}
              </Text>
              <Text type="secondary" className="text-xs whitespace-nowrap">
                {t.total} {t.total === 1 ? "employee" : "employees"}
              </Text>
            </div>
            {t.fullLabel && (
              <Text type="secondary" className="text-xs block" ellipsis>
                {t.fullLabel}
              </Text>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              <Tag color={t.ready ? "success" : "default"} className="m-0!">
                {t.ready} ready
              </Tag>
              {t.waiting > 0 && (
                <Tag color="warning" className="m-0!">
                  {t.waiting} waiting
                </Tag>
              )}
              {t.done > 0 && <Tag className="m-0!">{t.done} paid</Tag>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
