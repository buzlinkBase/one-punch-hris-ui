import { useMemo } from "react";
import { Empty, Skeleton, Tag, Typography, theme } from "antd";
import {
  countByCoverage,
  type CoverageRow,
} from "../../utils/dtr-coverage.util";

const { Text } = Typography;

interface GroupOption {
  value: string;
  label: string;
  fullLabel?: string;
}

interface Props {
  groups: GroupOption[];
  // Every in-scope coverage row of the cutoff, across all groups.
  rows: CoverageRow[];
  loading?: boolean;
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

// One tile per payroll group showing how many employees still need DTR for the cutoff vs. how
// many are saved -- so the user knows which group to generate without opening Saved DTR.
// Clicking a tile selects that group. Same look as the Payroll Run screen's readiness tiles.
export default function DtrCoverageOverview({
  groups,
  rows,
  loading,
  selectedGroupId,
  onSelect,
}: Props) {
  const { token } = theme.useToken();

  const tiles = useMemo(() => {
    const byGroup = new Map<string, CoverageRow[]>();
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
          const list = byGroup.get(g.value)!;
          const counts = countByCoverage(list);
          return {
            ...g,
            total: list.length,
            needDtr: counts.NotGenerated + counts.Partial,
            drafts: counts.Draft,
            approved: counts.Approved,
          };
        })
        // Groups with someone still needing DTR first, then by name.
        .sort(
          (a, b) =>
            (b.needDtr > 0 ? 1 : 0) - (a.needDtr > 0 ? 1 : 0) ||
            a.label.localeCompare(b.label),
        )
    );
  }, [groups, rows]);

  if (loading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!tiles.length)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No active employees in any payroll group for this cutoff."
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
              <Tag color={t.needDtr ? "error" : "default"} className="m-0!">
                {t.needDtr} need DTR
              </Tag>
              {t.drafts > 0 && (
                <Tag color="processing" className="m-0!">
                  {t.drafts} awaiting approval
                </Tag>
              )}
              {t.approved > 0 && (
                <Tag color="success" className="m-0!">
                  {t.approved} approved
                </Tag>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
