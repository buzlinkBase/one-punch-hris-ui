import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Tooltip,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  useAdjustLeaveCredits,
  useLeaveLedger,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { LeaveCreditsBalanceResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Leave Type",
  "Granted",
  "Used",
  "Reserved",
  "Balance",
  "Available to File",
];

const toRows = (records: LeaveCreditsBalanceResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.leaveDescription || r.leaveCode,
    fmt(r.granted),
    fmt(r.used),
    fmt(r.reserved),
    fmt(r.balance),
    fmt(r.availableToFile),
  ]);

interface AdjustFormValues {
  newBalance: number;
  particulars: string;
}

export default function LeaveLedger() {
  const [year, setYear] = useState(dayjs().year());
  const [adjustTarget, setAdjustTarget] =
    useState<LeaveCreditsBalanceResponse | null>(null);
  const [form] = Form.useForm<AdjustFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const { data = [], isLoading, refetch } = useLeaveLedger(year);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);
  const leaveTypeFilter = useReportNameFilter(
    employeeFilter.filtered,
    (r) => r.leaveDescription || r.leaveCode,
  );
  const { mutateAsync: adjustCredits, isPending: isAdjusting } =
    useAdjustLeaveCredits();

  const openAdjustModal = (record: LeaveCreditsBalanceResponse) => {
    setAdjustTarget(record);
    form.setFieldsValue({ newBalance: record.balance, particulars: "" });
  };

  const handleAdjustSubmit = async () => {
    if (!adjustTarget) return;
    const values = await form.validateFields();
    try {
      await adjustCredits({
        employeeId: adjustTarget.employeeId,
        leaveId: adjustTarget.leaveId,
        year,
        newBalance: values.newBalance,
        particulars: values.particulars,
      });
      messageApi.success("Leave credits balance updated.");
      setAdjustTarget(null);
    } catch {
      messageApi.error("Failed to update the balance. Please try again.");
    }
  };

  const columns: ColumnsType<LeaveCreditsBalanceResponse> = [
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
      key: "leaveType",
      width: 180,
      render: (_, r) => r.leaveDescription || r.leaveCode,
    },
    {
      title: "Granted",
      dataIndex: "granted",
      key: "granted",
      align: "right",
      render: fmt,
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      align: "right",
      render: fmt,
    },
    {
      title: "Reserved",
      dataIndex: "reserved",
      key: "reserved",
      align: "right",
      render: fmt,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (v: number) => <strong>{fmt(v)}</strong>,
    },
    {
      title: "Available to File",
      dataIndex: "availableToFile",
      key: "available",
      align: "right",
      render: fmt,
    },
    {
      title: "",
      key: "adjust",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="Adjust balance">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openAdjustModal(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.LEAVE_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.LEAVE_SUBTITLE}
        data={leaveTypeFilter.filtered}
        loading={isLoading}
        columns={columns}
        onRefresh={() => refetch()}
        rowKey={(r) => `${r.employeeId}-${r.leaveId}`}
        exportFileName={`leave-ledger-${year}`}
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-4 flex-wrap">
              <Form.Item
                label="Year"
                className="mb-0"
                style={{ maxWidth: 180 }}
              >
                <DatePicker
                  picker="year"
                  style={{ width: "100%" }}
                  value={dayjs().year(year)}
                  allowClear={false}
                  onChange={(date) => date && setYear(date.year())}
                />
              </Form.Item>
              <ReportNameFilter
                label="Employee"
                options={employeeFilter.options}
                value={employeeFilter.selected}
                onChange={employeeFilter.setSelected}
              />
              <ReportNameFilter
                label="Leave Type"
                options={leaveTypeFilter.options}
                value={leaveTypeFilter.selected}
                onChange={leaveTypeFilter.setSelected}
              />
            </div>
          </Form>
        }
      />

      <Modal
        title="Adjust Leave Credits Balance"
        open={!!adjustTarget}
        onCancel={() => setAdjustTarget(null)}
        onOk={handleAdjustSubmit}
        okText="Save"
        confirmLoading={isAdjusting}
        destroyOnClose
      >
        {adjustTarget && (
          <Form form={form} layout="vertical">
            <p className="text-sm text-gray-500">
              {adjustTarget.fullName} —{" "}
              {adjustTarget.leaveDescription || adjustTarget.leaveCode} ({year})
              <br />
              Current balance: <strong>{fmt(adjustTarget.balance)}</strong>
            </p>
            <Form.Item
              name="newBalance"
              label="New Balance"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber style={{ width: "100%" }} step={0.5} />
            </Form.Item>
            <Form.Item
              name="particulars"
              label="Reason"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="e.g. Correcting balance carried over from previous system"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
