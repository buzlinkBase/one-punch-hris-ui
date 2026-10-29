import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import {
  CopyOutlined,
  DownOutlined,
  LeftOutlined,
  ReloadOutlined,
  RetweetOutlined,
  SaveOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { apiErrorMessage } from "@/core/http/api-error";
import { authStorage } from "@/core/auth/auth-storage";
import { getNotify } from "@/shared/utils/notify";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  filterPayrollGroupOption,
  payrollGroupOptionRender,
  toPayrollGroupOptions,
} from "@/shared/utils/payroll-group-options.util";
import {
  useApplyScheduleGrid,
  useFetchScheduleGrid,
  useScheduleGrid,
  useScheduleScope,
} from "../../hooks/use-work-rotation-queries";
import { ScheduleGrid, type ShiftChip } from "../../components/schedule-grid";
import {
  ShiftPalette,
  type PaletteShift,
} from "../../components/shift-palette";
import {
  clientAfterSiteChange,
  siteAfterClientChange,
  siteOptionGroups,
} from "../../utils/site-client-options.util";
import { PatternModal } from "../../components/pattern-modal";
import {
  CellEditorModal,
  type CellEditTarget,
} from "../../components/cell-editor-modal";
import type { ApplyScheduleGridEntry } from "../../models/api/request/apply-schedule-grid.model";
import {
  shiftGroupLabel,
  sortShiftsForPalette,
} from "../../utils/shift-order.util";
import {
  buildDates,
  buildEntries,
  cellKey,
  chunk,
  indexPlans,
  parsePasteGrid,
  patternAt,
  SAVE_CHUNK_SIZE,
  splitCellKey,
  type CellPaint,
} from "../../utils/schedule-grid.util";
import { WriteGate } from "@/shared/components/write-gate/write-gate";

const { Title, Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// Static class names so Tailwind picks them up; shifts take them in order.
const SHIFT_COLORS = [
  "border-emerald-300 bg-emerald-100 text-emerald-800",
  "border-sky-300 bg-sky-100 text-sky-800",
  "border-amber-300 bg-amber-100 text-amber-800",
  "border-violet-300 bg-violet-100 text-violet-800",
  "border-rose-300 bg-rose-100 text-rose-800",
  "border-teal-300 bg-teal-100 text-teal-800",
  "border-orange-300 bg-orange-100 text-orange-800",
  "border-indigo-300 bg-indigo-100 text-indigo-800",
];

// [action, what it does] -- shown as a quick reference under the palette.
const GRID_TIPS: [string, string][] = [
  ["Click / drag", "Paint with the shift, client and site picked above"],
  ["Click a date", "Paint that day for every employee"],
  ["Double-click / right-click", "Set one day's shift, client and site"],
  ["Click a cell, Ctrl+C", "Use its settings as the template for next cells"],
  ["Click a cell, paste", 'Paste shift names from Excel ("-" clears)'],
  ["Ring on a day", "Unsaved until you click Save schedule"],
  ["Clear", "Sends the day back to the regular schedule"],
];

const TIPS_STORAGE_KEY = "quick-schedule-tips-open";
const PALETTE_STORAGE_KEY = "quick-schedule-palette-open";

const readOpen = (storageKey: string, defaultOpen = true) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === null ? defaultOpen : stored === "1";
  } catch {
    return defaultOpen;
  }
};

const writeOpen = (storageKey: string, open: boolean) => {
  try {
    localStorage.setItem(storageKey, open ? "1" : "0");
  } catch {
    // Storage unavailable: the choice just lasts for this visit.
  }
};

interface EmployeeFilterState {
  branchId?: string;
  departmentId?: string;
  clientId?: string;
  payrollGroupId?: string;
  operationAreaId?: string;
}

interface LastSave {
  saved: number;
  cleared: number;
  // The entries that put every saved day back the way it was.
  revert: ApplyScheduleGridEntry[];
}

const isTypingTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      el.isContentEditable)
  );
};

export default function QuickSchedule() {
  const navigate = useNavigate();
  const { modal } = App.useApp();

  // Same scoping rule as the Work Rotation create page and the API: Create is unscoped,
  // ManageOwnTeam alone is limited to direct reports.
  const isTeamScoped =
    !authStorage.hasPermission("Work Rotation:Create") &&
    authStorage.hasPermission("Work Rotation:ManageOwnTeam");
  // A team-scoped caller's employees and sites come from the server (direct reports plus their
  // granted project sites); everyone else filters the whole company.
  const { data: scope, isLoading: isScopeLoading } =
    useScheduleScope(isTeamScoped);

  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().add(1, "day"),
    dayjs().add(7, "day"),
  ]);
  const from = range[0].format(DATE_FORMAT);
  const to = range[1].format(DATE_FORMAT);
  const dates = useMemo(() => buildDates(from, to), [from, to]);

  const [filter, setFilter] = useState<EmployeeFilterState>({});
  const [committed, setCommitted] = useState<EmployeeFilterState | null>(null);
  const [search, setSearch] = useState("");

  const { data: filteredEmployees = [], isLoading: isFilterLoading } =
    useEmployeeFilter(committed ?? {}, {
      enabled: !isTeamScoped && committed !== null,
    });
  const isEmployeesLoading = isTeamScoped ? isScopeLoading : isFilterLoading;
  const allEmployees = useMemo(
    () =>
      (isTeamScoped ? (scope?.employees ?? []) : filteredEmployees)
        .map((e) => ({ id: e.id, name: e.name ?? e.id }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [isTeamScoped, scope?.employees, filteredEmployees],
  );
  const employeeIds = useMemo(
    () => allEmployees.map((e) => e.id),
    [allEmployees],
  );
  const visibleEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? allEmployees.filter((e) => e.name.toLowerCase().includes(q))
      : allEmployees;
  }, [allEmployees, search]);

  const { data: plans = [], isFetching: isGridLoading } = useScheduleGrid(
    { fromDate: from, toDate: to, employeeIds },
    employeeIds.length > 0 && dates.length > 0,
  );
  const server = useMemo(() => indexPlans(plans), [plans]);

  // Shifts and their palette colors.
  const { data: timeShifts = [], isLoading: isShiftsLoading } =
    useFixedTimeShifts();
  // Fixed shifts first, then flexi, each A-Z then by start time; the 1-9 keys follow this order.
  const orderedShifts = useMemo(
    () => sortShiftsForPalette(timeShifts),
    [timeShifts],
  );
  const paletteShifts: PaletteShift[] = useMemo(
    () =>
      orderedShifts.map((s, i) => ({
        id: s.id,
        label: s.shiftName,
        title:
          s.startTime && s.endTime
            ? `${s.shiftName} (${s.startTime} – ${s.endTime})`
            : s.shiftName,
        colorClass: SHIFT_COLORS[i % SHIFT_COLORS.length],
        group: shiftGroupLabel(s.shiftType),
      })),
    [orderedShifts],
  );
  const shiftChips = useMemo(
    () =>
      new Map<string, ShiftChip>(
        paletteShifts.map((s) => [
          s.id,
          { label: s.label, title: s.title, colorClass: s.colorClass },
        ]),
      ),
    [paletteShifts],
  );
  const shiftIdByName = useMemo(
    () => new Map(timeShifts.map((s) => [s.shiftName.toLowerCase(), s.id])),
    [timeShifts],
  );

  // The brush: a shift id, or null for clear. Until one is picked, the first shift.
  const [pickedBrush, setPickedBrush] = useState<string | null | undefined>(
    undefined,
  );
  const brush =
    pickedBrush === undefined ? (paletteShifts[0]?.id ?? null) : pickedBrush;
  const [siteId, setSiteId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const paintFor = (shiftId: string | null): CellPaint => ({
    shiftId,
    areaId: shiftId ? siteId : null,
    clientId: shiftId ? clientId : null,
  });

  const [edits, setEdits] = useState<Map<string, CellPaint>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [patternOpen, setPatternOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Remembered per browser so a closed reference stays closed next visit.
  const [tipsOpen, setTipsOpen] = useState(() => readOpen(TIPS_STORAGE_KEY));
  const changeTipsOpen = (open: boolean) => {
    setTipsOpen(open);
    writeOpen(TIPS_STORAGE_KEY, open);
  };
  // Collapsing the palette card leaves a one-line summary and gives the grid the room.
  const [paletteOpen, setPaletteOpen] = useState(() =>
    readOpen(PALETTE_STORAGE_KEY, false),
  );
  const changePaletteOpen = (open: boolean) => {
    setPaletteOpen(open);
    writeOpen(PALETTE_STORAGE_KEY, open);
  };
  const [lastSave, setLastSave] = useState<LastSave | null>(null);

  const entries = useMemo(() => buildEntries(edits, server), [edits, server]);
  const changedEmployees = useMemo(
    () => new Set(entries.map((e) => e.employeeId)).size,
    [entries],
  );
  useUnsavedChangesGuard(entries.length > 0);

  const { mutateAsync: applyGrid, isPending: isSaving } =
    useApplyScheduleGrid();
  const { mutateAsync: fetchGrid, isPending: isCopying } =
    useFetchScheduleGrid();

  // Shortcuts: 1-9 pick a shift, 0 picks clear.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (e.key === "0") setPickedBrush(null);
      else if (/^[1-9]$/.test(e.key) && paletteShifts[Number(e.key) - 1]) {
        setPickedBrush(paletteShifts[Number(e.key) - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteShifts]);

  // Changing the dates or the employees would leave edits pointing at cells that are gone.
  const guardEdits = (proceed: () => void) => {
    if (edits.size === 0) {
      proceed();
      return;
    }
    modal.confirm({
      title: "Discard unsaved changes?",
      content: `${entries.length} change${entries.length === 1 ? "" : "s"} haven't been saved.`,
      okText: "Discard",
      okButtonProps: { danger: true },
      cancelText: "Keep editing",
      onOk: () => {
        setEdits(new Map());
        proceed();
      },
    });
  };

  const applyPaints = (paints: [string, CellPaint][]) =>
    setEdits((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const [key, paint] of paints) {
        const cur = next.get(key);
        if (
          cur &&
          cur.shiftId === paint.shiftId &&
          cur.areaId === paint.areaId &&
          cur.clientId === paint.clientId
        ) {
          continue;
        }
        next.set(key, paint);
        changed = true;
      }
      return changed ? next : prev;
    });

  const paintKeys = (keys: string[]) => {
    const paint = paintFor(brush);
    applyPaints(keys.map((k) => [k, paint]));
  };

  // Clicking a cell that already holds the brush's unsaved paint puts back what was saved.
  // What the cell held before the last click, so a double-click can open the editor on the cell's
  // real values instead of the paint the first click just applied.
  const lastPress = useRef<{ key: string; prev: CellPaint | undefined } | null>(
    null,
  );

  const openEditor = (key: string, fromDoubleClick = false) => {
    const press = lastPress.current;
    if (fromDoubleClick && press?.key === key) {
      setEdits((prev) => {
        const next = new Map(prev);
        if (press.prev) next.set(key, press.prev);
        else next.delete(key);
        return next;
      });
    }
    lastPress.current = null;
    setEditingKey(key);
  };

  const clickCell = (key: string) => {
    const paint = paintFor(brush);
    const cur = edits.get(key);
    lastPress.current = { key, prev: cur };
    if (
      cur &&
      cur.shiftId === paint.shiftId &&
      cur.areaId === paint.areaId &&
      cur.clientId === paint.clientId
    ) {
      setEdits((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      return;
    }
    applyPaints([[key, paint]]);
  };

  // The copied cell's settings become the brush, so the next cells painted get the same shift,
  // client and project site.
  const adoptTemplate = (paint: CellPaint) => {
    setPickedBrush(paint.shiftId);
    setSiteId(paint.areaId);
    setClientId(paint.clientId);
  };

  const copyCell = (key: string) => {
    const paint = edits.get(key) ?? server.get(key);
    adoptTemplate(paint ?? { shiftId: null, areaId: null, clientId: null });
    const parts = [
      paint?.shiftId ? shiftChips.get(paint.shiftId)?.title : "Clear",
      paint?.clientId
        ? clients.find((c) => c.id === paint.clientId)?.name
        : null,
      paint?.areaId ? allAreas.find((a) => a.id === paint.areaId)?.name : null,
    ].filter(Boolean);
    getNotify().info({
      message: "Template copied",
      description: `${parts.join(" · ")}. The next cells you paint use it.`,
    });
  };

  const fillDay = (date: string) =>
    paintKeys(visibleEmployees.map((e) => cellKey(e.id, date)));

  const targetRows = () =>
    visibleEmployees.filter(
      (e) => selectedIds.size === 0 || selectedIds.has(e.id),
    );

  const fillSelectedRows = () =>
    paintKeys(targetRows().flatMap((e) => dates.map((d) => cellKey(e.id, d))));

  const applyPattern = (
    pattern: (string | null)[],
    offset: number,
    stagger: boolean,
  ) => {
    const paints: [string, CellPaint][] = [];
    targetRows().forEach((emp, row) => {
      dates.forEach((date, i) => {
        paints.push([
          cellKey(emp.id, date),
          paintFor(patternAt(pattern, i, offset + (stagger ? row : 0))),
        ]);
      });
    });
    applyPaints(paints);
  };

  const copyPreviousPeriod = async () => {
    const days = dates.length;
    try {
      const previous = await fetchGrid({
        fromDate: range[0].subtract(days, "day").format(DATE_FORMAT),
        toDate: range[0].subtract(1, "day").format(DATE_FORMAT),
        employeeIds,
      });
      const prev = indexPlans(previous);
      const paints: [string, CellPaint][] = [];
      for (const emp of visibleEmployees) {
        for (const date of dates) {
          const source = dayjs(date).subtract(days, "day").format(DATE_FORMAT);
          const paint = prev.get(cellKey(emp.id, source));
          if (paint) paints.push([cellKey(emp.id, date), paint]);
        }
      }
      applyPaints(paints);
      getNotify().info({
        message: "Copied from the previous period",
        description: paints.length
          ? `${paints.length} day${paints.length === 1 ? "" : "s"} filled in. Review and save.`
          : "The previous period has no schedules to copy.",
      });
    } catch (err) {
      getNotify().error({
        message: "Copy Failed",
        description: apiErrorMessage(err, "Couldn't load the previous period."),
      });
    }
  };

  // Spreadsheet paste: the top-left cell lands on the last clicked cell.
  const pasteText = (text: string) => {
    if (!focusKey) {
      getNotify().warning({
        message: "Click a cell first",
        description: "Pasted shifts start at the cell you clicked.",
      });
      return;
    }
    const { employeeId, date } = splitCellKey(focusKey);
    const startRow = visibleEmployees.findIndex((e) => e.id === employeeId);
    const startCol = dates.indexOf(date);
    if (startRow < 0 || startCol < 0) return;

    const { rows, invalid } = parsePasteGrid(text, shiftIdByName);
    const paints: [string, CellPaint][] = [];
    rows.forEach((cells, r) => {
      const emp = visibleEmployees[startRow + r];
      if (!emp) return;
      cells.forEach((cell, c) => {
        const day = dates[startCol + c];
        if (!day || cell.kind === "skip") return;
        paints.push([
          cellKey(emp.id, day),
          paintFor(cell.kind === "clear" ? null : cell.shiftId),
        ]);
      });
    });
    applyPaints(paints);
    if (invalid.length > 0) {
      getNotify().warning({
        message: "Some shifts weren't recognized",
        description: `Skipped: ${invalid.join(", ")}. Use the exact shift names, or "-" to clear.`,
      });
    }
  };

  const save = async () => {
    // Remember how each saved day was, so Undo can put it back.
    const revert: ApplyScheduleGridEntry[] = entries.map((e) => {
      const before = server.get(cellKey(e.employeeId, e.payrollDate));
      return {
        employeeId: e.employeeId,
        payrollDate: e.payrollDate,
        timeShiftId: before?.shiftId ?? null,
        operationAreaId: before?.areaId ?? null,
        clientId: before?.clientId ?? null,
      };
    });

    let saved = 0;
    let cleared = 0;
    try {
      for (const part of chunk(entries, SAVE_CHUNK_SIZE)) {
        const result = await applyGrid({ entries: part });
        saved += result.saved;
        cleared += result.cleared;
      }
      setEdits(new Map());
      setLastSave({ saved, cleared, revert });
      getNotify().success({
        message: "Schedule Saved",
        description: `${saved} day${saved === 1 ? "" : "s"} scheduled${cleared ? `, ${cleared} cleared` : ""}.`,
      });
    } catch (err) {
      getNotify().error({
        message: "Save Failed",
        description: apiErrorMessage(
          err,
          saved > 0
            ? "Part of the schedule was saved before this error. Reload and check."
            : "Failed to save the schedule. Please try again.",
        ),
      });
    }
  };

  const undo = async () => {
    if (!lastSave) return;
    try {
      for (const part of chunk(lastSave.revert, SAVE_CHUNK_SIZE)) {
        await applyGrid({ entries: part });
      }
      setLastSave(null);
      getNotify().success({ message: "Last save undone" });
    } catch (err) {
      getNotify().error({
        message: "Undo Failed",
        description: apiErrorMessage(err, "Couldn't undo the last save."),
      });
    }
  };

  const toggleEmployee = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The sticky save bar reads "N changes" only once something really differs from what's saved.
  const hasChanges = entries.length > 0;

  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: allAreas = [] } = useOperationAreas();
  // A supervisor with granted sites can only send people to those.
  const allowedAreaIds = scope?.allowedAreaIds ?? [];
  const areas =
    isTeamScoped && allowedAreaIds.length > 0
      ? allAreas.filter((a) => allowedAreaIds.includes(a.id))
      : allAreas;

  const codeNameOptions = (
    items: { id: string; code: string; name: string }[],
  ) => items.map((i) => ({ value: i.id, label: `${i.code} - ${i.name}` }));

  // The per-day editor narrows sites by client, so it needs each site's own client.
  const editorSites = areas.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    clientId: a.clientId ?? null,
    clientName: a.clientName ?? null,
  }));
  const clientNameOf = (id: string) =>
    clients.find((c) => c.id === id)?.name ?? "this client";
  // A site belongs to one client: picking a client narrows the sites, picking a site fills in its
  // client. Same rule as the per-day editor.
  const changeBrushClient = (next: string | null) => {
    setClientId(next);
    setSiteId(siteAfterClientChange(editorSites, next, siteId));
  };
  const changeBrushSite = (next: string | null) => {
    setSiteId(next);
    setClientId(clientAfterSiteChange(editorSites, next, clientId));
  };
  const brushChip = brush ? shiftChips.get(brush) : undefined;
  const actionButtons = (
    <WriteGate>
      <Space wrap>
        <Button
          disabled={visibleEmployees.length === 0}
          onClick={fillSelectedRows}
        >
          Paint {selectedIds.size ? "selected rows" : "all rows"}
        </Button>
        <Button
          icon={<RetweetOutlined />}
          disabled={visibleEmployees.length === 0}
          onClick={() => setPatternOpen(true)}
        >
          Repeat a pattern
        </Button>
        <Button
          icon={<CopyOutlined />}
          loading={isCopying}
          disabled={visibleEmployees.length === 0}
          onClick={copyPreviousPeriod}
        >
          Copy previous period
        </Button>
      </Space>
    </WriteGate>
  );
  const shiftOptions = paletteShifts.map((s) => ({
    value: s.id,
    label: s.title,
  }));
  let editTarget: CellEditTarget | null = null;
  if (editingKey) {
    const { employeeId, date } = splitCellKey(editingKey);
    editTarget = {
      key: editingKey,
      employeeName:
        allEmployees.find((e) => e.id === employeeId)?.name ?? employeeId,
      date,
      paint: edits.get(editingKey) ?? server.get(editingKey) ?? null,
    };
  }

  const setFilterField = (field: keyof EmployeeFilterState, value?: string) =>
    setFilter((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Quick Schedule
            </Title>
            <p className="page-toolbar-subtitle">
              Paint shifts across many employees and days, then save once.
            </p>
          </div>
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
          >
            Back to Work Rotation
          </Button>
        </div>
      </div>

      {lastSave && (
        <Alert
          type="success"
          showIcon
          closable
          onClose={() => setLastSave(null)}
          message={`Saved ${lastSave.saved} scheduled day${lastSave.saved === 1 ? "" : "s"}${lastSave.cleared ? ` and ${lastSave.cleared} cleared` : ""}.`}
          action={
            <Button size="small" loading={isSaving} onClick={undo}>
              Undo
            </Button>
          }
        />
      )}

      <Card size="small" title="1. Dates and employees">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Text type="secondary">Dates (up to 62 days)</Text>
            <MobileRangePicker
              value={range}
              allowClear={false}
              onChange={(v) => {
                if (v?.[0] && v[1]) {
                  guardEdits(() => setRange([v[0]!, v[1]!]));
                }
              }}
            />
          </div>
          {isTeamScoped ? (
            <Text type="secondary">Showing your team.</Text>
          ) : (
            <>
              <Select
                className="w-44"
                placeholder="Branch"
                allowClear
                showSearch={{ filterOption: filterByLabel }}
                options={codeNameOptions(branches)}
                value={filter.branchId}
                onChange={(v) => setFilterField("branchId", v)}
              />
              <Select
                className="w-44"
                placeholder="Department"
                allowClear
                showSearch={{ filterOption: filterByLabel }}
                options={codeNameOptions(departments)}
                value={filter.departmentId}
                onChange={(v) => setFilterField("departmentId", v)}
              />
              <Select
                className="w-44"
                placeholder="Client"
                allowClear
                showSearch={{ filterOption: filterByLabel }}
                options={codeNameOptions(clients)}
                value={filter.clientId}
                onChange={(v) => setFilterField("clientId", v)}
              />
              <Select
                className="w-44"
                placeholder="Payroll group"
                allowClear
                options={toPayrollGroupOptions(payrollGroups)}
                optionRender={payrollGroupOptionRender}
                showSearch={{ filterOption: filterPayrollGroupOption }}
                value={filter.payrollGroupId}
                onChange={(v) => setFilterField("payrollGroupId", v)}
              />
              <Select
                className="w-44"
                placeholder="Project site"
                allowClear
                showSearch={{ filterOption: filterByLabel }}
                options={codeNameOptions(areas)}
                value={filter.operationAreaId}
                onChange={(v) => setFilterField("operationAreaId", v)}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={isEmployeesLoading}
                onClick={() => guardEdits(() => setCommitted({ ...filter }))}
              >
                Load employees
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card
        size="small"
        title={
          <button
            type="button"
            className="w-full cursor-pointer text-left"
            aria-expanded={paletteOpen}
            onClick={() => changePaletteOpen(!paletteOpen)}
          >
            2. Pick a shift, then paint the grid
          </button>
        }
        extra={
          <Button
            type="link"
            size="small"
            icon={paletteOpen ? <UpOutlined /> : <DownOutlined />}
            onClick={() => changePaletteOpen(!paletteOpen)}
          >
            {paletteOpen ? "Collapse" : "Expand"}
          </Button>
        }
      >
        {!paletteOpen && (
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md border px-3 py-1 text-sm ${
                brushChip?.colorClass ?? "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {brushChip?.label ?? "Clear"}
            </span>
            {clientId && <Text type="secondary">{clientNameOf(clientId)}</Text>}
            {siteId && (
              <Text type="secondary">
                {allAreas.find((a) => a.id === siteId)?.name}
              </Text>
            )}
            {actionButtons}
          </div>
        )}
        <div className={`flex flex-col gap-3 ${paletteOpen ? "" : "hidden"}`}>
          {isShiftsLoading ? (
            <Text type="secondary">Loading shifts…</Text>
          ) : (
            <ShiftPalette
              shifts={paletteShifts}
              brush={brush}
              onChange={setPickedBrush}
            />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              className="w-60"
              placeholder="Client for painted days"
              allowClear
              showSearch={{ filterOption: filterByLabel }}
              options={codeNameOptions(clients)}
              value={clientId ?? undefined}
              onChange={(v?: string) => changeBrushClient(v ?? null)}
            />
            <Select
              className="w-60"
              placeholder="Project site for painted days"
              allowClear
              showSearch={{ filterOption: filterByLabel }}
              options={siteOptionGroups(
                editorSites,
                clientId,
                clientNameOf,
                siteId,
              )}
              value={siteId ?? undefined}
              onChange={(v?: string) => changeBrushSite(v ?? null)}
            />
          </div>
          {clientId && (
            <Text type="secondary" className="text-xs">
              Showing only this client&apos;s project sites.
            </Text>
          )}
          {actionButtons}
          {tipsOpen ? (
            <Alert
              type="info"
              closable
              onClose={() => changeTipsOpen(false)}
              title="Shortcuts"
              description={
                <ul className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-1.5 p-0 text-xs md:grid-cols-2">
                  {GRID_TIPS.map(([action, effect]) => (
                    <li key={action} className="flex items-baseline gap-2">
                      <span className="shrink-0 rounded border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-700">
                        {action}
                      </span>
                      <span>{effect}</span>
                    </li>
                  ))}
                </ul>
              }
            />
          ) : (
            <Button
              type="link"
              size="small"
              className="self-start p-0!"
              onClick={() => changeTipsOpen(true)}
            >
              Show shortcuts
            </Button>
          )}
        </div>
      </Card>

      <Card
        size="small"
        title="3. Schedule"
        extra={
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Find employee"
            className="w-52"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        loading={isGridLoading && plans.length === 0}
      >
        {visibleEmployees.length === 0 ? (
          <Text type="secondary">
            {isTeamScoped || committed
              ? "No employees found."
              : "Choose the employees above and click Load employees."}
          </Text>
        ) : (
          <ScheduleGrid
            employees={visibleEmployees}
            dates={dates}
            server={server}
            edits={edits}
            shifts={shiftChips}
            onEditCell={openEditor}
            onCopyCell={copyCell}
            selectedIds={selectedIds}
            focusKey={focusKey}
            onToggleEmployee={toggleEmployee}
            onToggleAll={(checked) =>
              setSelectedIds(
                checked
                  ? new Set(visibleEmployees.map((e) => e.id))
                  : new Set(),
              )
            }
            onPaint={paintKeys}
            onClickCell={clickCell}
            onFocusCell={setFocusKey}
            onFillDay={fillDay}
            onPasteText={pasteText}
          />
        )}
      </Card>

      <WriteGate>
        <div className="sticky bottom-0 z-40 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-md">
          <Text>
            {hasChanges
              ? `${entries.length} change${entries.length === 1 ? "" : "s"} for ${changedEmployees} employee${changedEmployees === 1 ? "" : "s"}`
              : "No unsaved changes"}
          </Text>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              disabled={edits.size === 0 || isSaving}
              onClick={() => setEdits(new Map())}
            >
              Discard
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isSaving}
              disabled={!hasChanges}
              onClick={save}
            >
              Save schedule
            </Button>
          </Space>
        </div>
      </WriteGate>

      <CellEditorModal
        target={editTarget}
        shiftOptions={shiftOptions}
        clientOptions={codeNameOptions(clients)}
        sites={editorSites}
        clientNameOf={clientNameOf}
        onApply={(key, paint) => {
          applyPaints([[key, paint]]);
          setEditingKey(null);
        }}
        onUseTemplate={(key, paint) => {
          applyPaints([[key, paint]]);
          adoptTemplate(paint);
          setEditingKey(null);
        }}
        onClear={(key) => {
          applyPaints([[key, { shiftId: null, areaId: null, clientId: null }]]);
          setEditingKey(null);
        }}
        onCancel={() => setEditingKey(null)}
      />

      <PatternModal
        open={patternOpen}
        shifts={paletteShifts}
        brush={brush}
        targetCount={targetRows().length}
        onApply={applyPattern}
        onClose={() => setPatternOpen(false)}
      />
    </div>
  );
}
