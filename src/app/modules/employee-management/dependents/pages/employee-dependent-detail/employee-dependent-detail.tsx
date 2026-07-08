import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeDependentFormSchema,
  type EmployeeDependentFormValues,
} from "../../models/forms/employee-dependent-form.schema";
import {
  useEmployeeDependent,
  useCreateEmployeeDependent,
  useUpdateEmployeeDependent,
} from "../../hooks/use-employee-dependent-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import {
  EMPLOYEE_DEPENDENT_LABEL,
  RELATIONSHIP_OPTIONS,
  GENDER_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function EmployeeDependentDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useEmployeeDependent(isEdit ? id : undefined);
  const { data: employees = [] } = useEmployees();
  const { mutateAsync: add, isPending: isCreating } =
    useCreateEmployeeDependent();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateEmployeeDependent();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} (${e.employeeNo})`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeDependentFormValues>({
    resolver: zodResolver(employeeDependentFormSchema),
    defaultValues: {
      employeeId: "",
      fullName: "",
      relationship: "",
      gender: "",
      dob: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        employeeId: selected.employeeId,
        fullName: selected.fullName,
        relationship: selected.relationship,
        gender: selected.gender,
        dob: selected.dob,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: EmployeeDependentFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/employee-management/dependents" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? EMPLOYEE_DEPENDENT_LABEL.EDIT_TITLE
                : EMPLOYEE_DEPENDENT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Record dependent information for an employee.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() =>
                navigate({ to: "/employee-management/dependents" })
              }
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Employee */}
          <Form.Item
            label={EMPLOYEE_DEPENDENT_LABEL.EMPLOYEE}
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
                  optionFilterProp="label"
                  options={employeeOptions}
                  placeholder="Select employee"
                />
              )}
            />
          </Form.Item>

          {/* Full Name */}
          <Form.Item
            label={EMPLOYEE_DEPENDENT_LABEL.FULL_NAME}
            validateStatus={errors.fullName ? "error" : ""}
            help={errors.fullName?.message}
          >
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter full name" />
              )}
            />
          </Form.Item>

          {/* Relationship & Gender side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={EMPLOYEE_DEPENDENT_LABEL.RELATIONSHIP}
              validateStatus={errors.relationship ? "error" : ""}
              help={errors.relationship?.message}
            >
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={RELATIONSHIP_OPTIONS}
                    placeholder="Select relationship"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={EMPLOYEE_DEPENDENT_LABEL.GENDER}
              validateStatus={errors.gender ? "error" : ""}
              help={errors.gender?.message}
            >
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* Date of Birth */}
          <Form.Item
            label={EMPLOYEE_DEPENDENT_LABEL.DOB}
            validateStatus={errors.dob ? "error" : ""}
            help={errors.dob?.message}
          >
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.format("YYYY-MM-DD") : "")
                  }
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() =>
                  navigate({ to: "/employee-management/dependents" })
                }
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating || isCreating}
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
