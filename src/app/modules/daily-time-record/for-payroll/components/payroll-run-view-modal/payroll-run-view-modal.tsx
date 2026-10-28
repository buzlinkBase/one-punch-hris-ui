import { Modal } from "antd";
import dayjs from "dayjs";
import { PayrollSummaryContent } from "../../pages/payroll-summary/payroll-summary";
import type { PayrollBatchListModel } from "../../models/api/response/payroll-batch-list.model";

interface Props {
  batch: PayrollBatchListModel | null;
  onClose: () => void;
}

// Full-screen look at one saved payroll run — the same tabs, totals, export and print as the
// Payroll Summary page, without leaving the Saved Payroll Runs tab.
export default function PayrollRunViewModal({ batch, onClose }: Props) {
  return (
    <Modal
      open={!!batch}
      onCancel={onClose}
      footer={null}
      className="modal-fullscreen"
      destroyOnHidden
      title={
        batch
          ? `Payroll Summary — ${dayjs(batch.payPeriodStart).format("MMM DD")} – ${dayjs(batch.payPeriodEnd).format("MMM DD, YYYY")}`
          : "Payroll Summary"
      }
    >
      {batch && (
        <PayrollSummaryContent batchId={batch.id} batch={batch} embedded />
      )}
    </Modal>
  );
}
