import { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Select,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AttendanceEntryTable from "../../components/AttendanceEntryTable";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";
import {
  useAttendanceEntryEmployees,
  useAttendanceEntryRecords,
  useDeleteAttendanceEntryLog,
} from "../../hooks/useAttendanceEntryQueries";
import type { AttendanceEntryFilter } from "../../models/api/request/attendance-entry-filter.model";

const { Title } = Typography;

export default function AttendanceEntryList() {
  const [filter, setFilter] = useState<AttendanceEntryFilter>({});
  const [pending, setPending] = useState<AttendanceEntryFilter>({});
  const [isExporting, setIsExporting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: records = [], isLoading } = useAttendanceEntryRecords(filter);
  const {
    data: allRecords = [],
    isLoading: isAllRecordsLoading,
    isFetching: isAllRecordsFetching,
  } = useAttendanceEntryRecords();
  const { data: employees = [] } = useAttendanceEntryEmployees();
  const { mutateAsync: removeLog, isPending: isDeleting } =
    useDeleteAttendanceEntryLog();

  const isDateRangeInvalid = useMemo(() => {
    if (!pending.fromDate || !pending.toDate) return false;
    return pending.fromDate > pending.toDate;
  }, [pending.fromDate, pending.toDate]);

  const handleSearch = () => {
    if (isDateRangeInvalid) {
      messageApi.warning("Date To must be greater than or equal to Date From.");
      return;
    }

    setFilter(pending);
  };

  const handleClear = () => {
    setPending({});
    setFilter({});
  };

  const handleDelete = async (id: string) => {
    await removeLog(id);
    messageApi.success("Time log deleted.");
  };

  const downloadFile = (
    content: string,
    mimeType: string,
    extension: "csv" | "xls",
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-entry-log-${dayjs().format("YYYYMMDD-HHmmss")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const buildCsv = () => {
    const header = ["Employee ID", "Employee", "Time Log"];
    const rows = allRecords.map((record) => [
      record.employeeId,
      record.employeeName,
      record.timeLog,
    ]);

    return [header, ...rows]
      .map((line) =>
        line
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildExcelTable = () => {
    const rows = allRecords
      .map(
        (record) =>
          `<tr><td>${escapeHtml(record.employeeId)}</td><td>${escapeHtml(record.employeeName)}</td><td>${escapeHtml(record.timeLog)}</td></tr>`,
      )
      .join("");

    return `<html><head><meta charset="utf-8" /></head><body><table><thead><tr><th>Employee ID</th><th>Employee</th><th>Time Log</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!allRecords.length) {
      messageApi.info("No records available for export.");
      return;
    }

    setIsExporting(true);

    if (format === "csv") {
      const csv = buildCsv();
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`,
      );
      element.setAttribute(
        "download",
        `attendance-${new Date().toISOString().split("T")[0]}.csv`,
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (format === "excel") {
      downloadFile(
        buildExcelTable(),
        "application/vnd.ms-excel;charset=utf-8;",
        "xls",
      );
      setIsExporting(false);
      return;
    }

    downloadFile(buildCsv(), "text/csv;charset=utf-8;", "csv");
    setIsExporting(false);
  };

  const isExportDisabled =
    isExporting ||
    isAllRecordsLoading ||
    isAllRecordsFetching ||
    !allRecords.length;

  const exportMenuItems: MenuProps["items"] = [
    {
      key: "csv",
      label: "Export as CSV",
      onClick: () => handleExport("csv"),
    },
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
              {ATTENDANCE_ENTRY_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              View and maintain attendance logs per employee, then export the
              complete time log file when needed.
            </p>
          </div>
          <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              loading={isExporting}
              disabled={isExportDisabled}
            >
              Export Log
            </Button>
          </Dropdown>
        </div>
      </div>

      <Form layout="inline" className="mb-4 flex flex-wrap gap-2">
        <Form.Item label={ATTENDANCE_ENTRY_LABEL.FILTER_DATE_FROM}>
          <DatePicker
            value={pending.fromDate ? dayjs(pending.fromDate) : null}
            onChange={(date) =>
              setPending((current) => ({
                ...current,
                fromDate: date?.format("YYYY-MM-DD"),
              }))
            }
          />
        </Form.Item>
        <Form.Item label={ATTENDANCE_ENTRY_LABEL.FILTER_DATE_TO}>
          <DatePicker
            value={pending.toDate ? dayjs(pending.toDate) : null}
            onChange={(date) =>
              setPending((current) => ({
                ...current,
                toDate: date?.format("YYYY-MM-DD"),
              }))
            }
          />
        </Form.Item>
        <Form.Item label={ATTENDANCE_ENTRY_LABEL.FILTER_EMPLOYEE}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="All Employees"
            options={employees}
            value={pending.employeeId}
            onChange={(value) =>
              setPending((current) => ({ ...current, employeeId: value }))
            }
            style={{ width: 220 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={handleSearch}
          >
            Filter
          </Button>
        </Form.Item>
        <Form.Item>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Clear
          </Button>
        </Form.Item>
      </Form>

      <AttendanceEntryTable
        data={records}
        loading={isLoading || isDeleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
