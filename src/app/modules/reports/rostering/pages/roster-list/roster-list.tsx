import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Segmented,
  Select,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  CalendarOutlined,
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  TableOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRosterRecords } from "../../hooks/use-roster-queries";
import RosterTable from "../../components/roster-table";
import RosterCalendar from "../../components/roster-calendar";
import {
  ROSTER_LABEL,
  SCHEDULE_SOURCE_LABEL,
} from "../../constants/label.const";
import type { RosterFilter } from "../../models/api/request/roster-filter.model";
import type { RosterResponse } from "../../models/api/response/roster-response.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import {
  buildFlatCsv,
  buildFlatExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title } = Typography;

function getDefaultWeek(): { fromDate: string; toDate: string } {
  const today = dayjs();
  return {
    fromDate: today.startOf("week").format("YYYY-MM-DD"),
    toDate: today.endOf("week").format("YYYY-MM-DD"),
  };
}

const DEFAULT_RANGE = getDefaultWeek();

const ROSTER_HEADERS = [
  "Date",
  "Employee ID",
  "Name",
  "Department",
  "Shift",
  "Shift Start",
  "Shift End",
  "Schedule Source",
  "Rest Day",
];

function toRosterRows(records: RosterResponse[]): string[][] {
  return records.map((r) => [
    r.workDate,
    r.employeeNo,
    r.fullName,
    r.department ?? "",
    r.shiftName,
    r.shiftStart ? dayjs(r.shiftStart).format("hh:mm A") : "",
    r.shiftEnd ? dayjs(r.shiftEnd).format("hh:mm A") : "",
    SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.label ?? r.scheduleSource,
    r.isRestDay ? "Yes" : "No",
  ]);
}

interface Props {
  // Renders without the page-level toolbar (title/subtitle, negative-margin bleed banner)
  // when hosted as a tab elsewhere — e.g. Work Rotation Plan's Roster Report tab — rather
  // than as its own routed page.
  embedded?: boolean;
}

export default function RosterList({ embedded = false }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"table" | "calendar">("calendar");
  const [filter, setFilter] = useState<RosterFilter>(DEFAULT_RANGE);
  const [pending, setPending] = useState<RosterFilter>(DEFAULT_RANGE);
  const [messageApi, contextHolder] = message.useMessage();

  const activeFilterCount = [
    filter.fromDate && filter.toDate ? "date" : null,
    filter.departmentId,
    filter.employeeId,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useRosterRecords(filter);
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployeeFilter(
    pending.departmentId ? { departmentId: pending.departmentId } : {},
  );

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const handleSearch = () => setFilter({ ...pending });

  const handleClear = () => {
    setPending(DEFAULT_RANGE);
    setFilter(DEFAULT_RANGE);
    setFiltersOpen(false);
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No records to export.");
      return;
    }
    const rows = toRosterRows(records);
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(ROSTER_HEADERS, rows),
        `roster-${date}.csv`,
        "text/plain",
      );
    } else {
      triggerDownload(
        buildFlatExcel(ROSTER_HEADERS, rows),
        `roster-${date}.xls`,
        "application/vnd.ms-excel;charset=utf-8;",
      );
    }
  };

  const exportMenu: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  const controls = (
    <div className="flex flex-wrap gap-2">
      <Segmented
        value={view}
        onChange={(v) => setView(v as "table" | "calendar")}
        options={[
          { value: "calendar", icon: <CalendarOutlined /> },
          { value: "table", icon: <TableOutlined /> },
        ]}
      />
      <Dropdown
        menu={{ items: exportMenu }}
        trigger={["click"]}
        disabled={!records.length}
      >
        <Button icon={<DownloadOutlined />} disabled={!records.length}>
          Export
        </Button>
      </Dropdown>
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
  );

  const body = (
    <>
      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
              <Form.Item label="Date Range" className="mb-0 sm:col-span-2">
                <MobileRangePicker
                  style={{ width: "100%" }}
                  value={
                    pending.fromDate && pending.toDate
                      ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                      : null
                  }
                  onChange={(dates) =>
                    setPending((f) => ({
                      ...f,
                      fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                      toDate: dates?.[1]?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={ROSTER_LABEL.FILTER_DEPARTMENT}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All Departments"
                  options={departmentOptions}
                  value={pending.departmentId}
                  onChange={(val) =>
                    setPending((f) => ({
                      ...f,
                      departmentId: val,
                      employeeId: undefined,
                    }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item label={ROSTER_LABEL.FILTER_EMPLOYEE} className="mb-0">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="All Employees"
                  options={employeeOptions}
                  value={pending.employeeId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, employeeId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                icon={<SearchOutlined />}
                type="primary"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {view === "calendar" ? (
        <RosterCalendar
          data={records}
          fromDate={filter.fromDate ?? DEFAULT_RANGE.fromDate}
          toDate={filter.toDate ?? DEFAULT_RANGE.toDate}
        />
      ) : (
        <RosterTable data={records} loading={isLoading} />
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-4">
        {contextHolder}
        <div className="flex justify-end">{controls}</div>
        {body}
      </div>
    );
  }

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ROSTER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View each employee&apos;s assigned shift and rest days for a date
              range, resolved from Work Rotation Plan overrides, Fixed
              Schedules, and permanent shift assignments.
            </p>
          </div>
          {controls}
        </div>
      </div>
      {body}
    </div>
  );
}
