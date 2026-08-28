import { useMemo, useRef, useState } from "react";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { Button, Modal, Select, Space, Tag, Tooltip, message } from "antd";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import type {
  RosterResponse,
  ScheduleSource,
} from "../../models/api/response/roster-response.model";
import {
  useCreateWorkRotation,
  useDeleteWorkRotation,
} from "@/app/modules/change-schedule/work-rotation/hooks/use-work-rotation-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { SCHEDULE_SOURCE_LABEL } from "../../constants/label.const";

const SHIFT_COLOR = "#1DA081";
const REST_DAY_COLOR = "#94a3b8";
const UNASSIGNED_COLOR = "#e5e7eb";

interface EventTags {
  shiftId: string | null;
  isRestDay: boolean;
  overrideId: string | null;
  scheduleSource: ScheduleSource;
}

interface AssignTarget {
  employeeId: string;
  employeeName: string;
  date: string;
  currentShiftId: string | null;
  overrideId: string | null;
  scheduleSource: ScheduleSource | null;
}

interface Props {
  data: RosterResponse[];
  fromDate: string;
  toDate: string;
}

export default function RosterCalendar({ data, fromDate, toDate }: Props) {
  const schedulerRef = useRef<DayPilot.Scheduler>();
  const queryClient = useQueryClient();
  const { mutateAsync: createWorkRotation, isPending: isAssigning } =
    useCreateWorkRotation();
  const { mutateAsync: deleteWorkRotation, isPending: isRemoving } =
    useDeleteWorkRotation();
  const [messageApi, contextHolder] = message.useMessage();
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const { data: timeShifts = [], isLoading: isLoadingShifts } =
    useFixedTimeShifts();
  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label:
      s.startTime && s.endTime
        ? `${s.shiftName} (${s.startTime} – ${s.endTime})`
        : s.shiftName,
  }));

  const resources = useMemo(() => {
    const byEmployee = new Map<string, string>();
    for (const r of data) {
      if (!byEmployee.has(r.employeeId)) {
        byEmployee.set(r.employeeId, r.fullName || r.employeeNo);
      }
    }
    return Array.from(byEmployee.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data]);

  const events = useMemo(() => {
    return data.map((r) => {
      const dayStart = `${r.workDate}T00:00:00`;
      const dayEnd =
        dayjs(r.workDate).add(1, "day").format("YYYY-MM-DD") + "T00:00:00";

      if (r.isRestDay) {
        return {
          id: `${r.employeeId}_${r.workDate}`,
          resource: r.employeeId,
          start: dayStart,
          end: dayEnd,
          text: "Rest Day",
          backColor: REST_DAY_COLOR,
          tags: {
            shiftId: null,
            isRestDay: true,
            overrideId: null,
            scheduleSource: r.scheduleSource,
          } satisfies EventTags,
        };
      }
      if (r.shiftId && r.shiftStart && r.shiftEnd) {
        return {
          id: `${r.employeeId}_${r.workDate}`,
          resource: r.employeeId,
          start: r.shiftStart,
          end: r.shiftEnd,
          text: r.shiftName,
          backColor: SHIFT_COLOR,
          toolTip: `${r.shiftName} — ${SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.label ?? r.scheduleSource}`,
          tags: {
            shiftId: r.shiftId,
            isRestDay: false,
            overrideId: r.overrideId,
            scheduleSource: r.scheduleSource,
          } satisfies EventTags,
        };
      }
      return {
        id: `${r.employeeId}_${r.workDate}`,
        resource: r.employeeId,
        start: dayStart,
        end: dayEnd,
        text: "Unassigned",
        backColor: UNASSIGNED_COLOR,
        fontColor: "#6b7280",
        tags: {
          shiftId: null,
          isRestDay: false,
          overrideId: null,
          scheduleSource: r.scheduleSource,
        } satisfies EventTags,
      };
    });
  }, [data]);

  const days = useMemo(
    () => Math.max(1, dayjs(toDate).diff(dayjs(fromDate), "day") + 1),
    [fromDate, toDate],
  );

  const openAssignModal = (
    employeeId: string,
    date: string,
    currentShiftId: string | null,
    overrideId: string | null,
    scheduleSource: ScheduleSource | null,
  ) => {
    const employeeName =
      resources.find((r) => r.id === employeeId)?.name ?? employeeId;
    setAssignTarget({
      employeeId,
      employeeName,
      date,
      currentShiftId,
      overrideId,
      scheduleSource,
    });
    setSelectedShiftId(currentShiftId);
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedShiftId) return;
    try {
      await createWorkRotation({
        employeeIds: [assignTarget.employeeId],
        timeShiftId: selectedShiftId,
        payrollDates: [assignTarget.date],
      });
      messageApi.success("Shift assigned.");
      setAssignTarget(null);
    } catch {
      messageApi.error("Failed to assign the shift.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    }
  };

  const handleRemove = async () => {
    if (!assignTarget?.overrideId) return;
    try {
      await deleteWorkRotation(assignTarget.overrideId);
      messageApi.success(
        "Override removed — reverted to Fixed Schedule/Permanent Shift.",
      );
      setAssignTarget(null);
    } catch {
      messageApi.error("Failed to remove the shift.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    }
  };

  return (
    <div>
      {contextHolder}
      <DayPilotScheduler
        controlRef={(c) => (schedulerRef.current = c)}
        startDate={fromDate}
        days={days}
        scale="Day"
        timeHeaders={[{ groupBy: "Day", format: "ddd, MMM d" }]}
        rowHeaderWidth={200}
        cellWidth={140}
        eventHeight={40}
        heightSpec="Auto"
        resources={resources}
        events={events}
        eventMoveHandling="Update"
        eventClickHandling="Enabled"
        timeRangeSelectedHandling="Enabled"
        onEventClicked={(args) => {
          const tags = args.e.data.tags as EventTags;
          openAssignModal(
            String(args.e.resource()),
            args.e.start().toString("yyyy-MM-dd"),
            tags.shiftId,
            tags.overrideId,
            tags.scheduleSource,
          );
        }}
        onTimeRangeSelected={(args) => {
          schedulerRef.current?.clearSelection();
          openAssignModal(
            String(args.resource),
            args.start.toString("yyyy-MM-dd"),
            null,
            null,
            null,
          );
        }}
        onEventMove={(args) => {
          const tags = args.e.data.tags as EventTags;
          if (!tags.shiftId || tags.isRestDay) {
            args.preventDefault();
            messageApi.info(
              tags.isRestDay
                ? "Rest days can't be reassigned from this calendar — use Change Rest Day."
                : "Unassigned days have no shift to move — click it to assign one.",
            );
          }
        }}
        onEventMoved={async (args) => {
          const tags = args.e.data.tags as EventTags;
          if (!tags.shiftId) return;
          try {
            await createWorkRotation({
              employeeIds: [String(args.newResource)],
              timeShiftId: tags.shiftId,
              payrollDates: [args.newStart.toString("yyyy-MM-dd")],
            });
            messageApi.success("Shift reassigned.");
          } catch {
            messageApi.error("Failed to save the reassignment.");
          } finally {
            queryClient.invalidateQueries({ queryKey: ["roster"] });
          }
        }}
      />

      <Modal
        title={
          assignTarget
            ? `Assign Shift — ${assignTarget.employeeName} on ${dayjs(assignTarget.date).format("MMM D, YYYY")}`
            : "Assign Shift"
        }
        open={!!assignTarget}
        onCancel={() => setAssignTarget(null)}
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
                onClick={handleRemove}
              >
                Remove Shift
              </Button>
            </Tooltip>
            <Space>
              <Button onClick={() => setAssignTarget(null)}>Cancel</Button>
              <Button
                type="primary"
                loading={isAssigning}
                disabled={!selectedShiftId}
                onClick={handleAssign}
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
          onChange={(v) => setSelectedShiftId(v)}
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
    </div>
  );
}
