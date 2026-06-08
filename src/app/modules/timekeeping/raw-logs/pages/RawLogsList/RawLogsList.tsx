import { useState } from "react";
import { Badge, Button, Card, Tabs, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import {
  useRawAttendanceLogs,
  useRawColumnarLogs,
  useCleanRowLogs,
  useCleanColumnarLogs,
} from "../../hooks/useRawLogsQueries";
import RawLogsFilter from "../../components/RawLogsFilter";
import RawAttendanceTable from "../../components/RawAttendanceTable";
import RawColumnarTable from "../../components/RawColumnarTable";
import CleanRowTable from "../../components/CleanRowTable";
import CleanColumnarTable from "../../components/CleanColumnarTable";
import { RAW_LOGS_LABEL } from "../../constants/label.const";
import type { RawLogsFilterRequest } from "../../models/api/response/raw-attendance-log.model";

const { Title } = Typography;

export default function RawLogsList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<RawLogsFilterRequest>({});
  const [activeTab, setActiveTab] = useState("raw-attendance");

  const activeFilterCount = [
    filters.fromDate,
    filters.clientId,
    filters.employeeId,
  ].filter(Boolean).length;

  const { data: rawAttendanceLogs = [], isLoading: rawAttendanceLoading } =
    useRawAttendanceLogs(filters);
  const { data: rawColumnarLogs = [], isLoading: rawColumnarLoading } =
    useRawColumnarLogs(filters);
  const { data: cleanRowLogs = [], isLoading: cleanRowLoading } =
    useCleanRowLogs(filters);
  const { data: cleanColumnarLogs = [], isLoading: cleanColumnarLoading } =
    useCleanColumnarLogs(filters);

  const handleFilter = (newFilters: RawLogsFilterRequest) => {
    setFilters(newFilters);
  };

  const isAnyLoading =
    rawAttendanceLoading ||
    rawColumnarLoading ||
    cleanRowLoading ||
    cleanColumnarLoading;

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {RAW_LOGS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{RAW_LOGS_LABEL.SUBTITLE}</p>
          </div>
          <div className="flex gap-2">
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtersOpen && (
          <Card size="small">
            <RawLogsFilter
              onFilter={handleFilter}
              onReset={() => setFiltersOpen(false)}
              loading={isAnyLoading}
            />
          </Card>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "raw-attendance",
              label: RAW_LOGS_LABEL.TAB_RAW_ATTENDANCE,
              children: (
                <RawAttendanceTable
                  data={rawAttendanceLogs}
                  loading={rawAttendanceLoading}
                />
              ),
            },
            {
              key: "raw-columnar",
              label: RAW_LOGS_LABEL.TAB_RAW_COLUMNAR,
              children: (
                <RawColumnarTable
                  data={rawColumnarLogs}
                  loading={rawColumnarLoading}
                />
              ),
            },
            {
              key: "clean-row",
              label: RAW_LOGS_LABEL.TAB_CLEAN_ROW,
              children: (
                <CleanRowTable data={cleanRowLogs} loading={cleanRowLoading} />
              ),
            },
            {
              key: "clean-columnar",
              label: RAW_LOGS_LABEL.TAB_CLEAN_COLUMNAR,
              children: (
                <CleanColumnarTable
                  data={cleanColumnarLogs}
                  loading={cleanColumnarLoading}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
