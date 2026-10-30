import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Modal,
  Spin,
  Typography,
  notification,
} from "antd";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { TERMS_LABEL } from "../../constants/label.const";
import {
  useAcceptTerms,
  usePublishedTerms,
  useTermsStatus,
} from "../../hooks/use-terms-queries";
import type { TermsStatusResponse } from "../../models/api/response/terms-response.model";
import { pendingTermsAcceptance } from "../../utils/pending-acceptance";
import { LegalDocument } from "../legal-document";

const { Paragraph, Text } = Typography;

interface GateProps {
  status: TermsStatusResponse;
}

/** An owner or admin: reads and accepts the Terms for the company. Can't be dismissed. */
function AcceptForCompany({ status }: GateProps) {
  const version = status.currentVersion!;
  const { data: terms, isLoading } = usePublishedTerms(version);
  const { mutateAsync: accept, isPending } = useAcceptTerms();
  const [checked, setChecked] = useState(false);
  const autoTried = useRef(false);
  const firstTime = status.acceptedVersion == null;

  // Agreed to at company setup (TermsAgreementCheckbox): record it now that the company exists.
  useEffect(() => {
    if (autoTried.current || pendingTermsAcceptance.get() !== version) return;
    autoTried.current = true;
    accept(version)
      .then(() => pendingTermsAcceptance.clear())
      .catch(() => undefined);
  }, [accept, version]);

  const onAccept = async () => {
    try {
      await accept(version);
      pendingTermsAcceptance.clear();
      notification.success({
        message: TERMS_LABEL.GATE_ACCEPTED,
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: TERMS_LABEL.GATE_FAILED,
        placement: "topRight",
      });
    }
  };

  return (
    <Modal
      open
      width={820}
      closable={false}
      maskClosable={false}
      keyboard={false}
      title={firstTime ? TERMS_LABEL.GATE_FIRST_TITLE : TERMS_LABEL.GATE_TITLE}
      footer={
        <Button
          type="primary"
          disabled={!checked || !terms}
          loading={isPending}
          onClick={onAccept}
        >
          {TERMS_LABEL.GATE_ACCEPT}
        </Button>
      }
    >
      <Paragraph>{TERMS_LABEL.GATE_INTRO}</Paragraph>
      {!firstTime && status.changeSummary && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={TERMS_LABEL.GATE_CHANGES}
          description={
            <Text className="whitespace-pre-line">{status.changeSummary}</Text>
          }
        />
      )}
      <div className="mb-4 max-h-[50vh] overflow-y-auto rounded border border-solid border-gray-200 p-4">
        {isLoading ? (
          <Spin />
        ) : terms ? (
          <LegalDocument markdown={terms.renderedMarkdown} />
        ) : (
          <Text type="secondary">{TERMS_LABEL.NOT_PUBLISHED}</Text>
        )}
      </div>
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      >
        {TERMS_LABEL.GATE_CHECKBOX}
      </Checkbox>
    </Modal>
  );
}

type GateKind = "acceptForCompany" | "nothingToDo";
type GateRender = (status: TermsStatusResponse) => ReactNode;

/** Strategy: who is asked to do what when the company owes an acceptance. */
const GATE_STRATEGIES: Record<GateKind, GateRender> = {
  acceptForCompany: (status) => <AcceptForCompany status={status} />,
  // Anyone else (and an operator signed in as a user, who may not accept for them).
  nothingToDo: () => null,
};

function gateKind(): GateKind {
  if (authStorage.isImpersonating()) return "nothingToDo";
  return authStorage.hasRole("Owner") || authStorage.hasRole("Admin")
    ? "acceptForCompany"
    : "nothingToDo";
}

/**
 * Makes sure the company has accepted the current Terms of Service: an owner or admin is asked
 * to read and accept them (on behalf of the company) before going on. Mounted in the main layout.
 */
export function TermsAcceptanceGate() {
  useAuthUser(); // re-evaluate the role when the session switches company
  const kind = gateKind();
  const { data: status } = useTermsStatus(kind !== "nothingToDo");

  if (!status?.requiresAcceptance || status.currentVersion == null) return null;
  return GATE_STRATEGIES[kind](status);
}
