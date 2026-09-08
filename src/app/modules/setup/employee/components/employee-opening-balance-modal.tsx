import { Button, Modal } from "antd";
import EmployeeOpeningBalanceTab from "./employee-opening-balance-tab";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
}

export default function EmployeeOpeningBalanceModal({
  open,
  onClose,
  employeeId,
  employeeName,
}: Props) {
  return (
    <Modal
      title={
        employeeName
          ? `Opening Balance (Pre-System YTD) — ${employeeName}`
          : "Opening Balance (Pre-System YTD)"
      }
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={720}
      destroyOnHidden
    >
      <EmployeeOpeningBalanceTab employeeId={employeeId} />
    </Modal>
  );
}
