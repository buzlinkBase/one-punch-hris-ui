import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  uniformAllowancePolicyFormSchema,
  type UniformAllowancePolicyFormValues,
} from "../../models/forms/uniform-allowance-policy.schema";
import {
  CREDIT_DAY_OPTIONS,
  MONTH_OPTIONS,
  QUALIFYING_STATUS_OPTIONS,
  UNIFORM_AMOUNT_MODE_OPTIONS,
  UNIFORM_EXPIRY_OPTIONS,
  UNIFORM_FREQUENCY_OPTIONS,
  UNIFORM_REHIRE_OPTIONS,
  UNIFORM_SEPARATION_OPTIONS,
} from "../../constants/uniform-allowance.const";
import UniformAllowanceSummary from "../uniform-allowance-summary/uniform-allowance-summary";

const { Text } = Typography;

const AMOUNT_LABEL: Record<
  UniformAllowancePolicyFormValues["amountMode"],
  string
> = {
  FixedPerPeriod: "Amount per period",
  ProratedByPresentDays: "Full amount per period",
  PerPresentDay: "Amount per present day",
};

const pesoFormatter = (value: string | number | undefined) =>
  value === undefined || value === ""
    ? ""
    : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pesoParser = (value: string | undefined) =>
  Number((value ?? "").replace(/,/g, ""));

interface UniformAllowancePolicyFormProps {
  initialValues: UniformAllowancePolicyFormValues;
  /** The earliest start date allowed (YYYY-MM-DD). */
  earliestStart: string;
  saving: boolean;
  canEdit: boolean;
  onSubmit: (values: UniformAllowancePolicyFormValues) => void;
  onCancel: () => void;
}

/** One uniform allowance policy version: when, how much, who, limits, separation -- and why. */
export default function UniformAllowancePolicyForm({
  initialValues,
  earliestStart,
  saving,
  canEdit,
  onSubmit,
  onCancel,
}: UniformAllowancePolicyFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UniformAllowancePolicyFormValues>({
    resolver: zodResolver(uniformAllowancePolicyFormSchema),
    defaultValues: initialValues,
  });
  const values = useWatch({ control }) as UniformAllowancePolicyFormValues;
  const isCycle = ["Quarterly", "SemiAnnual", "Annual"].includes(
    values.frequency,
  );

  // A field's error, for Form.Item.
  const status = (name: FieldPath<UniformAllowancePolicyFormValues>) => {
    const error = errors[name as keyof typeof errors];
    return error
      ? { validateStatus: "error" as const, help: String(error.message) }
      : {};
  };

  return (
    <Form layout="vertical" className="flex flex-col gap-4">
      <Card size="small" title="When it starts">
        <div className="form-grid-2">
          <Form.Item
            label="Effective from"
            extra="Credits before this day keep the rules they were decided under."
            {...status("effectiveFrom")}
          >
            <Controller
              name="effectiveFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) =>
                    field.onChange(d ? d.format("YYYY-MM-DD") : "")
                  }
                  disabledDate={(d) => d.format("YYYY-MM-DD") < earliestStart}
                  format="MMM D, YYYY"
                  allowClear={false}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Give uniform allowance"
            extra="Turn off to stop crediting from the start date. Balances already earned stay."
          >
            <Controller
              name="isEnabled"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>
        </div>
      </Card>

      {values.isEnabled && (
        <>
          <Card size="small" title="Schedule">
            <Text type="secondary" className="block mb-3 text-[13px]">
              When credits post. Each credit looks at the period that just
              ended, so its present days are final.
            </Text>
            <div className="form-grid-2">
              <Form.Item label="Credit frequency">
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={UNIFORM_FREQUENCY_OPTIONS} />
                  )}
                />
              </Form.Item>
              {values.frequency !== "HireAnniversary" && (
                <Form.Item
                  label="Credit day of the month"
                  extra="1 to 28, so every month has it."
                >
                  <Controller
                    name="creditDay"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={CREDIT_DAY_OPTIONS} />
                    )}
                  />
                </Form.Item>
              )}
              {isCycle && (
                <Form.Item
                  label={
                    values.frequency === "Annual"
                      ? "Credit month"
                      : "First credit month of the cycle"
                  }
                >
                  <Controller
                    name="startMonth"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={MONTH_OPTIONS} />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>

          <Card size="small" title="Amount">
            <div className="form-grid-2">
              <Form.Item label="How the amount is worked out">
                <Controller
                  name="amountMode"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={UNIFORM_AMOUNT_MODE_OPTIONS} />
                  )}
                />
              </Form.Item>
              <Form.Item
                label={AMOUNT_LABEL[values.amountMode]}
                {...status("amount")}
              >
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      min={0}
                      precision={2}
                      addonBefore="₱"
                      formatter={pesoFormatter}
                      parser={pesoParser}
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? null)}
                    />
                  )}
                />
              </Form.Item>
              {values.amountMode === "ProratedByPresentDays" && (
                <Form.Item
                  label="Present days for the full amount"
                  extra="Fewer days earn a share; more never earn above the full amount."
                  {...status("expectedDaysPerPeriod")}
                >
                  <Controller
                    name="expectedDaysPerPeriod"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        className="w-full"
                        min={1}
                        precision={0}
                        addonAfter="days"
                        value={field.value}
                        onChange={(v) => field.onChange(v ?? null)}
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>

          <Card size="small" title="Who qualifies">
            <div className="form-grid-2">
              <Form.Item
                label="Employment statuses"
                {...status("eligibleStatuses")}
              >
                <Controller
                  name="eligibleStatuses"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode="multiple"
                      options={QUALIFYING_STATUS_OPTIONS}
                      placeholder="Pick who qualifies"
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Waiting period"
                extra="Whole months of service before the first credit. 0 = from the start."
                {...status("waitingMonths")}
              >
                <Controller
                  name="waitingMonths"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      min={0}
                      max={120}
                      precision={0}
                      addonAfter="months"
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? 0)}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item
                label="Required present days"
                extra="Present days needed within each credit period. Leave empty for no attendance requirement."
                {...status("minPresentDays")}
              >
                <Controller
                  name="minPresentDays"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      min={0}
                      precision={0}
                      addonAfter="days per period"
                      placeholder="No requirement"
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? null)}
                    />
                  )}
                />
              </Form.Item>
            </div>
          </Card>

          <Card size="small" title="Balance limit and expiry">
            <div className="form-grid-2">
              <Form.Item
                label="Maximum balance"
                extra="A credit that would pass it is cut to fit. Leave empty for no limit."
                {...status("maxBalance")}
              >
                <Controller
                  name="maxBalance"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      className="w-full"
                      min={0}
                      precision={2}
                      addonBefore="₱"
                      placeholder="No limit"
                      formatter={pesoFormatter}
                      parser={pesoParser}
                      value={field.value}
                      onChange={(v) => field.onChange(v ?? null)}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item label="Unused balance">
                <Controller
                  name="expiry"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={UNIFORM_EXPIRY_OPTIONS} />
                  )}
                />
              </Form.Item>
              {values.expiry === "ResetAnnually" && (
                <Form.Item
                  label="Resets on the 1st of"
                  {...status("expiryMonth")}
                >
                  <Controller
                    name="expiryMonth"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={MONTH_OPTIONS}
                        placeholder="Pick a month"
                      />
                    )}
                  />
                </Form.Item>
              )}
              {values.expiry === "ExpireAfterMonths" && (
                <Form.Item
                  label="Each credit expires after"
                  extra="Releases use the oldest credits first."
                  {...status("expiryAfterMonths")}
                >
                  <Controller
                    name="expiryAfterMonths"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        className="w-full"
                        min={1}
                        max={120}
                        precision={0}
                        addonAfter="months"
                        value={field.value}
                        onChange={(v) => field.onChange(v ?? null)}
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>

          <Card size="small" title="Separation and rehire">
            <Text type="secondary" className="block mb-3 text-[13px]">
              Credits stop when an employee separates. Employees on leave or
              suspended are paused, not separated — their balance stays.
            </Text>
            <div className="form-grid-2">
              <Form.Item label="When an employee separates">
                <Controller
                  name="onSeparation"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={UNIFORM_SEPARATION_OPTIONS} />
                  )}
                />
              </Form.Item>
              <Form.Item label="When a former employee is rehired">
                <Controller
                  name="rehireRule"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={UNIFORM_REHIRE_OPTIONS} />
                  )}
                />
              </Form.Item>
              {values.rehireRule === "BridgeWithinDays" && (
                <Form.Item
                  label="Rehired within"
                  extra="Days between separating and coming back."
                  {...status("rehireBridgeDays")}
                >
                  <Controller
                    name="rehireBridgeDays"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        className="w-full"
                        min={1}
                        max={3650}
                        precision={0}
                        addonAfter="days"
                        value={field.value}
                        onChange={(v) => field.onChange(v ?? null)}
                      />
                    )}
                  />
                </Form.Item>
              )}
            </div>
          </Card>
        </>
      )}

      <Card size="small" title="Why the change">
        <Form.Item
          className="mb-0!"
          extra="Saved with this version and shown in its history."
          {...status("changeReason")}
        >
          <Controller
            name="changeReason"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={2}
                maxLength={500}
                placeholder="e.g. New client agreement signed Oct 2026"
              />
            )}
          />
        </Form.Item>
      </Card>

      <UniformAllowanceSummary policy={values} />

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        {canEdit && (
          <Button
            type="primary"
            loading={saving}
            onClick={handleSubmit(onSubmit)}
          >
            Save version
          </Button>
        )}
      </div>
    </Form>
  );
}
