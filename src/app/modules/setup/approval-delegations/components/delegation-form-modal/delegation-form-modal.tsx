import { useState } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { APPLICATION_TYPE_OPTIONS } from "@/app/modules/setup/approval-workflows/constants/label.const";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import {
  delegationFormSchema,
  type DelegationFormValues,
} from "../../models/delegation-form.schema";
import type { ApprovalDelegationRequest } from "../../models/approval-delegation.model";
import { useDelegateCandidates } from "../../hooks/use-approval-delegation-queries";

const DATE = "YYYY-MM-DD";

const filterOption = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

const EMPTY: DelegationFormValues = {
  delegatorEmployeeId: undefined,
  delegateEmployeeId: "",
  fromDate: undefined,
  toDate: undefined,
  applicationType: undefined,
  onlyWhileOnLeave: false,
  reason: undefined,
};

interface Props {
  open: boolean;
  /** "self": the signed-in person delegates their own; "admin": pick who is delegating. */
  mode: "self" | "admin";
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: ApprovalDelegationRequest) => Promise<unknown>;
}

// "While I'm away": who covers for me, for which requests, and when. Shared by the profile card
// (self) and the admin list (any person).
export function DelegationFormModal({
  open,
  mode,
  submitting,
  onCancel,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState("");
  const isAdmin = mode === "admin";

  // Employee Portal users can't load the whole employee list, so the self-service picker searches
  // the candidates endpoint; the admin screen already has the full list.
  const { data: candidates = [], isFetching } = useDelegateCandidates(
    search,
    open && !isAdmin,
  );
  const { data: employees = [] } = useEmployeeFilter();
  const delegateOptions = isAdmin
    ? employees.map((e) => ({ value: e.id, label: e.name ?? e.id }))
    : candidates.map((c) => ({ value: c.id, label: c.name }));

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<DelegationFormValues>({
    resolver: zodResolver(delegationFormSchema),
    defaultValues: EMPTY,
  });
  const fromDate = useWatch({ control, name: "fromDate" });
  const toDate = useWatch({ control, name: "toDate" });

  const close = () => {
    reset(EMPTY);
    setSearch("");
    onCancel();
  };

  const submit = handleSubmit(async (values) => {
    if (isAdmin && !values.delegatorEmployeeId) {
      setError("delegatorEmployeeId", { message: "Choose who is delegating" });
      return;
    }
    await onSubmit({
      delegatorEmployeeId: isAdmin ? values.delegatorEmployeeId : undefined,
      delegateEmployeeId: values.delegateEmployeeId,
      fromDate: values.fromDate || null,
      toDate: values.toDate || null,
      applicationType:
        (values.applicationType as ApprovalApplicationType) || null,
      onlyWhileOnLeave: values.onlyWhileOnLeave,
      reason: values.reason?.trim() || null,
    });
    close();
  });

  return (
    <Modal
      open={open}
      title="Delegate approvals"
      okText="Delegate"
      confirmLoading={submitting}
      onOk={submit}
      onCancel={close}
      destroyOnHidden
    >
      <Form layout="vertical">
        {isAdmin && (
          <Form.Item
            label="Who is delegating"
            validateStatus={errors.delegatorEmployeeId ? "error" : ""}
            help={errors.delegatorEmployeeId?.message}
          >
            <Controller
              name="delegatorEmployeeId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select the approver who is away"
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.name ?? e.id,
                  }))}
                  filterOption={filterOption}
                />
              )}
            />
          </Form.Item>
        )}

        <Form.Item
          label={isAdmin ? "Who approves instead" : "Who approves for me"}
          validateStatus={errors.delegateEmployeeId ? "error" : ""}
          help={
            errors.delegateEmployeeId?.message ??
            "They need a login. They can approve or decline the requests that would have come to you."
          }
        >
          <Controller
            name="delegateEmployeeId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder="Search by name or employee number"
                options={delegateOptions}
                filterOption={isAdmin ? filterOption : false}
                onSearch={isAdmin ? undefined : setSearch}
                loading={!isAdmin && isFetching}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Requests">
          <Controller
            name="applicationType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                allowClear
                placeholder="All requests"
                options={APPLICATION_TYPE_OPTIONS}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="When"
          validateStatus={errors.toDate ? "error" : ""}
          help={
            errors.toDate?.message ??
            "Leave empty to keep it on until you switch it off."
          }
        >
          <MobileRangePicker
            className="w-full"
            value={[
              fromDate ? dayjs(fromDate) : null,
              toDate ? dayjs(toDate) : null,
            ]}
            onChange={(dates) => {
              setValue("fromDate", dates?.[0]?.format(DATE));
              setValue("toDate", dates?.[1]?.format(DATE));
            }}
          />
        </Form.Item>

        <Form.Item
          label="Only while on approved leave"
          extra="Turns on by itself on the days you have an approved leave."
        >
          <Controller
            name="onlyWhileOnLeave"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} />
            )}
          />
        </Form.Item>

        <Form.Item label="Reason (optional)">
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                maxLength={500}
                placeholder="e.g. Annual leave"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
