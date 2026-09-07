import { useEffect, useMemo, lazy, Suspense } from "react";
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
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  branchFormSchema,
  type BranchFormValues,
} from "../../models/forms/branch-form.schema";
import {
  useBranch,
  useCreateBranch,
  useUpdateBranch,
} from "../../hooks/use-branch-queries";
import { BRANCH_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PH_REGION_OPTIONS } from "@/shared/constants/ph-regions.const";
import { useMinimumWageRates } from "@/app/modules/setup/minimum-wage-rate/hooks/use-minimum-wage-rate-queries";

// Lazy-load the map to avoid SSR/leaflet issues
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

export default function BranchDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useBranch(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateBranch();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateBranch();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      code: "",
      name: "",
      address: null,
      boundary: null,
      status: "ACTIVE",
      regionCode: null,
      wageOrderClass: null,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        address: selected.address ?? null,
        boundary: selected.boundary ?? null,
        status: selected.status,
        regionCode: selected.regionCode ?? null,
        wageOrderClass: selected.wageOrderClass ?? null,
      });
    }
  }, [selected, isEdit, reset]);

  // Wage Order Class options come from whatever classes have already been entered in
  // Minimum Wage Rate setup for this branch's region — keeps a branch's class always
  // matched to a real rate row instead of a freely-typed value that might not exist.
  // useWatch (not the imperative watch() from useForm) so React Compiler can safely memoize
  // this component.
  const selectedRegionCode = useWatch({ control, name: "regionCode" });
  const { data: minimumWageRates = [] } = useMinimumWageRates();
  const wageOrderClassOptions = useMemo(() => {
    if (!selectedRegionCode) return [];
    const classes = minimumWageRates
      .filter((r) => r.regionCode === selectedRegionCode && r.wageOrderClass)
      .map((r) => r.wageOrderClass as string);
    return Array.from(new Set(classes)).map((c) => ({ value: c, label: c }));
  }, [minimumWageRates, selectedRegionCode]);

  const onSubmit = async (values: BranchFormValues) => {
    if (isEdit && id) await update({ id, ...values });
    else await add(values);
    navigate({ to: "/setup/branch" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? BRANCH_LABEL.EDIT_TITLE : BRANCH_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure branch details and define its geographic boundary area.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/branch" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Two-column on large screens: inputs left, map right. Single column on small screens: map at bottom. */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}
            className="branch-detail-layout"
          >
            <style>{`
              @media (min-width: 1024px) {
                .branch-detail-layout {
                  grid-template-columns: 1fr 1.5fr !important;
                  align-items: start;
                }
              }
            `}</style>

            {/* Left column: fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <Form.Item
                label={BRANCH_LABEL.CODE}
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
                label={BRANCH_LABEL.NAME}
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
                label={BRANCH_LABEL.ADDRESS}
                validateStatus={errors.address ? "error" : ""}
                help={errors.address?.message}
              >
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      rows={3}
                      placeholder="Enter full address"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Region"
                help="DOLE wage region — used to auto-classify Minimum Wage Earners for BIR 1601-C"
              >
                <Controller
                  name="regionCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? undefined}
                      onChange={(v) => field.onChange(v ?? null)}
                      options={[...PH_REGION_OPTIONS]}
                      placeholder="Select region"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Wage Order Class"
                help="Sector/class this branch is registered under — options come from Minimum Wage Rate entries for the selected region. Leave blank if not applicable."
              >
                <Controller
                  name="wageOrderClass"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? undefined}
                      onChange={(v) => field.onChange(v ?? null)}
                      options={wageOrderClassOptions}
                      placeholder={
                        selectedRegionCode
                          ? "Select wage order class"
                          : "Select a Region first"
                      }
                      allowClear
                      showSearch
                      disabled={!selectedRegionCode}
                      notFoundContent="No classes entered for this region yet — add one in Minimum Wage Rate setup."
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={BRANCH_LABEL.STATUS}
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

            {/* Right column (large) / bottom (small): map */}
            <div>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Branch Boundary Area
                </span>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    margin: "4px 0 8px",
                  }}
                >
                  Draw a polygon on the map to define the geographic boundary of
                  this branch.
                </p>
              </div>
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
              <Button onClick={() => navigate({ to: "/setup/branch" })}>
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
