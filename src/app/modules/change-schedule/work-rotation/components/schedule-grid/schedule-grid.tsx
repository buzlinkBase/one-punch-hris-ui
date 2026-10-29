import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Checkbox, Dropdown, Tooltip, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { PaletteShift } from "../shift-palette";
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
  // Offered in the right-click / cell-button menu.
  menuShifts: PaletteShift[];
  // Paints one cell with a shift, or null to clear it, without touching the brush.
  onPickShift: (key: string, shiftId: string | null) => void;
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
  menuShifts,
  onPickShift,
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
    dragging.current = true;
    onFocusCell(key);
    onClickCell(key);
  };

  const handleEnter = (e: MouseEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const key = keyOf(e);
    if (key) onPaint([key]);
  };

  // One shared menu serves every cell. antd places it at the pointer for a contextmenu event;
  // the cell's arrow button re-dispatches one from itself so both paths open the same menu.
  const menuCell = useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = useMemo<MenuProps["items"]>(() => {
    const groups = new Map<string, PaletteShift[]>();
    for (const s of menuShifts) {
      groups.set(s.group, [...(groups.get(s.group) ?? []), s]);
    }
    return [
      ...[...groups].map(([group, items]) => ({
        type: "group" as const,
        key: group,
        label: group,
        children: items.map((s) => ({
          key: s.id,
          label: s.title,
        })),
      })),
      { type: "divider" as const },
      { key: "clear", label: "Clear", danger: true },
    ];
  }, [menuShifts]);

  const handleMenuPick: MenuProps["onClick"] = ({ key }) => {
    setMenuOpen(false);
    if (menuCell.current) {
      onPickShift(menuCell.current, key === "clear" ? null : key);
    }
  };

  const handleContextMenuCapture = (e: MouseEvent<HTMLElement>) => {
    const key = keyOf(e);
    menuCell.current = key ?? null;
    if (key) onFocusCell(key);
    else e.stopPropagation();
  };

  const allSelected =
    employees.length > 0 && employees.every((e) => selectedIds.has(e.id));
  const someSelected = employees.some((e) => selectedIds.has(e.id));

  return (
    <div
      tabIndex={0}
      className="max-h-[65vh] overflow-auto rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-teal-600/30"
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
        <Dropdown
          trigger={["contextMenu"]}
          open={menuOpen}
          onOpenChange={setMenuOpen}
          menu={{
            items: menuItems,
            onClick: handleMenuPick,
            className: "max-h-80 overflow-auto",
          }}
        >
          <tbody
            onMouseDown={handleDown}
            onMouseOver={handleEnter}
            onContextMenuCapture={handleContextMenuCapture}
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
                  const chip = paint?.shiftId
                    ? shifts.get(paint.shiftId)
                    : null;
                  const cleared = !!edit && edit.shiftId === null && changed;

                  let tone = "bg-white hover:bg-gray-50";
                  if (chip) tone = chip.colorClass;
                  if (cleared) tone = "bg-red-50 text-red-600 line-through";

                  return (
                    <td
                      key={date}
                      data-cell={key}
                      title={chip?.title}
                      className={`${CELL_BASE} group relative ${tone} ${
                        key === focusKey ? "outline-2 outline-teal-600" : ""
                      } ${changed ? "font-semibold ring-2 ring-inset ring-teal-600" : ""}`}
                    >
                      <span className="block truncate px-1">
                        {cleared ? "clear" : (chip?.label ?? "")}
                      </span>
                      <button
                        type="button"
                        aria-label="Choose a shift for this day"
                        className="absolute right-0 top-0 hidden h-4 w-4 items-center justify-center rounded-bl bg-white/80 text-[10px] text-gray-600 hover:bg-white group-hover:flex"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          e.currentTarget.dispatchEvent(
                            new MouseEvent("contextmenu", {
                              bubbles: true,
                              cancelable: true,
                              clientX: rect.left,
                              clientY: rect.bottom,
                            }),
                          );
                        }}
                      >
                        <DownOutlined />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Dropdown>
      </table>
    </div>
  );
}
