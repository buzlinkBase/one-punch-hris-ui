import { Button, Modal } from "antd";
import EmployeePriorEmployerTaxTab from "./employee-prior-employer-tax-tab";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
}

export default function EmployeePriorEmployerTaxModal({
  open,
  onClose,
  employeeId,
  employeeName,
}: Props) {
  return (
    <Modal
      title={
        employeeName
          ? `Prior Employer (BIR 2316) — ${employeeName}`
          : "Prior Employer (BIR 2316)"
      }
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={720}
      destroyOnHidden
    >
      <EmployeePriorEmployerTaxTab employeeId={employeeId} />
    </Modal>
  );
}
