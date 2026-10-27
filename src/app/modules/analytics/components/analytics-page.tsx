import { useMemo } from "react";
import { Alert, Button, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import dayjs from "dayjs";
import { authStorage } from "@/core/auth/auth-storage";
import { useDrillDown } from "@/shared/drilldown/use-drill-down";
import { downloadMultiSheetExcel } from "@/shared/utils/export.utils";
import type {
  AnalyticsArea,
  AnalyticsFilter,
  AnalyticsSeries,
} from "../models/analytics.model";
import { useAnalytics } from "../hooks/use-analytics-queries";
import { filterFromSearch, filterToSearch } from "../utils/analytics-filter";
import type { KpiDirection } from "../utils/analytics-format";
import { buildAnalyticsSheets } from "../utils/analytics-export";
import type { AnalyticsDrill } from "../utils/analytics-drill";
import type { TrendChartKind } from "./charts/trend-chart";
import { AnalyticsFilters } from "./analytics-filters";
import { KpiTile } from "./kpi-tile";
import { ChartCard } from "./chart-card";
import { BreakdownTable } from "./breakdown-table";

const { Title } = Typography;

export interface AnalyticsChartConfig {
  title: string;
  kind: TrendChartKind;
  /** Series keys from the API, in color order. All must share one unit. */
  series: string[];
}

/** What makes one Analytics area different from the others -- the page itself is shared. */
export interface AnalyticsPageConfig {
  area: AnalyticsArea;
  title: string;
  subtitle: string;
  exportPermission: string;
  /** Whether a rise is good news, per KPI key; anything missing is neutral. */
  kpiDirections?: Record<string, KpiDirection>;
  charts: AnalyticsChartConfig[];
  /** Shown above the figures, e.g. how a number is counted. */
  note?: string;
  /** Where the figures drill into; figures it leaves out stay plain. */
  drill?: AnalyticsDrill;
}

const KPI_SKELETONS = 5;

function pickSeries(all: AnalyticsSeries[], keys: string[]): AnalyticsSeries[] {
  return keys
    .map((key) => all.find((s) => s.key === key))
    .filter((s): s is AnalyticsSeries => s !== undefined);
}

/** An Analytics page: filters, headline figures, monthly charts, breakdown tables, Excel export. */
export function AnalyticsPage({ config }: { config: AnalyticsPageConfig }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const filter = useMemo(() => filterFromSearch(search), [search]);
  const { data, isLoading, isFetching, isError, refetch } = useAnalytics(
    config.area,
    filter,
  );

  const setFilter = (next: AnalyticsFilter) =>
    navigate({ to: pathname, search: filterToSearch(next), replace: true });

  // Figures open the list behind them -- only for screens this person may open. Drills use the
  // range the figures actually cover, which the API may have shortened.
  const { action } = useDrillDown();
  const drill = config.drill;
  const covered: AnalyticsFilter = data
    ? { ...filter, from: data.from, to: data.to }
    : filter;
  const pointAction = drill?.series
    ? (period: string, seriesKey: string) =>
        action(drill.series?.[seriesKey]?.(period, covered))
    : undefined;

  const canExport = authStorage.hasAnyPermission(config.exportPermission);
  const exportExcel = () => {
    if (!data) return;
    void downloadMultiSheetExcel(
      buildAnalyticsSheets(data),
      `${config.title} ${data.from} to ${data.to}.xlsx`,
    );
  };

  // The API caps a range at 24 months -- say so when it moved the start date.
  const cappedFrom =
    data && data.from !== filter.from && data.to === filter.to
      ? data.from
      : null;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {config.title}
            </Title>
            <p className="page-toolbar-subtitle">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
            {canExport && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportExcel}
                disabled={!data}
              >
                Export to Excel
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnalyticsFilters value={filter} onChange={setFilter} />

      {isError && (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="Couldn't load these figures. Try Refresh, or narrow the date range."
        />
      )}
      {cappedFrom && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message={`Showing the most recent 24 months, from ${dayjs(cappedFrom).format("MMM D, YYYY")}.`}
        />
      )}
      {config.note && (
        <p className="mb-4 text-xs text-(--ant-color-text-secondary)">
          {config.note}
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {isLoading || !data
          ? Array.from({ length: KPI_SKELETONS }, (_, i) => (
              <KpiTile key={i} loading />
            ))
          : data.kpis.map((kpi) => (
              <KpiTile
                key={kpi.key}
                kpi={kpi}
                direction={config.kpiDirections?.[kpi.key]}
                action={action(drill?.kpis?.[kpi.key]?.(covered))}
              />
            ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {config.charts.map((chart, i) => (
          <ChartCard
            key={chart.title}
            title={chart.title}
            kind={chart.kind}
            points={data?.series ?? []}
            series={pickSeries(data?.seriesDefinitions ?? [], chart.series)}
            loading={isLoading}
            pointAction={pointAction}
            className={
              // A lone last chart takes the full row.
              i === config.charts.length - 1 && i % 2 === 0
                ? "xl:col-span-2"
                : undefined
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {(data?.breakdowns ?? []).map((b) => (
          <BreakdownTable
            key={b.key}
            breakdown={b}
            loading={isLoading}
            rowAction={(row) =>
              action(drill?.breakdowns?.[b.key]?.(row, covered))
            }
          />
        ))}
      </div>
    </div>
  );
}
