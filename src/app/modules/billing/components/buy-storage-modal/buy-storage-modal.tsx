import { useEffect, useState } from "react";
import { Alert, Button, Descriptions, InputNumber, Modal, Select } from "antd";
import {
  useQuoteStorage,
  useStartStorageCheckout,
} from "../../hooks/use-subscription-queries";
import { BILLING_LABEL, STORAGE_LABEL } from "../../constants/label.const";
import type { StorageSummaryResponse } from "../../models/api/response/storage-response.model";
import { formatManilaDate, formatMoney } from "../../utils/format";
import {
  blockPrice,
  describeBlocks,
  formatStorage,
  perCycle,
} from "../../utils/storage";

const MAX_BLOCKS = 100;

interface BuyStorageModalProps {
  open: boolean;
  onClose: () => void;
  summary: StorageSummaryResponse;
  /** Whether the server can open the payment gateway's page (BillingView.onlinePaymentEnabled). */
  onlinePaymentEnabled: boolean;
}

/**
 * Add storage blocks: pick the block and how many, see the prorated charge for the rest of the
 * billing period and the new recurring total, then pay. The capacity is added the moment the
 * payment is confirmed -- no sign-out needed.
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
  const quote = useQuoteStorage();
  const checkout = useStartStorageCheckout();
  const { mutate: requestQuote, reset: resetQuote } = quote;

  const offering = summary.offerings.find((o) => o.code === offeringCode);

  // Reprice whenever the block or the quantity changes while the dialog is open.
  useEffect(() => {
    if (!open || !offeringCode || blocks < 1) {
      resetQuote();
      return;
    }
    requestQuote({ offeringCode, blocks });
  }, [open, offeringCode, blocks, requestQuote, resetQuote]);

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
        <Button
          key="pay"
          type="primary"
          disabled={!canPay}
          loading={checkout.isPending || checkout.isSuccess}
          onClick={() =>
            offeringCode && checkout.mutate({ offeringCode, blocks })
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
                  label: `${o.name} -- ${formatMoney(blockPrice(o, summary.billingCycle), o.currency)} ${perCycle(summary.billingCycle)}`,
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

          {offering && (
            <p className="m-0 text-sm text-(--ant-color-text-secondary)">
              {describeBlocks(blocks, offering.blockMb)}:{" "}
              {formatMoney(
                blockPrice(offering, summary.billingCycle) * blocks,
                offering.currency,
              )}{" "}
              {perCycle(summary.billingCycle)}
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
              <Descriptions.Item label={STORAGE_LABEL.BUY_PRORATED}>
                <span className="font-semibold">
                  {formatMoney(data.amountDue, data.currency)}
                </span>
                <div className="text-xs text-(--ant-color-text-secondary)">
                  {data.daysRemaining}{" "}
                  {data.daysRemaining === 1 ? "day" : "days"} left in this
                  period, ending {formatManilaDate(data.periodEndUtc)}.
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
              {STORAGE_LABEL.BUY_PRORATED_HINT}{" "}
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
