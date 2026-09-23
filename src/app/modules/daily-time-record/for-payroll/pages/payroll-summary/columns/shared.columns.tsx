import { Button, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

export const statusColumn: ColumnsType<PayrollRunResult>[number] = {
  title: "Status",
  key: "status",
  width: 90,
  render: (_, r) =>
    r.id ? (
      <Tag color={r.isPosted ? "success" : "default"}>
        {r.isPosted ? "Posted" : "Draft"}
      </Tag>
    ) : null,
};

// Setup > Payslip/13th Month/Last Pay > Received by Employee — informational only; HR has
// no action to take here, just visibility into whether/when the employee acknowledged.
export const acknowledgedColumn: ColumnsType<PayrollRunResult>[number] = {
  title: "Received",
  key: "acknowledged",
  width: 110,
  render: (_, r) =>
    r.id ? (
      r.acknowledgedAt ? (
        <Tooltip
          title={`Acknowledged ${dayjs(r.acknowledgedAt).format("MMM D, YYYY h:mm A")}`}
        >
          <Tag icon={<CheckCircleOutlined />} color="success">
            Acknowledged
          </Tag>
        </Tooltip>
      ) : (
        <Tag color="default">Pending</Tag>
      )
    ) : null,
};

// Print is the only per-row action left — Approve/Decline/Delete are run-level transactions
// handled from the Saved Payroll Runs tab (see PayrollBatchesTab).
export const actionsColumn = (
  onPrint: (r: PayrollRunResult) => void,
): ColumnsType<PayrollRunResult>[number] => ({
  title: "",
  key: "actions",
  width: 48,
  fixed: "right",
  render: (_, r) => (
    <PermissionGate permission="Payroll Summary:Export">
      <Tooltip
        title={r.id ? "Print payslip" : "Not yet available for this record"}
      >
        <Button
          type="text"
          size="small"
          icon={<PrinterOutlined />}
          disabled={!r.id}
          onClick={() => onPrint(r)}
        />
      </Tooltip>
    </PermissionGate>
  ),
});
