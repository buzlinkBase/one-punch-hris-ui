import { useState } from "react";
import { Button, Form, Modal, Select, theme } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { useCreateWorkRotation } from "@/app/modules/change-schedule/work-rotation/hooks/use-work-rotation-queries";
import { getNotify } from "@/shared/utils/notify";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
  currentShiftId?: string | null;
  currentShiftName?: string | null;
}

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

export default function DtrChangeTimeShiftModal({
  open,
  onClose,
  onSuccess,
  employeeId,
  employeeName,
  workDate,
  currentShiftId,
  currentShiftName,
}: Props) {
  const { token } = theme.useToken();
  // `timeShiftId` is only set once the user makes an explicit choice; until
  // then the Select falls back to the row's current shift (matched by id,
  // falling back to name for older records without one), so it opens
  // pre-filled instead of empty.
  const [timeShiftId, setTimeShiftId] = useState<string | null>(null);
  const { data: shifts = [], isLoading: isShiftsLoading } =
    useFixedTimeShifts();
  const { mutateAsync: createRotation, isPending: isSubmitting } =
    useCreateWorkRotation();

  const matchedShiftId =
    currentShiftId ??
    shifts.find((s) => s.shiftName === currentShiftName)?.id ??
    null;
  const effectiveShiftId = timeShiftId ?? matchedShiftId;

  const timeShiftOptions = shifts.map((s) => ({
    value: s.id,
    label:
      s.startTime && s.endTime
        ? `${s.shiftName} (${s.startTime} – ${s.endTime})`
        : s.shiftName,
  }));

  const navigate = useNavigate();

  const handleClose = () => {
    setTimeShiftId(null);
    onClose();
  };

  const handleSave = async () => {
    if (!effectiveShiftId) {
      getNotify().warning({ message: "Select a time shift." });
      return;
    }
    try {
      await createRotation({
        employeeIds: [employeeId],
        timeShiftId: effectiveShiftId,
        payrollDates: [workDate],
      });
      handleClose();
      onSuccess();
      getNotify().success({
        message: "Time Shift Updated",
        description: `${employeeName ?? employeeId} — ${workDate} has been updated successfully.`,
      });
    } catch {
      getNotify().error({
        message: "Update Failed",
        description: "Failed to update the time shift. Please try again.",
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSave}
      okText="Save"
      confirmLoading={isSubmitting}
      title={
        <div>
          <div>Change Time Shift</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: token.colorTextTertiary,
            }}
          >
            {employeeName ?? employeeId} &mdash; {workDate}
          </div>
        </div>
      }
      destroyOnClose
    >
      {currentShiftName && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            marginBottom: 16,
            background: "#fafafa",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <span style={{ color: token.colorTextTertiary }}>Current shift</span>
          <span style={{ fontWeight: 500 }}>{currentShiftName}</span>
        </div>
      )}
      <Form layout="vertical">
        <Form.Item label="New Time Shift" required className="mb-0">
          <Select
            style={{ width: "100%" }}
            showSearch
            loading={isShiftsLoading}
            placeholder="Select new time shift"
            options={timeShiftOptions}
            value={effectiveShiftId ?? undefined}
            onChange={(v: string | undefined) => setTimeShiftId(v ?? null)}
            filterOption={filterByLabel}
          />
        </Form.Item>
      </Form>
      <div className="mt-3">
        <Button
          type="link"
          size="small"
          icon={<UnorderedListOutlined />}
          style={{ padding: 0, fontSize: 12 }}
          onClick={() => {
            handleClose();
            navigate({ to: "/change-schedule/work-rotation" });
          }}
        >
          View Work Rotation Plan
        </Button>
      </div>
    </Modal>
  );
}
