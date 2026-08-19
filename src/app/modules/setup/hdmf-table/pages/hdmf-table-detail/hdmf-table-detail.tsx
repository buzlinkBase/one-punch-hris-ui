import { useEffect } from "react";
import {
  Form,
  Button,
  Typography,
  Space,
  Tag,
  DatePicker,
  InputNumber,
  Input,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  hdmfTableFormSchema,
  type HdmfTableFormValues,
} from "../../models/forms/hdmf-table-form.schema";
import {
  useHdmfTableRow,
  useCreateHdmfTableRow,
  useUpdateHdmfTableRow,
} from "../../hooks/use-hdmf-table-queries";
import { HDMF_TABLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

const today = dayjs().format("YYYY-MM-DD");

export default function HdmfTableDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useHdmfTableRow(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateHdmfTableRow();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateHdmfTableRow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HdmfTableFormValues>({
    resolver: zodResolver(hdmfTableFormSchema) as Resolver<HdmfTableFormValues>,
    defaultValues: {
      effectiveDate: today,
      minSalaryBase: 0,
      maxSalaryBase: 0,
      employeeRate: 0,
      employerRate: 0,
      employeeShare: 0,
      employerShare: 0,
      remarks: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        effectiveDate: selected.effectiveDate,
        minSalaryBase: selected.minSalaryBase,
        maxSalaryBase: selected.maxSalaryBase,
        employeeRate: selected.employeeRate,
        employerRate: selected.employerRate,
        employeeShare: selected.employeeShare,
        employerShare: selected.employerShare,
        remarks: selected.remarks,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: HdmfTableFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/hdmf-table" });
  };

  const numField = (name: keyof HdmfTableFormValues, label: string) => (
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
                ? HDMF_TABLE_LABEL.EDIT_TITLE
                : HDMF_TABLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define a Pag-IBIG contribution bracket and rates.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/hdmf-table" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={HDMF_TABLE_LABEL.EFFECTIVE_DATE}
            validateStatus={errors.effectiveDate ? "error" : ""}
            help={errors.effectiveDate?.message}
          >
            <Controller
              name="effectiveDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) =>
                    field.onChange(d ? d.format("YYYY-MM-DD") : "")
                  }
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

          {numField("minSalaryBase", HDMF_TABLE_LABEL.MIN_SALARY_BASE)}
          {numField("maxSalaryBase", HDMF_TABLE_LABEL.MAX_SALARY_BASE)}
          {numField("employeeRate", HDMF_TABLE_LABEL.EMPLOYEE_RATE)}
          {numField("employerRate", HDMF_TABLE_LABEL.EMPLOYER_RATE)}
          {numField("employeeShare", HDMF_TABLE_LABEL.EMPLOYEE_SHARE)}
          {numField("employerShare", HDMF_TABLE_LABEL.EMPLOYER_SHARE)}

          <Form.Item
            label={HDMF_TABLE_LABEL.REMARKS}
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
              <Descriptions.Item label={HDMF_TABLE_LABEL.TOTAL}>
                {selected.totalContribution.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Descriptions.Item>
            </Descriptions>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/hdmf-table" })}>
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
