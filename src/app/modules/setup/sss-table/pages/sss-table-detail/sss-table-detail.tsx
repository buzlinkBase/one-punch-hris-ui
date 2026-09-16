import { useEffect } from "react";
import {
  Form,
  Button,
  Typography,
  Space,
  Tag,
  InputNumber,
  Descriptions,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sssTableFormSchema,
  type SssTableFormValues,
} from "../../models/forms/sss-table-form.schema";
import {
  useSssTableRow,
  useCreateSssTableRow,
  useUpdateSssTableRow,
} from "../../hooks/use-sss-table-queries";
import { SSS_TABLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function SssTableDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useSssTableRow(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateSssTableRow();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSssTableRow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SssTableFormValues>({
    resolver: zodResolver(sssTableFormSchema) as Resolver<SssTableFormValues>,
    defaultValues: {
      rangeFrom: 0,
      rangeTo: 0,
      msc: 0,
      ee: 0,
      er: 0,
      ec: 0,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        rangeFrom: selected.rangeFrom,
        rangeTo: selected.rangeTo,
        msc: selected.msc,
        ee: selected.ee,
        er: selected.er,
        ec: selected.ec,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: SssTableFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/sss-table" });
  };

  const numField = (name: keyof SssTableFormValues, label: string) => (
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
            className="w-full"
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
                ? SSS_TABLE_LABEL.EDIT_TITLE
                : SSS_TABLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define a salary range bracket and its corresponding SSS
              contributions.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/sss-table" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {numField("rangeFrom", SSS_TABLE_LABEL.RANGE_FROM)}
          {numField("rangeTo", SSS_TABLE_LABEL.RANGE_TO)}
          {numField("msc", SSS_TABLE_LABEL.MSC)}
          {numField("ee", SSS_TABLE_LABEL.EE)}
          {numField("er", SSS_TABLE_LABEL.ER)}
          {numField("ec", SSS_TABLE_LABEL.EC)}

          {isEdit && selected && (
            <Descriptions size="small" bordered column={1}>
              <Descriptions.Item label={SSS_TABLE_LABEL.TOTAL}>
                {(selected.totalContibution ?? 0).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Descriptions.Item>
            </Descriptions>
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/sss-table" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={
                  isEdit ? "Statutory Tables:Edit" : "Statutory Tables:Create"
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
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
