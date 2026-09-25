import { Button, Input, Space } from "antd";
import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

// Column filter dropdowns for server-driven antd tables. They only collect the value into the
// column's selectedKeys -- the table's onChange hands those to the caller, which turns them into
// query params. Nothing here filters rows client-side.

type FilterProps<T> = Pick<
  ColumnType<T>,
  "filterDropdown" | "filterIcon" | "filteredValue"
>;

// antd already colors the trigger when the column is filtered -- only the glyph differs.
const filterIcon = (Icon: typeof SearchOutlined) => () => <Icon />;

/** Free-text "contains" filter. `value` is the column's current filter (controlled). */
export function textColumnFilter<T>(
  value: string | undefined,
  placeholder = "Search",
): FilterProps<T> {
  return {
    filteredValue: value ? [value] : null,
    filterIcon: filterIcon(SearchOutlined),
    filterDropdown: ({
      selectedKeys,
      setSelectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2 w-56" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          allowClear
          placeholder={placeholder}
          value={(selectedKeys[0] as string | undefined) ?? ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          className="mb-2"
        />
        <Space className="w-full justify-end">
          <Button
            size="small"
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
          >
            Reset
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => confirm()}
          >
            Search
          </Button>
        </Space>
      </div>
    ),
  };
}

/** Date range filter (inclusive, "YYYY-MM-DD"). selectedKeys holds [from, to]. */
export function dateRangeColumnFilter<T>(
  from: string | undefined,
  to: string | undefined,
): FilterProps<T> {
  return {
    filteredValue: from || to ? [from ?? "", to ?? ""] : null,
    filterIcon: filterIcon(CalendarOutlined),
    filterDropdown: ({
      selectedKeys,
      setSelectedKeys,
      confirm,
      clearFilters,
    }) => {
      const [start, end] = selectedKeys as string[];
      return (
        <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
          <MobileRangePicker
            value={[start ? dayjs(start) : null, end ? dayjs(end) : null]}
            onChange={(dates) =>
              setSelectedKeys(
                dates
                  ? [
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]
                  : [],
              )
            }
          />
          <Space className="w-full justify-end mt-2">
            <Button
              size="small"
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
            >
              Reset
            </Button>
            <Button size="small" type="primary" onClick={() => confirm()}>
              Filter
            </Button>
          </Space>
        </div>
      );
    },
  };
}
