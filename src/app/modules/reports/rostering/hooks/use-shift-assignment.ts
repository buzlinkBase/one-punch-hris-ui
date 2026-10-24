import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  useCreateWorkRotation,
  useDeleteWorkRotation,
} from "@/app/modules/change-schedule/work-rotation/hooks/use-work-rotation-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import type { ScheduleSource } from "../models/api/response/roster-response.model";

export interface AssignTarget {
  employeeId: string;
  employeeName: string;
  date: string;
  currentShiftId: string | null;
  overrideId: string | null;
  scheduleSource: ScheduleSource | null;
  currentAreaId: string | null;
  currentClientId: string | null;
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
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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

  const { data: areas = [] } = useOperationAreas();
  const { data: clients = [] } = useClients();
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  // Every project site with the client it belongs to, so the Assign Shift window can narrow the
  // sites by the client picked (and fill the client in from a site).
  const sites = areas.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    clientId: a.clientId ?? null,
    clientName: a.clientName ?? null,
  }));
  const clientNameOf = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? "this client";

  const openAssignModal = (
    employeeId: string,
    date: string,
    currentShiftId: string | null,
    overrideId: string | null,
    scheduleSource: ScheduleSource | null,
    currentAreaId: string | null = null,
    currentClientId: string | null = null,
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
      currentAreaId,
      currentClientId,
    });
    setSelectedShiftId(currentShiftId);
    setSelectedAreaId(currentAreaId);
    setSelectedClientId(currentClientId);
  };

  const closeAssignModal = () => setAssignTarget(null);

  const handleAssign = async () => {
    if (!assignTarget || !selectedShiftId) return;
    try {
      await createWorkRotation({
        employeeIds: [assignTarget.employeeId],
        timeShiftId: selectedShiftId,
        payrollDates: [assignTarget.date],
        operationAreaId: selectedAreaId,
        clientId: selectedClientId,
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
    selectedAreaId,
    setSelectedAreaId,
    sites,
    selectedClientId,
    setSelectedClientId,
    clientOptions,
    clientNameOf,
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
