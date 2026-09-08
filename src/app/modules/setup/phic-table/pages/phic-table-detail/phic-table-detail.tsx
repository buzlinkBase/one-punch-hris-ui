import { useEffect } from "react";
import {
  Form,
  Button,
  Typography,
  Space,
  Tag,
  InputNumber,
  Input,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  phicTableFormSchema,
  type PhicTableFormValues,
} from "../../models/forms/phic-table-form.schema";
import {
  usePhicTableRow,
  useCreatePhicTableRow,
  useUpdatePhicTableRow,
} from "../../hooks/use-phic-table-queries";
import { PHIC_TABLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function PhicTableDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = usePhicTableRow(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreatePhicTableRow();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdatePhicTableRow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhicTableFormValues>({
    resolver: zodResolver(phicTableFormSchema) as Resolver<PhicTableFormValues>,
    defaultValues: {
      minSalaryBase: 0,
      maxSalaryBase: 0,
      premiumRate: 0,
      employeeShare: 0,
      employerShare: 0,
      remarks: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        minSalaryBase: selected.minSalaryBase,
        maxSalaryBase: selected.maxSalaryBase,
        premiumRate: selected.premiumRate,
        employeeShare: selected.employeeShare,
        employerShare: selected.employerShare,
        remarks: selected.remarks,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: PhicTableFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/phic-table" });
  };

  const numField = (name: keyof PhicTableFormValues, label: string) => (
    <Form.Item
      label={label}
      validateStatus={errors[name] ? "error" : ""}
      help={errors[name]?.message}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputNumber
            {...field}
            onChange={(v) => field.onChange(v ?? 0)}
            min={0}
            step={0.01}
            style={{ width: "100%" }}
          />
        )}
      />
    </Form.Item>
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? PHIC_TABLE_LABEL.EDIT_TITLE
                : PHIC_TABLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define a PhilHealth premium bracket and contribution amounts.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/phic-table" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {numField("minSalaryBase", PHIC_TABLE_LABEL.MIN_SALARY_BASE)}
          {numField("maxSalaryBase", PHIC_TABLE_LABEL.MAX_SALARY_BASE)}
          {numField("premiumRate", PHIC_TABLE_LABEL.PREMIUM_RATE)}
          {numField("employeeShare", PHIC_TABLE_LABEL.EMPLOYEE_SHARE)}
          {numField("employerShare", PHIC_TABLE_LABEL.EMPLOYER_SHARE)}

          <Form.Item
            label={PHIC_TABLE_LABEL.REMARKS}
            validateStatus={errors.remarks ? "error" : ""}
            help={errors.remarks?.message}
          >
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          {isEdit && selected && (
            <Descriptions size="small" bordered column={1}>
              <Descriptions.Item label={PHIC_TABLE_LABEL.TOTAL}>
                {(selected.totalContribution ?? 0).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Descriptions.Item>
            </Descriptions>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/phic-table" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
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
