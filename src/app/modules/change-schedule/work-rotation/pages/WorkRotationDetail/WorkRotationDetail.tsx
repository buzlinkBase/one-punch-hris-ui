import { useEffect } from "react";
import {
  Form,
  Button,
  Select,
  DatePicker,
  Typography,
  Card,
  Space,
  Tag,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  workRotationFormSchema,
  type WorkRotationFormValues,
} from "../../models/forms/work-rotation-form.schema";
import {
  useWorkRotation,
  useCreateWorkRotation,
  useUpdateWorkRotation,
} from "../../hooks/useWorkRotationQueries";
import { workRotationMapper } from "../../services/work-rotation.mapper";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/useFixedTimeShiftQueries";
import { useFlexiTimeShifts } from "@/app/modules/setup/time-shift/flexi/hooks/useFlexiTimeShiftQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";

const { Title } = Typography;

export default function WorkRotationDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id) && id !== "create";
  const navigate = useNavigate();

  const { data: selected, isLoading: isRecordLoading } = useWorkRotation(
    isEdit ? id : undefined,
  );
  const { mutateAsync: add, isPending: isCreating } = useCreateWorkRotation();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateWorkRotation();

  const { data: fixedShifts = [], isLoading: isFixedLoading } =
    useFixedTimeShifts();
  const { data: flexiShifts = [], isLoading: isFlexiLoading } =
    useFlexiTimeShifts();
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployees();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkRotationFormValues>({
    resolver: zodResolver(workRotationFormSchema),
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset(workRotationMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedEmployeeId = watch("employeeId");
  const selectedEmployee = employees.find((e) => e.id === watchedEmployeeId);

  const onSubmit = async (values: WorkRotationFormValues) => {
    if (isEdit && selected) {
      await update({ id: selected.id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/change-schedule/work-rotation" });
  };

  const isSubmitting = isCreating || isUpdating;
  const isTimeShiftLoading = isFixedLoading || isFlexiLoading;

  const timeShiftOptions = [
    ...fixedShifts.map((s) => ({
      value: s.id,
      label: `[Fixed] ${s.name} (${s.timeIn} – ${s.timeOut})`,
    })),
    ...flexiShifts.map((s) => ({
      value: s.id,
      label: `[Flexi] ${s.name}`,
    })),
  ];

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.employeeNo} – ${e.lastName}, ${e.firstName}`,
  }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? WORK_ROTATION_LABEL.EDIT_TITLE
                : WORK_ROTATION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Assign or update the work rotation plan for the selected employee.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() => navigate({ to: "/change-schedule/work-rotation" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        {isEdit && selected && (
          <Card
            className="form-section-card"
            title="Employee"
            loading={isRecordLoading}
          >
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="Employee">
                {selected.employeeName}
              </Descriptions.Item>
              <Descriptions.Item label="Client">
                {selected.clientName}
              </Descriptions.Item>
              <Descriptions.Item label="Current Time Shift">
                {selected.timeShiftName}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Change Work Plan">
            <div className="form-grid-2">
              {!isEdit && (
                <Form.Item
                  label={WORK_ROTATION_LABEL.EMPLOYEE}
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
                        allowClear
                        loading={isEmployeesLoading}
                        placeholder="Select employee"
                        options={employeeOptions}
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    )}
                  />
                </Form.Item>
              )}

              {!isEdit && selectedEmployee && (
                <Form.Item label="Department">
                  <span className="text-sm text-gray-600">
                    {selectedEmployee.departmentId}
                  </span>
                </Form.Item>
              )}

              <Form.Item
                label={WORK_ROTATION_LABEL.USE_TIME_SHIFT}
                validateStatus={errors.timeShiftId ? "error" : ""}
                help={errors.timeShiftId?.message}
              >
                <Controller
                  name="timeShiftId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      allowClear
                      loading={isTimeShiftLoading}
                      placeholder="Select time shift"
                      options={timeShiftOptions}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={WORK_ROTATION_LABEL.PAYROLL_DATE}
                validateStatus={errors.payrollDate ? "error" : ""}
                help={errors.payrollDate?.message}
              >
                <Controller
                  name="payrollDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? date.format("YYYY-MM-DD") : "")
                      }
                    />
                  )}
                />
              </Form.Item>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() =>
                  navigate({ to: "/change-schedule/work-rotation" })
                }
              >
                {NAVIGATION_BUTTON_LABEL.CANCEL}
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEdit
                  ? NAVIGATION_BUTTON_LABEL.SAVE
                  : NAVIGATION_BUTTON_LABEL.ADD}
              </Button>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
