import { Badge, Select } from "antd";
import { DownOutlined, LockOutlined } from "@ant-design/icons";

export interface SectionNavItem {
  key: string;
  label: string;
  /** Validation errors currently showing in this section. */
  errorCount?: number;
  /** Section can't be opened yet (shows a lock). */
  locked?: boolean;
}

export interface SectionNavGroup {
  title: string;
  items: SectionNavItem[];
}

interface SectionNavProps {
  groups: SectionNavGroup[];
  active: string;
  onChange: (key: string) => void;
  isMobile: boolean;
}

/**
 * Grouped outline for a multi-section form or settings page: a sticky side rail on desktop, a grouped dropdown on
 * phones. Sections with validation errors show a red count; record sections of an unsaved
 * employee show a lock.
 */
export function SectionNav({
  groups,
  active,
  onChange,
  isMobile,
}: SectionNavProps) {
  if (isMobile) {
    const current = groups
      .flatMap((g) => g.items)
      .find((item) => item.key === active);
    const totalErrors = groups
      .flatMap((g) => g.items)
      .reduce((sum, item) => sum + (item.errorCount ?? 0), 0);

    return (
      <div className="rounded-xl border border-(--ant-color-primary) bg-(--ant-color-primary-bg) p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-(--ant-color-primary) uppercase">
            Jump to section
          </span>
          {totalErrors > 0 && (
            <Badge count={`${totalErrors} to fix`} color="red" size="small" />
          )}
        </div>
        <Select
          className="w-full"
          size="large"
          aria-label="Section"
          value={active}
          onChange={onChange}
          suffixIcon={<DownOutlined className="text-(--ant-color-primary)!" />}
          labelRender={() => (
            <span className="font-semibold">{current?.label}</span>
          )}
          options={groups.map((group) => ({
            label: group.title,
            options: group.items.map((item) => ({
              value: item.key,
              disabled: item.locked,
              label: item.errorCount
                ? `${item.label} (${item.errorCount} to fix)`
                : item.locked
                  ? `${item.label} (save first)`
                  : item.label,
            })),
          }))}
        />
      </div>
    );
  }

  return (
    <nav
      aria-label="Sections"
      className="w-60 shrink-0 self-start rounded-xl border border-(--ant-color-border-secondary) bg-(--ant-color-bg-container) p-3 md:sticky md:top-20"
    >
      {groups.map((group) => (
        <div
          key={group.title}
          className="border-t border-(--ant-color-border-secondary) pt-3 mt-3 first:mt-0 first:border-t-0 first:pt-0"
        >
          <p className="m-0 mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-(--ant-color-text-tertiary) uppercase">
            {group.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {group.items.map((item) => {
              const isActive = item.key === active;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    disabled={item.locked}
                    aria-current={isActive ? "page" : undefined}
                    title={item.locked ? "Save first" : undefined}
                    onClick={() => onChange(item.key)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-0 px-3 py-2.5 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive
                        ? "bg-(--ant-color-primary-bg) font-semibold text-(--ant-color-primary)"
                        : "bg-transparent text-(--ant-color-text) hover:bg-(--ant-color-fill-tertiary)"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {!!item.errorCount && (
                      <Badge count={item.errorCount} size="small" />
                    )}
                    {item.locked && <LockOutlined aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
