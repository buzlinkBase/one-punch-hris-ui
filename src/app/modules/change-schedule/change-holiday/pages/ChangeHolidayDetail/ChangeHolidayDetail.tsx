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
  type SelectProps,
} from "antd";

const { RangePicker } = DatePicker;
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  changeHolidayFormSchema,
  type ChangeHolidayFormInput,
  type ChangeHolidayFormValues,
} from "../../models/forms/change-holiday-form.schema";
import {
  useChangeHoliday,
  useCreateChangeHoliday,
  useUpdateChangeHoliday,
} from "../../hooks/useChangeHolidayQueries";
import { changeHolidayMapper } from "../../services/change-holiday.mapper";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useHolidays } from "@/app/modules/setup/holiday/hooks/useHolidayQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/usePayrollGroupQueries";
import type { CreateChangeHoliday } from "../../models/api/request/create-change-holiday.model";

const { Title } = Typography;

const TARGET_TYPE_OPTIONS: SelectProps["options"] = [
  { value: "employee", label: CHANGE_HOLIDAY_LABEL.TARGET_EMPLOYEE },
  {
    value: "payroll-group",
    label: CHANGE_HOLIDAY_LABEL.TARGET_PAYROLL_GROUP,
  },
  {
    value: "employee-group",
    label: CHANGE_HOLIDAY_LABEL.TARGET_EMPLOYEE_GROUP,
  },
];

export default function ChangeHolidayDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id) && id !== "create";
  const navigate = useNavigate();

  const { data: selected, isLoading: isRecordLoading } = useChangeHoliday(
    isEdit ? id : undefined,
  );

  const { mutateAsync: add, isPending: isCreating } = useCreateChangeHoliday();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateChangeHoliday();

  const { data: holidays = [], isLoading: isHolidaysLoading } = useHolidays();
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployees();
  const { data: payrollGroups = [], isLoading: isPayrollGroupsLoading } =
    usePayrollGroups();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ChangeHolidayFormInput, unknown, ChangeHolidayFormValues>({
    resolver: zodResolver(changeHolidayFormSchema),
    defaultValues: {
      targetType: "employee",
      employeeIds: [],
    },
  });

  const targetType = useWatch({ control, name: "targetType" });
  const payrollGroupId = useWatch({ control, name: "payrollGroupId" });
  const fromDate = useWatch({ control, name: "fromDate" });
  const toDate = useWatch({ control, name: "toDate" });

  useEffect(() => {
    if (isEdit && selected) {
      reset(changeHolidayMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  useEffect(() => {
    if (targetType === "employee") {
      setValue("payrollGroupId", undefined);
      setValue("employeeIds", []);
      return;
    }

    if (targetType === "payroll-group") {
      setValue("employeeId", undefined);
      setValue("employeeIds", []);
      return;
    }

    setValue("employeeId", undefined);
    setValue("payrollGroupId", undefined);
  }, [targetType, setValue]);

  const employeeOptions: SelectProps["options"] = employees.map((item) => ({
    value: item.id,
    label: `${item.employeeNo} - ${item.lastName}, ${item.firstName}`,
  }));

  const filteredEmployeeOptions: SelectProps["options"] = payrollGroupId
    ? employees
        .filter((emp) => emp.payrollGroupId === payrollGroupId)
        .map((item) => ({
          value: item.id,
          label: `${item.employeeNo} - ${item.lastName}, ${item.firstName}`,
        }))
    : [];

  const payrollGroupOptions: SelectProps["options"] = payrollGroups.map(
    (item) => ({
      value: item.id,
      label: item.name,
    }),
  );

  const onSubmit = async (values: ChangeHolidayFormValues) => {
    const employeeIds =
      values.targetType === "employee"
        ? values.employeeId
          ? [values.employeeId]
          : []
        : values.employeeIds;

    const payload: CreateChangeHoliday = {
      employeeIds,
      holidayId: values.holidayId,
      payrollDateFrom: values.fromDate,
      payrollDateTo: values.toDate,
    };

    if (isEdit && id) {
      await update({ id, ...payload });
    } else {
      await add(payload);
    }

    navigate({ to: "/change-schedule/change-holiday" });
  };

  const isSubmitting = isCreating || isUpdating;

  const holidayOptions = holidays.map((h) => ({
    value: h.id,
    label: `${h.name} (${h.date})`,
  }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? CHANGE_HOLIDAY_LABEL.EDIT_TITLE
                : CHANGE_HOLIDAY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Apply a holiday change by employee, payroll group, or a selected
              group of employees.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-holiday" })
              }
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
            title="Current Assignment"
            loading={isRecordLoading}
          >
            <Descriptions size="small" column={3}>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.EMPLOYEE}>
                {selected.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.HOLIDAY_NAME}>
                {selected.holidayName}
              </Descriptions.Item>
              <Descriptions.Item label={CHANGE_HOLIDAY_LABEL.CLIENT}>
                {selected.clientName}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Card className="form-section-card" title="Holiday Details">
            <div className="form-grid-2">
              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.TARGET_TYPE}
                validateStatus={errors.targetType ? "error" : ""}
                help={errors.targetType?.message}
              >
                <Controller
                  name="targetType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={TARGET_TYPE_OPTIONS}
                      placeholder="Select target type"
                    />
                  )}
                />
              </Form.Item>

              {targetType === "employee" && (
                <Form.Item
                  label={CHANGE_HOLIDAY_LABEL.EMPLOYEE}
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
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    )}
                  />
                </Form.Item>
              )}

              {targetType === "payroll-group" && (
                <>
                  <Form.Item
                    label={CHANGE_HOLIDAY_LABEL.PAYROLL_GROUP}
                    validateStatus={errors.payrollGroupId ? "error" : ""}
                    help={errors.payrollGroupId?.message}
                  >
                    <Controller
                      name="payrollGroupId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          showSearch
                          allowClear
                          loading={isPayrollGroupsLoading}
                          placeholder="Select payroll group"
                          options={payrollGroupOptions}
                          filterOption={(input, option) =>
                            String(option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(val) => {
                            field.onChange(val);
                            setValue("employeeIds", []);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label={CHANGE_HOLIDAY_LABEL.EMPLOYEE_GROUP}
                    validateStatus={errors.employeeIds ? "error" : ""}
                    help={errors.employeeIds?.message as string | undefined}
                  >
                    <Controller
                      name="employeeIds"
                      control={control}
                      render={({ field }) => (
                        <Select
                          mode="multiple"
                          value={field.value}
                          onChange={field.onChange}
                          showSearch
                          allowClear
                          disabled={!payrollGroupId}
                          loading={isEmployeesLoading}
                          placeholder={
                            payrollGroupId
                              ? "Select employees"
                              : "Select a payroll group first"
                          }
                          options={filteredEmployeeOptions}
                          filterOption={(input, option) =>
                            String(option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      )}
                    />
                  </Form.Item>
                </>
              )}

              {targetType === "employee-group" && (
                <Form.Item
                  label={CHANGE_HOLIDAY_LABEL.EMPLOYEE_GROUP}
                  validateStatus={errors.employeeIds ? "error" : ""}
                  help={errors.employeeIds?.message as string | undefined}
                >
                  <Controller
                    name="employeeIds"
                    control={control}
                    render={({ field }) => (
                      <Select
                        mode="multiple"
                        value={field.value}
                        onChange={field.onChange}
                        showSearch
                        allowClear
                        loading={isEmployeesLoading}
                        placeholder="Select employees"
                        options={employeeOptions}
                        filterOption={(input, option) =>
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    )}
                  />
                </Form.Item>
              )}

              <Form.Item
                label={CHANGE_HOLIDAY_LABEL.HOLIDAY}
                validateStatus={errors.holidayId ? "error" : ""}
                help={errors.holidayId?.message}
                className="col-span-2"
              >
                <Controller
                  name="holidayId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      allowClear
                      loading={isHolidaysLoading}
                      placeholder="Select holiday"
                      options={holidayOptions}
                      filterOption={(input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={`${CHANGE_HOLIDAY_LABEL.FROM_DATE} – ${CHANGE_HOLIDAY_LABEL.TO_DATE}`}
                validateStatus={errors.fromDate || errors.toDate ? "error" : ""}
                help={errors.fromDate?.message ?? errors.toDate?.message}
                className="col-span-2"
              >
                <RangePicker
                  style={{ width: "100%" }}
                  value={
                    fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : null
                  }
                  onChange={(dates) => {
                    setValue(
                      "fromDate",
                      dates?.[0]?.format("YYYY-MM-DD") ?? "",
                      { shouldValidate: true },
                    );
                    setValue("toDate", dates?.[1]?.format("YYYY-MM-DD") ?? "", {
                      shouldValidate: true,
                    });
                  }}
                />
              </Form.Item>
            </div>
          </Card>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() =>
                navigate({ to: "/change-schedule/change-holiday" })
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
        </Form>
      </div>
    </div>
  );
}
