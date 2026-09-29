import { Tag } from "antd";
import { PushpinFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { ANNOUNCEMENT_PRIORITY_COLOR } from "@/shared/types/announcement.model";
import type { MyAnnouncementListItem } from "../../models/api/response/my-announcement-response.model";

interface AnnouncementTagsProps {
  item: MyAnnouncementListItem;
}

/** Priority, pin, edited and acknowledgement status -- shared by the list and the reader. */
export function AnnouncementTags({ item }: AnnouncementTagsProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {item.isPinned && (
        <Tag icon={<PushpinFilled />} color="blue">
          Pinned
        </Tag>
      )}
      {item.priority !== "Normal" && (
        <Tag color={ANNOUNCEMENT_PRIORITY_COLOR[item.priority]}>
          {item.priority}
        </Tag>
      )}
      {item.isEdited && <Tag>Edited</Tag>}
      {item.isArchived && <Tag>Archived</Tag>}
      {item.requiresAcknowledgement &&
        (item.isOverdue ? (
          <Tag color="red">Acknowledgement overdue</Tag>
        ) : item.needsReacknowledgement ? (
          <Tag color="orange">Updated — acknowledge again</Tag>
        ) : item.needsAcknowledgement ? (
          <Tag color="gold">
            Needs acknowledgement
            {item.acknowledgeByUtc
              ? ` by ${dayjs(item.acknowledgeByUtc).format("MMM D")}`
              : ""}
          </Tag>
        ) : item.acknowledgedAt ? (
          <Tag color="success">Acknowledged</Tag>
        ) : null)}
    </span>
  );
}
