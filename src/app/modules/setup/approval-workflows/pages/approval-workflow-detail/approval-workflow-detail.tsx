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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteParams } from "@/shared/hooks/use-route-params";
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
  NOTE_REQUIREMENT_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { usePositions } from "@/app/modules/setup/position/hooks/use-position-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

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
  noteRequirement: "Optional" as const,
  namedApproverEmployeeIds: [],
};

const LIST_PATH = "/setup/approval-workflows";

export default function ApprovalWorkflowDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useApprovalWorkflow(isEdit ? id : undefined);
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
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApprovalWorkflowFormValues>({
    resolver: zodResolver(approvalWorkflowFormSchema),
    defaultValues: {
      applicationType: "Leave",
      name: "",
      scopeDepartmentId: undefined,
      steps: [EMPTY_STEP],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        applicationType: selected.applicationType,
        name: selected.name,
        scopeDepartmentId: selected.scopeDepartmentId ?? undefined,
        steps: selected.steps.map((s) => ({
          approverType: s.approverType,
          approverEmployeeId: s.approverEmployeeId ?? undefined,
          approverDepartmentId: s.approverDepartmentId ?? undefined,
          approverPositionId: s.approverPositionId ?? undefined,
          minApprovals: s.minApprovals,
          noteRequirement: s.noteRequirement,
          namedApproverEmployeeIds: s.namedApproverEmployeeIds,
        })),
      });
    }
  }, [selected, isEdit, reset]);

  const isLocked = isEdit && selected && !selected.isEditable;

  const onSubmit = async (values: ApprovalWorkflowFormValues) => {
    const payload = {
      applicationType: values.applicationType,
      name: values.name,
      scopeDepartmentId: values.scopeDepartmentId || null,
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
        noteRequirement: s.noteRequirement,
        namedApproverEmployeeIds: s.namedApproverEmployeeIds,
      })),
    };

    if (isEdit && id) {
      await update({ id, data: payload });
    } else {
      await create(payload);
    }
    navigate({ to: LIST_PATH });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? APPROVAL_WORKFLOWS_LABEL.EDIT_TITLE
                : APPROVAL_WORKFLOWS_LABEL.CREATE_TITLE}
            </Title>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: LIST_PATH })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isLocked && (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="This workflow has already been used and can no longer be edited."
            description="Deactivate it from the list and create a new version instead."
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

          <Form.Item
            label="Scope"
            extra="Leave blank for the tenant-wide default. Scoping to a department overrides the default for applicants in that department only."
          >
            <Controller
              name="scopeDepartmentId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  showSearch
                  placeholder="Tenant-wide default"
                  options={departmentOptions}
                  filterOption={filterOption}
                  value={field.value || undefined}
                  style={{ maxWidth: 400 }}
                />
              )}
            />
          </Form.Item>

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
              <PermissionGate permission="Approval Workflows:Edit">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                  disabled={!!isLocked}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
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
}: StepCardProps) {
  return (
    <Card
      size="small"
      title={`Step ${index + 1}`}
      extra={
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<ArrowUpOutlined />}
            disabled={!canMoveUp}
            onClick={onMoveUp}
          />
          <Button
            size="small"
            type="text"
            icon={<ArrowDownOutlined />}
            disabled={!canMoveDown}
            onClick={onMoveDown}
          />
          <Button
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
                    typeField.value === "ApplicantManager"
                      ? "Resolved per applicant — their manager"
                      : "Resolved per applicant — their department"
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
          if (typeField.value === "Person") return <></>;
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
