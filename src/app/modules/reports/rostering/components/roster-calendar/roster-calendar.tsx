import { useMemo, useRef } from "react";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { Card, message } from "antd";
import dayjs from "dayjs";
import type {
  RosterResponse,
  ScheduleSource,
} from "../../models/api/response/roster-response.model";
import { useShiftAssignment } from "../../hooks/use-shift-assignment";
import AssignShiftModal from "../assign-shift-modal";
import { SCHEDULE_SOURCE_LABEL } from "../../constants/label.const";
import { useCreateWorkRotation } from "@/app/modules/change-schedule/work-rotation/hooks/use-work-rotation-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/core/stores/theme.store";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

const SHIFT_COLOR = "#1DA081";
const REST_DAY_COLOR = "#8b93a7";
const UNASSIGNED_COLOR_LIGHT = "#eef2f6";
const UNASSIGNED_COLOR_DARK = "#22332e";
const FONT_FAMILY =
  "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";

function eventCardHtml(title: string, subtitle: string) {
  return `<div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:2px 4px;line-height:1.35;overflow:hidden;">
    <div style="font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
    <div style="font-size:11px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subtitle}</div>
  </div>`;
}

interface EventTags {
  shiftId: string | null;
  isRestDay: boolean;
  overrideId: string | null;
  scheduleSource: ScheduleSource;
}

interface Props {
  data: RosterResponse[];
  fromDate: string;
  toDate: string;
}

export default function RosterCalendar({ data, fromDate, toDate }: Props) {
  const schedulerRef = useRef<DayPilot.Scheduler | null>(null);
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const isMobile = useIsMobile();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  // Drag-and-drop reassignment fires immediately on drop rather than through the Assign Shift
  // modal, so it uses this mutation directly rather than the shared useShiftAssignment hook
  // (which owns the modal-driven assign/remove flow both Timeline and Month use).
  const { mutateAsync: createWorkRotation } = useCreateWorkRotation();

  // For the same-shift-already-there drop guard: what shift (if any) is
  // currently resolved for a given employee/date, keyed the same way as event ids.
  const shiftByEmployeeDate = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const r of data) {
      m.set(`${r.employeeId}_${r.workDate}`, r.shiftId);
    }
    return m;
  }, [data]);

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

  const {
    contextHolder: assignContextHolder,
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
  } = useShiftAssignment(resources);

  const events = useMemo(() => {
    return data.map((r) => {
      const dayStart = `${r.workDate}T00:00:00`;
      const dayEnd =
        dayjs(r.workDate).add(1, "day").format("YYYY-MM-DD") + "T00:00:00";

      if (r.isRestDay) {
        // The employee's underlying shift (Fixed Schedule/Permanent/Override) still
        // resolves independently of rest-day status — show it as a subtitle so the
        // roster reads "Rest Day" but preparers can still see which shift it's covering.
        const hasShift = r.shiftId && r.shiftStart && r.shiftEnd;
        const timeRange = hasShift
          ? `${dayjs(r.shiftStart).format("h:mm A")} – ${dayjs(r.shiftEnd).format("h:mm A")}`
          : null;
        return {
          id: `${r.employeeId}_${r.workDate}`,
          resource: r.employeeId,
          start: dayStart,
          end: dayEnd,
          text: hasShift ? `Rest Day (${r.shiftName})` : "Rest Day",
          html: hasShift
            ? eventCardHtml("Rest Day", `${r.shiftName} · ${timeRange}`)
            : undefined,
          backColor: REST_DAY_COLOR,
          fontColor: "#ffffff",
          toolTip: hasShift
            ? `Rest Day — underlying shift: ${r.shiftName} (${timeRange})`
            : "Rest Day",
          tags: {
            // Carries the real underlying shift/override — a rest day is treated the
            // same as a work day for assign/drag-drop purposes; the rest-day flag is a
            // display/scheduling attribute on top, not a separate no-shift state.
            shiftId: r.shiftId,
            isRestDay: true,
            overrideId: r.overrideId,
            scheduleSource: r.scheduleSource,
          } satisfies EventTags,
        };
      }
      if (r.shiftId && r.shiftStart && r.shiftEnd) {
        const timeRange = `${dayjs(r.shiftStart).format("h:mm A")} – ${dayjs(r.shiftEnd).format("h:mm A")}`;
        return {
          id: `${r.employeeId}_${r.workDate}`,
          resource: r.employeeId,
          start: r.shiftStart,
          end: r.shiftEnd,
          text: r.shiftName,
          html: eventCardHtml(r.shiftName, timeRange),
          backColor: SHIFT_COLOR,
          fontColor: "#ffffff",
          toolTip: `${r.shiftName} (${timeRange}) — ${SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.label ?? r.scheduleSource}`,
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
        text: "Open Shift",
        backColor: isDark ? UNASSIGNED_COLOR_DARK : UNASSIGNED_COLOR_LIGHT,
        fontColor: isDark ? "#7c8f88" : "#8a94a6",
        tags: {
          shiftId: null,
          isRestDay: false,
          overrideId: null,
          scheduleSource: r.scheduleSource,
        } satisfies EventTags,
      };
    });
  }, [data, isDark]);

  const days = useMemo(
    () => Math.max(1, dayjs(toDate).diff(dayjs(fromDate), "day") + 1),
    [fromDate, toDate],
  );

  // DayPilot's own default theme re-declares every --dp-scheduler-* variable
  // directly on its root element's class (.scheduler_default_main), which beats
  // any value merely inherited from an ancestor like a Card's inline style —
  // setting these vars there has no effect. Overriding via a same-or-higher
  // specificity selector on that exact class is the only way to win the cascade.
  const schedulerThemeCss = `
    .roster-scheduler-theme .scheduler_default_main {
      --dp-scheduler-border-color: ${isDark ? "#1e3830" : "#e3f3ef"};
      --dp-scheduler-border-inner-color: ${isDark ? "#1e3830" : "#eef6f4"};
      --dp-scheduler-grid-line-color: ${isDark ? "#1c322b" : "#eef6f4"};
      --dp-scheduler-grid-line-break-color: ${isDark ? "#254238" : "#dceee8"};
      --dp-scheduler-cell-bg-color: ${isDark ? "#162820" : "#ffffff"};
      --dp-scheduler-cell-business-bg-color: ${isDark ? "#162820" : "#ffffff"};
      --dp-scheduler-header-bg-color: ${isDark ? "#111f1b" : "#f7fbfa"};
      --dp-scheduler-header-color: ${isDark ? "#c8e6df" : "#305b52"};
      --dp-scheduler-font-family: ${FONT_FAMILY};
      --dp-scheduler-font-size: 13px;
      --dp-scheduler-event-border-radius: 8px;
      /* A visible border (matching the cell background, not "none") is what actually
         separates two same-color shift bars sitting in adjacent day columns — without it
         they read as one continuous merged block instead of distinct daily events. */
      --dp-scheduler-event-border: 2px solid ${isDark ? "#162820" : "#ffffff"};
      --dp-scheduler-event-box-shadow: ${
        isDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 2px rgba(16,24,40,0.08)"
      };
      --dp-scheduler-event-padding: 0px;
      --dp-scheduler-rowheader-padding: 10px 14px;
      --dp-scheduler-timeheader-padding: 8px;
      --dp-scheduler-link-color: ${SHIFT_COLOR};
    }

    /* The grid is almost always wider than the viewport, so the horizontal scrollbar
       needs to be an obvious, always-visible affordance here — not the app's default
       thin/hover-only scrollbar (fine for a sidebar, easy to miss on a wide data grid). */
    .roster-scheduler-theme .ant-card-body {
      scrollbar-width: auto;
      scrollbar-color: ${isDark ? "rgba(29,160,129,0.55) rgba(255,255,255,0.06)" : "rgba(29,160,129,0.55) rgba(15,23,42,0.06)"};
    }
    .roster-scheduler-theme .ant-card-body::-webkit-scrollbar {
      height: 12px;
    }
    .roster-scheduler-theme .ant-card-body::-webkit-scrollbar-track {
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"};
    }
    .roster-scheduler-theme .ant-card-body::-webkit-scrollbar-thumb {
      background: rgba(29,160,129,0.55);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .roster-scheduler-theme .ant-card-body::-webkit-scrollbar-thumb:hover {
      background: rgba(29,160,129,0.8);
      background-clip: content-box;
    }
  `;

  return (
    <div>
      {contextHolder}
      {assignContextHolder}
      <style>{schedulerThemeCss}</style>
      <Card
        size="small"
        className="roster-scheduler-theme"
        styles={{ body: { padding: 0, overflowX: "auto" } }}
      >
        <DayPilotScheduler
          controlRef={(c: DayPilot.Scheduler) => (schedulerRef.current = c)}
          startDate={fromDate}
          days={days}
          scale="Day"
          timeHeaders={[
            { groupBy: "Day", format: isMobile ? "d" : "ddd, MMM d" },
          ]}
          rowHeaderWidth={isMobile ? 130 : 200}
          cellWidth={isMobile ? 96 : 150}
          eventHeight={48}
          // Breathing room between employee rows, and between the two stacked lanes a
          // cross-midnight shift (e.g. a night shift) needs within one employee's row —
          // without this the bars sit edge-to-edge with nothing to visually separate them.
          rowMarginTop={4}
          rowMarginBottom={4}
          heightSpec="Auto"
          resources={resources}
          events={events}
          eventMoveHandling="Update"
          eventClickHandling="Enabled"
          timeRangeSelectedHandling="Enabled"
          onBeforeCellRender={(args) => {
            const dow = args.cell.start.getDayOfWeek();
            if (dow === 0 || dow === 6) {
              args.cell.properties.backColor = isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(15,23,42,0.02)";
            }
          }}
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
            // Dropped back on the exact same employee/date — not a real move,
            // just cancel silently so it doesn't fire an unnecessary save.
            const droppedOnSameSlot =
              String(args.newResource) === String(args.e.resource()) &&
              args.newStart.toString("yyyy-MM-dd") ===
                args.e.start().toString("yyyy-MM-dd");
            if (droppedOnSameSlot) {
              args.preventDefault();
              return;
            }

            const tags = args.e.data.tags as EventTags;

            // Target day already resolves to this exact shift for this employee
            // (via override, Fixed Schedule, or Permanent Shift) — nothing to change.
            const targetDate = args.newStart.toString("yyyy-MM-dd");
            const targetShiftId = shiftByEmployeeDate.get(
              `${args.newResource}_${targetDate}`,
            );
            if (tags.shiftId && targetShiftId === tags.shiftId) {
              args.preventDefault();
              messageApi.info("That day already has this same shift assigned.");
              return;
            }

            // Rest days are treated the same as work days here — only a genuinely
            // shift-less (Unassigned) day has nothing to drag.
            if (!tags.shiftId) {
              args.preventDefault();
              messageApi.info(
                "Unassigned days have no shift to move — click it to assign one.",
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
      </Card>

      <AssignShiftModal
        assignTarget={assignTarget}
        selectedShiftId={selectedShiftId}
        onSelectShift={setSelectedShiftId}
        timeShiftOptions={timeShiftOptions}
        isLoadingShifts={isLoadingShifts}
        isAssigning={isAssigning}
        isRemoving={isRemoving}
        onAssign={handleAssign}
        onRemove={handleRemove}
        onCancel={closeAssignModal}
      />
    </div>
  );
}
