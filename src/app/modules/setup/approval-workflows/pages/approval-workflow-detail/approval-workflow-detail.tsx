import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Tag,
  Card,
  Alert,
  Divider,
  notification,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { authStorage } from "@/core/auth/auth-storage";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import {
  approvalWorkflowFormSchema,
  type ApprovalWorkflowFormValues,
} from "../../models/forms/approval-workflow-form.schema";
import {
  useApprovalWorkflow,
  useCreateApprovalWorkflow,
  useUpdateApprovalWorkflow,
} from "../../hooks/use-approval-workflow-queries";
import {
  APPROVAL_WORKFLOWS_LABEL,
  APPLICATION_TYPE_OPTIONS,
  APPROVER_TYPE_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  NOTE_REQUIREMENT_OPTIONS,
  UNRESOLVED_POLICY_OPTIONS,
  conditionMetricOptions,
  hasConditionMetrics,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  describeDynamicApprover,
  isDynamicApprover,
  resolvesToOnePerson,
  takesApproverLevel,
} from "../../services/step-approver-types";
import { StepGroupEditor } from "../../components/step-group-editor/step-group-editor";
import { EMPTY_GROUP } from "../../components/step-group-editor/step-group.const";
import { ScopeConditionsEditor } from "../../components/scope-conditions-editor/scope-conditions-editor";
import {
  fromScopeDtos,
  toScopeDtos,
} from "../../services/scope-conditions.util";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { withReferencedEmployees } from "../../services/approver-options";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";

const { Title } = Typography;

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const EMPTY_STEP = {
  approverType: "Person" as const,
  approverEmployeeId: undefined,
  approverDepartmentId: undefined,
  approverPositionId: undefined,
  minApprovals: 1,
  approverLevel: undefined,
  onUnresolved: "Block" as const,
  fallbackEmployeeId: undefined,
  conditionMetric: "None" as const,
  conditionOperator: "GreaterOrEqual" as const,
  conditionValue: undefined,
  remindAfterHours: undefined,
  remindRepeatHours: undefined,
  escalateAfterHours: undefined,
  escalateToEmployeeId: undefined,
  noteRequirement: "Optional" as const,
  namedApproverEmployeeIds: [],
  groups: [] as (typeof EMPTY_GROUP)[],
};

const LIST_PATH = "/setup/approval-workflows";

export default function ApprovalWorkflowDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  // "Copy as a new version": a new workflow pre-filled from this one.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const copyFrom =
    !isEdit && typeof search.copyFrom === "string"
      ? search.copyFrom
      : undefined;

  const { data: selected } = useApprovalWorkflow(isEdit ? id : copyFrom);
  const { mutateAsync: create, isPending: isCreating } =
    useCreateApprovalWorkflow();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateApprovalWorkflow();

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: employees = [] } = useEmployeeFilter();

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));
  const positionOptions = positions.map((p) => ({
    value: p.id,
    label: p.name,
  }));
  const employeeOptions = withReferencedEmployees(
    employees.map((e) => ({
      value: e.id,
      label: e.name ?? e.id,
    })),
    selected?.approverNames,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ApprovalWorkflowFormValues>({
    resolver: zodResolver(approvalWorkflowFormSchema),
    defaultValues: {
      applicationType: "Leave",
      name: "",
      scopes: [],
      priority: 100,
      steps: [EMPTY_STEP],
    },
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);
  // Which measures a step can depend on, and whether Leave Type scoping applies, follow the type.
  const applicationType = useWatch({ control, name: "applicationType" });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  useEffect(() => {
    if (selected && (isEdit || copyFrom)) {
      reset({
        applicationType: selected.applicationType,
        name: isEdit ? selected.name : `${selected.name} (copy)`,
        scopes: fromScopeDtos(selected.scopes),
        priority: selected.priority ?? 100,
        steps: selected.steps.map((s) => ({
          approverType: s.approverType,
          approverEmployeeId: s.approverEmployeeId ?? undefined,
          approverDepartmentId: s.approverDepartmentId ?? undefined,
          approverPositionId: s.approverPositionId ?? undefined,
          minApprovals: s.minApprovals,
          approverLevel: s.approverLevel ?? undefined,
          onUnresolved: s.onUnresolved ?? "Block",
          fallbackEmployeeId: s.fallbackEmployeeId ?? undefined,
          conditionMetric: s.conditionMetric ?? "None",
          conditionOperator: s.conditionOperator ?? "GreaterOrEqual",
          conditionValue: s.conditionValue ?? undefined,
          remindAfterHours: s.remindAfterHours ?? undefined,
          remindRepeatHours: s.remindRepeatHours ?? undefined,
          escalateAfterHours: s.escalateAfterHours ?? undefined,
          escalateToEmployeeId: s.escalateToEmployeeId ?? undefined,
          noteRequirement: s.noteRequirement,
          namedApproverEmployeeIds: s.namedApproverEmployeeIds,
          groups: (s.groups ?? []).map((g) => ({
            approverType: g.approverType,
            approverEmployeeId: g.approverEmployeeId ?? undefined,
            approverDepartmentId: g.approverDepartmentId ?? undefined,
            approverPositionId: g.approverPositionId ?? undefined,
            approverLevel: g.approverLevel ?? undefined,
            onUnresolved: g.onUnresolved ?? "Block",
            fallbackEmployeeId: g.fallbackEmployeeId ?? undefined,
            minApprovals: g.minApprovals,
          })),
        })),
      });
    }
  }, [selected, isEdit, copyFrom, reset]);

  const canManage = authStorage.hasAnyPermission("Approval Workflows:Edit");
  // Read-only while requests are still going through it (they read its steps live), or for
  // someone who may only view workflows.
  const inProgress = isEdit && selected ? selected.inProgressCount : 0;
  const isLocked = Boolean(
    isEdit && selected && (!selected.canEdit || !canManage),
  );
  const copyThis = () =>
    navigate({ to: `${LIST_PATH}/create`, search: { copyFrom: id } });

  const onSubmit = async (values: ApprovalWorkflowFormValues) => {
    const payload = {
      applicationType: values.applicationType,
      name: values.name,
      scopeDepartmentId: null,
      scopes: toScopeDtos(values.scopes),
      priority: values.priority,
      steps: values.steps.map((s, index) => ({
        stepNumber: index + 1,
        approverType: s.approverType,
        approverEmployeeId:
          s.approverType === "Person" ? s.approverEmployeeId : null,
        approverDepartmentId:
          s.approverType === "Department" ? s.approverDepartmentId : null,
        approverPositionId:
          s.approverType === "Position" ? s.approverPositionId : null,
        minApprovals: s.minApprovals,
        approverLevel: takesApproverLevel(s.approverType)
          ? (s.approverLevel ?? 1)
          : null,
        // Only a per-applicant approver can be "not found"; anything else always has someone.
        onUnresolved: isDynamicApprover(s.approverType)
          ? s.onUnresolved
          : ("Block" as const),
        fallbackEmployeeId:
          isDynamicApprover(s.approverType) &&
          s.onUnresolved === "FallbackPerson"
            ? s.fallbackEmployeeId
            : null,
        conditionMetric: s.conditionMetric,
        conditionOperator: s.conditionOperator,
        conditionValue:
          s.conditionMetric === "None" ? null : (s.conditionValue ?? null),
        remindAfterHours: s.remindAfterHours ?? null,
        remindRepeatHours: s.remindAfterHours
          ? (s.remindRepeatHours ?? null)
          : null,
        escalateAfterHours: s.escalateToEmployeeId
          ? (s.escalateAfterHours ?? null)
          : null,
        escalateToEmployeeId: s.escalateAfterHours
          ? (s.escalateToEmployeeId ?? null)
          : null,
        noteRequirement: s.noteRequirement,
        namedApproverEmployeeIds: s.namedApproverEmployeeIds,
        groups: s.groups.map((g) => ({
          approverType: g.approverType,
          approverEmployeeId:
            g.approverType === "Person" ? g.approverEmployeeId : null,
          approverDepartmentId:
            g.approverType === "Department" ? g.approverDepartmentId : null,
          approverPositionId:
            g.approverType === "Position" ? g.approverPositionId : null,
          approverLevel: takesApproverLevel(g.approverType)
            ? (g.approverLevel ?? 1)
            : null,
          onUnresolved: isDynamicApprover(g.approverType)
            ? g.onUnresolved
            : ("Block" as const),
          fallbackEmployeeId:
            isDynamicApprover(g.approverType) &&
            g.onUnresolved === "FallbackPerson"
              ? g.fallbackEmployeeId
              : null,
          minApprovals:
            g.approverType === "Person" || resolvesToOnePerson(g.approverType)
              ? 1
              : g.minApprovals,
        })),
      })),
    };

    if (isEdit && id) {
      await update({ id, data: payload });
    } else {
      await create(payload);
      notification.success({
        message: "Workflow saved as inactive",
        description:
          "Activate it from the list when ready -- now, or once the current workflow has no pending requests.",
        placement: "topRight",
      });
    }
    allowNavigation();
    navigate({ to: LIST_PATH });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isLocked
                ? APPROVAL_WORKFLOWS_LABEL.VIEW_TITLE
                : isEdit
                  ? APPROVAL_WORKFLOWS_LABEL.EDIT_TITLE
                  : APPROVAL_WORKFLOWS_LABEL.CREATE_TITLE}
            </Title>
          </div>
          <Space>
            <Tag
              color={isLocked ? "default" : isEdit ? "processing" : "success"}
            >
              {isLocked
                ? "Read only"
                : isEdit
                  ? "Editing"
                  : copyFrom
                    ? "New Version"
                    : "New Record"}
            </Tag>
            {isEdit && canManage && (
              <Button icon={<CopyOutlined />} onClick={copyThis}>
                Copy as new version
              </Button>
            )}
            <Button onClick={() => navigate({ to: LIST_PATH })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isLocked && inProgress > 0 && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message={`${inProgress} ${inProgress === 1 ? "request is" : "requests are"} still going through this workflow, so it can't be edited right now.`}
            description="You can edit it once they finish -- changes then apply to the next applications. To change it now, copy it as a new version and activate that (or schedule it to take over when these finish)."
            action={
              canManage && (
                <Button size="small" icon={<CopyOutlined />} onClick={copyThis}>
                  Copy as new version
                </Button>
              )
            }
          />
        )}
        {copyFrom && selected && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message={`A new version of "${selected.name}"`}
            description="It's saved as inactive. Afterwards, activate it from the list -- now, or once the current workflow has no pending requests."
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          disabled={!!isLocked}
        >
          <div className="form-grid-2">
            <Form.Item
              label="Name"
              validateStatus={errors.name ? "error" : ""}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. Standard Leave Approval"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="Application Type">
              <Controller
                name="applicationType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={APPLICATION_TYPE_OPTIONS}
                    disabled={isEdit}
                  />
                )}
              />
            </Form.Item>
          </div>

          <Card size="small" title="Applies to" className="mb-4">
            <Form.Item
              className="mb-3"
              validateStatus={errors.scopes ? "error" : ""}
              help={
                errors.scopes?.message ??
                errors.scopes?.root?.message ??
                "Limit this workflow to certain people. Every condition must match; values inside one condition are alternatives. No conditions means everyone — the company-wide default."
              }
            >
              <Controller
                name="scopes"
                control={control}
                render={({ field }) => (
                  <ScopeConditionsEditor
                    applicationType={applicationType}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!isLocked}
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Priority"
              className="mb-0"
              validateStatus={errors.priority ? "error" : ""}
              help={
                errors.priority?.message ??
                "When an applicant fits several active workflows, the lowest number wins (then the most specific). Leave at 100 unless two workflows overlap."
              }
            >
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1}
                    max={9999}
                    precision={0}
                    className="w-32"
                  />
                )}
              />
            </Form.Item>
          </Card>

          <Divider />

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {fields.map((field, index) => (
              <StepCard
                key={field.id}
                index={index}
                control={control}
                errors={errors}
                canRemove={fields.length > 1}
                canMoveUp={index > 0}
                canMoveDown={index < fields.length - 1}
                onRemove={() => remove(index)}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                departmentOptions={departmentOptions}
                positionOptions={positionOptions}
                employeeOptions={employeeOptions}
                applicationType={applicationType}
              />
            ))}
          </Space>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => append(EMPTY_STEP)}
            className="mt-3"
            block
          >
            Add Step
          </Button>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: LIST_PATH })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              {!isLocked && (
                <PermissionGate permission="Approval Workflows:Edit">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCreating || isUpdating}
                  >
                    {NAVIGATION_BUTTON_LABEL.SAVE}
                  </Button>
                </PermissionGate>
              )}
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}

interface StepCardProps {
  index: number;
  control: Control<ApprovalWorkflowFormValues>;
  errors: FieldErrors<ApprovalWorkflowFormValues>;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  departmentOptions: { value: string; label: string }[];
  positionOptions: { value: string; label: string }[];
  employeeOptions: { value: string; label: string }[];
  applicationType: ApprovalApplicationType;
}

function StepCard({
  index,
  control,
  errors,
  canRemove,
  canMoveUp,
  canMoveDown,
  onRemove,
  onMoveUp,
  onMoveDown,
  departmentOptions,
  positionOptions,
  employeeOptions,
  applicationType,
}: StepCardProps) {
  const levelValue =
    useWatch({ control, name: `steps.${index}.approverLevel` }) ?? undefined;
  return (
    <Card
      size="small"
      title={`Step ${index + 1}`}
      extra={
        <Space size="small">
          <Button
            aria-label="Move up"
            size="small"
            type="text"
            icon={<ArrowUpOutlined />}
            disabled={!canMoveUp}
            onClick={onMoveUp}
          />
          <Button
            aria-label="Move down"
            size="small"
            type="text"
            icon={<ArrowDownOutlined />}
            disabled={!canMoveDown}
            onClick={onMoveDown}
          />
          <Button
            aria-label="Delete"
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            onClick={onRemove}
          />
        </Space>
      }
    >
      <div className="form-grid-2">
        <Form.Item label="Approver Type">
          <Controller
            name={`steps.${index}.approverType`}
            control={control}
            render={({ field }) => (
              <Select {...field} options={APPROVER_TYPE_OPTIONS} />
            )}
          />
        </Form.Item>

        <Controller
          name={`steps.${index}.approverType`}
          control={control}
          render={({ field: typeField }) => {
            if (typeField.value === "Person") {
              return (
                <Form.Item
                  label="Approver"
                  validateStatus={
                    errors.steps?.[index]?.approverEmployeeId ? "error" : ""
                  }
                  help={errors.steps?.[index]?.approverEmployeeId?.message}
                >
                  <Controller
                    name={`steps.${index}.approverEmployeeId`}
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
            }
            if (typeField.value === "Department") {
              return (
                <Form.Item
                  label="Department"
                  validateStatus={
                    errors.steps?.[index]?.approverDepartmentId ? "error" : ""
                  }
                  help={errors.steps?.[index]?.approverDepartmentId?.message}
                >
                  <Controller
                    name={`steps.${index}.approverDepartmentId`}
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
            }
            if (typeField.value === "Position") {
              return (
                <Form.Item
                  label="Position"
                  validateStatus={
                    errors.steps?.[index]?.approverPositionId ? "error" : ""
                  }
                  help={errors.steps?.[index]?.approverPositionId?.message}
                >
                  <Controller
                    name={`steps.${index}.approverPositionId`}
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
            }
            return (
              <Form.Item label="Approver">
                <Input
                  disabled
                  value={
                    typeField.value === "ApplicantDepartment"
                      ? "Resolved per applicant — their department"
                      : describeDynamicApprover(typeField.value, levelValue)
                  }
                />
              </Form.Item>
            );
          }}
        />
      </div>

      <Controller
        name={`steps.${index}.approverType`}
        control={control}
        render={({ field: typeField }) => {
          // A person resolved per applicant (a head, a manager N levels up) is always exactly one
          // person, so a quorum and narrowing to named people don't apply.
          if (
            typeField.value === "Person" ||
            resolvesToOnePerson(typeField.value)
          )
            return <></>;
          return (
            <div className="form-grid-2">
              <Form.Item
                label="Min Approvals (quorum)"
                extra="How many distinct approvers from the group must approve before this step clears."
              >
                <Controller
                  name={`steps.${index}.minApprovals`}
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={1} style={{ width: "100%" }} />
                  )}
                />
              </Form.Item>

              {typeField.value !== "ApplicantManager" && (
                <Form.Item
                  label="Narrow to specific employees (optional)"
                  extra="Leave empty to allow anyone currently in the group."
                >
                  <Controller
                    name={`steps.${index}.namedApproverEmployeeIds`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        allowClear
                        showSearch
                        placeholder="Anyone in the group"
                        options={employeeOptions}
                        filterOption={filterOption}
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          );
        }}
      />

      <Controller
        name={`steps.${index}.approverType`}
        control={control}
        render={({ field: typeField }) => {
          if (!isDynamicApprover(typeField.value)) return <></>;
          return (
            <div className="form-grid-2">
              {takesApproverLevel(typeField.value) && (
                <Form.Item
                  label="Levels up"
                  extra={
                    typeField.value === "ApplicantManagerLevel"
                      ? "1 = their manager, 2 = their manager's manager, and so on."
                      : "1 = their own department's head, 2 = the parent department's head, and so on."
                  }
                >
                  <Controller
                    name={`steps.${index}.approverLevel`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={1}
                        max={10}
                        precision={0}
                        value={field.value ?? 1}
                        style={{ width: "100%" }}
                      />
                    )}
                  />
                </Form.Item>
              )}

              <Form.Item
                label="If no approver is found"
                validateStatus={
                  errors.steps?.[index]?.onUnresolved ? "error" : ""
                }
                help={
                  errors.steps?.[index]?.onUnresolved?.message ??
                  "When the applicant has no manager recorded, or nobody is set as the head."
                }
              >
                <Controller
                  name={`steps.${index}.onUnresolved`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={UNRESOLVED_POLICY_OPTIONS.map((o) => ({
                        ...o,
                        // The first step can't be skipped.
                        disabled: o.value === "Skip" && index === 0,
                      }))}
                    />
                  )}
                />
              </Form.Item>

              <Controller
                name={`steps.${index}.onUnresolved`}
                control={control}
                render={({ field: policyField }) =>
                  policyField.value === "FallbackPerson" ? (
                    <Form.Item
                      label="Fallback person"
                      validateStatus={
                        errors.steps?.[index]?.fallbackEmployeeId ? "error" : ""
                      }
                      help={errors.steps?.[index]?.fallbackEmployeeId?.message}
                    >
                      <Controller
                        name={`steps.${index}.fallbackEmployeeId`}
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
                  ) : (
                    <></>
                  )
                }
              />
            </div>
          );
        }}
      />

      {index > 0 && hasConditionMetrics(applicationType) && (
        <Controller
          name={`steps.${index}.conditionMetric`}
          control={control}
          render={({ field: metricField }) => (
            <Form.Item
              label="Applies"
              extra="A step that doesn't apply is skipped for that request. The first step always applies."
              validateStatus={
                errors.steps?.[index]?.conditionValue ||
                errors.steps?.[index]?.conditionMetric
                  ? "error"
                  : ""
              }
              help={
                errors.steps?.[index]?.conditionValue?.message ??
                errors.steps?.[index]?.conditionMetric?.message
              }
            >
              <Space wrap>
                <Select
                  {...metricField}
                  className="w-56"
                  options={conditionMetricOptions(applicationType)}
                />
                {metricField.value !== "None" && (
                  <>
                    <Controller
                      name={`steps.${index}.conditionOperator`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          className="w-44"
                          options={CONDITION_OPERATOR_OPTIONS}
                        />
                      )}
                    />
                    <Controller
                      name={`steps.${index}.conditionValue`}
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          className="w-32"
                          placeholder="e.g. 5"
                        />
                      )}
                    />
                  </>
                )}
              </Space>
            </Form.Item>
          )}
        />
      )}

      <StepGroupEditor
        control={control}
        errors={errors}
        stepIndex={index}
        departmentOptions={departmentOptions}
        positionOptions={positionOptions}
        employeeOptions={employeeOptions}
      />

      <Form.Item
        label="Reminders and escalation"
        extra="Hours count from when the request reaches this step. Leave empty for none. Escalating opens the step to one more person; it doesn't replace the approvers."
        validateStatus={
          errors.steps?.[index]?.remindRepeatHours ||
          errors.steps?.[index]?.escalateAfterHours ||
          errors.steps?.[index]?.escalateToEmployeeId
            ? "error"
            : ""
        }
        help={
          errors.steps?.[index]?.remindRepeatHours?.message ??
          errors.steps?.[index]?.escalateAfterHours?.message ??
          errors.steps?.[index]?.escalateToEmployeeId?.message
        }
      >
        <Space wrap>
          <Controller
            name={`steps.${index}.remindAfterHours`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                max={2160}
                precision={0}
                className="w-48"
                addonBefore="Remind after"
                addonAfter="h"
              />
            )}
          />
          <Controller
            name={`steps.${index}.remindRepeatHours`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                max={2160}
                precision={0}
                className="w-48"
                addonBefore="then every"
                addonAfter="h"
              />
            )}
          />
          <Controller
            name={`steps.${index}.escalateAfterHours`}
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                max={2160}
                precision={0}
                className="w-52"
                addonBefore="Escalate after"
                addonAfter="h"
              />
            )}
          />
          <Controller
            name={`steps.${index}.escalateToEmployeeId`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                allowClear
                showSearch
                className="w-56"
                placeholder="Escalate to…"
                options={employeeOptions}
                filterOption={filterOption}
                value={field.value || undefined}
              />
            )}
          />
        </Space>
      </Form.Item>

      <Form.Item label="Note Requirement">
        <Controller
          name={`steps.${index}.noteRequirement`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={NOTE_REQUIREMENT_OPTIONS}
              style={{ maxWidth: 240 }}
            />
          )}
        />
      </Form.Item>
    </Card>
  );
}
