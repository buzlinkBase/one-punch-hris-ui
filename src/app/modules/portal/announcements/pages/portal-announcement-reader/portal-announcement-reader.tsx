import { Alert, Button, Card, Result, Skeleton, Typography } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { LinkifiedText } from "@/shared/components/linkified-text/linkified-text";
import {
  useAcknowledgeAnnouncement,
  useOpenMyAnnouncement,
} from "../../hooks/use-my-announcement-queries";
import { AnnouncementTags } from "../../components/announcement-tags/announcement-tags";

const { Title, Text } = Typography;

const LIST_PATH = "/portal/announcements";
const formatDateTime = (value: string) =>
  dayjs(value).format("MMM D, YYYY h:mm A");

export default function PortalAnnouncementReader() {
  const { id } = useRouteParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOpenMyAnnouncement(id);
  const { mutate: acknowledge, isPending: isAcknowledging } =
    useAcknowledgeAnnouncement();

  const back = (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate({ to: LIST_PATH })}
      className="mb-3"
    >
      All announcements
    </Button>
  );

  if (isLoading) {
    return (
      <div className="content-page">
        {back}
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="content-page">
        {back}
        <Result
          status="404"
          title="Announcement not found"
          subTitle="It may have been removed, or it wasn't sent to you."
        />
      </div>
    );
  }

  return (
    <div className="content-page">
      {back}
      <Card className="mx-auto max-w-3xl">
        <div className="mb-2">
          <AnnouncementTags item={data} />
        </div>
        <Title level={3} className="mt-0!">
          {data.title}
        </Title>
        <Text type="secondary" className="mb-4 block text-sm">
          {data.publishedByName ?? "Company"}
          {data.publishedAtUtc
            ? ` · ${formatDateTime(data.publishedAtUtc)}`
            : ""}
          {data.lastEditedAtUtc
            ? ` · Edited ${formatDateTime(data.lastEditedAtUtc)}`
            : ""}
        </Text>

        {data.isWithdrawn ? (
          <Alert
            type="warning"
            showIcon
            message="This announcement was withdrawn"
            description={
              <>
                {data.withdrawnByName ?? "The publisher"} withdrew it
                {data.withdrawnAtUtc
                  ? ` on ${formatDateTime(data.withdrawnAtUtc)}`
                  : ""}
                .{data.withdrawReason ? ` Reason: ${data.withdrawReason}` : ""}
              </>
            }
          />
        ) : (
          <>
            {data.isArchived && (
              <Alert
                className="mb-4"
                type="info"
                showIcon
                message="Archived — kept here for your reference."
              />
            )}
            <LinkifiedText text={data.body} className="text-base leading-7" />

            {data.requiresAcknowledgement && (
              <div className="mt-6 border-t border-(--ant-color-border-secondary) pt-4">
                {data.needsAcknowledgement ? (
                  <Alert
                    type={data.isOverdue ? "error" : "warning"}
                    showIcon
                    message={
                      data.needsReacknowledgement
                        ? "This announcement was updated since you acknowledged it. Please read it again and acknowledge."
                        : "Please confirm you have read and understood this announcement."
                    }
                    description={
                      data.acknowledgeByUtc
                        ? `Due ${formatDateTime(data.acknowledgeByUtc)}`
                        : undefined
                    }
                    action={
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={isAcknowledging}
                        onClick={() => acknowledge(data.id)}
                      >
                        Acknowledge
                      </Button>
                    }
                  />
                ) : data.acknowledgedAt ? (
                  <Alert
                    type="success"
                    showIcon
                    message={`You acknowledged this on ${formatDateTime(data.acknowledgedAt)}.`}
                  />
                ) : null}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
