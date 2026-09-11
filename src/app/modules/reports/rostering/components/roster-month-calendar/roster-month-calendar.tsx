import { useMemo } from "react";
import { Card, Popover, Tag, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { RosterResponse } from "../../models/api/response/roster-response.model";
import { useShiftAssignment } from "../../hooks/use-shift-assignment";
import AssignShiftModal from "../assign-shift-modal";
import { SCHEDULE_SOURCE_LABEL } from "../../constants/label.const";
import { useThemeStore } from "@/core/stores/theme.store";

const { Text } = Typography;

const SHIFT_COLOR = "#1DA081";
const REST_DAY_COLOR = "#8b93a7";
const UNASSIGNED_COLOR_LIGHT = "#c7d0da";
const UNASSIGNED_COLOR_DARK = "#3a4a44";

interface Props {
  data: RosterResponse[];
  fromDate: string;
  toDate: string;
}

interface DayCell {
  date: Dayjs;
  dateStr: string;
  inRange: boolean;
  records: RosterResponse[];
}

function dayLabel(r: RosterResponse): { text: string; color: string } {
  if (r.isRestDay) {
    const hasShift = r.shiftId && r.shiftStart && r.shiftEnd;
    return {
      text: hasShift
        ? `Rest Day — ${r.shiftName} (${dayjs(r.shiftStart).format("h:mm A")}–${dayjs(r.shiftEnd).format("h:mm A")})`
        : "Rest Day",
      color: REST_DAY_COLOR,
    };
  }
  if (r.shiftId && r.shiftStart && r.shiftEnd) {
    return {
      text: `${r.shiftName} (${dayjs(r.shiftStart).format("h:mm A")}–${dayjs(r.shiftEnd).format("h:mm A")})`,
      color: SHIFT_COLOR,
    };
  }
  return { text: "Open Shift", color: "" };
}

export default function RosterMonthCalendar({ data, fromDate, toDate }: Props) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const unassignedColor = isDark
    ? UNASSIGNED_COLOR_DARK
    : UNASSIGNED_COLOR_LIGHT;

  const resources = useMemo(() => {
    const byEmployee = new Map<string, string>();
    for (const r of data) {
      if (!byEmployee.has(r.employeeId)) {
        byEmployee.set(r.employeeId, r.fullName || r.employeeNo);
      }
    }
    return Array.from(byEmployee.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const {
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
  } = useShiftAssignment(resources);

  const recordsByDate = useMemo(() => {
    const m = new Map<string, RosterResponse[]>();
    for (const r of data) {
      const list = m.get(r.workDate);
      if (list) list.push(r);
      else m.set(r.workDate, [r]);
    }
    return m;
  }, [data]);

  // Weeks spanning the active filter's range, padded to full weeks (same convention a real
  // calendar uses for lead/trail days) -- driven entirely by whatever fromDate/toDate the page's
  // existing filter already fetched, not an independent month navigator.
  const weeks = useMemo(() => {
    const gridStart = dayjs(fromDate).startOf("week");
    const gridEnd = dayjs(toDate).endOf("week");
    const allDays: DayCell[] = [];
    let cursor = gridStart;
    while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, "day")) {
      const dateStr = cursor.format("YYYY-MM-DD");
      allDays.push({
        date: cursor,
        dateStr,
        inRange:
          !cursor.isBefore(dayjs(fromDate), "day") &&
          !cursor.isAfter(dayjs(toDate), "day"),
        records: recordsByDate.get(dateStr) ?? [],
      });
      cursor = cursor.add(1, "day");
    }
    const rows: DayCell[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }
    return rows;
  }, [fromDate, toDate, recordsByDate]);

  const weekdayLabels = weeks[0]?.map((d) => d.date.format("ddd")) ?? [];

  return (
    <div>
      {contextHolder}
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <div className="grid grid-cols-7 border-b border-(--ant-color-border)">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="px-2 py-2 text-center text-xs font-semibold text-(--ant-color-text-secondary)"
            >
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div
            key={i}
            className="grid grid-cols-7 border-b border-(--ant-color-border) last:border-b-0"
          >
            {week.map((cell) => {
              const assignedCount = cell.records.filter(
                (r) => !r.isRestDay && r.shiftId,
              ).length;
              const restCount = cell.records.filter((r) => r.isRestDay).length;
              const unassignedCount = cell.records.filter(
                (r) => !r.isRestDay && !r.shiftId,
              ).length;

              const popoverContent = (
                <div className="flex flex-col gap-1.5 max-w-80 max-h-96 overflow-y-auto">
                  {cell.records.length === 0 && (
                    <Text type="secondary" className="text-xs">
                      No one scheduled this day.
                    </Text>
                  )}
                  {cell.records.map((r) => {
                    const { text, color } = dayLabel(r);
                    return (
                      <button
                        key={r.employeeId}
                        type="button"
                        onClick={() =>
                          openAssignModal(
                            r.employeeId,
                            cell.dateStr,
                            r.shiftId,
                            r.overrideId,
                            r.scheduleSource,
                          )
                        }
                        className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-left hover:bg-(--ant-color-fill-tertiary)"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {r.fullName || r.employeeNo}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={color ? { color } : undefined}
                          >
                            {text}
                          </div>
                        </div>
                        <Tag
                          color={SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.color}
                          className="shrink-0 text-[10px]"
                        >
                          {SCHEDULE_SOURCE_LABEL[r.scheduleSource]?.label ??
                            r.scheduleSource}
                        </Tag>
                      </button>
                    );
                  })}
                </div>
              );

              return (
                <Popover
                  key={cell.dateStr}
                  trigger="click"
                  placement="bottom"
                  title={cell.date.format("dddd, MMM D, YYYY")}
                  content={popoverContent}
                >
                  <div
                    className={`min-h-24 border-r border-(--ant-color-border) last:border-r-0 p-1.5 cursor-pointer hover:bg-(--ant-color-fill-tertiary) ${
                      cell.inRange ? "" : "opacity-40"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {cell.date.format("D")}
                    </div>
                    {cell.records.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {assignedCount > 0 && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{ background: SHIFT_COLOR }}
                          >
                            {assignedCount}
                          </span>
                        )}
                        {restCount > 0 && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{ background: REST_DAY_COLOR }}
                          >
                            {restCount}
                          </span>
                        )}
                        {unassignedCount > 0 && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ background: unassignedColor }}
                          >
                            {unassignedCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Popover>
              );
            })}
          </div>
        ))}
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
