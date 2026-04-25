import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Card,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "../../models/forms/employee-form.schema";
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
} from "../../hooks/useEmployeeQueries";
import { employeeMapper } from "../../services/employee.mapper";
import {
  EMPLOYEE_LABEL,
  PAYMENT_METHOD_OPTIONS,
  SALARY_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  JOB_LEVEL_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useDepartments } from "@/app/modules/setup/department/hooks/useDepartmentQueries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/useOperationAreaQueries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/usePayrollGroupQueries";
import dayjs from "dayjs";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function EmployeeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useEmployee(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateEmployee();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateEmployee();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();
  const { data: operationAreas = [], isLoading: isOperationAreasLoading } =
    useOperationAreas();
  const { data: payrollGroups = [], isLoading: isPayrollGroupsLoading } =
    usePayrollGroups();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset(employeeMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/employee" });
  };

  const isSubmitting = isUpdating || isCreating;
  const isReferenceLoading =
    isDepartmentsLoading || isOperationAreasLoading || isPayrollGroupsLoading;

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: `${department.code} - ${department.name}`,
  }));

  const operationAreaOptions = operationAreas.map((operationArea) => ({
    value: operationArea.id,
    label: `${operationArea.code} - ${operationArea.name}`,
  }));

  const payrollGroupOptions = payrollGroups.map((payrollGroup) => ({
    value: payrollGroup.id,
    label: `${payrollGroup.code} - ${payrollGroup.name}`,
  }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="!mb-0">
              {isEdit ? EMPLOYEE_LABEL.EDIT_TITLE : EMPLOYEE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Complete all required employee profile, assignment, and payroll
              details.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/employee" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="section-jump-bar">
        <a href="#employee-personal" className="section-jump-chip">
          Personal
        </a>
        <a href="#employee-employment" className="section-jump-chip">
          Employment
        </a>
        <a href="#employee-compensation" className="section-jump-chip">
          Compensation
        </a>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <section id="employee-personal" className="form-section-anchor">
            <Card className="form-section-card" title="Personal Information">
              <div className="form-grid-2">
                <Form.Item
                  label={EMPLOYEE_LABEL.EMPLOYEE_NO}
                  validateStatus={errors.employeeNo ? "error" : ""}
                  help={errors.employeeNo?.message}
                >
                  <Controller
                    name="employeeNo"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.EMAIL}
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email?.message}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.FIRST_NAME}
                  validateStatus={errors.firstName ? "error" : ""}
                  help={errors.firstName?.message}
                >
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.LAST_NAME}
                  validateStatus={errors.lastName ? "error" : ""}
                  help={errors.lastName?.message}
                >
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item label={EMPLOYEE_LABEL.MIDDLE_NAME}>
                  <Controller
                    name="middleName"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.HIRE_DATE}
                  validateStatus={errors.hireDate ? "error" : ""}
                  help={errors.hireDate?.message}
                >
                  <Controller
                    name="hireDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        className="w-full"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : "")
                        }
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </Card>
          </section>

          <section id="employee-employment" className="form-section-anchor">
            <Card className="form-section-card" title="Employment Assignment">
              <div className="form-grid-2">
                <Form.Item
                  label={EMPLOYEE_LABEL.DEPARTMENT}
                  validateStatus={errors.departmentId ? "error" : ""}
                  help={errors.departmentId?.message}
                >
                  <Controller
                    name="departmentId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={departmentOptions}
                        loading={isReferenceLoading}
                        placeholder="Select department"
                        showSearch
                        optionFilterProp="label"
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.OPERATION_AREA}
                  validateStatus={errors.operationAreaId ? "error" : ""}
                  help={errors.operationAreaId?.message}
                >
                  <Controller
                    name="operationAreaId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={operationAreaOptions}
                        loading={isReferenceLoading}
                        placeholder="Select operation area"
                        showSearch
                        optionFilterProp="label"
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.PAYROLL_GROUP}
                  validateStatus={errors.payrollGroupId ? "error" : ""}
                  help={errors.payrollGroupId?.message}
                >
                  <Controller
                    name="payrollGroupId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={payrollGroupOptions}
                        loading={isReferenceLoading}
                        placeholder="Select payroll group"
                        showSearch
                        optionFilterProp="label"
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.EMPLOYMENT_STATUS}
                  validateStatus={errors.employmentStatus ? "error" : ""}
                  help={errors.employmentStatus?.message}
                >
                  <Controller
                    name="employmentStatus"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={EMPLOYMENT_STATUS_OPTIONS} />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.JOB_LEVEL}
                  validateStatus={errors.jobLevel ? "error" : ""}
                  help={errors.jobLevel?.message}
                >
                  <Controller
                    name="jobLevel"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={JOB_LEVEL_OPTIONS} />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.STATUS}
                  validateStatus={errors.status ? "error" : ""}
                  help={errors.status?.message}
                >
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={STATUS_OPTIONS} />
                    )}
                  />
                </Form.Item>
              </div>
            </Card>
          </section>

          <section id="employee-compensation" className="form-section-anchor">
            <Card className="form-section-card" title="Compensation Setup">
              <div className="form-grid-2">
                <Form.Item
                  label={EMPLOYEE_LABEL.PAYMENT_METHOD}
                  validateStatus={errors.paymentMethod ? "error" : ""}
                  help={errors.paymentMethod?.message}
                >
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={PAYMENT_METHOD_OPTIONS} />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={EMPLOYEE_LABEL.SALARY_TYPE}
                  validateStatus={errors.salaryType ? "error" : ""}
                  help={errors.salaryType?.message}
                >
                  <Controller
                    name="salaryType"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={SALARY_TYPE_OPTIONS} />
                    )}
                  />
                </Form.Item>
              </div>
            </Card>
          </section>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/employee" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isReferenceLoading}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
