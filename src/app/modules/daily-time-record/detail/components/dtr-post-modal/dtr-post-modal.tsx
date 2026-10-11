import { useState } from "react";
import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  recordCount: number;
  // When set, the summary also names how many employees the draft covers.
  employeeCount?: number;
  // Days skipped because they already have saved DTR -- mentioned so nobody wonders where they went.
  skippedCount?: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (postingDescription: string) => void;
}

export default function DtrPostModal({
  open,
  recordCount,
  employeeCount,
  skippedCount = 0,
  isSaving,
  onClose,
  onConfirm,
}: Props) {
  const [description, setDescription] = useState("");

  const handleOk = () => {
    onConfirm(description.trim());
  };

  const handleClose = () => {
    setDescription("");
    onClose();
  };

  return (
    <Modal
      title="Save DTR Draft"
      open={open}
      onCancel={handleClose}
      onOk={handleOk}
      okText="Save Draft"
      confirmLoading={isSaving}
      destroyOnClose
    >
      <p className="mb-3 text-gray-500">
        {`Saves ${recordCount} record${recordCount !== 1 ? "s" : ""}${
          employeeCount !== undefined
            ? ` for ${employeeCount} employee${employeeCount !== 1 ? "s" : ""}`
            : ""
        } as a draft awaiting approval. It's posted as final once approved from the Saved DTR tab.`}
        {skippedCount > 0 &&
          ` ${skippedCount} day${skippedCount !== 1 ? "s" : ""} that already have saved DTR will be skipped.`}
      </p>
      <Form layout="vertical">
        <Form.Item label="Posting Description">
          <Input.TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note about this batch (e.g. reason, cutoff, remarks)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
