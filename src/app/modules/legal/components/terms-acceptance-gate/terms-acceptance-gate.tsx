import { useEffect, useRef, useState, type ReactNode } from "react";
import { InfoCircleFilled } from "@ant-design/icons";
import { Button, Checkbox, Modal, Spin, Typography, notification } from "antd";
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

interface ChangeItem {
  section: string | null;
  text: string;
}

// "- 4.2 and 4.4: We now ..." -> { section: "4.2 and 4.4", text: "We now ..." }.
// A line without a "section: " lead-in is shown as plain text.
function parseChangeSummary(summary: string): ChangeItem[] {
  return summary
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^(\d[\d.\sand,]*):\s+(.*)$/.exec(line);
      return match
        ? { section: match[1], text: match[2] }
        : { section: null, text: line };
    });
}

function ChangeSummaryList({ summary }: { summary: string }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {parseChangeSummary(summary).map((item, index) => (
        <li key={index} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          {item.section && (
            <Text
              strong
              className="h-fit w-fit shrink-0 rounded bg-blue-50 px-2 py-0.5 text-center sm:w-28"
            >
              {item.section}
            </Text>
          )}
          <Text className="leading-relaxed">{item.text}</Text>
        </li>
      ))}
    </ul>
  );
}

/** An owner or admin: reads and accepts the Terms for the company. Can't be dismissed. */
function AcceptForCompany({ status }: GateProps) {
  const version = status.currentVersion!;
  const { data: terms, isLoading } = usePublishedTerms(version);
  const { mutateAsync: accept, isPending } = useAcceptTerms();
  const [checked, setChecked] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
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
        <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          >
            {TERMS_LABEL.GATE_CHECKBOX}
          </Checkbox>
          <Button
            type="primary"
            className="w-full shrink-0 sm:w-auto"
            disabled={!checked || !terms}
            loading={isPending}
            onClick={onAccept}
          >
            {TERMS_LABEL.GATE_ACCEPT}
          </Button>
        </div>
      }
    >
      <Paragraph>{TERMS_LABEL.GATE_INTRO}</Paragraph>
      {!firstTime && status.changeSummary && (
        <div className="sticky top-0 z-10 mb-4 flex flex-col gap-1 rounded-lg shadow-sm border border-solid border-blue-200 bg-blue-50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="flex items-center gap-2">
            <InfoCircleFilled className="text-blue-500" />
            <Text>{TERMS_LABEL.GATE_CHANGES_NOTICE}</Text>
          </span>
          <Button
            type="link"
            className="self-start px-0 sm:self-auto sm:px-2"
            onClick={() => setShowChanges(true)}
          >
            {TERMS_LABEL.GATE_CHANGES_VIEW}
          </Button>
        </div>
      )}
      <div className="rounded-lg md:max-h-[55vh] md:overflow-y-auto border border-solid border-gray-200 p-4">
        {isLoading ? (
          <Spin />
        ) : terms ? (
          <LegalDocument markdown={terms.renderedMarkdown} />
        ) : (
          <Text type="secondary">{TERMS_LABEL.NOT_PUBLISHED}</Text>
        )}
      </div>
      <Modal
        open={showChanges}
        width={640}
        title={TERMS_LABEL.GATE_CHANGES}
        onCancel={() => setShowChanges(false)}
        footer={
          <Button type="primary" onClick={() => setShowChanges(false)}>
            {TERMS_LABEL.GATE_CHANGES_CLOSE}
          </Button>
        }
      >
        <div className="md:max-h-[65vh] md:overflow-y-auto md:pr-2">
          <ChangeSummaryList summary={status.changeSummary ?? ""} />
        </div>
      </Modal>
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
