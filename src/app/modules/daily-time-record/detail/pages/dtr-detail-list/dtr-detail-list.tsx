import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDtrDetailRecords } from "../../hooks/use-dtr-detail-queries";
import DtrDetailTable from "../../components/dtr-detail-table";
import { DTR_DETAIL_LABEL } from "../../constants/label.const";
import type { DtrDetailFilter } from "../../models/api/request/dtr-detail-filter.model";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const { Title } = Typography;

function currentSemiMonthlyRange(): { fromDate: string; toDate: string } {
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

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const EMPTY_FILTER: DtrDetailFilter = {};

export default function DtrDetailList() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [pending, setPending] = useState<DtrDetailFilter>(
    currentSemiMonthlyRange,
  );
  const [committedFilter, setCommittedFilter] =
    useState<DtrDetailFilter | null>(null);
  const [generateKey, setGenerateKey] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  const hasGenerated = committedFilter !== null;

  const isDateRangeInvalid =
    !!pending.fromDate && !!pending.toDate && pending.fromDate > pending.toDate;

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employeeData = [] } = useEmployeeFilter();

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));
  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const payrollGrpOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));
  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));
  const employeeOptions = employeeData.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const { data: records = [], isLoading } = useDtrDetailRecords(
    committedFilter ?? EMPTY_FILTER,
    { enabled: hasGenerated, generateKey },
  );

  const activeFilterCount = [
    pending.fromDate,
    pending.toDate,
    pending.branchId,
    pending.departmentId,
    pending.clientId,
    pending.payrollGroupId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  const handleGenerate = () => {
    if (!pending.fromDate || !pending.toDate) {
      messageApi.warning("From Date and To Date are required.");
      return;
    }
    if (isDateRangeInvalid) {
      messageApi.warning("To Date must be ≥ From Date.");
      return;
    }
    setCommittedFilter({ ...pending });
    setGenerateKey((k) => k + 1);
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setCommittedFilter(null);
    setGenerateKey(0);
  };

  // ── Export ──────────────────────────────────────────────────────────────────

  type AnyRow = Record<string, unknown>;

  const toExportRows = (): AnyRow[] =>
    records.map((r: DtrDetailResponse) => ({
      Employee: r.fullName,
      BioID: r.bioId,
      WorkType: r.workType,
      AttStatus: r.attStatus,
      RecordStatus: r.recordStatus,
      WorkDate: r.workDate,
      ShiftName: r.shiftName,
      Start: r.startTime ? dayjs(r.startTime).format("HH:mm") : "",
      End: r.endTime ? dayjs(r.endTime).format("HH:mm") : "",
      // Minutes
      Late_min: r.lateMinutes,
      UT_min: r.utMinutes,
      OverBreak_min: r.overBreakMinutes,
      OT_min: r.otMinutes,
      ND_min: r.nd,
      ND_OT_min: r.ndot,
      LH_min: r.lh,
      SP_min: r.sp,
      Leave_min: r.leaveMinutes,
      // Hours – regular
      RegNet_hr: r.regularNetHours,
      RegOT_hr: r.regularOTHours,
      RegND_hr: r.regularNDHours,
      RegND_OT_hr: r.regularNDOTHours,
      // Hours – rest day
      RD_hr: r.restDayHours,
      RD_OT_hr: r.restDayOTHours,
      RD_ND_hr: r.restDayNDHours,
      RD_ND_OT_hr: r.restDayNDOTHours,
      // Hours – legal holiday
      LH_hr: r.legalHolHours,
      LH_OT_hr: r.legalHolOTHours,
      LH_ND_hr: r.legalHolNightDiffHours,
      LH_ND_OT_hr: r.legalHolNightDiffOTHours,
      // Hours – special holiday
      SPH_hr: r.specialHolHours,
      SPH_OT_hr: r.specialHolOTHours,
      SPH_ND_hr: r.specialHolNightDiffHours,
      SPH_ND_OT_hr: r.specialHolNightDiffOTHours,
      // Hours – rest + legal/special
      RestLegal_hr: r.restLegalDayHours,
      RestLegal_OT_hr: r.restLegalDayOTHours,
      RestLegal_ND_hr: r.restLegalDayNDHours,
      RestLegal_ND_OT_hr: r.restLegalDayNDOTHours,
      RestSpecial_hr: r.restSpecialDayHours,
      RestSpecial_OT_hr: r.restSpecialDayOTHours,
      RestSpecial_ND_hr: r.restSpecialDayNDHours,
      RestSpecial_ND_OT_hr: r.restSpecialDayNDOTHours,
    }));

  const buildCsv = (rows: AnyRow[]): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    return [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
  };

  const escapeHtml = (v: string) =>
    v
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildExcel = (rows: AnyRow[]): string => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
    const trs = rows
      .map(
        (r) =>
          `<tr>${headers.map((h) => `<td>${escapeHtml(String(r[h] ?? ""))}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<html><head><meta charset="utf-8"/></head><body><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
  };

  const handleExport = (format: "csv" | "excel") => {
    const rows = toExportRows();
    if (!rows.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    const date = dayjs().format("YYYYMMDD");
    if (format === "csv") {
      const a = document.createElement("a");
      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(buildCsv(rows))}`;
      a.download = `dtr-detail-${date}.csv`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([buildExcel(rows)], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dtr-detail-${date}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const exportMenuItems: MenuProps["items"] = [
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
              {DTR_DETAIL_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View per-day time record details including minutes and hours
              breakdowns for each employee.
            </p>
          </div>
          <Space>
            <Dropdown
              menu={{ items: exportMenuItems }}
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
          </Space>
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_FROM_DATE}
                className="mb-3"
                required
                validateStatus={!pending.fromDate ? "error" : ""}
                help={!pending.fromDate ? "Required" : undefined}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  status={!pending.fromDate ? "error" : undefined}
                  value={pending.fromDate ? dayjs(pending.fromDate) : null}
                  onChange={(d) =>
                    setPending((f) => ({
                      ...f,
                      fromDate: d?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_TO_DATE}
                className="mb-3"
                required
                validateStatus={
                  !pending.toDate || isDateRangeInvalid ? "error" : ""
                }
                help={
                  !pending.toDate
                    ? "Required"
                    : isDateRangeInvalid
                      ? "Must be ≥ From Date"
                      : undefined
                }
              >
                <DatePicker
                  style={{ width: "100%" }}
                  status={
                    !pending.toDate || isDateRangeInvalid ? "error" : undefined
                  }
                  value={pending.toDate ? dayjs(pending.toDate) : null}
                  onChange={(d) =>
                    setPending((f) => ({
                      ...f,
                      toDate: d?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Branch" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All branches"
                  options={branchOptions}
                  value={pending.branchId}
                  onChange={(v) => setPending((f) => ({ ...f, branchId: v }))}
                />
              </Form.Item>
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_DEPARTMENT}
                className="mb-3"
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All departments"
                  options={deptOptions}
                  value={pending.departmentId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, departmentId: v }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_CLIENT}
                className="mb-3"
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All clients"
                  options={clientOptions}
                  value={pending.clientId}
                  onChange={(v) => setPending((f) => ({ ...f, clientId: v }))}
                />
              </Form.Item>
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_PAYROLL_GROUP}
                className="mb-3"
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All payroll groups"
                  options={payrollGrpOptions}
                  value={pending.payrollGroupId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, payrollGroupId: v }))
                  }
                />
              </Form.Item>
              <Form.Item label="Operation Area" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All areas"
                  options={areaOptions}
                  value={pending.operationAreaId}
                  onChange={(v) =>
                    setPending((f) => ({ ...f, operationAreaId: v }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={DTR_DETAIL_LABEL.FILTER_EMPLOYEE}
                className="mb-3"
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={filterByLabel}
                  placeholder="All employees"
                  options={employeeOptions}
                  value={pending.employeeId}
                  onChange={(v) => setPending((f) => ({ ...f, employeeId: v }))}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={isLoading}
                disabled={
                  !pending.fromDate || !pending.toDate || isDateRangeInvalid
                }
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <DtrDetailTable data={records} loading={isLoading} />
    </div>
  );
}
