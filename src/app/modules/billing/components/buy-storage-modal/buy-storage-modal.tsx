import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  InputNumber,
  Modal,
  Segmented,
  Select,
} from "antd";
import {
  useQuoteStorage,
  useStartStorageCheckout,
} from "../../hooks/use-subscription-queries";
import { BILLING_LABEL, STORAGE_LABEL } from "../../constants/label.const";
import { AutoRenewPayButton } from "../auto-renew-pay-button";
import type { StorageSummaryResponse } from "../../models/api/response/storage-response.model";
import type { BillingCycle } from "../../models/api/response/subscription-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";
import { cycleLabel } from "../../utils/payment";
import {
  blockPrice,
  describeBlocks,
  formatStorage,
  perCycle,
} from "../../utils/storage";

const MAX_BLOCKS = 100;

const CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "Monthly", label: cycleLabel("Monthly") },
  { value: "Annual", label: cycleLabel("Annual") },
];

interface BuyStorageModalProps {
  open: boolean;
  onClose: () => void;
  summary: StorageSummaryResponse;
  /** Whether the server can open the payment gateway's page (BillingView.onlinePaymentEnabled). */
  onlinePaymentEnabled: boolean;
}

/**
 * Add storage blocks: pick the block and how many, see what's due today and the new recurring storage
 * total, then pay. Storage is billed apart from the plan: the first purchase starts storage's own
 * period on the cycle chosen here; later ones are prorated to its due date. The capacity is added
 * the moment the payment is confirmed -- no sign-out needed.
 */
export function BuyStorageModal({
  open,
  onClose,
  summary,
  onlinePaymentEnabled,
}: BuyStorageModalProps) {
  const [offeringCode, setOfferingCode] = useState<string | undefined>(
    summary.offerings[0]?.code,
  );
  const [blocks, setBlocks] = useState(1);
  // No running storage period: this purchase starts one, on a cycle of the owner's choosing.
  const startsNewPeriod =
    summary.status === null || summary.status === "Lapsed";
  const [chosenCycle, setChosenCycle] = useState<BillingCycle>(
    summary.billingCycle,
  );
  const cycle = startsNewPeriod ? chosenCycle : summary.billingCycle;
  const quote = useQuoteStorage();
  const checkout = useStartStorageCheckout();
  const { mutate: requestQuote, reset: resetQuote } = quote;

  const offering = summary.offerings.find((o) => o.code === offeringCode);

  // Reprice whenever the block, the quantity or the cycle changes while the dialog is open.
  useEffect(() => {
    if (!open || !offeringCode || blocks < 1) {
      resetQuote();
      return;
    }
    requestQuote({
      offeringCode,
      blocks,
      billingCycle: startsNewPeriod ? cycle : undefined,
    });
  }, [
    open,
    offeringCode,
    blocks,
    cycle,
    startsNewPeriod,
    requestQuote,
    resetQuote,
  ]);

  const data = quote.data;
  const canPay = onlinePaymentEnabled && !!data && data.amountDue > 0;

  return (
    <Modal
      open={open}
      title={STORAGE_LABEL.BUY_TITLE}
      onCancel={onClose}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        // Only a purchase that starts the storage period can start auto renew: one prorated into a running
        // period is renewed with the rest at the next storage renewal.
        ...(canPay && data?.startsNewPeriod && offeringCode
          ? [
              <AutoRenewPayButton
                key="auto"
                start={{
                  target: "Storage",
                  offeringCode,
                  blocks,
                  billingCycle: cycle,
                }}
                amount={data.amountDue}
                currency={data.currency}
                cycle={data.billingCycle}
              />,
            ]
          : []),
        <Button
          key="pay"
          type="primary"
          disabled={!canPay}
          loading={checkout.isPending || checkout.isSuccess}
          onClick={() =>
            offeringCode &&
            checkout.mutate({
              offeringCode,
              blocks,
              billingCycle: startsNewPeriod ? cycle : undefined,
            })
          }
        >
          {STORAGE_LABEL.BUY_CONFIRM}
          {data ? ` ${formatMoney(data.amountDue, data.currency)}` : ""}
        </Button>,
      ]}
    >
      {summary.offerings.length === 0 ? (
        <Alert type="info" showIcon message={STORAGE_LABEL.NO_OFFERINGS} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex min-w-48 flex-1 flex-col gap-1">
              <span className="text-sm">{STORAGE_LABEL.BUY_BLOCK}</span>
              <Select
                value={offeringCode}
                onChange={setOfferingCode}
                options={summary.offerings.map((o) => ({
                  value: o.code,
                  label: `${o.name} -- ${formatMoney(blockPrice(o, cycle), o.currency)} ${perCycle(cycle)}`,
                }))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">{STORAGE_LABEL.BUY_QUANTITY}</span>
              <InputNumber
                min={1}
                max={MAX_BLOCKS}
                precision={0}
                value={blocks}
                onChange={(value) => setBlocks(value ?? 1)}
              />
            </label>
          </div>

          {startsNewPeriod && (
            <div className="flex flex-col gap-1">
              <span className="text-sm">{STORAGE_LABEL.BUY_CYCLE}</span>
              <Segmented<BillingCycle>
                value={chosenCycle}
                onChange={setChosenCycle}
                options={CYCLE_OPTIONS}
              />
            </div>
          )}

          {offering && (
            <p className="m-0 text-sm text-(--ant-color-text-secondary)">
              {describeBlocks(blocks, offering.blockMb)}:{" "}
              {formatMoney(
                blockPrice(offering, cycle) * blocks,
                offering.currency,
              )}{" "}
              {perCycle(cycle)}
            </p>
          )}

          {quote.isError && (
            <Alert
              type="error"
              showIcon
              message={
                quote.error instanceof Error
                  ? quote.error.message
                  : STORAGE_LABEL.BUY_UNAVAILABLE
              }
            />
          )}

          {data && (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item
                label={
                  data.startsNewPeriod
                    ? STORAGE_LABEL.BUY_FULL_PERIOD
                    : STORAGE_LABEL.BUY_PRORATED
                }
              >
                <span className="font-semibold">
                  {formatMoney(data.amountDue, data.currency)}
                </span>
                <div className="text-xs text-(--ant-color-text-secondary)">
                  {data.startsNewPeriod
                    ? `Storage renews on ${formatManilaDate(data.periodEndUtc)}.`
                    : `${data.daysRemaining} ${data.daysRemaining === 1 ? "day" : "days"} left until your storage renews on ${formatManilaDate(data.periodEndUtc)}.`}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={STORAGE_LABEL.BUY_NEW_RECURRING}>
                {formatMoney(data.newAddOnsTotal, data.currency)}{" "}
                {perCycle(data.billingCycle)}
              </Descriptions.Item>
              <Descriptions.Item label={STORAGE_LABEL.BUY_NEW_LIMIT}>
                {data.newLimitMb < 0
                  ? BILLING_LABEL.UNLIMITED
                  : formatStorage(data.newLimitMb)}
              </Descriptions.Item>
            </Descriptions>
          )}

          {data && (
            <p className="m-0 text-xs text-(--ant-color-text-secondary)">
              {data.startsNewPeriod
                ? STORAGE_LABEL.BUY_FULL_PERIOD_HINT
                : STORAGE_LABEL.BUY_PRORATED_HINT}{" "}
              {data.pricesIncludeVat
                ? BILLING_LABEL.VAT_INCLUSIVE
                : BILLING_LABEL.VAT_EXCLUSIVE}
            </p>
          )}

          {!onlinePaymentEnabled && (
            <Alert
              type="warning"
              showIcon
              message="Online payment isn't available yet. Please contact billing to add storage."
            />
          )}
        </div>
      )}
    </Modal>
  );
}
