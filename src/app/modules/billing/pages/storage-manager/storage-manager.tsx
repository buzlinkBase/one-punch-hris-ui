import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Progress,
  Skeleton,
  Space,
  Table,
  Typography,
  theme,
} from "antd";
import { DeleteOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { DeleteStorageModal } from "../../components/delete-storage-modal";
import { StorageFilesDrawer } from "../../components/storage-files-drawer";
import {
  STORAGE_LABEL,
  STORAGE_MANAGER_LABEL,
} from "../../constants/label.const";
import {
  type StorageGroup,
  useStorageBreakdown,
} from "../../hooks/use-storage-manager-queries";
import { useStorageStatus } from "../../hooks/use-subscription-queries";
import { STORAGE_PERMISSION } from "../../hooks/use-subscription-state";
import type { StorageDeleteRequest } from "../../models/api/request/storage-manager-request.model";
import type {
  StorageCategoryResponse,
  StorageYearResponse,
} from "../../models/api/response/storage-manager-response.model";
import {
  STORAGE_LEVEL_COLOR,
  gaugePercent,
  storageHeadline,
} from "../../utils/storage";
import { fileCount, formatBytes } from "../../utils/storage-manager";

const { Title } = Typography;

const UNUSED_CATEGORY = "unlinked";

/**
 * Billing > Storage: the account's storage gauge, then what fills the current company's file
 * storage -- by category, each opening into the years its files were stored in -- with a way to
 * look through a year's files and delete the ones no longer needed.
 */
export default function StorageManager() {
  const session = useAuthUser();
  const canManage = useHasPermission(STORAGE_PERMISSION.MANAGE);
  const { token } = theme.useToken();
  const { data: status } = useStorageStatus();
  const { data: breakdown, isLoading } = useStorageBreakdown();
  const [browsing, setBrowsing] = useState<StorageGroup | null>(null);
  const [deleting, setDeleting] = useState<StorageDeleteRequest | null>(null);

  const ownedCompanies =
    session?.tenants?.filter((t) => t.roles.includes("Owner")).length ?? 0;
  const companyName = session?.tenantName;

  const yearColumns = (
    category: StorageCategoryResponse,
  ): ColumnsType<StorageYearResponse> => [
    { title: STORAGE_MANAGER_LABEL.YEAR, dataIndex: "year", key: "year" },
    {
      title: STORAGE_MANAGER_LABEL.FILES,
      key: "files",
      render: (_, row) => fileCount(row.fileCount),
    },
    {
      title: STORAGE_MANAGER_LABEL.SIZE,
      key: "size",
      align: "right",
      render: (_, row) => formatBytes(row.bytes),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, row) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<FolderOpenOutlined />}
            onClick={() =>
              setBrowsing({
                category: category.category,
                label: category.label,
                year: row.year,
              })
            }
          >
            {STORAGE_MANAGER_LABEL.VIEW_FILES}
          </Button>
          {canManage && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                setDeleting({ category: category.category, year: row.year })
              }
            >
              {STORAGE_MANAGER_LABEL.DELETE_YEAR}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const categoryColumns: ColumnsType<StorageCategoryResponse> = [
    {
      title: STORAGE_MANAGER_LABEL.CATEGORY,
      key: "category",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.label}</span>
          {row.category === UNUSED_CATEGORY && (
            <span className="text-xs text-(--ant-color-text-secondary)">
              {STORAGE_MANAGER_LABEL.UNUSED_HINT}
            </span>
          )}
        </div>
      ),
    },
    {
      title: STORAGE_MANAGER_LABEL.FILES,
      key: "files",
      render: (_, row) => fileCount(row.fileCount),
    },
    {
      title: STORAGE_MANAGER_LABEL.SIZE,
      key: "size",
      align: "right",
      render: (_, row) => formatBytes(row.bytes),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {STORAGE_MANAGER_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {STORAGE_MANAGER_LABEL.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {status && (
          <Card size="small" title={STORAGE_LABEL.TITLE}>
            <div className="mb-1 font-medium">{storageHeadline(status)}</div>
            {status.usedMb !== null && status.limitMb !== null && (
              <Progress
                percent={gaugePercent(status.percentUsed)}
                strokeColor={token[STORAGE_LEVEL_COLOR[status.level]]}
                format={() => `${status.percentUsed ?? 0}%`}
              />
            )}
            {ownedCompanies > 1 && (
              <p className="mb-0 text-sm text-(--ant-color-text-secondary)">
                {STORAGE_MANAGER_LABEL.OTHER_COMPANIES}
              </p>
            )}
          </Card>
        )}

        {!canManage && (
          <Alert
            type="info"
            showIcon
            message={STORAGE_MANAGER_LABEL.NO_PERMISSION_HINT}
          />
        )}

        <Card
          title={
            companyName
              ? `${STORAGE_MANAGER_LABEL.THIS_COMPANY}: ${companyName}`
              : STORAGE_MANAGER_LABEL.THIS_COMPANY
          }
          extra={
            breakdown && (
              <span className="text-sm text-(--ant-color-text-secondary)">
                {fileCount(breakdown.fileCount)} ·{" "}
                {formatBytes(breakdown.bytes)}
              </span>
            )
          }
        >
          {isLoading || !breakdown ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : breakdown.categories.length === 0 ? (
            <Empty description={STORAGE_MANAGER_LABEL.EMPTY} />
          ) : (
            <Table
              rowKey="category"
              size="small"
              columns={categoryColumns}
              dataSource={breakdown.categories}
              pagination={false}
              scroll={{ x: "max-content" }}
              expandable={{
                expandRowByClick: true,
                expandedRowRender: (category) => (
                  <Table
                    rowKey="year"
                    size="small"
                    columns={yearColumns(category)}
                    dataSource={category.years}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                  />
                ),
              }}
            />
          )}
        </Card>
      </div>

      <StorageFilesDrawer
        group={browsing}
        canManage={canManage}
        onClose={() => setBrowsing(null)}
      />
      <DeleteStorageModal
        key={deleting ? `${deleting.category}:${deleting.year}` : "none"}
        request={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
