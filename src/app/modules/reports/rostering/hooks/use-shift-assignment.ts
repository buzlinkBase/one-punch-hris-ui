import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  useCreateWorkRotation,
  useDeleteWorkRotation,
} from "@/app/modules/change-schedule/work-rotation/hooks/use-work-rotation-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import type { ScheduleSource } from "../models/api/response/roster-response.model";

export interface AssignTarget {
  employeeId: string;
  employeeName: string;
  date: string;
  currentShiftId: string | null;
  overrideId: string | null;
  scheduleSource: ScheduleSource | null;
}

interface Resource {
  id: string;
  name: string;
}

/** Shared "assign/remove a shift for one employee on one day" behavior -- used by both the
 * Timeline (RosterCalendar) and Month (RosterMonthCalendar) views so they save/invalidate
 * identically and always show the same Assign Shift modal. */
export function useShiftAssignment(resources: Resource[]) {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const { mutateAsync: createWorkRotation, isPending: isAssigning } =
    useCreateWorkRotation();
  const { mutateAsync: deleteWorkRotation, isPending: isRemoving } =
    useDeleteWorkRotation();

  const { data: timeShifts = [], isLoading: isLoadingShifts } =
    useFixedTimeShifts();
  const timeShiftOptions = timeShifts.map((s) => ({
    value: s.id,
    label:
      s.startTime && s.endTime
        ? `${s.shiftName} (${s.startTime} – ${s.endTime})`
        : s.shiftName,
  }));

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

  const closeAssignModal = () => setAssignTarget(null);

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

  return {
    contextHolder,
    assignTarget,
    selectedShiftId,
    setSelectedShiftId,
    openAssignModal,
    closeAssignModal,
    handleAssign,
    handleRemove,
    isAssigning,
    isRemoving,
    timeShiftOptions,
    isLoadingShifts,
  };
}
