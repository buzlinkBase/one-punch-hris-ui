import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getNotify } from "@/shared/utils/notify";
import { phNow, toPh } from "@/shared/utils/ph-time.util";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import {
  useDeleteUniformAllowancePolicy,
  useSaveUniformAllowancePolicy,
  useUniformAllowancePolicies,
  useUniformAllowancePreview,
} from "../../hooks/use-uniform-allowance-policy-queries";
import {
  earliestEffectiveFrom,
  toFormValues,
  toPayload,
} from "../../services/uniform-allowance-policy.mapper";
import {
  UNIFORM_ALLOWANCE_LABEL,
  UNIFORM_FREQUENCY_OPTIONS,
} from "../../constants/uniform-allowance.const";
import type { UniformAllowancePolicy } from "../../models/api/response/uniform-allowance-policy.model";
import type { UniformAllowancePolicyFormValues } from "../../models/forms/uniform-allowance-policy.schema";
import UniformAllowanceSummary from "../uniform-allowance-summary/uniform-allowance-summary";
import UniformAllowancePolicyForm from "./uniform-allowance-policy-form";

const { Text } = Typography;

const peso = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const date = (value: string) => dayjs(value).format("MMM D, YYYY");

/** What's open below the current rules: nothing, a new version, or a scheduled one being edited. */
type Editor =
  { mode: "new" } | { mode: "edit"; policy: UniformAllowancePolicy };

function shortRule(p: UniformAllowancePolicy): string {
  if (!p.isEnabled) return "Off";
  const frequency =
    UNIFORM_FREQUENCY_OPTIONS.find((o) => o.value === p.frequency)?.label ??
    p.frequency;
  const amount =
    p.amountMode === "PerPresentDay"
      ? `${peso(p.amount)} / present day`
      : p.amountMode === "ProratedByPresentDays"
        ? `up to ${peso(p.amount)}, prorated`
        : peso(p.amount);
  return `${amount} · ${frequency}`;
}

/**
 * Client Settings > Uniform Allowance: the rules in force (in plain language) with the next
 * credit dates, the version history, and scheduling a change -- always a new version from a
 * future day, so credits already decided keep the rules they were decided under.
 */
export default function UniformAllowancePolicyTab({
  clientId,
}: {
  clientId: string;
}) {
  const canEdit = useHasPermission("Workforce Setup:Edit");
  const { data, isLoading } = useUniformAllowancePolicies(clientId);
  const { data: preview = [] } = useUniformAllowancePreview(clientId);
  const { mutate: save, isPending: saving } =
    useSaveUniformAllowancePolicy(clientId);
  const { mutate: remove } = useDeleteUniformAllowancePolicy(clientId);
  const [editor, setEditor] = useState<Editor | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  const today = phNow().format("YYYY-MM-DD");
  const current =
    data.versions.find((v) => v.id === data.currentPolicyId) ??
    (data.currentPolicyId ? null : data.legacy);
  const earliest = earliestEffectiveFrom(data.lastProcessedCreditDate);

  const handleSubmit = (values: UniformAllowancePolicyFormValues) => {
    save(
      {
        policyId: editor?.mode === "edit" ? editor.policy.id : null,
        payload: toPayload(values),
      },
      {
        onSuccess: () => {
          getNotify().success({
            message: "Uniform allowance saved",
            description: `The new rules apply from ${date(values.effectiveFrom)}.`,
            placement: "topRight",
          });
          setEditor(null);
        },
      },
    );
  };

  const statusTag = (p: UniformAllowancePolicy) => {
    if (p.id === data.currentPolicyId) return <Tag color="green">In force</Tag>;
    if (p.effectiveFrom > today) return <Tag color="blue">Scheduled</Tag>;
    return <Tag>Replaced</Tag>;
  };

  // The original settings are part of the history until a version replaces them.
  const rows: UniformAllowancePolicy[] = [
    ...data.versions,
    ...(data.legacy ? [data.legacy] : []),
  ];

  return (
    <div className="flex flex-col gap-4 mt-2">
      <Card size="small" title={UNIFORM_ALLOWANCE_LABEL.RULES_TITLE}>
        {current ? (
          <>
            {current.isLegacy && (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message={UNIFORM_ALLOWANCE_LABEL.LEGACY_NOTE}
              />
            )}
            <UniformAllowanceSummary policy={current} />
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="This client doesn't give a uniform allowance."
          />
        )}

        {preview.length > 0 && (
          <div className="mt-4">
            <Text strong className="block mb-2">
              {UNIFORM_ALLOWANCE_LABEL.NEXT_CREDITS}
            </Text>
            <ul className="m-0 pl-0 list-none flex flex-col gap-1 text-[13px]">
              {preview.map((p) => (
                <li
                  key={p.creditDate}
                  className="flex flex-wrap gap-x-3 gap-y-0.5"
                >
                  <span className="font-medium w-28 shrink-0">
                    {date(p.creditDate)}
                  </span>
                  <span className="text-(--ant-color-text-secondary)">
                    for {date(p.periodStart)} – {date(p.periodEnd)}
                  </span>
                  <span>
                    {p.amount !== null ? peso(p.amount) : ""}
                    {p.condition
                      ? `${p.amount !== null ? ", " : ""}${p.condition}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {current?.frequency === "HireAnniversary" && (
          <Text type="secondary" className="block mt-3 text-[13px]">
            Credits post on each employee's own service anniversary — see an
            employee's schedule in the Uniform Allowance Ledger.
          </Text>
        )}
      </Card>

      {editor ? (
        <UniformAllowancePolicyForm
          key={editor.mode === "edit" ? (editor.policy.id ?? "edit") : "new"}
          initialValues={
            editor.mode === "edit"
              ? toFormValues(editor.policy, editor.policy.effectiveFrom, true)
              : toFormValues(current ?? null, earliest)
          }
          earliestStart={earliest}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onCancel={() => setEditor(null)}
        />
      ) : (
        canEdit && (
          <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setEditor({ mode: "new" })}
            >
              {UNIFORM_ALLOWANCE_LABEL.NEW_VERSION}
            </Button>
          </div>
        )
      )}

      <Card size="small" title={UNIFORM_ALLOWANCE_LABEL.HISTORY}>
        <Table<UniformAllowancePolicy>
          size="small"
          rowKey={(p) => p.id ?? "legacy"}
          pagination={false}
          scroll={{ x: true }}
          dataSource={rows}
          locale={{ emptyText: "No versions yet" }}
          expandable={{
            expandedRowRender: (p) => (
              <div className="flex flex-col gap-2">
                <UniformAllowanceSummary policy={p} />
                {p.isLocked && !p.isLegacy && (
                  <Text type="secondary" className="text-[13px]">
                    {UNIFORM_ALLOWANCE_LABEL.LOCKED_NOTE}
                  </Text>
                )}
              </div>
            ),
          }}
          columns={[
            {
              title: "Effective from",
              key: "effectiveFrom",
              render: (_, p) =>
                p.isLegacy ? "Original settings" : date(p.effectiveFrom),
            },
            {
              title: "Rule",
              key: "rule",
              render: (_, p) => shortRule(p),
            },
            {
              title: "Status",
              key: "status",
              render: (_, p) => statusTag(p),
            },
            {
              title: "Changed by",
              key: "by",
              render: (_, p) =>
                p.isLegacy ? (
                  "—"
                ) : (
                  <div className="text-[13px]">
                    <div>{p.createdByName || "—"}</div>
                    {p.createdAt && (
                      <Text type="secondary" className="text-xs">
                        {toPh(p.createdAt).format("MMM D, YYYY h:mm A")}
                      </Text>
                    )}
                  </div>
                ),
            },
            {
              title: "Reason",
              dataIndex: "changeReason",
              ellipsis: true,
            },
            {
              title: "",
              key: "actions",
              render: (_, p) =>
                canEdit && p.id && !p.isLocked && p.effectiveFrom >= today ? (
                  <Space size={4}>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => setEditor({ mode: "edit", policy: p })}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this scheduled change?"
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => remove(p.id!)}
                    >
                      <Button size="small" type="link" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : null,
            },
          ]}
        />
      </Card>
    </div>
  );
}
