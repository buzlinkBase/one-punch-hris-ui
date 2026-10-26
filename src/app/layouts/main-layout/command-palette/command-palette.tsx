import { Fragment, useMemo, useState } from "react";
import { Input, Modal } from "antd";
import {
  SearchOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { NavItem } from "@/shared/constants/navigation.const";
import { getPermissionForPath } from "@/shared/constants/navigation.const";
import { authStorage } from "@/core/auth/auth-storage";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import {
  collectPalettePages,
  searchPaletteEmployees,
  searchPalettePages,
} from "./palette-search";

const EMPLOYEE_PAGE = "/setup/employee";

interface PaletteEntry {
  key: string;
  label: string;
  hint: string;
  path: string;
  isEmployee: boolean;
  /** Heading shown above the first entry of each section (empty-query view only). */
  section?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Already permission- and plan-filtered menu, so results never expose pages the user can't open. */
  navItems: NavItem[];
  onNavigate: (path: string) => void;
  /** Shown first when the search box is empty. */
  pinnedPaths: string[];
  recentPaths: string[];
  onTogglePin: (path: string) => void;
}

/** Ctrl/Cmd+K palette: jump to any menu page, or straight to an employee's record. */
export function CommandPalette({
  open,
  onClose,
  navItems,
  onNavigate,
  pinnedPaths,
  recentPaths,
  onTogglePin,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const pages = useMemo(() => collectPalettePages(navItems), [navItems]);
  const canSearchEmployees = useMemo(() => {
    if (!pages.some((p) => p.path === EMPLOYEE_PAGE)) return false;
    const permission = getPermissionForPath(EMPLOYEE_PAGE);
    if (!permission) return true;
    return authStorage.hasAnyPermission(
      ...(Array.isArray(permission) ? permission : [permission]),
    );
  }, [pages]);

  const { data: employees = [] } = useEmployeeFilter(
    {},
    { enabled: open && canSearchEmployees },
  );

  const entries = useMemo<PaletteEntry[]>(() => {
    const toEntry = (
      p: { path: string; label: string; breadcrumb: string },
      section?: string,
    ): PaletteEntry => ({
      key: `${section ?? "page"}:${p.path}`,
      label: p.label,
      hint: p.breadcrumb,
      path: p.path,
      isEmployee: false,
      section,
    });

    if (query.trim() === "") {
      const byPath = new Map(pages.map((p) => [p.path, p]));
      const pinned = pinnedPaths.flatMap((path) => byPath.get(path) ?? []);
      const recent = recentPaths
        .filter((path) => !pinnedPaths.includes(path))
        .flatMap((path) => byPath.get(path) ?? []);
      if (pinned.length + recent.length > 0) {
        return [
          ...pinned.map((p) => toEntry(p, "Pinned")),
          ...recent.map((p) => toEntry(p, "Recent")),
        ];
      }
    }

    const pageEntries = searchPalettePages(pages, query).map((p) => toEntry(p));
    const employeeEntries = canSearchEmployees
      ? searchPaletteEmployees(employees, query).map((e) => ({
          key: `employee:${e.id}`,
          label: e.name ?? e.id,
          hint: [e.departmentName, e.branchName].filter(Boolean).join(" · "),
          path: `${EMPLOYEE_PAGE}/${e.id}`,
          isEmployee: true,
        }))
      : [];
    return [...pageEntries, ...employeeEntries];
  }, [pages, employees, query, canSearchEmployees, pinnedPaths, recentPaths]);

  // Start fresh each time the palette closes (adjusting state during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }

  const choose = (entry: PaletteEntry | undefined) => {
    if (!entry) return;
    onClose();
    onNavigate(entry.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(entries[active]);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnHidden
      width={560}
      title={null}
      className="command-palette"
    >
      <Input
        autoFocus
        size="large"
        variant="borderless"
        prefix={<SearchOutlined />}
        placeholder={
          canSearchEmployees ? "Search pages and employees…" : "Search pages…"
        }
        aria-label="Search pages and employees"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={handleKeyDown}
      />
      <ul
        role="listbox"
        aria-label="Results"
        className="m-0 mt-2 max-h-80 list-none overflow-y-auto p-0"
      >
        {entries.length === 0 && (
          <li className="px-3 py-6 text-center text-(--ant-color-text-secondary)">
            No results
          </li>
        )}
        {entries.map((entry, index) => (
          <Fragment key={entry.key}>
            {entry.section && entry.section !== entries[index - 1]?.section && (
              <li
                role="presentation"
                className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.12em] text-(--ant-color-text-tertiary) uppercase"
              >
                {entry.section}
              </li>
            )}
            <li
              role="option"
              aria-selected={index === active}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                index === active ? "bg-(--ant-color-fill-tertiary)" : ""
              }`}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(entry)}
            >
              {entry.isEmployee && <TeamOutlined />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">
                  {entry.label}
                </div>
                {entry.hint && (
                  <div className="truncate text-[11px] text-(--ant-color-text-tertiary)">
                    {entry.hint}
                  </div>
                )}
              </div>
              {!entry.isEmployee && (
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-1 text-(--ant-color-text-tertiary) hover:text-(--ant-color-warning)"
                  aria-label={
                    pinnedPaths.includes(entry.path)
                      ? `Unpin ${entry.label}`
                      : `Pin ${entry.label}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(entry.path);
                  }}
                >
                  {pinnedPaths.includes(entry.path) ? (
                    <StarFilled className="text-(--ant-color-warning)" />
                  ) : (
                    <StarOutlined />
                  )}
                </button>
              )}
            </li>
          </Fragment>
        ))}
      </ul>
    </Modal>
  );
}
