import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Select,
  Tabs,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTardinessRecords } from "../../hooks/use-tardiness-queries";

function getSemiMonthlyCutoff(): { fromDate: string; toDate: string } {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

const DEFAULT_CUTOFF = getSemiMonthlyCutoff();
import TardinessTable from "../../components/tardiness-table";
import TardinessSummaryTable from "../../components/tardiness-summary-table/tardiness-summary-table";
import { TARDINESS_LABEL } from "../../constants/label.const";
import type { TardinessFilter } from "../../models/api/request/tardiness-filter.model";
import type { TardinessResponse } from "../../models/api/response/tardiness-response.model";

const { Title } = Typography;

const DEPARTMENT_OPTIONS = [
  { value: "dept-1", label: "HR" },
  { value: "dept-2", label: "Finance" },
  { value: "dept-3", label: "Operations" },
  { value: "dept-4", label: "IT" },
];

const EMPLOYEE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: `emp-${1001 + i}`,
  label: `Employee ${i + 1}`,
}));

function escapeHtml(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildCsv(records: TardinessResponse[]) {
  const header = [
    "Date",
    "Employee ID",
    "Name",
    "Department",
    "Scheduled In",
    "Actual In",
    "Grace Period (Mins)",
    "Tardiness (Mins)",
    "Deductible (Mins)",
  ];
  const rows = records.map((r) => [
    r.workDate,
    r.employeeNo,
    r.fullName ?? "",
    r.department ?? "",
    r.scheduledIn,
    r.actualIn ?? "",
    String(r.gracePeriodMinutes),
    String(r.tardinessMinutes),
    String(r.deductibleMinutes),
  ]);
  return [header, ...rows]
    .map((line) => line.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function buildExcel(records: TardinessResponse[]) {
  const th = (v: string) => `<th>${escapeHtml(v)}</th>`;
  const td = (v: string) => `<td>${escapeHtml(v)}</td>`;
  const header = [
    "Date",
    "Employee ID",
    "Name",
    "Department",
    "Scheduled In",
    "Actual In",
    "Grace Period (Mins)",
    "Tardiness (Mins)",
    "Deductible (Mins)",
  ]
    .map(th)
    .join("");
  const body = records
    .map(
      (r) =>
        `<tr>${[
          r.workDate,
          r.employeeNo,
          r.fullName ?? "",
          r.department ?? "",
          r.scheduledIn,
          r.actualIn ?? "",
          String(r.gracePeriodMinutes),
          String(r.tardinessMinutes),
          String(r.deductibleMinutes),
        ]
          .map(td)
          .join("")}</tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"/></head><body><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

export default function TardinessList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState<TardinessFilter>(DEFAULT_CUTOFF);
  const [pending, setPending] = useState<TardinessFilter>(DEFAULT_CUTOFF);
  const [messageApi, contextHolder] = message.useMessage();

  const activeFilterCount = [
    filter.fromDate && filter.toDate ? "date" : null,
    filter.departmentId,
    filter.employeeId,
    filter.payrollGroupId,
  ].filter(Boolean).length;

  const { data: records = [], isLoading } = useTardinessRecords(filter);

  const handleSearch = () => setFilter({ ...pending });

  const handleClear = () => {
    setPending(DEFAULT_CUTOFF);
    setFilter(DEFAULT_CUTOFF);
    setFiltersOpen(false);
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No records to export.");
      return;
    }
    if (format === "csv") {
      const a = document.createElement("a");
      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(buildCsv(records))}`;
      a.download = `tardiness-${dayjs().format("YYYYMMDD")}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([buildExcel(records)], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tardiness-${dayjs().format("YYYYMMDD")}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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

  return (
    <div className="content-page">
      {contextHolder}
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {TARDINESS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View employee tardiness records including late arrivals and
              deductible minutes.
            </p>
          </div>
          <div className="flex gap-2">
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
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
              <Form.Item label="Date Range" className="mb-0 sm:col-span-2">
                <DatePicker.RangePicker
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
                label={TARDINESS_LABEL.FILTER_DEPARTMENT}
                className="mb-0"
              >
                <Select
                  allowClear
                  placeholder="All Departments"
                  options={DEPARTMENT_OPTIONS}
                  value={pending.departmentId}
                  onChange={(val) =>
                    setPending((f) => ({ ...f, departmentId: val }))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={TARDINESS_LABEL.FILTER_EMPLOYEE}
                className="mb-0"
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="All Employees"
                  options={EMPLOYEE_OPTIONS}
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

      <Tabs
        items={[
          {
            key: "details",
            label: "Details",
            children: <TardinessTable data={records} loading={isLoading} />,
          },
          {
            key: "summary",
            label: "Summary",
            children: (
              <TardinessSummaryTable data={records} loading={isLoading} />
            ),
          },
        ]}
      />
    </div>
  );
}
