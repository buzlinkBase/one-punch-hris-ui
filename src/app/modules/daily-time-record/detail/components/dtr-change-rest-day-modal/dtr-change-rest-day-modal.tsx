import { useState } from "react";
import { Button, DatePicker, Form, Modal, Space } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useCreateChangeRestDay } from "@/app/modules/change-schedule/change-rest-day/hooks/use-change-rest-day-queries";
import { getNotify } from "@/shared/utils/notify";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
}

export default function DtrChangeRestDayModal({
  open,
  onClose,
  onSuccess,
  employeeId,
  employeeName,
  workDate,
}: Props) {
  const { mutateAsync: createChangeRestDay, isPending: isSubmitting } =
    useCreateChangeRestDay();

  const handleSave = async (priorDate: Dayjs, newDate: Dayjs) => {
    try {
      await createChangeRestDay({
        fromDay: priorDate.day(),
        toDay: newDate.day(),
        payrollDateFrom: priorDate.format("YYYY-MM-DD"),
        payrollDateTo: newDate.format("YYYY-MM-DD"),
        employeeIds: [employeeId],
      });
      onClose();
      onSuccess();
      getNotify().success({
        message: "Rest Day Updated",
        description: `${employeeName ?? employeeId} — rest day moved from ${priorDate.format("MMM DD, YYYY")} to ${newDate.format("MMM DD, YYYY")}.`,
      });
    } catch {
      getNotify().error({
        message: "Update Failed",
        description: "Failed to update the rest day. Please try again.",
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div>
          <div>Change Rest Day</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: "#8c8c8c" }}>
            {employeeName ?? employeeId}
          </div>
        </div>
      }
      destroyOnClose
    >
      {/* Remounted fresh on every open (destroyOnClose), so the old-date
          field always defaults back to this DTR row's date. */}
      <ChangeRestDayForm
        workDate={workDate}
        isSubmitting={isSubmitting}
        onCancel={onClose}
        onSave={handleSave}
      />
    </Modal>
  );
}

interface FormProps {
  workDate: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: (priorDate: Dayjs, newDate: Dayjs) => void;
}

function ChangeRestDayForm({
  workDate,
  isSubmitting,
  onCancel,
  onSave,
}: FormProps) {
  const [priorDate, setPriorDate] = useState<Dayjs | null>(dayjs(workDate));
  const [newDate, setNewDate] = useState<Dayjs | null>(null);

  const handleOk = () => {
    if (!priorDate) {
      getNotify().warning({ message: "Select the old rest day date." });
      return;
    }
    if (!newDate) {
      getNotify().warning({ message: "Select the new rest day date." });
      return;
    }
    if (newDate.isSame(priorDate, "day")) {
      getNotify().warning({
        message: "New Day-Off Date cannot be the same as the old rest day.",
      });
      return;
    }
    onSave(priorDate, newDate);
  };

  return (
    <>
      <Form layout="vertical">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item label="Old Rest Day Date" required className="mb-0">
            <DatePicker
              style={{ width: "100%" }}
              value={priorDate}
              onChange={(d) => {
                setPriorDate(d ?? null);
                if (d && newDate && d.isSame(newDate, "day")) {
                  setNewDate(null);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space size={4}>
                <ArrowRightOutlined style={{ color: "#1DA081" }} />
                New Rest Day Date
              </Space>
            }
            required
            className="mb-0"
          >
            <DatePicker
              style={{ width: "100%" }}
              value={newDate}
              disabledDate={(d) =>
                priorDate ? d.isSame(priorDate, "day") : false
              }
              onChange={(d) => setNewDate(d ?? null)}
            />
          </Form.Item>
        </div>
      </Form>

      <div className="flex justify-end gap-2 mt-5">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" loading={isSubmitting} onClick={handleOk}>
          Save
        </Button>
      </div>
    </>
  );
}
