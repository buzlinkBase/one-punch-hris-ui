import { useEffect, useRef, type MouseEvent } from "react";
import { Checkbox, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  cellKey,
  isChange,
  type CellPaint,
} from "../../utils/schedule-grid.util";

export interface GridEmployee {
  id: string;
  name: string;
}

export interface ShiftChip {
  label: string;
  title: string;
  colorClass: string;
}

interface ScheduleGridProps {
  employees: GridEmployee[];
  dates: string[];
  server: Map<string, CellPaint>;
  edits: Map<string, CellPaint>;
  shifts: Map<string, ShiftChip>;
  // Right-click: opens the per-day editor (shift, client, project site) for one cell.
  // fromDoubleClick: the cell was just painted by the first click of the double-click.
  onEditCell: (key: string, fromDoubleClick?: boolean) => void;
  // Ctrl+C on the focused cell: its settings become the template for the next cells painted.
  onCopyCell: (key: string) => void;
  selectedIds: Set<string>;
  focusKey: string | null;
  onToggleEmployee: (employeeId: string) => void;
  onToggleAll: (checked: boolean) => void;
  // Called with every cell a click or drag crosses.
  onPaint: (keys: string[]) => void;
  // A plain click: paints the cell, or restores its saved value if it already holds this paint.
  onClickCell: (key: string) => void;
  onFocusCell: (key: string) => void;
  onFillDay: (date: string) => void;
  onPasteText: (text: string) => void;
}

const CELL_BASE =
  "h-9 min-w-16 max-w-16 cursor-pointer select-none border border-gray-200 p-0 text-center text-xs";

// Painting a cell happens on mouse down and while the button is held over more cells. The
// handlers sit on the table body and read the cell from its data attribute, so thousands of
// cells share three listeners.
export function ScheduleGrid({
  employees,
  dates,
  server,
  edits,
  shifts,
  onEditCell,
  onCopyCell,
  selectedIds,
  focusKey,
  onToggleEmployee,
  onToggleAll,
  onPaint,
  onClickCell,
  onFocusCell,
  onFillDay,
  onPasteText,
}: ScheduleGridProps) {
  const dragging = useRef(false);
  // The cell the press or drag last acted on.
  const lastCell = useRef<string | null>(null);

  useEffect(() => {
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const keyOf = (e: MouseEvent<HTMLElement>) =>
    (e.target as HTMLElement).closest<HTMLElement>("[data-cell]")?.dataset.cell;

  const handleDown = (e: MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const key = keyOf(e);
    if (!key) return;
    onFocusCell(key);
    // The second press of a double-click opens the editor; the page undoes the first press's paint.
    if (e.detail >= 2) {
      dragging.current = false;
      onEditCell(key, true);
      return;
    }
    dragging.current = true;
    lastCell.current = key;
    onClickCell(key);
  };

  const handleEnter = (e: MouseEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const key = keyOf(e);
    // An emptied cell's label collapses under the pointer, which fires a mouseover on the same
    // cell; without this check that would repaint the cell the click just undid.
    if (!key || key === lastCell.current) return;
    lastCell.current = key;
    onPaint([key]);
  };

  // Right-clicking a cell opens the per-day editor instead of the browser menu.
  const handleContextMenu = (e: MouseEvent<HTMLElement>) => {
    const key = keyOf(e);
    if (!key) return;
    e.preventDefault();
    onFocusCell(key);
    onEditCell(key);
  };

  const allSelected =
    employees.length > 0 && employees.every((e) => selectedIds.has(e.id));
  const someSelected = employees.some((e) => selectedIds.has(e.id));

  return (
    <div
      tabIndex={0}
      className="max-h-[65vh] overflow-auto rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-teal-600/30"
      onKeyDown={(e) => {
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key.toLowerCase() === "c" &&
          focusKey &&
          !(e.target instanceof HTMLInputElement)
        ) {
          e.preventDefault();
          onCopyCell(focusKey);
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        onPasteText(e.clipboardData.getData("text"));
      }}
    >
      <table className="border-collapse">
        <thead className="sticky top-0 z-20 bg-gray-50">
          <tr>
            <th className="sticky left-0 z-30 min-w-52 border border-gray-200 bg-gray-50 px-2 text-left text-xs font-medium">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
              >
                Employee ({employees.length})
              </Checkbox>
            </th>
            {dates.map((date) => {
              const d = dayjs(date);
              const weekend = d.day() === 0 || d.day() === 6;
              return (
                <th
                  key={date}
                  className={`min-w-16 cursor-pointer border border-gray-200 px-1 py-1 text-xs font-medium hover:bg-teal-600/10 ${
                    weekend ? "bg-amber-50" : ""
                  }`}
                  onClick={() => onFillDay(date)}
                >
                  <Tooltip title="Paint this day for every employee">
                    <div>
                      <div>{d.format("ddd")}</div>
                      <div className="text-gray-500">{d.format("MMM D")}</div>
                    </div>
                  </Tooltip>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          onMouseDown={handleDown}
          onMouseOver={handleEnter}
          onContextMenu={handleContextMenu}
        >
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="sticky left-0 z-10 min-w-52 max-w-52 border border-gray-200 bg-white px-2 text-xs">
                <Checkbox
                  checked={selectedIds.has(emp.id)}
                  onChange={() => onToggleEmployee(emp.id)}
                >
                  <span className="block max-w-40 truncate">{emp.name}</span>
                </Checkbox>
              </td>
              {dates.map((date) => {
                const key = cellKey(emp.id, date);
                const saved = server.get(key);
                const edit = edits.get(key);
                const paint = edit ?? saved;
                const changed = !!edit && isChange(edit, saved);
                const chip = paint?.shiftId ? shifts.get(paint.shiftId) : null;
                const cleared = !!edit && edit.shiftId === null && changed;

                let tone = "bg-white hover:bg-gray-50";
                if (chip) tone = chip.colorClass;
                if (cleared) tone = "bg-red-50 text-red-600 line-through";

                return (
                  <td
                    key={date}
                    data-cell={key}
                    title={chip?.title}
                    className={`${CELL_BASE} relative ${tone} ${
                      key === focusKey ? "outline-2 outline-teal-600" : ""
                    } ${changed ? "font-semibold ring-2 ring-inset ring-teal-600" : ""}`}
                  >
                    <span className="block truncate px-1">
                      {cleared ? "clear" : (chip?.label ?? "")}
                    </span>
                    {!cleared && (paint?.areaId || paint?.clientId) && (
                      <span className="absolute bottom-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
