import { useState } from "react";
import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  batchCount: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}

export default function PayrollRunPostModal({
  open,
  batchCount,
  isSaving,
  onClose,
  onConfirm,
}: Props) {
  const [remarks, setRemarks] = useState("");

  const handleOk = () => {
    onConfirm(remarks.trim());
  };

  const handleClose = () => {
    setRemarks("");
    onClose();
  };

  return (
    <Modal
      title="Save Payroll"
      open={open}
      onCancel={handleClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={isSaving}
      destroyOnClose
    >
      <p className="mb-3 text-gray-500">
        {`This will calculate and save payroll from ${batchCount} selected DTR batch${batchCount !== 1 ? "es" : ""}.`}
      </p>
      <Form layout="vertical">
        <Form.Item label="Remarks">
          <Input.TextArea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional note identifying this run (e.g. cutoff, purpose, reason for a re-run)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
