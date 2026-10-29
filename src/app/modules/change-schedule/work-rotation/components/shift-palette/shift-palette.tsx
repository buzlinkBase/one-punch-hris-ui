import { Tooltip } from "antd";

export interface PaletteShift {
  id: string;
  label: string;
  title: string;
  colorClass: string;
  // The heading it is listed under, e.g. "Fixed shifts".
  group: string;
}

interface ShiftPaletteProps {
  shifts: PaletteShift[];
  // A shift id, or null for "clear" (back to the employee's regular schedule).
  brush: string | null;
  onChange: (brush: string | null) => void;
}

const CHIP_BASE =
  "flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-sm transition";

// Shifts arrive already ordered by type, so each group is a run of neighbours. The number on a
// chip is its place in the whole list, which is what the 1-9 shortcut keys follow.
function groupShifts(shifts: PaletteShift[]) {
  const groups: {
    name: string;
    items: { shift: PaletteShift; index: number }[];
  }[] = [];
  shifts.forEach((shift, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === shift.group) last.items.push({ shift, index });
    else groups.push({ name: shift.group, items: [{ shift, index }] });
  });
  return groups;
}

export function ShiftPalette({ shifts, brush, onChange }: ShiftPaletteProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500">
        <span className="font-semibold text-(--primary)">Tip:</span> press the
        number on a shift (1-9) to select it, 0 to clear.
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {groupShifts(shifts).map((group) => (
          <div key={group.name} className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.name} ({group.items.length})
            </span>
            {group.items.map(({ shift: s, index }) => (
              <Tooltip key={s.id} title={s.title}>
                <button
                  type="button"
                  className={`${CHIP_BASE} ${s.colorClass} ${
                    brush === s.id
                      ? "ring-2 ring-teal-600 ring-offset-1"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => onChange(s.id)}
                >
                  {index < 9 && (
                    <kbd className="rounded bg-white/70 px-1 text-xs">
                      {index + 1}
                    </kbd>
                  )}
                  {s.label}
                </button>
              </Tooltip>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Other
          </span>
          <Tooltip title="Remove the schedule from the day. The employee goes back to their regular schedule.">
            <button
              type="button"
              className={`${CHIP_BASE} border-red-300 bg-red-50 text-red-700 ${
                brush === null
                  ? "ring-2 ring-teal-600 ring-offset-1"
                  : "opacity-80 hover:opacity-100"
              }`}
              onClick={() => onChange(null)}
            >
              <kbd className="rounded bg-white/70 px-1 text-xs">0</kbd>
              Clear
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
