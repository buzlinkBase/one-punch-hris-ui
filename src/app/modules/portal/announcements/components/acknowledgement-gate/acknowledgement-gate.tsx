import { useState } from "react";
import { Button, List, Modal, Tag, Typography } from "antd";
import { useLocation, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ANNOUNCEMENT_PRIORITY_COLOR } from "@/shared/types/announcement.model";
import { useMyPendingAcknowledgements } from "../../hooks/use-my-announcement-queries";

const { Text } = Typography;

const READER_PATH = "/portal/announcements";
const DISMISSED_KEY = "announcement-gate-dismissed";

function readDismissed(): string[] {
  try {
    return JSON.parse(
      sessionStorage.getItem(DISMISSED_KEY) ?? "[]",
    ) as string[];
  } catch {
    return [];
  }
}

function writeDismissed(ids: string[]) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable -- the reminder simply shows again next time.
  }
}

/**
 * Asks the signed-in employee to acknowledge announcements that require it. Urgent ones can't be
 * dismissed until acknowledged; the rest can be put off for this session. Stays out of the way
 * on the announcement pages themselves, where the reading and acknowledging happens.
 */
export function AcknowledgementGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: pending = [] } = useMyPendingAcknowledgements();
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  const hasUrgent = pending.some((a) => a.priority === "Urgent");
  const visible = pending.filter(
    (a) => a.priority === "Urgent" || !dismissed.includes(a.id),
  );
  const onReaderPage = location.pathname.startsWith(READER_PATH);
  const open = visible.length > 0 && !onReaderPage;

  const dismiss = () => {
    const next = [...new Set([...dismissed, ...pending.map((a) => a.id)])];
    setDismissed(next);
    writeDismissed(next);
  };

  return (
    <Modal
      open={open}
      title="Please acknowledge"
      closable={!hasUrgent}
      maskClosable={!hasUrgent}
      keyboard={!hasUrgent}
      onCancel={dismiss}
      footer={
        hasUrgent ? null : <Button onClick={dismiss}>Remind me later</Button>
      }
    >
      <Text type="secondary">
        {hasUrgent
          ? "An urgent announcement needs your acknowledgement before you continue."
          : "These announcements ask you to confirm you have read them."}
      </Text>
      <List
        className="mt-3"
        dataSource={visible}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="read"
                type="primary"
                size="small"
                onClick={() => navigate({ to: `${READER_PATH}/${item.id}` })}
              >
                Read
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {item.title}
                  {item.priority !== "Normal" && (
                    <Tag color={ANNOUNCEMENT_PRIORITY_COLOR[item.priority]}>
                      {item.priority}
                    </Tag>
                  )}
                </span>
              }
              description={
                item.acknowledgeByUtc
                  ? `${item.isOverdue ? "Was due" : "Due"} ${dayjs(item.acknowledgeByUtc).format("MMM D, YYYY h:mm A")}`
                  : undefined
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
