import { useEffect } from "react";
import { Form, Input, Select, Button, Typography, Space, Tag } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SelectProps } from "antd";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  deviceFormSchema,
  type DeviceFormValues,
} from "../../models/forms/device-form.schema";
import {
  useDevice,
  useCreateDevice,
  useUpdateDevice,
} from "../../hooks/use-device-queries";
import { DEVICE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const LIST_PATH = "/biometric/manage-devices";

export default function ManageDevicesDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useDevice(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateDevice();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateDevice();

  const { data: branches = [] } = useBranches();
  const { data: clients = [] } = useClients();
  const { data: areas = [] } = useOperationAreas();

  const branchOptions: SelectProps["options"] = branches.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const clientOptions: SelectProps["options"] = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const areaOptions: SelectProps["options"] = areas.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      sn: "",
      description: "",
      branchId: undefined,
      clientId: undefined,
      areaId: undefined,
      status: "Active",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        sn: selected.sn,
        description: selected.description,
        branchId: selected.branchId,
        clientId: selected.clientId,
        areaId: selected.operationAreaId,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: DeviceFormValues) => {
    const payload = {
      sn: values.sn,
      description: values.description ?? "",
      branchId: values.branchId || undefined,
      clientId: values.clientId || undefined,
      areaId: values.areaId || undefined,
      status: values.status,
    };

    if (isEdit && id) {
      await update({ id, ...payload });
    } else {
      await add(payload);
    }
    navigate({ to: LIST_PATH });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? DEVICE_LABEL.EDIT_TITLE : DEVICE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{DEVICE_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: LIST_PATH })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={DEVICE_LABEL.DESCRIPTION}
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Main Gate Scanner" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEVICE_LABEL.SN}
            validateStatus={errors.sn ? "error" : ""}
            help={errors.sn?.message}
          >
            <Controller
              name="sn"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. BIO-SN-001" />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEVICE_LABEL.BRANCH}
            validateStatus={errors.branchId ? "error" : ""}
            help={errors.branchId?.message}
          >
            <Controller
              name="branchId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Select branch (optional)"
                  options={branchOptions}
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEVICE_LABEL.CLIENT}
            validateStatus={errors.clientId ? "error" : ""}
            help={errors.clientId?.message}
          >
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Select client (optional)"
                  options={clientOptions}
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEVICE_LABEL.AREA}
            validateStatus={errors.areaId ? "error" : ""}
            help={errors.areaId?.message}
          >
            <Controller
              name="areaId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Select project site (optional)"
                  options={areaOptions}
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEVICE_LABEL.STATUS}
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

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: LIST_PATH })}>
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
