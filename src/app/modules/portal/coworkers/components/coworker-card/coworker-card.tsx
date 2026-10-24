import type { ReactNode } from "react";
import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CoworkerCardProps {
  name: string;
  imageUrl?: string;
  subtitle?: string;
  /** Extra line under the subtitle (e.g. contact details). */
  extra?: ReactNode;
  /** Right-aligned badge (e.g. "5 years", "Out"). */
  badge?: ReactNode;
}

export default function CoworkerCard({
  name,
  imageUrl,
  subtitle,
  extra,
  badge,
}: CoworkerCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-3 transition-colors hover:border-(--primary) hover:bg-(--bg-hover)">
      <Avatar
        size={48}
        src={imageUrl || undefined}
        icon={<UserOutlined />}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-medium truncate">{name}</p>
        {subtitle && (
          <Text type="secondary" className="text-xs block truncate">
            {subtitle}
          </Text>
        )}
        {extra}
      </div>
      {badge}
    </div>
  );
}
