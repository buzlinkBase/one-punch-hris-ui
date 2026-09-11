import { Button, Modal, Select, Space, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { SCHEDULE_SOURCE_LABEL } from "../../constants/label.const";
import type { AssignTarget } from "../../hooks/use-shift-assignment";

interface Props {
  assignTarget: AssignTarget | null;
  selectedShiftId: string | null;
  onSelectShift: (shiftId: string) => void;
  timeShiftOptions: { value: string; label: string }[];
  isLoadingShifts: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  onAssign: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

/** Shared "Assign Shift" modal — used identically by the Timeline and Month roster views (see
 * useShiftAssignment). Always creates a Work Rotation Plan override for the exact target date,
 * regardless of what the day currently resolves from (Fixed Schedule, Permanent Shift, or an
 * existing override). */
export default function AssignShiftModal({
  assignTarget,
  selectedShiftId,
  onSelectShift,
  timeShiftOptions,
  isLoadingShifts,
  isAssigning,
  isRemoving,
  onAssign,
  onRemove,
  onCancel,
}: Props) {
  return (
    <Modal
      title={
        assignTarget
          ? `Assign Shift — ${assignTarget.employeeName} on ${dayjs(assignTarget.date).format("MMM D, YYYY")}`
          : "Assign Shift"
      }
      open={!!assignTarget}
      onCancel={onCancel}
      destroyOnClose
      footer={
        <div className="flex items-center justify-between">
          <Tooltip
            title={
              assignTarget?.overrideId
                ? undefined
                : "No Work Rotation Plan override to remove — this shift comes from Fixed Schedule or the employee's Permanent Shift."
            }
          >
            <Button
              danger
              disabled={!assignTarget?.overrideId}
              loading={isRemoving}
              onClick={onRemove}
            >
              Remove Shift
            </Button>
          </Tooltip>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              loading={isAssigning}
              disabled={!selectedShiftId}
              onClick={onAssign}
            >
              Assign
            </Button>
          </Space>
        </div>
      }
    >
      {assignTarget?.currentShiftId && assignTarget.scheduleSource && (
        <div className="mb-3 text-sm text-gray-500">
          Currently from:{" "}
          <Tag
            color={SCHEDULE_SOURCE_LABEL[assignTarget.scheduleSource]?.color}
          >
            {SCHEDULE_SOURCE_LABEL[assignTarget.scheduleSource]?.label ??
              assignTarget.scheduleSource}
          </Tag>
        </div>
      )}
      <Select
        className="w-full mt-2"
        showSearch
        loading={isLoadingShifts}
        placeholder="Select a time shift"
        options={timeShiftOptions}
        value={selectedShiftId ?? undefined}
        onChange={onSelectShift}
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      <p className="text-xs text-gray-400 mt-2">
        Assigning here always creates a Work Rotation Plan override for this
        exact date, regardless of the current source.
      </p>
    </Modal>
  );
}
