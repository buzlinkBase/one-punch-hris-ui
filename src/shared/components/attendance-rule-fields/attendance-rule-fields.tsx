import type { ReactNode } from "react";
import { Checkbox, ConfigProvider, Form, InputNumber, Select } from "antd";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  ATTENDANCE_BASIS_OPTIONS,
  DAY_TYPE_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/shared/constants/attendance-rule.const";

// The form fields both attendance-based forms (Other Income, Loans & Deductions) share. Each page
// passes its own control, which has these names among its others.
export interface AttendanceRuleFormValues {
  attendanceBasis: string;
  minHours: number | null;
  maxLateMinutes: number | null;
  maxUndertimeMinutes: number | null;
  // Bit values of the selected weekdays / day types.
  applicableDays: number[];
  dayTypes: number[];
  requireAllDays: boolean;
  minQualifyingDays: number | null;
  // Deductions only.
  onMiss?: string;
}

interface Props {
  control: Control<AttendanceRuleFormValues>;
  errors: FieldErrors<AttendanceRuleFormValues>;
  isPeriodic: boolean;
  requireAllDays: boolean;
  // Deductions: what happens to a day that doesn't qualify.
  onMissOptions?: { value: string; label: string }[];
}

const WEEKDAYS_ONLY = [1, 2, 4, 8, 16];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {title}
      </h4>
      {children}
    </section>
  );
}

interface ChipsProps {
  options: { value: number; label: string }[];
  value: number[];
  onChange: (value: number[]) => void;
}

// Multi-select as toggle chips: easier to scan and tap than a row of checkboxes.
function ToggleChips({ options, value, onChange }: ChipsProps) {
  const { componentDisabled: disabled } = ConfigProvider.useConfig();
  const toggle = (bit: number) =>
    onChange(
      value.includes(bit) ? value.filter((b) => b !== bit) : [...value, bit],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => toggle(option.value)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              on
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-gray-300 bg-transparent hover:border-teal-400"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AttendanceRuleFields({
  control,
  errors,
  isPeriodic,
  requireAllDays,
  onMissOptions,
}: Props) {
  return (
    <div>
      <Section title="Who qualifies">
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            label="Counts as present when the employee"
            validateStatus={errors.attendanceBasis ? "error" : ""}
            help={errors.attendanceBasis?.message}
            required
          >
            <Controller
              name="attendanceBasis"
              control={control}
              render={({ field }) => (
                <Select {...field} options={ATTENDANCE_BASIS_OPTIONS} />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Minimum hours worked"
            validateStatus={errors.minHours ? "error" : ""}
            help={errors.minHours?.message}
          >
            <Controller
              name="minHours"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  max={24}
                  step={0.5}
                  className="w-full!"
                  addonAfter="hrs"
                  placeholder="No minimum"
                />
              )}
            />
          </Form.Item>
        </div>
      </Section>

      <Section title="When it applies">
        <Form.Item
          label={
            <span className="flex items-center gap-3">
              Days of the week
              <Controller
                name="applicableDays"
                control={control}
                render={({ field }) => (
                  <span className="flex gap-2 text-xs font-normal">
                    <button
                      type="button"
                      className="cursor-pointer text-teal-700 hover:underline"
                      onClick={() => field.onChange(WEEKDAYS_ONLY)}
                    >
                      Weekdays only
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer text-teal-700 hover:underline"
                      onClick={() =>
                        field.onChange(WEEKDAY_OPTIONS.map((o) => o.value))
                      }
                    >
                      Select all
                    </button>
                  </span>
                )}
              />
            </span>
          }
          validateStatus={errors.applicableDays ? "error" : ""}
          help={errors.applicableDays?.message}
          required
        >
          <Controller
            name="applicableDays"
            control={control}
            render={({ field }) => (
              <ToggleChips
                options={WEEKDAY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Kinds of day"
          validateStatus={errors.dayTypes ? "error" : ""}
          help={errors.dayTypes?.message}
          required
        >
          <Controller
            name="dayTypes"
            control={control}
            render={({ field }) => (
              <ToggleChips
                options={DAY_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Form.Item>
      </Section>

      <Section title="How strict">
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item label="Late allowed">
            <Controller
              name="maxLateMinutes"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  precision={0}
                  className="w-full!"
                  addonAfter="min"
                  placeholder="No limit"
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Undertime allowed">
            <Controller
              name="maxUndertimeMinutes"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  precision={0}
                  className="w-full!"
                  addonAfter="min"
                  placeholder="No limit"
                />
              )}
            />
          </Form.Item>
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          Leave blank for no limit. Enter 0 to allow none.
        </p>
      </Section>

      {isPeriodic && (
        <Section title="For the whole period">
          <div className="grid grid-cols-1 items-start gap-x-4 md:grid-cols-2">
            <Controller
              name="requireAllDays"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Every applicable day must qualify
                </Checkbox>
              )}
            />
            {!requireAllDays && (
              <Form.Item
                label="Minimum qualifying days"
                validateStatus={errors.minQualifyingDays ? "error" : ""}
                help={errors.minQualifyingDays?.message}
                required
              >
                <Controller
                  name="minQualifyingDays"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={1}
                      precision={0}
                      className="w-full!"
                      addonAfter="days"
                    />
                  )}
                />
              </Form.Item>
            )}
          </div>
        </Section>
      )}

      {onMissOptions && (
        <Section title="When a day doesn't qualify">
          <Controller
            name="onMiss"
            control={control}
            render={({ field }) => (
              <div
                role="radiogroup"
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                {onMissOptions.map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(option.value)}
                      className={`cursor-pointer rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none ${
                        selected
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950"
                          : "border-gray-200 hover:border-teal-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Section>
      )}
    </div>
  );
}
