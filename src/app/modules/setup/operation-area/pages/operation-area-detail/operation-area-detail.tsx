import { useEffect, lazy, Suspense, type ReactNode } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Spin,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  operationAreaFormSchema,
  type OperationAreaFormValues,
} from "../../models/forms/operation-area-form.schema";
import {
  useOperationArea,
  useCreateOperationArea,
  useUpdateOperationArea,
} from "../../hooks/use-operation-area-queries";
import { OPERATION_AREA_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const PolygonMapPicker = lazy(() =>
  import("@/shared/components/polygon-map-picker").then((m) => ({
    default: m.PolygonMapPicker,
  })),
);

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "20px 0 12px",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
    </div>
  );
}

export default function OperationAreaDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useOperationArea(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateOperationArea();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateOperationArea();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<OperationAreaFormValues>({
    resolver: zodResolver(operationAreaFormSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      boundary: null,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        address: selected.address ?? "",
        boundary: selected.boundary ?? null,
        status: selected.status,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OperationAreaFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/project-site" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OPERATION_AREA_LABEL.EDIT_TITLE
                : OPERATION_AREA_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Maintain project sites used for employee and scheduling setup.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/project-site" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}
            className="op-area-detail-layout"
          >
            <style>{`
              @media (min-width: 1024px) {
                .op-area-detail-layout {
                  grid-template-columns: 1fr 1.5fr !important;
                  align-items: start;
                }
              }
            `}</style>

            {/* Left: fields */}
            <div>
              <Form.Item
                label={OPERATION_AREA_LABEL.CODE}
                validateStatus={errors.code ? "error" : ""}
                help={errors.code?.message}
              >
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={OPERATION_AREA_LABEL.NAME}
                validateStatus={errors.name ? "error" : ""}
                help={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>

              <Form.Item
                label={OPERATION_AREA_LABEL.ADDRESS}
                validateStatus={errors.address ? "error" : ""}
                help={errors.address?.message}
              >
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      rows={3}
                      placeholder="Enter full address"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={OPERATION_AREA_LABEL.STATUS}
                validateStatus={errors.status ? "error" : ""}
                help={errors.status?.message}
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={STATUS_OPTIONS}
                      placeholder="Select status"
                    />
                  )}
                />
              </Form.Item>
            </div>

            {/* Right (large) / bottom (small): map */}
            <div>
              <SectionHeader>Project Site Boundary</SectionHeader>
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
                Draw a polygon on the map to define the geographic boundary of
                this project site.
              </p>
              <Controller
                name="boundary"
                control={control}
                render={({ field }) => (
                  <Suspense
                    fallback={
                      <div
                        style={{
                          height: 450,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Spin />
                      </div>
                    }
                  >
                    <PolygonMapPicker
                      value={field.value ?? null}
                      onChange={field.onChange}
                      height={450}
                      onAddressFound={(addr) => {
                        if (!getValues("address")?.trim())
                          setValue("address", addr);
                      }}
                    />
                  </Suspense>
                )}
              />
              {errors.boundary && (
                <p style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
                  {errors.boundary.message}
                </p>
              )}
            </div>
          </div>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/project-site" })}>
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
