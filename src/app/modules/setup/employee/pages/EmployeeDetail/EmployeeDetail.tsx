import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Typography,
  Card,
  Space,
  Tag,
  Checkbox,
  Switch,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/useRouteParams";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "../../models/forms/employee-form.schema";
import type { DayName } from "../../models/api/response/employee-response.model";
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
} from "../../hooks/useEmployeeQueries";
import { employeeMapper } from "../../services/employee.mapper";
import {
  EMPLOYEE_LABEL,
  MODE_OF_PAYMENT_OPTIONS,
  SALARY_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  JOB_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useDepartments } from "@/app/modules/setup/department/hooks/useDepartmentQueries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/useOperationAreaQueries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/usePayrollGroupQueries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/useFixedTimeShiftQueries";
import { useFlexiTimeShifts } from "@/app/modules/setup/time-shift/flexi/hooks/useFlexiTimeShiftQueries";
import { useClients } from "@/app/modules/setup/client/hooks/useClientQueries";
import { useSections } from "@/app/modules/setup/section/hooks/useSectionQueries";
import { useBranches } from "@/app/modules/setup/branch/hooks/useBranchQueries";
import { usePositions } from "@/app/modules/setup/position/hooks/usePositionQueries";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const filterByLabel = (input: string, option?: { label?: string | number | boolean }) =>
  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase());

const REST_DAY_OPTIONS = [
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
  { value: "Sunday", label: "Sun" },
];

const datePicker = (
  value: string | null | undefined,
  onChange: (v: string | null) => void,
  allowClear = true,
) => (
  <DatePicker
    className="w-full"
    value={value ? dayjs(value) : null}
    onChange={(date) => onChange(date ? date.toISOString() : null)}
    allowClear={allowClear}
  />
);

export default function EmployeeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useEmployee(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateEmployee();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateEmployee();
  const { data: departments = [], isLoading: isDepartmentsLoading } = useDepartments();
  const { data: operationAreas = [], isLoading: isAreasLoading } = useOperationAreas();
  const { data: payrollGroups = [], isLoading: isPayrollGroupsLoading } = usePayrollGroups();
  const { data: fixedShifts = [], isLoading: isFixedShiftsLoading } = useFixedTimeShifts();
  const { data: flexiShifts = [], isLoading: isFlexiShiftsLoading } = useFlexiTimeShifts();
  const { data: clients = [], isLoading: isClientsLoading } = useClients();
  const { data: sections = [], isLoading: isSectionsLoading } = useSections();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: positions = [], isLoading: isPositionsLoading } = usePositions();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema) as Resolver<EmployeeFormValues>,
    defaultValues: employeeMapper.toDefaultValues(),
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset(employeeMapper.toFormValues(selected));
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const payload = {
      ...values,
      restDays: values.restDays?.map((d) => ({ dayName: d as DayName })),
    };
   if (isEdit && id) await update({ id, ...payload });
      else await add(payload);
      navigate({ to: "/setup/employee" });
  };

  const isSubmitting = isUpdating || isCreating;
  const watchedDepartmentId = useWatch({ control, name: "departmentId" });

  const isRefLoading =
    isDepartmentsLoading ||
    isAreasLoading ||
    isPayrollGroupsLoading ||
    isFixedShiftsLoading ||
    isFlexiShiftsLoading ||
    isClientsLoading ||
    isSectionsLoading ||
    isBranchesLoading ||
    isPositionsLoading;

  const departmentOptions = departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }));
  const areaOptions = operationAreas.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));
  const payrollGroupOptions = payrollGroups.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }));
  const timeShiftOptions = [
    ...fixedShifts.map((s) => ({ value: s.id, label: `${s.code} - ${s.name} (Fixed)` })),
    ...flexiShifts.map((s) => ({ value: s.id, label: `${s.code} - ${s.name} (Flexi)` })),
  ];
  const clientOptions = clients.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` }));
  const branchOptions = branches.map((b) => ({ value: b.id, label: `${b.code} - ${b.name}` }));
  const positionOptions = positions.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }));
  const sectionOptions = sections
    .filter((s) => !watchedDepartmentId || s.departmentId === watchedDepartmentId)
    .map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }));

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? EMPLOYEE_LABEL.EDIT_TITLE : EMPLOYEE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Complete all required employee profile, assignment, and payroll details.
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
        <a href="#emp-personal" className="section-jump-chip">Personal</a>
        <a href="#emp-employment" className="section-jump-chip">Employment</a>
        <a href="#emp-compensation" className="section-jump-chip">Compensation</a>
        <a href="#emp-gov-ids" className="section-jump-chip">Gov't IDs</a>
        <a href="#emp-settings" className="section-jump-chip">Settings</a>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

          {/* ── Personal Information ── */}
          <section id="emp-personal" className="form-section-anchor">
            <Card className="form-section-card" title="Personal Information">
              <div className="form-grid-2">
                <Form.Item label={EMPLOYEE_LABEL.FIRST_NAME} validateStatus={errors.firstName ? "error" : ""} help={errors.firstName?.message}>
                  <Controller name="firstName" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.LAST_NAME} validateStatus={errors.lastName ? "error" : ""} help={errors.lastName?.message}>
                  <Controller name="lastName" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.MIDDLE_NAME}>
                  <Controller name="middleName" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.SUFFIX}>
                  <Controller name="suffix" control={control} render={({ field }) => <Input {...field} placeholder="Jr., Sr., III…" />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.GENDER}>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} options={GENDER_OPTIONS} allowClear placeholder="Select gender" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.CIVIL_STATUS}>
                  <Controller name="civilStatus" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} options={CIVIL_STATUS_OPTIONS} allowClear placeholder="Select civil status" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.DOB}>
                  <Controller name="dob" control={control} render={({ field }) => datePicker(field.value, field.onChange)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.AGE}>
                  <Controller name="age" control={control} render={({ field }) => (
                    <InputNumber {...field} className="w-full" min={0} max={120} placeholder="0" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.BLOOD_TYPE}>
                  <Controller name="bloodType" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} options={BLOOD_TYPE_OPTIONS} allowClear placeholder="Select blood type" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.CONTACT}>
                  <Controller name="contact" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.ADDRESS1}>
                  <Controller name="address1" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.ADDRESS2}>
                  <Controller name="address2" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </div>
            </Card>
          </section>

          {/* ── Employment ── */}
          <section id="emp-employment" className="form-section-anchor">
            <Card className="form-section-card" title="Employment Details">
              <div className="form-grid-2">
                <Form.Item label={EMPLOYEE_LABEL.EMPLOYEE_NO}>
                  <Controller name="employeeNo" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.BIO_ID}>
                  <Controller name="bioId" control={control} render={({ field }) => (
                    <InputNumber {...field} className="w-full" min={0} placeholder="" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.DEPARTMENT}>
                  <Controller name="departmentId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => { field.onChange(v ?? null); setValue("sectionId", null); }} options={departmentOptions} loading={isRefLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select department" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.SECTION}>
                  <Controller name="sectionId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={sectionOptions} loading={isSectionsLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select section" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.AREA}>
                  <Controller name="areaId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={areaOptions} loading={isRefLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select area" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.PAYROLL_GROUP}>
                  <Controller name="payrollGroupId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={payrollGroupOptions} loading={isRefLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select payroll group" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.CLIENT}>
                  <Controller name="clientId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={clientOptions} loading={isClientsLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select client" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.BRANCH}>
                  <Controller name="branchId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={branchOptions} loading={isBranchesLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select branch" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.POSITION}>
                  <Controller name="positionId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={positionOptions} loading={isPositionsLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select position" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.JOB_LEVEL} validateStatus={errors.jobLevel ? "error" : ""} help={errors.jobLevel?.message}>
                  <Controller name="jobLevel" control={control} render={({ field }) => (
                    <Select {...field} options={JOB_LEVEL_OPTIONS} placeholder="Select job level" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.TIME_SHIFT}>
                  <Controller name="timeShiftId" control={control} render={({ field }) => (
                    <Select {...field} value={field.value ?? undefined} onChange={(v) => field.onChange(v ?? null)} options={timeShiftOptions} loading={isRefLoading} allowClear showSearch filterOption={filterByLabel} placeholder="Select time shift" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.EMPLOYMENT_STATUS} validateStatus={errors.employmentStatus ? "error" : ""} help={errors.employmentStatus?.message}>
                  <Controller name="employmentStatus" control={control} render={({ field }) => (
                    <Select {...field} options={EMPLOYMENT_STATUS_OPTIONS} placeholder="Select status" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.HIRING_ENTITY}>
                  <Controller name="hiringEntity" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.STATUS} validateStatus={errors.status ? "error" : ""} help={errors.status?.message}>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select {...field} options={STATUS_OPTIONS} placeholder="Select status" />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.DATE_REGISTERED} validateStatus={errors.dateRegistered ? "error" : ""} help={errors.dateRegistered?.message}>
                  <Controller name="dateRegistered" control={control} render={({ field }) => datePicker(field.value, (v) => field.onChange(v ?? ""), false)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.HIRE_DATE}>
                  <Controller name="hireDate" control={control} render={({ field }) => datePicker(field.value, field.onChange)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.CONTRACT_START}>
                  <Controller name="contractStart" control={control} render={({ field }) => datePicker(field.value, field.onChange)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.CONTRACT_END}>
                  <Controller name="contractEnd" control={control} render={({ field }) => datePicker(field.value, field.onChange)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.DATE_RESIGNED} className="col-span-2">
                  <Controller name="dateResigned" control={control} render={({ field }) => datePicker(field.value, field.onChange)} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.REST_DAYS} className="col-span-2">
                  <Controller name="restDays" control={control} render={({ field }) => (
                    <Checkbox.Group
                      options={REST_DAY_OPTIONS}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      className="flex gap-4 flex-wrap"
                    />
                  )} />
                </Form.Item>
              </div>
            </Card>
          </section>

          {/* ── Compensation ── */}
          <section id="emp-compensation" className="form-section-anchor">
            <Card className="form-section-card" title="Compensation">
              <div className="form-grid-2">
                <Form.Item label={EMPLOYEE_LABEL.SALARY_TYPE} validateStatus={errors.salaryType ? "error" : ""} help={errors.salaryType?.message}>
                  <Controller name="salaryType" control={control} render={({ field }) => (
                    <Select {...field} options={SALARY_TYPE_OPTIONS} />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.MONTHLY_RATE}>
                  <Controller name="monthlyRate" control={control} render={({ field }) => (
                    <InputNumber {...field} className="w-full" min={0} precision={2} formatter={(v) => `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.DAILY_RATE}>
                  <Controller name="dailyRate" control={control} render={({ field }) => (
                    <InputNumber {...field} className="w-full" min={0} precision={2} formatter={(v) => `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.COLA}>
                  <Controller name="cola" control={control} render={({ field }) => (
                    <InputNumber {...field} className="w-full" min={0} precision={2} formatter={(v) => `₱ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.MODE_OF_PAYMENT} validateStatus={errors.modeOfPayment ? "error" : ""} help={errors.modeOfPayment?.message}>
                  <Controller name="modeOfPayment" control={control} render={({ field }) => (
                    <Select {...field} options={MODE_OF_PAYMENT_OPTIONS} />
                  )} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.BANK_NAME}>
                  <Controller name="bankName" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.BANK_NO} className="col-span-2">
                  <Controller name="bankNo" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </div>
            </Card>
          </section>

          {/* ── Government IDs ── */}
          <section id="emp-gov-ids" className="form-section-anchor">
            <Card className="form-section-card" title="Government IDs">
              <div className="form-grid-2">
                <Form.Item label={EMPLOYEE_LABEL.SSS_NO}>
                  <Controller name="sssNo" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.PHIC_NO}>
                  <Controller name="phicNo" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.HDMF_NO}>
                  <Controller name="hdmfNo" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>

                <Form.Item label={EMPLOYEE_LABEL.TIN}>
                  <Controller name="tin" control={control} render={({ field }) => <Input {...field} />} />
                </Form.Item>
              </div>
            </Card>
          </section>

          {/* ── Settings ── */}
          <section id="emp-settings" className="form-section-anchor">
            <Card className="form-section-card" title="Eligibility Settings">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span>Eligible for Overtime</span>
                  <Controller name="settings.isEligibleForOvertime" control={control} render={({ field }) => (
                    <Switch checked={field.value ?? false} onChange={field.onChange} />
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Eligible for Holiday Pay</span>
                  <Controller name="settings.isEligibleForHolidayPay" control={control} render={({ field }) => (
                    <Switch checked={field.value ?? false} onChange={field.onChange} />
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Eligible for Night Differential</span>
                  <Controller name="settings.isEligibleForNightDifferential" control={control} render={({ field }) => (
                    <Switch checked={field.value ?? false} onChange={field.onChange} />
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Eligible for Leave Credits</span>
                  <Controller name="settings.isEligibleForLeaveCredits" control={control} render={({ field }) => (
                    <Switch checked={field.value ?? false} onChange={field.onChange} />
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Eligible for 13th Month Pay</span>
                  <Controller name="settings.isEligibleFor13thMonth" control={control} render={({ field }) => (
                    <Switch checked={field.value ?? false} onChange={field.onChange} />
                  )} />
                </div>
              </div>
            </Card>
          </section>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/employee" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isRefLoading}>
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>

        </Form>
      </div>
    </div>
  );
}
