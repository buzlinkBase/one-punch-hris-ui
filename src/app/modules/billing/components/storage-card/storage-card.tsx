import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import {
  ClearOutlined,
  CreditCardOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { BILLING_LABEL, STORAGE_LABEL } from "../../constants/label.const";
import {
  useChangeStorageCycle,
  useRequestStorageReduction,
  useStartStorageRenewalCheckout,
  useStorage,
  useWithdrawStorageCycleChange,
  useWithdrawStorageReduction,
} from "../../hooks/use-subscription-queries";
import { STORAGE_PERMISSION } from "../../hooks/use-subscription-state";
import type {
  StorageAddOnResponse,
  StorageSummaryResponse,
} from "../../models/api/response/storage-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";
import {
  STORAGE_LEVEL_COLOR,
  cycleWord,
  describeBlocks,
  exceedsLimit,
  formatStorage,
  gaugePercent,
  limitAfterReduction,
  otherCycle,
  perCycle,
  storageHeadline,
  storageStanding,
} from "../../utils/storage";
import { BuyStorageModal } from "../buy-storage-modal";
import { AutoRenewPayButton } from "../auto-renew-pay-button";
import { AutoRenewStatus } from "../auto-renew-status";
import { isCharging } from "../../utils/auto-renew";

interface StorageCardProps {
  /** Owner or billing admin: may buy and reduce blocks. */
  canManage: boolean;
  onlinePaymentEnabled: boolean;
}

/**
 * The account's storage on the Billing page -- one pool shared by all its companies: a colour-coded
 * gauge of used against the total limit, the plan's own capacity, each block held (with what it costs
 * per storage cycle and when it renews), and storage's own bill -- its cycle, due date and renewal,
 * independent of the plan's.
 */
export function StorageCard({
  canManage,
  onlinePaymentEnabled,
}: StorageCardProps) {
  const { data: summary, isLoading } = useStorage();
  const { token } = theme.useToken();
  const [buying, setBuying] = useState(false);
  const [reducing, setReducing] = useState<StorageAddOnResponse | null>(null);
  const withdraw = useWithdrawStorageReduction();
  const navigate = useNavigate();
  const canFreeUp = useHasPermission(
    STORAGE_PERMISSION.VIEW,
    STORAGE_PERMISSION.MANAGE,
  );

  if (isLoading || !summary) {
    return (
      <Card title={STORAGE_LABEL.TITLE}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  const canBuy = canManage && summary.offerings.length > 0;

  const columns: ColumnsType<StorageAddOnResponse> = [
    {
      title: STORAGE_LABEL.ADD_ONS,
      key: "block",
      render: (_, row) => (
        <div>
          <div>{describeBlocks(row.blocks, row.blockMb)}</div>
          {row.isComplimentary && (
            <Tag color="purple">{STORAGE_LABEL.FREE_GRANT}</Tag>
          )}
          {row.pendingBlocks !== null && (
            <div className="text-xs text-(--ant-color-warning)">
              {STORAGE_LABEL.REDUCE_PENDING.replace(
                "{blocks}",
                String(row.pendingBlocks),
              ).replace("{date}", formatManilaDate(row.pendingEffectiveAtUtc))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: STORAGE_LABEL.UNIT_COST,
      key: "unit",
      align: "right",
      render: (_, row) =>
        row.isComplimentary
          ? BILLING_LABEL.UNKNOWN
          : `${formatMoney(row.unitPrice, summary.currency)} ${perCycle(summary.billingCycle)}`,
    },
    {
      title:
        summary.billingCycle === "Annual"
          ? STORAGE_LABEL.CYCLE_TOTAL_ANNUAL
          : STORAGE_LABEL.CYCLE_TOTAL_MONTHLY,
      key: "cycleTotal",
      align: "right",
      render: (_, row) =>
        row.isComplimentary
          ? BILLING_LABEL.UNKNOWN
          : formatMoney(row.cycleTotal, summary.currency),
    },
    {
      title: "Renews",
      key: "renews",
      render: (_, row) => formatManilaDate(row.renewsAtUtc),
    },
    ...(canManage
      ? [
          {
            title: "",
            key: "actions",
            render: (_: unknown, row: StorageAddOnResponse) =>
              row.isComplimentary ? null : row.pendingBlocks !== null ? (
                <Button
                  size="small"
                  loading={withdraw.isPending && withdraw.variables === row.id}
                  onClick={() => withdraw.mutate(row.id)}
                >
                  {STORAGE_LABEL.WITHDRAW_REDUCTION}
                </Button>
              ) : (
                <Tooltip
                  title={`${STORAGE_LABEL.REDUCE_TIP} From ${formatManilaDate(row.renewsAtUtc)}, each block removed lowers what you pay by ${formatMoney(row.unitPrice, summary.currency)} ${perCycle(summary.billingCycle)}.`}
                >
                  <Button size="small" onClick={() => setReducing(row)}>
                    {STORAGE_LABEL.REDUCE}
                  </Button>
                </Tooltip>
              ),
          },
        ]
      : []),
  ];

  return (
    <Card
      title={STORAGE_LABEL.TITLE}
      extra={
        <div className="flex flex-wrap justify-end gap-2">
          {canFreeUp && (
            <Button
              size="large"
              icon={<ClearOutlined />}
              onClick={() => navigate({ to: "/billing/storage" })}
            >
              {STORAGE_LABEL.FREE_UP}
            </Button>
          )}
          {canBuy && (
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              className="shadow-md!"
              disabled={!summary.canPurchase}
              onClick={() => setBuying(true)}
            >
              {summary.level === "Normal"
                ? STORAGE_LABEL.BUY
                : STORAGE_LABEL.UPGRADE}
            </Button>
          )}
        </div>
      }
    >
      <p className="mt-0 text-sm text-(--ant-color-text-secondary)">
        {STORAGE_LABEL.SUBTITLE}
      </p>

      <div className="mb-1 font-medium">{storageHeadline(summary)}</div>
      {summary.usedMb !== null && summary.limitMb !== null ? (
        <Progress
          percent={gaugePercent(summary.percentUsed)}
          strokeColor={token[STORAGE_LEVEL_COLOR[summary.level]]}
          format={() => `${summary.percentUsed ?? 0}%`}
        />
      ) : (
        <p className="text-sm text-(--ant-color-text-secondary)">
          {summary.usedMb === null
            ? STORAGE_LABEL.UNKNOWN_USAGE
            : BILLING_LABEL.UNLIMITED}
        </p>
      )}

      <StorageBillingAlert
        summary={summary}
        canManage={canManage}
        onlinePaymentEnabled={onlinePaymentEnabled}
      />

      {canManage &&
        !summary.canPurchase &&
        summary.offerings.length > 0 &&
        !summary.renewalDue && (
          <Alert
            className="mt-2"
            type="info"
            showIcon
            message={
              summary.purchaseBlockedReason ?? STORAGE_LABEL.BUY_UNAVAILABLE
            }
          />
        )}

      <Descriptions column={{ xs: 1, sm: 3 }} size="small" className="mt-4">
        <Descriptions.Item label={STORAGE_LABEL.BASE_PLAN}>
          {formatStorage(summary.baseMb)} ({summary.planName})
        </Descriptions.Item>
        <Descriptions.Item label={STORAGE_LABEL.ADD_ONS}>
          {formatStorage(summary.addOnMb)}
        </Descriptions.Item>
        <Descriptions.Item label={STORAGE_LABEL.TOTAL}>
          {formatStorage(summary.limitMb)}
        </Descriptions.Item>
      </Descriptions>

      {summary.overProjectedLimit && (
        <Alert
          className="mb-3"
          type="warning"
          showIcon
          message={STORAGE_LABEL.REDUCE_OVER_LIMIT}
        />
      )}

      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={summary.addOns}
        locale={{ emptyText: STORAGE_LABEL.NO_ADD_ONS }}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      {summary.companies.length > 1 && (
        <div className="mt-4">
          <div className="mb-1 text-sm font-medium">
            {STORAGE_LABEL.BY_COMPANY}
          </div>
          <ul className="m-0 list-none p-0 text-sm">
            {summary.companies.map((company) => (
              <li
                key={company.tenantId}
                className="flex justify-between gap-2 py-0.5"
              >
                <span>{company.companyName}</span>
                <span className="text-(--ant-color-text-secondary)">
                  {company.usedMb === null
                    ? BILLING_LABEL.UNKNOWN
                    : formatStorage(company.usedMb)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.addOnsTotal > 0 && summary.periodEndUtc && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span>
            <span className="font-medium">
              {STORAGE_LABEL.BILLING_SUMMARY}:{" "}
            </span>
            <span className="font-semibold">
              {formatMoney(summary.addOnsTotal, summary.currency)}{" "}
              {perCycle(summary.billingCycle)}
            </span>
            {summary.status === "Active" &&
              !summary.cancelAtPeriodEnd &&
              `, renews on ${formatManilaDate(summary.periodEndUtc)}`}
          </span>
          {canManage && <StorageCycleSwitch summary={summary} />}
        </div>
      )}

      <BuyStorageModal
        open={buying}
        onClose={() => setBuying(false)}
        summary={summary}
        onlinePaymentEnabled={onlinePaymentEnabled}
      />
      <ReduceStorageModal
        key={reducing?.id ?? "none"}
        addOn={reducing}
        summary={summary}
        onClose={() => setReducing(null)}
      />
    </Card>
  );
}

interface StorageBillingAlertProps {
  summary: StorageSummaryResponse;
  canManage: boolean;
  onlinePaymentEnabled: boolean;
}

/**
 * Storage's own billing standing -- paid until, ending, past due or lapsed -- and, when a storage
 * renewal is due, what it costs and a Pay storage button. Separate from the plan's payment alert.
 */
function StorageBillingAlert({
  summary,
  canManage,
  onlinePaymentEnabled,
}: StorageBillingAlertProps) {
  const pay = useStartStorageRenewalCheckout();
  const standing = storageStanding(summary);
  const due = summary.renewalDue;
  const autoRenew = summary.autoRenew;

  // Auto renew pays storage by itself: show that (and Turn off) instead of asking for a payment.
  if (autoRenew && (isCharging(autoRenew) || !due)) {
    return (
      <AutoRenewStatus
        className="mt-3"
        autoRenew={autoRenew}
        canManage={canManage}
      />
    );
  }
  if (!standing && !due) return null;

  const dueLine = due
    ? STORAGE_LABEL.RENEWAL_DUE.replace(
        "{amount}",
        formatMoney(due.amount, due.currency),
      )
        .replace("{cycle}", cycleWord(due.billingCycle))
        .replace("{date}", formatManilaDate(due.periodEndUtc))
    : null;

  return (
    <Alert
      className="mt-3"
      type={standing?.type ?? "info"}
      showIcon
      message={standing?.message ?? dueLine}
      description={
        due && canManage ? (
          <div className="flex flex-col items-start gap-2">
            {standing && <span>{dueLine}</span>}
            {onlinePaymentEnabled ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  loading={pay.isPending || pay.isSuccess}
                  onClick={() => pay.mutate()}
                >
                  {STORAGE_LABEL.PAY_RENEWAL}{" "}
                  {formatMoney(due.amount, due.currency)}
                </Button>
                <AutoRenewPayButton
                  start={{ target: "Storage" }}
                  amount={due.amount}
                  currency={due.currency}
                  cycle={due.billingCycle}
                />
              </div>
            ) : (
              <span>{STORAGE_LABEL.PAY_RENEWAL_UNAVAILABLE}</span>
            )}
          </div>
        ) : standing && dueLine ? (
          dueLine
        ) : undefined
      }
    />
  );
}

/** Switch storage between monthly and annual billing from its next renewal, or keep the current cycle. */
function StorageCycleSwitch({ summary }: { summary: StorageSummaryResponse }) {
  const change = useChangeStorageCycle();
  const withdraw = useWithdrawStorageCycleChange();
  if (summary.status !== "Active" || summary.cancelAtPeriodEnd) return null;

  const renewsOn = formatManilaDate(summary.periodEndUtc);
  if (summary.pendingBillingCycle) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-(--ant-color-warning)">
          {STORAGE_LABEL.CYCLE_PENDING.replace(
            "{cycle}",
            cycleWord(summary.pendingBillingCycle),
          ).replace("{date}", renewsOn)}
        </span>
        <Button
          size="small"
          loading={withdraw.isPending}
          onClick={() => withdraw.mutate()}
        >
          {STORAGE_LABEL.CYCLE_KEEP.replace(
            "{cycle}",
            cycleWord(summary.billingCycle),
          )}
        </Button>
      </span>
    );
  }

  const next = otherCycle(summary.billingCycle);
  return (
    <Popconfirm
      title={STORAGE_LABEL.CYCLE_SWITCH.replace("{cycle}", cycleWord(next))}
      description={STORAGE_LABEL.CYCLE_SWITCH_CONFIRM.replace(
        "{date}",
        renewsOn,
      ).replace("{cycle}", cycleWord(next))}
      onConfirm={() => change.mutate({ billingCycle: next })}
    >
      <Button size="small" loading={change.isPending}>
        {STORAGE_LABEL.CYCLE_SWITCH.replace("{cycle}", cycleWord(next))}
      </Button>
    </Popconfirm>
  );
}

interface ReduceStorageModalProps {
  addOn: StorageAddOnResponse | null;
  summary: StorageSummaryResponse;
  onClose: () => void;
}

/** Hold fewer blocks (or none) from the end of the paid period; warns when usage wouldn't fit. */
function ReduceStorageModal({
  addOn,
  summary,
  onClose,
}: ReduceStorageModalProps) {
  const [blocks, setBlocks] = useState((addOn?.blocks ?? 1) - 1);
  const reduce = useRequestStorageReduction();

  if (!addOn) return null;

  const limitAfter = limitAfterReduction(summary.limitMb, addOn, blocks);
  const tooSmall = exceedsLimit(summary.usedMb, limitAfter);

  const submit = () =>
    reduce.mutate({ addOnId: addOn.id, blocks }, { onSuccess: onClose });

  return (
    <Modal
      open
      title={STORAGE_LABEL.REDUCE_TITLE}
      onCancel={onClose}
      onOk={submit}
      okText={STORAGE_LABEL.REDUCE}
      confirmLoading={reduce.isPending}
    >
      <p className="mt-0">{STORAGE_LABEL.REDUCE_HINT}</p>
      <label className="flex flex-col gap-1">
        <span className="text-sm">
          {describeBlocks(addOn.blocks, addOn.blockMb)} now. Keep:
        </span>
        <InputNumber
          min={0}
          max={addOn.blocks - 1}
          precision={0}
          value={blocks}
          onChange={(value) => setBlocks(value ?? 0)}
        />
      </label>
      <p className="mb-0 mt-3 text-sm">
        Storage after {formatManilaDate(addOn.renewsAtUtc)}:{" "}
        <span className="font-semibold">{formatStorage(limitAfter)}</span>
      </p>
      {tooSmall && (
        <Alert
          className="mt-3"
          type="warning"
          showIcon
          message={STORAGE_LABEL.REDUCE_OVER_LIMIT}
        />
      )}
    </Modal>
  );
}
