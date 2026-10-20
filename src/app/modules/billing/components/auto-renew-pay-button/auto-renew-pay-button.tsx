import { useState } from "react";
import { Alert, Button, Form, Input, Modal, Radio } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { AUTO_RENEW_LABEL } from "../../constants/label.const";
import { usePayWithAutoRenew } from "../../hooks/use-subscription-queries";
import type {
  AutoRenewPaymentMethod,
  StartAutoRenewRequest,
} from "../../models/api/request/auto-renew-request.model";
import type { BillingCycle } from "../../models/api/response/subscription-response.model";
import { formatMoney } from "../../utils/format";
import { formatCardNumber, parseExpiry } from "../../utils/auto-renew";

interface AutoRenewPayButtonProps {
  /** What paying now covers -- the plan's due, storage's renewal, or a first storage purchase. */
  start: StartAutoRenewRequest;
  /** What the server will charge now (the due, renewal or quote shown next to the button). */
  amount: number;
  currency: string;
  /** The cycle it then renews on. */
  cycle: BillingCycle;
  disabled?: boolean;
}

interface CardFormValues {
  name: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

/**
 * "Pay and renew automatically": pays what's due now by card or Maya, which saves it at PayMongo, so
 * every next period is charged automatically. Card details are tokenized by PayMongo in the browser --
 * they never reach our servers.
 */
export function AutoRenewPayButton({
  start,
  amount,
  currency,
  cycle,
  disabled,
}: AutoRenewPayButtonProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<AutoRenewPaymentMethod>("card");
  const [form] = Form.useForm<CardFormValues>();
  const pay = usePayWithAutoRenew();

  const submit = async () => {
    if (method === "maya") {
      pay.mutate({ start, method });
      return;
    }
    const values = await form.validateFields();
    const expiry = parseExpiry(values.expiry);
    if (!expiry) {
      form.setFields([
        { name: "expiry", errors: [AUTO_RENEW_LABEL.INVALID_CARD] },
      ]);
      return;
    }
    pay.mutate({
      start,
      method,
      card: {
        name: values.name.trim(),
        cardNumber: values.cardNumber,
        expMonth: expiry.month,
        expYear: expiry.year,
        cvc: values.cvc.trim(),
      },
    });
  };

  const busy = pay.isPending || pay.isSuccess;

  return (
    <>
      <Button
        icon={<SyncOutlined />}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {AUTO_RENEW_LABEL.PAY_BUTTON}
      </Button>
      <Modal
        open={open}
        title={AUTO_RENEW_LABEL.MODAL_TITLE}
        onCancel={() => setOpen(false)}
        okText={AUTO_RENEW_LABEL.CONFIRM.replace(
          "{amount}",
          formatMoney(amount, currency),
        )}
        onOk={submit}
        confirmLoading={busy}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4">
          <p className="m-0">
            {AUTO_RENEW_LABEL.INTRO.replace(
              "{amount}",
              formatMoney(amount, currency),
            ).replace("{cycle}", cycle === "Annual" ? "year" : "month")}
            {start.target === "Storage" &&
              ` ${AUTO_RENEW_LABEL.INTRO_STORAGE_NOTE}`}
          </p>

          <div className="flex flex-col gap-1">
            <span className="text-sm">{AUTO_RENEW_LABEL.METHOD}</span>
            <Radio.Group
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              optionType="button"
              options={[
                { value: "card", label: AUTO_RENEW_LABEL.METHOD_CARD },
                { value: "maya", label: AUTO_RENEW_LABEL.METHOD_MAYA },
              ]}
            />
          </div>

          {method === "card" ? (
            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item
                name="name"
                label={AUTO_RENEW_LABEL.CARD_NAME}
                rules={[{ required: true, whitespace: true }]}
              >
                <Input autoComplete="cc-name" />
              </Form.Item>
              <Form.Item
                name="cardNumber"
                label={AUTO_RENEW_LABEL.CARD_NUMBER}
                normalize={formatCardNumber}
                rules={[
                  {
                    required: true,
                    pattern: /^[\d ]{12,23}$/,
                    message: AUTO_RENEW_LABEL.INVALID_CARD,
                  },
                ]}
              >
                <Input inputMode="numeric" autoComplete="cc-number" />
              </Form.Item>
              <div className="flex gap-3">
                <Form.Item
                  className="flex-1"
                  name="expiry"
                  label={AUTO_RENEW_LABEL.CARD_EXPIRY}
                  rules={[{ required: true }]}
                >
                  <Input placeholder="MM/YY" autoComplete="cc-exp" />
                </Form.Item>
                <Form.Item
                  className="w-28"
                  name="cvc"
                  label={AUTO_RENEW_LABEL.CARD_CVC}
                  rules={[{ required: true, pattern: /^\d{3,4}$/ }]}
                >
                  <Input.Password
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                  />
                </Form.Item>
              </div>
              <p className="m-0 text-xs text-(--ant-color-text-secondary)">
                {AUTO_RENEW_LABEL.CARD_SAFE}
              </p>
            </Form>
          ) : (
            <p className="m-0 text-sm text-(--ant-color-text-secondary)">
              {AUTO_RENEW_LABEL.MAYA_HINT}
            </p>
          )}

          {pay.isError && (
            <Alert
              type="error"
              showIcon
              message={
                pay.error instanceof Error
                  ? pay.error.message
                  : AUTO_RENEW_LABEL.INVALID_CARD
              }
            />
          )}
        </div>
      </Modal>
    </>
  );
}
