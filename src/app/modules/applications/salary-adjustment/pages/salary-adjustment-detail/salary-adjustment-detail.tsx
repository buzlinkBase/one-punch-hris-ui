import { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import {
  useCreateSalaryAdjustment,
  useSalaryAdjustment,
  useUpdateSalaryAdjustment,
} from "../../hooks/use-salary-adjustment-queries";
import { ADJUSTMENT_TYPE_OPTIONS } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  salaryAdjustmentFormSchema,
  type SalaryAdjustmentFormValues,
} from "../../models/forms/salary-adjustment-form.schema";

const { Title } = Typography;

export default function SalaryAdjustmentDetail() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = !!id;
  // Without the save permission the page is a read-only view of the record.
  const readOnly = !useHasPermission(
    isEdit ? "Salary Adjustment:Edit" : "Salary Adjustment:Create",
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SalaryAdjustmentFormValues>({
    resolver: zodResolver(salaryAdjustmentFormSchema),
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);

  const { data: existing, isLoading: loadingExisting } =
    useSalaryAdjustment(id);
  const { data: rawEmployees = [] } = useEmployees();
  const { mutate: create, isPending: creating } = useCreateSalaryAdjustment();
  const { mutate: update, isPending: updating } = useUpdateSalaryAdjustment();

  const empOptions = useMemo(
    () =>
      rawEmployees.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`,
      })),
    [rawEmployees],
  );

  useEffect(() => {
    if (existing) {
      reset({
        employeeId: existing.employeeId,
        adjustmentType: existing.adjustmentType,
        payrollDate: dayjs(existing.payrollDate),
        amount: existing.amount,
        remarks: existing.remarks,
      });
    }
  }, [existing, reset]);

  const onSubmit = (values: SalaryAdjustmentFormValues) => {
    const payload = {
      employeeId: values.employeeId,
      adjustmentType: values.adjustmentType,
      payrollDate: values.payrollDate.format("YYYY-MM-DD"),
      amount: values.amount,
      remarks: values.remarks,
    };

    if (isEdit) {
      update(
        { id: id!, payload: { ...payload, id: id! } },
        {
          onSuccess: () => {
            message.success("Updated.");
            allowNavigation();
            navigate({ to: "/applications/salary-adjustment" });
          },
          onError: () => message.error("Update failed."),
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          message.success("Created.");
          allowNavigation();
          navigate({ to: "/applications/salary-adjustment" });
        },
        onError: () => message.error("Create failed."),
      });
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {readOnly && isEdit
                ? "View Salary Adjustment"
                : isEdit
                  ? "Edit Salary Adjustment"
                  : "New Salary Adjustment"}
            </Title>
            <p className="page-toolbar-subtitle">
              One-time salary, allowance, or deduction correction applied during
              payroll run.
            </p>
          </div>
          <Space>
            {readOnly && <Tag>View only</Tag>}
            <Button
              onClick={() =>
                navigate({ to: "/applications/salary-adjustment" })
              }
            >
              Cancel
            </Button>
            <PermissionGate
              permission={
                isEdit ? "Salary Adjustment:Edit" : "Salary Adjustment:Create"
              }
            >
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                loading={creating || updating}
              >
                Save
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <Card loading={isEdit && loadingExisting}>
        <Form layout="vertical" disabled={readOnly} className="max-w-140">
          <Form.Item
            label="Employee"
            required
            validateStatus={errors.employeeId ? "error" : ""}
            help={errors.employeeId?.message}
          >
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  options={empOptions}
                  filterOption={(input, opt) =>
                    (opt?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  placeholder="Search employee"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Adjustment Type"
            required
            validateStatus={errors.adjustmentType ? "error" : ""}
            help={errors.adjustmentType?.message}
          >
            <Controller
              name="adjustmentType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ADJUSTMENT_TYPE_OPTIONS}
                  placeholder="Select type"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Payroll Date"
            required
            validateStatus={errors.payrollDate ? "error" : ""}
            help={errors.payrollDate?.message}
          >
            <Controller
              name="payrollDate"
              control={control}
              render={({ field }) => (
                <DatePicker {...field} className="w-full" format="YYYY-MM-DD" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Amount"
            required
            validateStatus={errors.amount ? "error" : ""}
            help={errors.amount?.message}
          >
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? undefined)}
                  className="w-full"
                  min={0.01}
                  precision={2}
                  prefix="₱"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Remarks">
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={2}
                  placeholder="Optional remarks"
                />
              )}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
