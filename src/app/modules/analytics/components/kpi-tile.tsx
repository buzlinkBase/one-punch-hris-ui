import { Card, Skeleton, Typography } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import {
  CARD_EDGE_TONE_CLASS,
  type CardTone,
} from "@/shared/constants/card-tone.const";
import { DRILL_CLASS, drillProps } from "@/shared/drilldown/drill-props";
import type { DrillAction } from "@/shared/drilldown/use-drill-down";
import type { AnalyticsKpi } from "../models/analytics.model";
import {
  formatValue,
  kpiChange,
  type KpiDirection,
  type KpiTone,
} from "../utils/analytics-format";

const { Text } = Typography;

const TONE_TYPE: Record<KpiTone, "success" | "danger" | "secondary"> = {
  good: "success",
  bad: "danger",
  flat: "secondary",
  neutral: "secondary",
};

// A tile's edge shows how the figure moved: green better, red worse, brand color otherwise.
const CHANGE_TONE_CARD: Record<KpiTone, CardTone> = {
  good: "success",
  bad: "error",
  flat: "primary",
  neutral: "primary",
};

interface KpiTileProps {
  kpi?: AnalyticsKpi;
  direction?: KpiDirection;
  loading?: boolean;
  /** What clicking the tile opens; without one it stays plain. */
  action?: DrillAction;
}

/** One headline figure with its change against the previous period (arrow + text, never color alone). */
export function KpiTile({ kpi, direction, loading, action }: KpiTileProps) {
  if (loading || !kpi) {
    return (
      <Card size="small" className="h-full">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: "50%" }} />
      </Card>
    );
  }

  const change = kpiChange(kpi, direction);
  const Arrow =
    change.trend === "up"
      ? ArrowUpOutlined
      : change.trend === "down"
        ? ArrowDownOutlined
        : MinusOutlined;

  return (
    <Card
      size="small"
      className={`h-full ${CARD_EDGE_TONE_CLASS[CHANGE_TONE_CARD[change.tone]]} ${action ? DRILL_CLASS : ""}`}
      {...drillProps(action)}
    >
      <div className="text-xs text-(--ant-color-text-secondary)">
        {kpi.label}
      </div>
      <div className="mt-1 text-2xl font-semibold leading-tight tabular-nums">
        {formatValue(kpi.value, kpi.unit)}
      </div>
      <div className="mt-1 text-xs">
        {change.text ? (
          <Text type={TONE_TYPE[change.tone]} className="text-xs!">
            <Arrow aria-hidden /> {change.text}{" "}
            <Text type="secondary" className="text-xs!">
              vs previous period
            </Text>
          </Text>
        ) : (
          <Text type="secondary" className="text-xs!">
            No earlier data to compare
          </Text>
        )}
      </div>
    </Card>
  );
}
