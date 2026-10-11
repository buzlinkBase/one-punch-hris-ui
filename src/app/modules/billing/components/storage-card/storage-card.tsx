import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  InputNumber,
  Modal,
  Progress,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { BILLING_LABEL, STORAGE_LABEL } from "../../constants/label.const";
import {
  useRequestStorageReduction,
  useStorage,
  useWithdrawStorageReduction,
} from "../../hooks/use-subscription-queries";
import type {
  StorageAddOnResponse,
  StorageSummaryResponse,
} from "../../models/api/response/storage-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";
import {
  STORAGE_LEVEL_COLOR,
  describeBlocks,
  exceedsLimit,
  formatStorage,
  gaugePercent,
  cycleBreakdown,
  limitAfterReduction,
  perCycle,
  storageHeadline,
} from "../../utils/storage";
import { BuyStorageModal } from "../buy-storage-modal";

interface StorageCardProps {
  /** Owner or billing admin: may buy and reduce blocks. */
  canManage: boolean;
  onlinePaymentEnabled: boolean;
}

/**
 * The account's storage on the Billing page -- one pool shared by all its companies: a colour-coded
 * gauge of used against the total limit, the plan's own capacity, each block held (with what it costs
 * per billing cycle and when it renews), and the bill that results -- plan plus storage add-ons.
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

  if (isLoading || !summary) {
    return (
      <Card title={STORAGE_LABEL.TITLE}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  const bill = cycleBreakdown(summary);
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
        canBuy && (
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
        )
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

      {canManage && !summary.canPurchase && summary.offerings.length > 0 && (
        <Alert
          className="mt-2"
          type="info"
          showIcon
          message={STORAGE_LABEL.BUY_UNAVAILABLE}
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

      <div className="mt-4 text-sm">
        <span className="font-medium">{STORAGE_LABEL.BILLING_SUMMARY}: </span>
        {STORAGE_LABEL.PLAN_LINE} {formatMoney(bill.plan, summary.currency)} +{" "}
        {STORAGE_LABEL.ADD_ONS_LINE}{" "}
        {formatMoney(bill.addOns, summary.currency)} ={" "}
        {STORAGE_LABEL.TOTAL_LINE}{" "}
        <span className="font-semibold">
          {formatMoney(bill.total, summary.currency)}{" "}
          {perCycle(summary.billingCycle)}
        </span>
      </div>

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
