import { useMemo } from "react";
import { Button, Card, Result } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { CLOSURE_LABEL } from "../../constants/closure-label.const";
import { useClosureLinkAction } from "../../hooks/use-closure-queries";

type LinkAction = "confirm" | "cancel";

function readLink(): { action: LinkAction | null; token: string } {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");
  return {
    action: action === "confirm" || action === "cancel" ? action : null,
    token: params.get("token") ?? "",
  };
}

/**
 * The page the two links in an account-closure email open ("confirm" and "this wasn't me, cancel"). Public:
 * the owner may be signed out. Opening the link does nothing by itself (mail scanners open links), the
 * owner presses the button.
 */
export default function ClosureLink() {
  const navigate = useNavigate();
  const { action, token } = useMemo(() => readLink(), []);
  const confirm = useClosureLinkAction("confirm");
  const cancel = useClosureLinkAction("cancel");
  const run = action === "cancel" ? cancel : confirm;

  if (!action || !token) {
    return (
      <Card>
        <Result status="warning" title={CLOSURE_LABEL.LINK_MISSING} />
      </Card>
    );
  }

  if (run.isSuccess) {
    return (
      <Card>
        <Result
          status="success"
          title={
            action === "confirm"
              ? CLOSURE_LABEL.LINK_CONFIRMED
              : CLOSURE_LABEL.LINK_CANCELED
          }
          extra={
            <Button type="primary" onClick={() => navigate({ to: "/login" })}>
              {CLOSURE_LABEL.GO_TO_SIGN_IN}
            </Button>
          }
        />
      </Card>
    );
  }

  if (run.isError) {
    return (
      <Card>
        <Result status="error" title={CLOSURE_LABEL.LINK_INVALID} />
      </Card>
    );
  }

  const isConfirm = action === "confirm";
  return (
    <Card>
      <Result
        status="info"
        title={
          isConfirm
            ? CLOSURE_LABEL.LINK_CONFIRM_TITLE
            : CLOSURE_LABEL.LINK_CANCEL_TITLE
        }
        subTitle={
          isConfirm
            ? CLOSURE_LABEL.LINK_CONFIRM_TEXT
            : CLOSURE_LABEL.LINK_CANCEL_TEXT
        }
        extra={
          <Button
            type="primary"
            danger={isConfirm}
            loading={run.isPending}
            onClick={() => run.mutate(token)}
          >
            {isConfirm
              ? CLOSURE_LABEL.LINK_CONFIRM_BUTTON
              : CLOSURE_LABEL.LINK_CANCEL_BUTTON}
          </Button>
        }
      />
    </Card>
  );
}
