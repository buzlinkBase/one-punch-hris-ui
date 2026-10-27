import type { ReactNode } from "react";
import { Badge, Button, Card, Form, Tag, Typography } from "antd";
import { ClearOutlined, FilterOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ToggleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
}

// "Filters" button with the active-filter badge. Lives in the page toolbar next to Export etc.
export function FilterToggleButton({
  open,
  onOpenChange,
  activeCount,
}: ToggleProps) {
  return (
    <Badge count={activeCount} size="small">
      <Button
        icon={<FilterOutlined />}
        onClick={() => onOpenChange(!open)}
        type={open ? "default" : "text"}
      >
        Filters
      </Button>
    </Badge>
  );
}

interface PanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the current filter is, shown as chips while the card is collapsed. */
  chips: string[];
  onClear: () => void;
  /** Omit for pages that filter live and have nothing to submit. */
  onApply?: () => void;
  applyLabel?: string;
  applyIcon?: ReactNode;
  applyLoading?: boolean;
  applyDisabled?: boolean;
  /** Tailwind grid-cols classes for the field grid. */
  gridClassName?: string;
  /** The `Form.Item`s; give each `className="mb-3"` (add `sm:col-span-2` to widen). */
  children: ReactNode;
}

const DEFAULT_GRID = "grid grid-cols-1 sm:grid-cols-4 gap-x-4";

// Collapsible filter card + the "Showing <chips> / Change filters" summary row, shared by every
// list page that filters. Presentational only -- each page owns its filter state.
export function FilterPanel({
  open,
  onOpenChange,
  chips,
  onClear,
  onApply,
  applyLabel = "Apply",
  applyIcon,
  applyLoading,
  applyDisabled,
  gridClassName = DEFAULT_GRID,
  children,
}: PanelProps) {
  if (!open) {
    if (chips.length === 0) return null;
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Text type="secondary">Showing</Text>
        {chips.map((chip) => (
          <Tag
            key={chip}
            className="me-0! cursor-pointer"
            onClick={() => onOpenChange(true)}
          >
            {chip}
          </Tag>
        ))}
        <Button type="link" size="small" onClick={() => onOpenChange(true)}>
          Change filters
        </Button>
      </div>
    );
  }

  return (
    <Card size="small" className="mb-4">
      <Form layout="vertical">
        <div className={gridClassName}>{children}</div>
        <div className="mt-1 flex justify-end gap-2">
          <Button icon={<ClearOutlined />} onClick={onClear}>
            Clear
          </Button>
          {onApply && (
            <Button
              type="primary"
              icon={applyIcon}
              loading={applyLoading}
              disabled={applyDisabled}
              onClick={onApply}
            >
              {applyLabel}
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
}
