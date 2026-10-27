import { Button, Card, Form, Input, InputNumber, Select, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import type { ApprovalWorkflowFormValues } from "../../models/forms/approval-workflow-form.schema";
import {
  APPROVER_TYPE_OPTIONS,
  UNRESOLVED_POLICY_OPTIONS,
} from "../../constants/label.const";
import {
  describeDynamicApprover,
  isDynamicApprover,
  resolvesToOnePerson,
  takesApproverLevel,
} from "../../services/step-approver-types";
import { EMPTY_GROUP, MAX_GROUPS_PER_STEP } from "./step-group.const";

type Option = { value: string; label: string };

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

interface Props {
  control: Control<ApprovalWorkflowFormValues>;
  errors: FieldErrors<ApprovalWorkflowFormValues>;
  stepIndex: number;
  departmentOptions: Option[];
  positionOptions: Option[];
  employeeOptions: Option[];
}

// "Also needs approval from": extra pools of approvers on a step. The step clears only when its own
// approver AND every group here has reached its quorum -- for example one approval from HR and one
// from Finance, in any order. Presentational: the page's form owns the values.
export function StepGroupEditor({
  control,
  errors,
  stepIndex,
  departmentOptions,
  positionOptions,
  employeeOptions,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `steps.${stepIndex}.groups`,
  });

  return (
    <div className="mb-4">
      <div className="mb-2 font-medium">Also needs approval from</div>
      <div className="mb-2 text-xs opacity-60">
        Add another group to require several different people at once. The step
        is approved only when the approver above and every group here have each
        approved.
      </div>

      <Space direction="vertical" className="w-full" size="small">
        {fields.map((field, g) => (
          <GroupCard
            key={field.id}
            control={control}
            errors={errors}
            stepIndex={stepIndex}
            groupIndex={g}
            onRemove={() => remove(g)}
            departmentOptions={departmentOptions}
            positionOptions={positionOptions}
            employeeOptions={employeeOptions}
          />
        ))}
      </Space>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        className="mt-2"
        disabled={fields.length >= MAX_GROUPS_PER_STEP}
        onClick={() => append(EMPTY_GROUP)}
      >
        Add approver group
      </Button>
    </div>
  );
}

interface GroupCardProps extends Props {
  groupIndex: number;
  onRemove: () => void;
}

function GroupCard({
  control,
  errors,
  stepIndex,
  groupIndex,
  onRemove,
  departmentOptions,
  positionOptions,
  employeeOptions,
}: GroupCardProps) {
  const base = `steps.${stepIndex}.groups.${groupIndex}` as const;
  const groupErrors = errors.steps?.[stepIndex]?.groups?.[groupIndex];
  const type = useWatch({ control, name: `${base}.approverType` });
  const policy = useWatch({ control, name: `${base}.onUnresolved` });
  const level = useWatch({ control, name: `${base}.approverLevel` });

  const target = () => {
    if (type === "Person")
      return (
        <Form.Item
          label="Approver"
          validateStatus={groupErrors?.approverEmployeeId ? "error" : ""}
          help={groupErrors?.approverEmployeeId?.message}
        >
          <Controller
            name={`${base}.approverEmployeeId`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder="Select employee"
                options={employeeOptions}
                filterOption={filterOption}
                value={field.value || undefined}
              />
            )}
          />
        </Form.Item>
      );
    if (type === "Department")
      return (
        <Form.Item
          label="Department"
          validateStatus={groupErrors?.approverDepartmentId ? "error" : ""}
          help={groupErrors?.approverDepartmentId?.message}
        >
          <Controller
            name={`${base}.approverDepartmentId`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder="Select department"
                options={departmentOptions}
                filterOption={filterOption}
                value={field.value || undefined}
              />
            )}
          />
        </Form.Item>
      );
    if (type === "Position")
      return (
        <Form.Item
          label="Position"
          validateStatus={groupErrors?.approverPositionId ? "error" : ""}
          help={groupErrors?.approverPositionId?.message}
        >
          <Controller
            name={`${base}.approverPositionId`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder="Select position"
                options={positionOptions}
                filterOption={filterOption}
                value={field.value || undefined}
              />
            )}
          />
        </Form.Item>
      );
    return (
      <Form.Item label="Approver">
        <Input
          disabled
          value={
            type === "ApplicantDepartment"
              ? "Resolved per applicant — their department"
              : describeDynamicApprover(type, level)
          }
        />
      </Form.Item>
    );
  };

  return (
    <Card
      size="small"
      title={`Group ${groupIndex + 1}`}
      extra={
        <Button
          aria-label="Remove group"
          size="small"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={onRemove}
        />
      }
    >
      <div className="form-grid-2">
        <Form.Item label="Approver Type">
          <Controller
            name={`${base}.approverType`}
            control={control}
            render={({ field }) => (
              <Select {...field} options={APPROVER_TYPE_OPTIONS} />
            )}
          />
        </Form.Item>
        {target()}
      </div>

      <div className="form-grid-2">
        {!resolvesToOnePerson(type) && type !== "Person" && (
          <Form.Item
            label="Min Approvals (quorum)"
            extra="How many distinct people from this group must approve."
          >
            <Controller
              name={`${base}.minApprovals`}
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={1} className="w-full" />
              )}
            />
          </Form.Item>
        )}

        {takesApproverLevel(type) && (
          <Form.Item label="Levels up">
            <Controller
              name={`${base}.approverLevel`}
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={10}
                  precision={0}
                  value={field.value ?? 1}
                  className="w-full"
                />
              )}
            />
          </Form.Item>
        )}

        {isDynamicApprover(type) && (
          <Form.Item label="If no approver is found">
            <Controller
              name={`${base}.onUnresolved`}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={UNRESOLVED_POLICY_OPTIONS.map((o) =>
                    o.value === "Skip"
                      ? { ...o, label: "Don't require this group" }
                      : o,
                  )}
                />
              )}
            />
          </Form.Item>
        )}

        {isDynamicApprover(type) && policy === "FallbackPerson" && (
          <Form.Item
            label="Fallback person"
            validateStatus={groupErrors?.fallbackEmployeeId ? "error" : ""}
            help={groupErrors?.fallbackEmployeeId?.message}
          >
            <Controller
              name={`${base}.fallbackEmployeeId`}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select employee"
                  options={employeeOptions}
                  filterOption={filterOption}
                  value={field.value || undefined}
                />
              )}
            />
          </Form.Item>
        )}
      </div>
    </Card>
  );
}
