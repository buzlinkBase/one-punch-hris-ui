import { useState, type ReactNode } from "react";
import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Radio,
  Typography,
  message,
  type MenuProps,
} from "antd";
import {
  CalendarOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  PushpinOutlined,
  RollbackOutlined,
  SendOutlined,
  StopOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import type {
  AnnouncementAction,
  AnnouncementSummary,
} from "../../models/api/response/announcement-response.model";
import type { RemindTarget } from "../../models/api/request/announcement-request.model";
import {
  ANNOUNCEMENT_PATH,
  ANNOUNCEMENT_PERMISSION,
} from "../../constants/label.const";
import {
  useArchiveAnnouncement,
  useDeleteAnnouncement,
  useDuplicateAnnouncement,
  usePinAnnouncement,
  usePublishAnnouncement,
  useRemindAnnouncement,
  useRepublishAnnouncement,
  useRestoreAnnouncement,
  useRestoreDeletedAnnouncement,
  useScheduleAnnouncement,
  useUnpinAnnouncement,
  useUnpublishAnnouncement,
  useUnscheduleAnnouncement,
} from "../../hooks/use-announcement-queries";

const { Text } = Typography;

type DialogKind = "schedule" | "unpublish" | "remind" | "pin" | null;

const { EDIT, CREATE, DELETE, PUBLISH } = ANNOUNCEMENT_PERMISSION;

const ACTION_META: Record<
  AnnouncementAction,
  { label: string; icon: ReactNode; permission: string; danger?: boolean }
> = {
  Edit: { label: "Edit", icon: <EditOutlined />, permission: EDIT },
  PublishNow: {
    label: "Publish now",
    icon: <SendOutlined />,
    permission: PUBLISH,
  },
  Schedule: {
    label: "Schedule",
    icon: <CalendarOutlined />,
    permission: PUBLISH,
  },
  Unschedule: {
    label: "Cancel schedule",
    icon: <StopOutlined />,
    permission: PUBLISH,
  },
  Remind: {
    label: "Send reminder",
    icon: <BellOutlined />,
    permission: PUBLISH,
  },
  Pin: { label: "Pin to top", icon: <PushpinOutlined />, permission: PUBLISH },
  Unpin: { label: "Unpin", icon: <PushpinOutlined />, permission: PUBLISH },
  Unpublish: {
    label: "Unpublish (withdraw)",
    icon: <StopOutlined />,
    permission: PUBLISH,
  },
  Republish: {
    label: "Republish",
    icon: <SendOutlined />,
    permission: PUBLISH,
  },
  Archive: { label: "Archive", icon: <InboxOutlined />, permission: PUBLISH },
  Restore: {
    label: "Restore from archive",
    icon: <RollbackOutlined />,
    permission: PUBLISH,
  },
  Duplicate: {
    label: "Duplicate",
    icon: <CopyOutlined />,
    permission: CREATE,
  },
  Delete: {
    label: "Delete",
    icon: <DeleteOutlined />,
    permission: DELETE,
    danger: true,
  },
  RestoreDeleted: {
    label: "Restore",
    icon: <RollbackOutlined />,
    permission: DELETE,
  },
};

interface AnnouncementActionsProps {
  announcement: AnnouncementSummary;
  /** Called after the announcement is permanently removed (e.g. leave its page). */
  onRemoved?: () => void;
  /** "button" shows a labelled button (page header); default is a compact icon (table row). */
  trigger?: "icon" | "button";
}

/**
 * Lifecycle actions for one announcement. Which actions exist comes from the server
 * (allowedActions, decided by AnnouncementStateMachine); this only hides the ones the caller's
 * role can't perform, and asks for confirmation/details where an action needs them.
 */
export function AnnouncementActions({
  announcement,
  onRemoved,
  trigger = "icon",
}: AnnouncementActionsProps) {
  useAuthUser();
  const navigate = useNavigate();
  const [modal, modalContext] = Modal.useModal();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [publishAt, setPublishAt] = useState<Dayjs | null>(null);
  const [pinUntil, setPinUntil] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [remindTarget, setRemindTarget] = useState<RemindTarget>("NotViewed");

  const { id, title, requiresAcknowledgement } = announcement;
  const publish = usePublishAnnouncement();
  const schedule = useScheduleAnnouncement();
  const unschedule = useUnscheduleAnnouncement();
  const unpublish = useUnpublishAnnouncement();
  const republish = useRepublishAnnouncement();
  const remind = useRemindAnnouncement();
  const pin = usePinAnnouncement();
  const unpin = useUnpinAnnouncement();
  const archive = useArchiveAnnouncement();
  const restore = useRestoreAnnouncement();
  const duplicate = useDuplicateAnnouncement();
  const remove = useDeleteAnnouncement();
  const restoreDeleted = useRestoreDeletedAnnouncement();

  const isNeverSent =
    announcement.state === "Draft" || announcement.state === "Scheduled";

  const run = (action: AnnouncementAction) => {
    switch (action) {
      case "Edit":
        navigate({ to: ANNOUNCEMENT_PATH.edit(id) });
        return;
      case "Duplicate":
        duplicate.mutate(id, {
          onSuccess: (newId) => {
            message.success("Copied into a new draft.");
            navigate({ to: ANNOUNCEMENT_PATH.edit(newId) });
          },
        });
        return;
      case "PublishNow":
        modal.confirm({
          title: `Publish "${title}" now?`,
          content:
            "Everyone in its audience gets it right away, with a live notification.",
          okText: "Publish",
          onOk: () =>
            publish.mutateAsync(id).then(() => message.success("Published.")),
        });
        return;
      case "Schedule":
        setPublishAt(dayjs().add(1, "hour").startOf("hour"));
        setDialog("schedule");
        return;
      case "Unschedule":
        modal.confirm({
          title: "Cancel the schedule?",
          content: "It goes back to being a draft and won't be sent.",
          okText: "Cancel schedule",
          cancelText: "Keep",
          onOk: () =>
            unschedule
              .mutateAsync(id)
              .then(() => message.success("Moved back to drafts.")),
        });
        return;
      case "Unpublish":
        setReason("");
        setDialog("unpublish");
        return;
      case "Republish":
        modal.confirm({
          title: "Republish?",
          content:
            "It becomes visible again to the same people. Views and acknowledgements they already gave are kept.",
          okText: "Republish",
          onOk: () =>
            republish
              .mutateAsync(id)
              .then(() => message.success("Republished.")),
        });
        return;
      case "Remind":
        setRemindTarget(
          requiresAcknowledgement ? "NotAcknowledged" : "NotViewed",
        );
        setDialog("remind");
        return;
      case "Pin":
        setPinUntil(null);
        setDialog("pin");
        return;
      case "Unpin":
        unpin.mutate(id, { onSuccess: () => message.success("Unpinned.") });
        return;
      case "Archive":
        modal.confirm({
          title: "Archive this announcement?",
          content:
            "Employees keep it in their archive (read-only). Reminders and acknowledgements stop. You can restore it later.",
          okText: "Archive",
          onOk: () =>
            archive.mutateAsync(id).then(() => message.success("Archived.")),
        });
        return;
      case "Restore":
        restore.mutate(id, { onSuccess: () => message.success("Restored.") });
        return;
      case "Delete":
        modal.confirm({
          title: isNeverSent
            ? "Delete this draft for good?"
            : "Move to Recently deleted?",
          content: isNeverSent
            ? "It was never sent, so it's removed permanently."
            : "Employees lose access to it right away. It stays restorable for 30 days, then it and its read/acknowledgement records are removed permanently.",
          okText: "Delete",
          okButtonProps: { danger: true },
          onOk: () =>
            remove.mutateAsync(id).then(() => {
              message.success(
                isNeverSent ? "Deleted." : "Moved to Recently deleted.",
              );
              if (isNeverSent) onRemoved?.();
            }),
        });
        return;
      case "RestoreDeleted":
        restoreDeleted.mutate(id, {
          onSuccess: () => message.success("Restored."),
        });
        return;
    }
  };

  const allowed = announcement.allowedActions.filter((a) =>
    authStorage.hasAnyPermission(ACTION_META[a].permission),
  );
  if (allowed.length === 0) return null;

  const items: MenuProps["items"] = allowed.map((action) => ({
    key: action,
    label: ACTION_META[action].label,
    icon: ACTION_META[action].icon,
    danger: ACTION_META[action].danger,
  }));

  return (
    <>
      {modalContext}
      <Dropdown
        trigger={["click"]}
        menu={{ items, onClick: ({ key }) => run(key as AnnouncementAction) }}
      >
        {trigger === "button" ? (
          <Button icon={<MoreOutlined />}>Actions</Button>
        ) : (
          <Button type="text" icon={<MoreOutlined />} aria-label="Actions" />
        )}
      </Dropdown>

      <Modal
        open={dialog === "schedule"}
        title="Schedule announcement"
        okText="Schedule"
        okButtonProps={{ disabled: !publishAt || publishAt.isBefore(dayjs()) }}
        confirmLoading={schedule.isPending}
        onCancel={() => setDialog(null)}
        onOk={() =>
          publishAt &&
          schedule.mutate(
            { id, publishAtUtc: publishAt.toISOString() },
            {
              onSuccess: () => {
                message.success(
                  `Scheduled for ${publishAt.format("MMM D, YYYY h:mm A")}.`,
                );
                setDialog(null);
              },
            },
          )
        }
      >
        <Text type="secondary" className="mb-3 block">
          It publishes automatically at this time, to everyone who matches its
          audience then.
        </Text>
        <DatePicker
          showTime={{ format: "h:mm A", minuteStep: 5 }}
          format="MMM D, YYYY h:mm A"
          className="w-full"
          value={publishAt}
          onChange={setPublishAt}
          disabledDate={(d) => d.isBefore(dayjs(), "day")}
        />
      </Modal>

      <Modal
        open={dialog === "unpublish"}
        title="Unpublish (withdraw) this announcement?"
        okText="Unpublish"
        okButtonProps={{ danger: true }}
        confirmLoading={unpublish.isPending}
        onCancel={() => setDialog(null)}
        onOk={() =>
          unpublish.mutate(
            { id, reason: reason.trim() || null },
            {
              onSuccess: () => {
                message.success("Unpublished.");
                setDialog(null);
              },
            },
          )
        }
      >
        <Text type="secondary" className="mb-3 block">
          It disappears from employees' lists right away; anyone opening an old
          link sees that it was withdrawn. The read report is kept, and you can
          republish it later.
        </Text>
        <Input.TextArea
          rows={3}
          maxLength={500}
          showCount
          placeholder="Reason shown to employees (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      <Modal
        open={dialog === "remind"}
        title="Send a reminder"
        okText="Send reminder"
        confirmLoading={remind.isPending}
        onCancel={() => setDialog(null)}
        onOk={() =>
          remind.mutate(
            { id, target: remindTarget },
            {
              onSuccess: (count) => {
                message.success(
                  count === 0
                    ? "Everyone is already up to date."
                    : `Reminded ${count} ${count === 1 ? "person" : "people"}.`,
                );
                setDialog(null);
              },
            },
          )
        }
      >
        <Radio.Group
          className="flex flex-col gap-2"
          value={remindTarget}
          onChange={(e) => setRemindTarget(e.target.value as RemindTarget)}
          options={[
            { value: "NotViewed", label: "People who haven't opened it" },
            ...(requiresAcknowledgement
              ? [
                  {
                    value: "NotAcknowledged",
                    label: "People who haven't acknowledged it",
                  },
                ]
              : []),
          ]}
        />
      </Modal>

      <Modal
        open={dialog === "pin"}
        title="Pin to top"
        okText="Pin"
        confirmLoading={pin.isPending}
        onCancel={() => setDialog(null)}
        onOk={() =>
          pin.mutate(
            { id, pinnedUntilUtc: pinUntil ? pinUntil.toISOString() : null },
            {
              onSuccess: () => {
                message.success("Pinned.");
                setDialog(null);
              },
            },
          )
        }
      >
        <Text type="secondary" className="mb-3 block">
          Pinned announcements stay at the top of employees' lists. Leave the
          date empty to keep it pinned until you unpin it.
        </Text>
        <DatePicker
          showTime={{ format: "h:mm A", minuteStep: 5 }}
          format="MMM D, YYYY h:mm A"
          className="w-full"
          placeholder="Pinned until (optional)"
          value={pinUntil}
          onChange={setPinUntil}
          disabledDate={(d) => d.isBefore(dayjs(), "day")}
        />
      </Modal>
    </>
  );
}
