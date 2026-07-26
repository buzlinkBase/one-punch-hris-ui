import { useState } from "react";
import { DatePicker, Form, Modal, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { AttendanceEntryResponse } from "../../models/api/response/attendance-entry-response.model";
import { useUpdateAttendanceEntry } from "../../hooks/use-attendance-entry-queries";
import { getNotify } from "@/shared/utils/notify";

const { Text } = Typography;

interface Props {
  record: AttendanceEntryResponse | null;
  onClose: () => void;
}

export default function EditAttendanceEntryModal({ record, onClose }: Props) {
  const [value, setValue] = useState<Dayjs | null>(
    record ? dayjs(record.timeLog) : null,
  );
  const { mutateAsync: update, isPending } = useUpdateAttendanceEntry();

  const handleOk = async () => {
    if (!record || !value) return;
    await update({
      id: record.id,
      workTime: value.format("YYYY-MM-DDTHH:mm:ss"),
    });
    getNotify().success({ message: "Time log updated." });
    onClose();
  };

  return (
    <Modal
      title="Edit Time Log"
      open={!!record}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save"
      confirmLoading={isPending}
      okButtonProps={{ disabled: !value }}
      destroyOnHidden
    >
      {record && (
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Employee">
            <Text strong>{record.employeeName ?? "—"}</Text>
          </Form.Item>
          <Form.Item label="Date &amp; Time" required>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="MMM DD, YYYY HH:mm"
              value={value}
              onChange={(d) => setValue(d)}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
