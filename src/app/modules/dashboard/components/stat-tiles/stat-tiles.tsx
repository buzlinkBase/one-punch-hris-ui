import { Card, Skeleton } from "antd";
import { DRILL_CLASS, drillProps } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";
import type { DashboardStats } from "../../models/api/response/dashboard-response.model";
import { DASHBOARD_LABEL } from "../../constants/label.const";

interface StatTilesProps {
  stats?: DashboardStats;
  loading?: boolean;
  /** What clicking a tile opens; tiles without an action stay plain. */
  drillAction?: (key: keyof DashboardStats) => DrillAction;
}

const TILES: { key: keyof DashboardStats; label: string; accent: string }[] = [
  {
    key: "totalEmployees",
    label: DASHBOARD_LABEL.TOTAL_EMPLOYEES,
    accent: "text-(--ant-color-primary)",
  },
  {
    key: "presentToday",
    label: DASHBOARD_LABEL.PRESENT_TODAY,
    accent: "text-(--ant-color-success)",
  },
  {
    key: "lateToday",
    label: DASHBOARD_LABEL.LATE_TODAY,
    accent: "text-(--ant-color-warning)",
  },
  {
    key: "absentToday",
    label: DASHBOARD_LABEL.ABSENT_TODAY,
    accent: "text-(--ant-color-error)",
  },
  {
    key: "onLeaveToday",
    label: DASHBOARD_LABEL.ON_LEAVE_TODAY,
    accent: "text-(--ant-color-info)",
  },
  {
    key: "pendingRequests",
    label: DASHBOARD_LABEL.PENDING_REQUESTS,
    accent: "text-(--ant-color-warning)",
  },
  {
    key: "newHiresThisMonth",
    label: DASHBOARD_LABEL.NEW_HIRES,
    accent: "text-(--ant-color-primary)",
  },
];

/** Today's headcount and attendance figures, plus what is waiting for approval. */
export default function StatTiles({
  stats,
  loading,
  drillAction,
}: StatTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {TILES.map((tile) => {
        const action = stats ? drillAction?.(tile.key) : undefined;
        return (
          <Card
            key={tile.key}
            size="small"
            className={`h-full ${action ? DRILL_CLASS : ""}`}
            {...drillProps(action)}
          >
            {loading || !stats ? (
              <Skeleton
                active
                paragraph={{ rows: 1 }}
                title={{ width: "50%" }}
              />
            ) : (
              <>
                <div className="text-xs text-(--ant-color-text-secondary)">
                  {tile.label}
                </div>
                <div
                  className={`mt-1 text-2xl font-semibold leading-tight tabular-nums ${tile.accent}`}
                >
                  {stats[tile.key].toLocaleString()}
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
