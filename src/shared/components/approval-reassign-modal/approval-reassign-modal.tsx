import { useState } from "react";
import { Modal, Select, Input, Typography, Space } from "antd";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const { Text } = Typography;
const { TextArea } = Input;

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

interface ApprovalReassignModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (newApproverEmployeeId: string, note?: string) => void;
  onCancel: () => void;
}

/**
 * Owner/Admin-only escape hatch for a step whose configured/resolved approver can't actually
 * act — lets them swap the current step to a specific employee. Mirrors ApprovalActionModal's
 * dumb-modal shape (caller owns the mutation/loading state). Triggered from ApprovalTimeline.
 */
export function ApprovalReassignModal({
  open,
  loading,
  onConfirm,
  onCancel,
}: ApprovalReassignModalProps) {
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const { data: employees = [] } = useEmployeeFilter();
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const reset = () => {
    setEmployeeId(undefined);
    setNote("");
  };
  const handleCancel = () => {
    reset();
    onCancel();
  };
  const handleConfirm = () => {
    if (!employeeId) return;
    const value = note.trim() || undefined;
    reset();
    onConfirm(employeeId, value);
  };

  return (
    <Modal
      title="Reassign this step to a different approver?"
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Reassign"
      okButtonProps={{ disabled: !employeeId, loading }}
      cancelButtonProps={{ disabled: loading }}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text>New approver</Text>
        <Select
          value={employeeId}
          onChange={setEmployeeId}
          options={employeeOptions}
          showSearch
          filterOption={filterOption}
          placeholder="Select an employee"
          style={{ width: "100%" }}
        />
        <Text>Reason (optional)</Text>
        <TextArea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why is this step being reassigned..."
          maxLength={2000}
        />
      </Space>
    </Modal>
  );
}
