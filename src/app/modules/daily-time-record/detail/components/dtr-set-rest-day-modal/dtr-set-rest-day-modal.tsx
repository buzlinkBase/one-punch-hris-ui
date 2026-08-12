import { useState } from "react";
import { Button, DatePicker, Form, Modal } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useCreateRestDayDate } from "@/app/modules/change-schedule/rest-day-date/hooks/use-rest-day-date-queries";
import { getNotify } from "@/shared/utils/notify";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
}

export default function DtrSetRestDayModal({
  open,
  onClose,
  onSuccess,
  employeeId,
  employeeName,
  workDate,
}: Props) {
  const { mutateAsync: createRestDayDate, isPending: isSubmitting } =
    useCreateRestDayDate();

  const handleSave = async (payrollDate: Dayjs) => {
    try {
      await createRestDayDate({
        employeeId,
        payrollDate: payrollDate.format("YYYY-MM-DD"),
      });
      onClose();
      onSuccess();
      getNotify().success({
        message: "Rest Day Set",
        description: `${employeeName ?? employeeId} — ${payrollDate.format("MMM DD, YYYY")} is now set as a rest day.`,
      });
    } catch {
      getNotify().error({
        message: "Save Failed",
        description: "Failed to set the rest day date. Please try again.",
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
          <div>Set Restday Date</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: "#8c8c8c" }}>
            {employeeName ?? employeeId}
          </div>
        </div>
      }
      destroyOnClose
    >
      {/* Remounted fresh on every open (destroyOnClose), so the date field
          always defaults back to this DTR row's date. */}
      <SetRestDayForm
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
  onSave: (payrollDate: Dayjs) => void;
}

function SetRestDayForm({
  workDate,
  isSubmitting,
  onCancel,
  onSave,
}: FormProps) {
  const [payrollDate, setPayrollDate] = useState<Dayjs | null>(dayjs(workDate));

  const handleOk = () => {
    if (!payrollDate) {
      getNotify().warning({ message: "Select the rest day date." });
      return;
    }
    onSave(payrollDate);
  };

  return (
    <>
      <Form layout="vertical">
        <Form.Item label="Rest Day Date" required className="mb-0">
          <DatePicker
            style={{ width: "100%" }}
            value={payrollDate}
            onChange={(d) => setPayrollDate(d ?? null)}
          />
        </Form.Item>
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
