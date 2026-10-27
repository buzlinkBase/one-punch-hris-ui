import { Button, Select, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type {
  ApprovalScopeDimension,
  ScopeCondition,
} from "../../models/api/approval-scope.model";
import { SCOPE_DIMENSIONS } from "../../services/scope-conditions.util";
import { useScopeOptions } from "../../hooks/use-scope-options";

const { Text } = Typography;

interface Props {
  /** Leave Type is only offered for leave workflows. */
  applicationType?: string;
  value: ScopeCondition[];
  onChange: (next: ScopeCondition[]) => void;
  disabled?: boolean;
}

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

// "Applies to": who a workflow is for. Each row narrows by one dimension (a branch, a department,
// specific employees...); values inside a row are alternatives, and every row must match. With no
// rows the workflow is the company-wide default. Presentational -- the form owns the value.
export function ScopeConditionsEditor({
  applicationType,
  value,
  onChange,
  disabled,
}: Props) {
  const { options } = useScopeOptions();
  const used = new Set(value.map((c) => c.dimension));
  const offered = SCOPE_DIMENSIONS.filter(
    (d) => d.value !== "LeaveType" || applicationType === "Leave",
  );
  const free = offered.filter((d) => !used.has(d.value));

  const update = (index: number, patch: Partial<ScopeCondition>) =>
    onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const addCondition = () => {
    if (free.length === 0) return;
    onChange([...value, { dimension: free[0].value, values: [] }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && (
        <Text type="secondary">
          Everyone — this is the company-wide default. Add a condition to limit
          it to certain branches, sites, departments and so on.
        </Text>
      )}

      {value.map((condition, index) => {
        const dimension = SCOPE_DIMENSIONS.find(
          (d) => d.value === condition.dimension,
        );
        // The row's own dimension plus the ones no other row uses.
        const dimensionChoices = offered.filter(
          (d) => d.value === condition.dimension || !used.has(d.value),
        );
        return (
          // Grid, not flex: the values picker always gets the remaining width instead of
          // collapsing next to the type picker. Phones: type on its own row, values + remove below.
          <div
            key={condition.dimension}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:grid-cols-[13rem_minmax(0,1fr)_auto]"
          >
            <Select<ApprovalScopeDimension>
              value={condition.dimension}
              onChange={(next) =>
                update(index, { dimension: next, values: [] })
              }
              options={dimensionChoices.map((d) => ({
                value: d.value,
                label: d.label,
              }))}
              disabled={disabled}
              className="col-span-2 w-full sm:col-span-1"
              aria-label="Condition type"
            />
            <Select
              mode="multiple"
              allowClear
              showSearch
              maxTagCount="responsive"
              value={condition.values}
              onChange={(next: string[]) => update(index, { values: next })}
              options={options[condition.dimension]}
              filterOption={filterOption}
              placeholder={`Select ${dimension?.plural ?? "values"}`}
              disabled={disabled}
              className="w-full min-w-0"
              aria-label="Condition values"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={disabled}
              aria-label="Remove condition"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            />
          </div>
        );
      })}

      <div>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addCondition}
          disabled={disabled || free.length === 0}
        >
          Add condition
        </Button>
      </div>
    </div>
  );
}
