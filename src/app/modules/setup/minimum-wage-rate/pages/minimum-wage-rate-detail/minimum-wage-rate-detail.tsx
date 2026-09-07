import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  minimumWageRateFormSchema,
  type MinimumWageRateFormValues,
} from "../../models/forms/minimum-wage-rate-form.schema";
import {
  useMinimumWageRate,
  useCreateMinimumWageRate,
  useUpdateMinimumWageRate,
} from "../../hooks/use-minimum-wage-rate-queries";
import { MINIMUM_WAGE_RATE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PH_REGION_OPTIONS } from "@/shared/constants/ph-regions.const";

const { Title } = Typography;

export default function MinimumWageRateDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useMinimumWageRate(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateMinimumWageRate();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateMinimumWageRate();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MinimumWageRateFormValues>({
    resolver: zodResolver(minimumWageRateFormSchema),
    defaultValues: {
      regionCode: "",
      regionName: "",
      dailyRate: 0,
      effectiveDate: "",
      wageOrderNo: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        regionCode: selected.regionCode,
        regionName: selected.regionName,
        dailyRate: selected.dailyRate,
        effectiveDate: selected.effectiveDate,
        wageOrderNo: selected.wageOrderNo ?? "",
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: MinimumWageRateFormValues) => {
    const payload = { ...values, wageOrderNo: values.wageOrderNo || undefined };
    if (isEdit && id) await update({ id, ...payload });
    else await add(payload);
    navigate({ to: "/setup/minimum-wage-rate" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? MINIMUM_WAGE_RATE_LABEL.EDIT_TITLE
                : MINIMUM_WAGE_RATE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Used to auto-classify Minimum Wage Earners for BIR Form 1601-C by
              comparing each employee's daily rate against their branch's
              region.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button
              onClick={() => navigate({ to: "/setup/minimum-wage-rate" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <Form.Item
              label={MINIMUM_WAGE_RATE_LABEL.REGION}
              validateStatus={errors.regionCode ? "error" : ""}
              help={errors.regionCode?.message}
            >
              <Controller
                name="regionCode"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    options={[...PH_REGION_OPTIONS]}
                    placeholder="Select region"
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(v: string) => {
                      field.onChange(v);
                      const region = PH_REGION_OPTIONS.find(
                        (r) => r.value === v,
                      );
                      setValue("regionName", region?.label ?? "");
                    }}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={MINIMUM_WAGE_RATE_LABEL.DAILY_RATE}
              validateStatus={errors.dailyRate ? "error" : ""}
              help={errors.dailyRate?.message}
            >
              <Controller
                name="dailyRate"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: "100%" }}
                    min={0}
                    precision={2}
                    addonBefore="₱"
                    onChange={(val) => field.onChange(val ?? 0)}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={MINIMUM_WAGE_RATE_LABEL.EFFECTIVE_DATE}
              validateStatus={errors.effectiveDate ? "error" : ""}
              help={errors.effectiveDate?.message}
            >
              <Controller
                name="effectiveDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) =>
                      field.onChange(d ? d.format("YYYY-MM-DD") : "")
                    }
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={MINIMUM_WAGE_RATE_LABEL.WAGE_ORDER_NO}
              help="Optional reference, e.g. 'NCR Wage Order No. 25'"
            >
              <Controller
                name="wageOrderNo"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/minimum-wage-rate" })}
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
