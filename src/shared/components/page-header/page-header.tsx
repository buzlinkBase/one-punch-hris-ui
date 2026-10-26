import type { ReactNode } from "react";
import { Button, Space, Tooltip, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Renders a labelled refresh button when provided. */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Primary actions (e.g. an "Add" button wrapped in a PermissionGate). */
  actions?: ReactNode;
}

/** Standard title / subtitle / actions bar at the top of every list and detail page. */
export function PageHeader({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-toolbar">
      <div className="page-toolbar-row">
        <div>
          <Title level={4} className="mb-0!">
            {title}
          </Title>
          {subtitle && <p className="page-toolbar-subtitle">{subtitle}</p>}
        </div>
        <Space>
          {onRefresh && (
            <Tooltip title="Refresh">
              <Button
                aria-label="Refresh"
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={onRefresh}
                disabled={isRefreshing}
              />
            </Tooltip>
          )}
          {actions}
        </Space>
      </div>
    </div>
  );
}
