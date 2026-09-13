import { useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useReimbursementList } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { ReimbursementListResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useUpdateReimbursementStatus } from "@/app/modules/applications/leave-application/hooks/use-leave-application-queries";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const STATUS_COLOR: Record<ReimbursementListResponse["status"], string> = {
  NotFiled: "default",
  Filed: "processing",
  Reimbursed: "success",
};

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Leave Type",
  "Leave Dates",
  "Release Payroll Date",
  "Government Amount",
  "Status",
  "Filed Date",
  "Received Date",
  "Reference No",
];

const toRows = (records: ReimbursementListResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.leaveDescription,
    `${r.leaveDateFrom} - ${r.leaveDateTo}`,
    r.releasePayrollDate ?? "",
    fmt(r.governmentAmount),
    r.status,
    r.filedDate ?? "",
    r.receivedDate ?? "",
    r.referenceNo ?? "",
  ]);

// Captures the date (and optional reference no.) for whichever transition (Filed/Reimbursed)
// the row's action button triggers — same shape either way, just a different target status.
interface PendingAction {
  row: ReimbursementListResponse;
  targetStatus: "Filed" | "Reimbursed";
}

export default function ReimbursementList() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useReimbursementList(range[0], range[1]);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);
  const { mutateAsync: updateStatus, isPending } =
    useUpdateReimbursementStatus();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionDate, setActionDate] = useState(dayjs());
  const [referenceNo, setReferenceNo] = useState("");

  const openAction = (
    row: ReimbursementListResponse,
    targetStatus: "Filed" | "Reimbursed",
  ) => {
    setPending({ row, targetStatus });
    setActionDate(dayjs());
    setReferenceNo(row.referenceNo ?? "");
  };

  const confirmAction = async () => {
    if (!pending) return;
    const { row, targetStatus } = pending;
    await updateStatus({
      id: row.leaveApplicationId,
      data: {
        status: targetStatus,
        filedDate:
          targetStatus === "Filed"
            ? actionDate.format("YYYY-MM-DD")
            : row.filedDate,
        receivedDate:
          targetStatus === "Reimbursed"
            ? actionDate.format("YYYY-MM-DD")
            : row.receivedDate,
        referenceNo: referenceNo || null,
      },
    });
    setPending(null);
  };

  const columns: ColumnsType<ReimbursementListResponse> = [
    {
      title: "Employee No",
      dataIndex: "employeeNo",
      key: "no",
      width: 120,
      fixed: "left",
    },
    { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
    {
      title: "Leave Type",
      dataIndex: "leaveDescription",
      key: "leave",
      width: 160,
    },
    {
      title: "Leave Dates",
      key: "dates",
      width: 190,
      render: (_, r) =>
        `${dayjs(r.leaveDateFrom).format("MMM DD")} – ${dayjs(r.leaveDateTo).format("MMM DD, YYYY")}`,
    },
    {
      title: "Release Payroll Date",
      dataIndex: "releasePayrollDate",
      key: "release",
      width: 150,
      render: (v: string | null) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Government Amount",
      dataIndex: "governmentAmount",
      key: "amount",
      align: "right",
      width: 150,
      render: fmt,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v: ReimbursementListResponse["status"]) => (
        <Tag color={STATUS_COLOR[v]}>{v === "NotFiled" ? "Not Filed" : v}</Tag>
      ),
    },
    {
      title: "Filed",
      dataIndex: "filedDate",
      key: "filed",
      width: 110,
      render: (v: string | null) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Received",
      dataIndex: "receivedDate",
      key: "received",
      width: 110,
      render: (v: string | null) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Reference No",
      dataIndex: "referenceNo",
      key: "ref",
      width: 140,
      render: (v: string | null) => v || "—",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 160,
      render: (_, r) => (
        <Space size={4}>
          {r.status === "NotFiled" && (
            <Button size="small" onClick={() => openAction(r, "Filed")}>
              Mark Filed
            </Button>
          )}
          {r.status === "Filed" && (
            <Button
              size="small"
              type="primary"
              onClick={() => openAction(r, "Reimbursed")}
            >
              Mark Reimbursed
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.REIMBURSEMENT_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.REIMBURSEMENT_SUBTITLE}
        data={employeeFilter.filtered}
        loading={isLoading}
        columns={columns}
        onRefresh={() => refetch()}
        rowKey={(r) => r.leaveApplicationId}
        exportFileName="reimbursement-list"
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-4 flex-wrap">
              <Form.Item
                label="Release Payroll Date Range"
                className="mb-0"
                style={{ maxWidth: 360 }}
              >
                <MobileRangePicker
                  style={{ width: "100%" }}
                  value={[dayjs(range[0]), dayjs(range[1])]}
                  onChange={(dates) => {
                    if (dates)
                      setRange([
                        dates[0]?.format("YYYY-MM-DD") ?? "",
                        dates[1]?.format("YYYY-MM-DD") ?? "",
                      ]);
                  }}
                />
              </Form.Item>
              <ReportNameFilter
                label="Employee"
                options={employeeFilter.options}
                value={employeeFilter.selected}
                onChange={employeeFilter.setSelected}
              />
            </div>
          </Form>
        }
      />

      <Modal
        open={!!pending}
        title={
          pending?.targetStatus === "Filed"
            ? "Mark Reimbursement Claim as Filed"
            : "Mark Reimbursement as Received"
        }
        onCancel={() => setPending(null)}
        onOk={confirmAction}
        confirmLoading={isPending}
        okText={
          pending?.targetStatus === "Filed" ? "Mark Filed" : "Mark Reimbursed"
        }
      >
        <Form layout="vertical">
          <Form.Item
            label={
              pending?.targetStatus === "Filed" ? "Date Filed" : "Date Received"
            }
          >
            <DatePicker
              style={{ width: "100%" }}
              value={actionDate}
              allowClear={false}
              onChange={(d) => d && setActionDate(d)}
            />
          </Form.Item>
          <Form.Item label="Reference No. (optional)">
            <Input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="SSS claim/transaction reference"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
