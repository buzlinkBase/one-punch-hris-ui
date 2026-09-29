import { Button, Select, Segmented, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import type { AudienceRuleKind } from "@/shared/types/announcement.model";
import type {
  AnnouncementFormValues,
  AudienceRuleFormValues,
} from "../../models/forms/announcement-form.schema";
import { RULE_KIND_OPTIONS } from "../../constants/label.const";
import type { TargetOption } from "../../hooks/use-audience-target-options";

const { Text } = Typography;

const filterOption = (input: string, option?: { label?: string }) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

interface AudienceBuilderProps {
  control: Control<AnnouncementFormValues>;
  errors?: FieldErrors<AnnouncementFormValues>["audienceRules"];
  options: Record<AudienceRuleKind, TargetOption[]>;
  loading?: boolean;
  /** Locked once published -- recipients were snapshotted then. */
  disabled?: boolean;
}

const NEW_RULE: AudienceRuleFormValues = {
  kind: "Department",
  targetId: null,
  targetValue: null,
  targetLabel: "",
  isExclusion: false,
};

/**
 * Who an announcement goes to: include rules are combined (anyone matching any of them), then
 * exclude rules take people back out -- e.g. "Operations" + "Warehouse", except one person.
 */
export function AudienceBuilder({
  control,
  errors,
  options,
  loading,
  disabled,
}: AudienceBuilderProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "audienceRules",
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const rowError =
          errors?.[index]?.targetId?.message ??
          errors?.[index]?.targetValue?.message;
        return (
          <Controller
            key={field.id}
            control={control}
            name={`audienceRules.${index}`}
            render={({ field: { value, onChange } }) => {
              const targets = options[value.kind];
              const isStatus = value.kind === "EmploymentStatus";
              const target = isStatus ? value.targetValue : value.targetId;
              return (
                <div
                  className={`rounded-lg border p-3 ${value.isExclusion ? "border-(--ant-color-error-border) bg-(--ant-color-error-bg)" : "border-(--ant-color-border-secondary)"}`}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <Segmented
                      size="small"
                      disabled={disabled}
                      value={value.isExclusion ? "exclude" : "include"}
                      onChange={(v) =>
                        onChange({ ...value, isExclusion: v === "exclude" })
                      }
                      options={[
                        { value: "include", label: "Include" },
                        { value: "exclude", label: "Exclude" },
                      ]}
                    />
                    <Select
                      className="w-full md:w-48"
                      disabled={disabled}
                      value={value.kind}
                      options={RULE_KIND_OPTIONS}
                      onChange={(kind: AudienceRuleKind) =>
                        onChange({
                          ...value,
                          kind,
                          targetId: null,
                          targetValue: null,
                          targetLabel:
                            kind === "AllEmployees" ? "All employees" : "",
                        })
                      }
                    />
                    {value.kind !== "AllEmployees" && (
                      <Select
                        className="w-full md:flex-1"
                        disabled={disabled}
                        showSearch
                        loading={loading}
                        filterOption={filterOption}
                        placeholder="Choose…"
                        status={rowError ? "error" : undefined}
                        value={target ?? undefined}
                        options={targets}
                        onChange={(selected: string) => {
                          const label =
                            targets.find((o) => o.value === selected)?.label ??
                            "";
                          onChange({
                            ...value,
                            targetId: isStatus ? null : selected,
                            targetValue: isStatus ? selected : null,
                            targetLabel: label,
                          });
                        }}
                      />
                    )}
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={disabled || fields.length === 1}
                      onClick={() => remove(index)}
                      aria-label="Remove rule"
                    />
                  </div>
                  {rowError && (
                    <Text type="danger" className="mt-1 block text-xs">
                      {rowError}
                    </Text>
                  )}
                </div>
              );
            }}
          />
        );
      })}
      {!disabled && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => append(NEW_RULE)}
          className="self-start"
        >
          Add rule
        </Button>
      )}
    </div>
  );
}
