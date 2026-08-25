import { useState } from "react";
import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  recordCount: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (postingDescription: string) => void;
}

export default function DtrPostModal({
  open,
  recordCount,
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
      title="Post DTR"
      open={open}
      onCancel={handleClose}
      onOk={handleOk}
      okText="Post"
      confirmLoading={isSaving}
      destroyOnClose
    >
      <p className="mb-3 text-gray-500">
        {`Posting will save ${recordCount} record${recordCount !== 1 ? "s" : ""} to the daily time record.`}
      </p>
      <Form layout="vertical">
        <Form.Item label="Posting Description">
          <Input.TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note about this posting (e.g. reason, cutoff, remarks)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
