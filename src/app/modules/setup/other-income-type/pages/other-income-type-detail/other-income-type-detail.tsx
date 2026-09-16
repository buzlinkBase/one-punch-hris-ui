import { useEffect } from "react";
import { Button, Form, Input, Space, Tag, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  otherIncomeTypeFormSchema,
  type OtherIncomeTypeFormValues,
} from "../../models/forms/other-income-type-form.schema";
import {
  useOtherIncomeType,
  useCreateOtherIncomeType,
  useUpdateOtherIncomeType,
} from "../../hooks/use-other-income-type-queries";
import { OTHER_INCOME_TYPE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function OtherIncomeTypeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useOtherIncomeType(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateOtherIncomeType();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateOtherIncomeType();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtherIncomeTypeFormValues>({
    resolver: zodResolver(otherIncomeTypeFormSchema),
    defaultValues: { description: "" },
  });

  useEffect(() => {
    if (isEdit && selected) reset({ description: selected.description });
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OtherIncomeTypeFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/other-income-type" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OTHER_INCOME_TYPE_LABEL.EDIT_TITLE
                : OTHER_INCOME_TYPE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define a category for grouping other income items.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() => navigate({ to: "/setup/other-income-type" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={OTHER_INCOME_TYPE_LABEL.DESCRIPTION}
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Allowance, Bonus" />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/other-income-type" })}
              >
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={
                  isEdit
                    ? "Deductions & Income Setup:Edit"
                    : "Deductions & Income Setup:Create"
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
