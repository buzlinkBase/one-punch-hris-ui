import { useState } from "react";
import { Modal, Input, Typography, Space } from "antd";
import type { NoteRequirement } from "@/shared/types/approval.model";

const { Text } = Typography;
const { TextArea } = Input;

interface ApprovalActionModalProps {
  open: boolean;
  action: "Approved" | "Declined";
  /** Unknown while the current step's config is still loading -- treated as Optional. */
  noteRequirement?: NoteRequirement;
  loading?: boolean;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}

export function ApprovalActionModal({
  open,
  action,
  noteRequirement = "Optional",
  loading,
  onConfirm,
  onCancel,
}: ApprovalActionModalProps) {
  const [note, setNote] = useState("");
  const isDecline = action === "Declined";
  const isRequired = noteRequirement === "Required";
  const isHidden = noteRequirement === "None";
  const trimmed = note.trim();
  const canConfirm = !isRequired || trimmed.length > 0;

  // Reset here rather than in an effect keyed on `open` (which would setState synchronously
  // during render's commit phase) -- every path that closes the modal goes through one of these
  // two handlers before it can be reopened, so the note is always blank by the next open.
  const handleCancel = () => {
    setNote("");
    onCancel();
  };
  const handleConfirm = () => {
    const value = trimmed || undefined;
    setNote("");
    onConfirm(value);
  };

  return (
    <Modal
      title={
        isDecline ? "Decline this application?" : "Approve this application?"
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText={isDecline ? "Decline" : "Approve"}
      okButtonProps={{ danger: isDecline, disabled: !canConfirm, loading }}
      cancelButtonProps={{ disabled: loading }}
      destroyOnHidden
    >
      {!isHidden && (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Note{isRequired ? " (required)" : " (optional)"}</Text>
          <TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isDecline
                ? "Explain why this application is being declined..."
                : "Add a note for this approval..."
            }
            maxLength={2000}
          />
        </Space>
      )}
    </Modal>
  );
}
