import {
  Card,
  Empty,
  Progress,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { TeamOutlined } from "@ant-design/icons";
import type { AudiencePreview } from "../../models/api/response/announcement-response.model";

const { Text } = Typography;

interface AudiencePreviewCardProps {
  preview: AudiencePreview | undefined;
  loading: boolean;
  hasInclusion: boolean;
  /** Published: the audience is fixed -- show who actually received it instead. */
  sentTo?: number;
}

export function AudiencePreviewCard({
  preview,
  loading,
  hasInclusion,
  sentTo,
}: AudiencePreviewCardProps) {
  if (sentTo !== undefined) {
    return (
      <Card size="small" title="Recipients">
        <Statistic value={sentTo} suffix="people" prefix={<TeamOutlined />} />
        <Text type="secondary" className="text-xs">
          The audience was fixed when this was published. Duplicate it to send
          to a different group.
        </Text>
      </Card>
    );
  }

  return (
    <Card size="small" title="Who will receive this">
      {!hasInclusion ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Add at least one Include rule"
        />
      ) : loading && !preview ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : preview ? (
        <div className="flex flex-col gap-3">
          <Statistic
            value={preview.total}
            suffix={preview.total === 1 ? "person" : "people"}
            prefix={<TeamOutlined />}
            loading={loading}
          />
          {preview.total === 0 ? (
            <Text type="warning">
              Nobody matches yet — adjust the rules before publishing.
            </Text>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                {preview.byDepartment.map((d) => (
                  <div key={d.name} className="text-xs">
                    <div className="flex justify-between">
                      <span className="truncate">{d.name}</span>
                      <span className="text-(--ant-color-text-secondary)">
                        {d.count}
                      </span>
                    </div>
                    <Progress
                      percent={Math.round((d.count / preview.total) * 100)}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {preview.sample.map((name) => (
                  <Tag key={name}>{name}</Tag>
                ))}
                {preview.total > preview.sample.length && (
                  <Tag>+{preview.total - preview.sample.length} more</Tag>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}
