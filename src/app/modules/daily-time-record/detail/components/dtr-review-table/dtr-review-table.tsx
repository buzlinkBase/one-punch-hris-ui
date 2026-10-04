import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, WarningOutlined } from "@ant-design/icons";
import DtrDetailTable from "../dtr-detail-table";
import {
  COVERAGE_STATUS_COLOR,
  COVERAGE_STATUS_HINT,
  COVERAGE_STATUS_LABEL,
  SAVE_STATE_COLOR,
  SAVE_STATE_LABEL,
  hasIssues,
  type CoverageStatus,
  type EmployeeDtrSummary,
} from "../../utils/dtr-coverage.util";

const { Text } = Typography;

type Filter = "all" | "toSave" | "issues" | "saved";

interface Props {
  summaries: EmployeeDtrSummary[];
  coverageById: Map<string, CoverageStatus>;
  loading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  // Refetch after a row action (change shift, rest day...) in an expanded employee.
  onChanged?: () => void;
  dateFrom?: string;
  dateTo?: string;
}

const num = (v: number, digits = 1) =>
  v ? (
    <Text>{Number.isInteger(v) ? v : v.toFixed(digits)}</Text>
  ) : (
    <Text type="secondary">—</Text>
  );

// The generated DTR, one row per employee with their cutoff totals. Expanding a row shows that
// employee's daily rows (with the usual attendance / shift / rest-day actions). Employees whose
// days are all saved already can't be ticked; everyone else is ticked by default.
export default function DtrReviewTable({
  summaries,
  coverageById,
  loading,
  selectedIds,
  onSelectionChange,
  onChanged,
  dateFrom,
  dateTo,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const toSaveIds = useMemo(
    () =>
      summaries
        .filter((s) => s.saveState !== "AlreadySaved")
        .map((s) => s.employeeId),
    [summaries],
  );
  const counts = useMemo(
    () => ({
      all: summaries.length,
      toSave: toSaveIds.length,
      issues: summaries.filter(hasIssues).length,
      saved: summaries.length - toSaveIds.length,
    }),
    [summaries, toSaveIds],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return summaries.filter((s) => {
      if (filter === "toSave" && s.saveState === "AlreadySaved") return false;
      if (filter === "issues" && !hasIssues(s)) return false;
      if (filter === "saved" && s.saveState !== "AlreadySaved") return false;
      return !q || s.fullName.toLowerCase().includes(q);
    });
  }, [summaries, filter, search]);

  const columns: ColumnsType<EmployeeDtrSummary> = [
    {
      title: "Employee",
      key: "employee",
      fixed: "left",
      width: 220,
      render: (_, s) => <Text>{s.fullName}</Text>,
    },
    {
      title: "Save",
      key: "saveState",
      width: 150,
      render: (_, s) => (
        <Tooltip
          title={
            s.saveState === "FillsMissing"
              ? `${s.savedDays} day(s) already saved are skipped; ${s.newDays} new day(s) will be saved.`
              : s.saveState === "AlreadySaved"
                ? "Every generated day already has saved DTR."
                : undefined
          }
        >
          <Tag color={SAVE_STATE_COLOR[s.saveState]}>
            {s.saveState === "FillsMissing"
              ? `Saves ${s.newDays} missing day${s.newDays !== 1 ? "s" : ""}`
              : SAVE_STATE_LABEL[s.saveState]}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Current status",
      key: "coverage",
      width: 150,
      render: (_, s) => {
        const status = coverageById.get(s.employeeId) ?? "NotGenerated";
        return (
          <Tooltip title={COVERAGE_STATUS_HINT[status]}>
            <Tag color={COVERAGE_STATUS_COLOR[status]}>
              {COVERAGE_STATUS_LABEL[status]}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Issues",
      key: "issues",
      width: 210,
      render: (_, s) =>
        hasIssues(s) ? (
          <Space size={4} wrap>
            {s.missingPunchDays > 0 && (
              <Tooltip title="Days with a time-in but no time-out (or the reverse). Expand the row to check the logs.">
                <Tag color="warning" icon={<WarningOutlined />}>
                  {s.missingPunchDays} missing punch
                  {s.missingPunchDays !== 1 ? "es" : ""}
                </Tag>
              </Tooltip>
            )}
            {s.absences > 0 && (
              <Tag color="warning">
                {s.absences} absent day{s.absences !== 1 ? "s" : ""}
              </Tag>
            )}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Days",
      key: "days",
      width: 70,
      align: "right",
      render: (_, s) => num(s.days),
    },
    {
      title: "Reg hrs",
      key: "reg",
      width: 80,
      align: "right",
      render: (_, s) => num(s.regularHours),
    },
    {
      title: "OT hrs",
      key: "ot",
      width: 75,
      align: "right",
      render: (_, s) => num(s.otHours),
    },
    {
      title: "ND hrs",
      key: "nd",
      width: 75,
      align: "right",
      render: (_, s) => num(s.ndHours),
    },
    {
      title: "Late (min)",
      key: "late",
      width: 90,
      align: "right",
      render: (_, s) => num(s.lateMinutes, 0),
    },
    {
      title: "UT (min)",
      key: "ut",
      width: 85,
      align: "right",
      render: (_, s) => num(s.utMinutes, 0),
    },
    {
      title: "Leave hrs",
      key: "leave",
      width: 85,
      align: "right",
      render: (_, s) => num(s.leaveHours),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="overflow-x-auto">
          <Segmented
            size="small"
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "toSave", label: `To save (${counts.toSave})` },
              { value: "issues", label: `With issues (${counts.issues})` },
              { value: "saved", label: `Already saved (${counts.saved})` },
            ]}
          />
        </div>
        <Space wrap>
          <Button
            size="small"
            disabled={!toSaveIds.length}
            onClick={() => onSelectionChange(toSaveIds)}
          >
            Select all to save ({toSaveIds.length})
          </Button>
          <Button
            size="small"
            disabled={!selectedIds.length}
            onClick={() => onSelectionChange([])}
          >
            Clear
          </Button>
          <Input
            size="small"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search employee"
            style={{ width: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Space>
      </div>

      <Table
        rowKey="employeeId"
        size="small"
        loading={loading}
        dataSource={visible}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          hideOnSinglePage: true,
        }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          preserveSelectedRowKeys: true,
          onChange: (keys) => onSelectionChange(keys as string[]),
          getCheckboxProps: (s) => ({
            disabled: s.saveState === "AlreadySaved",
          }),
        }}
        expandable={{
          expandedRowRender: (s) => (
            <DtrDetailTable
              data={s.rows}
              onChanged={onChanged}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          ),
        }}
      />
    </div>
  );
}
