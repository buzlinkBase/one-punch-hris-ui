import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Typography,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leaveTypeFormSchema,
  type LeaveTypeFormValues,
} from "../../models/forms/leave-type-form.schema";
import {
  useLeaveType,
  useCreateLeaveType,
  useUpdateLeaveType,
} from "../../hooks/use-leave-type-queries";
import { LEAVE_TYPE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  { value: "Statutory", label: "Statutory" },
  { value: "Company", label: "Company" },
];

const PAY_SOURCE_OPTIONS = [
  { value: "Company", label: "Company (employer-funded)" },
  { value: "Government", label: "Government (SSS/statutory)" },
  { value: "Unpaid", label: "Unpaid (no pay)" },
  { value: "Other", label: "Other" },
];

const LEAVE_RESET_OPTIONS = [
  { value: "PerPeriod", label: "Per Period (yearly reset)" },
  { value: "PerEvent", label: "Per Event (resets each qualifying event)" },
];

export default function LeaveTypeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useLeaveType(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateLeaveType();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateLeaveType();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: {
      code: "",
      category: undefined,
      description: "",
      credits: 0,
      paySource: "Company",
      leaveReset: "PerPeriod",
      remarks: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        category: selected.category,
        description: selected.description,
        credits: selected.credits,
        paySource: selected.paySource,
        leaveReset: selected.leaveReset,
        remarks: selected.remarks,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: LeaveTypeFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/leave-type" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? LEAVE_TYPE_LABEL.EDIT_TITLE
                : LEAVE_TYPE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define leave type rules, entitlements, and pay source.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/leave-type" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={LEAVE_TYPE_LABEL.CODE}
              validateStatus={errors.code ? "error" : ""}
              help={errors.code?.message}
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. SIL, ML, VL" />
                )}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_TYPE_LABEL.CATEGORY}
              validateStatus={errors.category ? "error" : ""}
              help={errors.category?.message}
            >
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CATEGORY_OPTIONS}
                    placeholder="Select category"
                    allowClear
                  />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={LEAVE_TYPE_LABEL.DESCRIPTION}
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Service Incentive Leave" />
              )}
            />
          </Form.Item>

          <div className="grid grid-cols-3 gap-x-6">
            <Form.Item
              label={LEAVE_TYPE_LABEL.CREDITS}
              validateStatus={errors.credits ? "error" : ""}
              help={errors.credits?.message}
            >
              <Controller
                name="credits"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    step={0.5}
                    className="w-full"
                    placeholder="0"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_TYPE_LABEL.PAY_SOURCE}
              validateStatus={errors.paySource ? "error" : ""}
              help={errors.paySource?.message}
            >
              <Controller
                name="paySource"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={PAY_SOURCE_OPTIONS}
                    placeholder="Select pay source"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={LEAVE_TYPE_LABEL.LEAVE_RESET}
              validateStatus={errors.leaveReset ? "error" : ""}
              help={errors.leaveReset?.message}
            >
              <Controller
                name="leaveReset"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={LEAVE_RESET_OPTIONS}
                    placeholder="Select reset policy"
                  />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={LEAVE_TYPE_LABEL.REMARKS}
            validateStatus={errors.remarks ? "error" : ""}
            help={errors.remarks?.message}
          >
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="e.g. RA 11210 Expanded Maternity Leave Law"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/leave-type" })}>
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
