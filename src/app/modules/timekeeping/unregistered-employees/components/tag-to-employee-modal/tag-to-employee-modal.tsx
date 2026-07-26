import { useState } from "react";
import { Form, Modal, Select } from "antd";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useTagEmployee } from "../../hooks/use-unregister-employee-queries";
import { getNotify } from "@/shared/utils/notify";
import type { UnregisteredAttendanceLog } from "../../models/api/response/unregister-employee-response.model";

interface Props {
  entries: UnregisteredAttendanceLog[] | null;
  onClose: () => void;
}

export default function TagToEmployeeModal({ entries, onClose }: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >();

  const { data: employees = [] } = useEmployees();
  const { mutateAsync: tag, isPending } = useTagEmployee();

  const handleOk = async () => {
    if (!selectedEmployeeId) {
      getNotify().warning({ message: "Please select an employee." });
      return;
    }
    await tag({ employeeId: selectedEmployeeId, attId: entries![0].id });
    getNotify().success({ message: "Attendance tagged to employee." });
    onClose();
  };

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.employeeNo} — ${e.firstName} ${e.lastName}${e.bioId != null ? ` (Bio ID: ${e.bioId})` : ""}`,
  }));

  return (
    <Modal
      title="Tag Employee"
      open={!!entries}
      onOk={handleOk}
      onCancel={onClose}
      okText="Confirm"
      confirmLoading={isPending}
      destroyOnClose
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Employee"
          required
          extra="Select the employee to link this Bio ID to. The employee's Bio ID must match the attendance log's Bio ID."
        >
          <Select
            showSearch
            placeholder="Search employee..."
            value={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
            options={employeeOptions}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
