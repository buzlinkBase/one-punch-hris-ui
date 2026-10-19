import { useState } from "react";
import { Button, Drawer, Table, Tag, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { openAttachment } from "@/shared/components/attachment-upload/open-attachment";
import { STORAGE_MANAGER_LABEL } from "../../constants/label.const";
import {
  type StorageGroup,
  useStoredFiles,
} from "../../hooks/use-storage-manager-queries";
import type { StoredFileResponse } from "../../models/api/response/storage-manager-response.model";
import { formatManilaDate } from "../../utils/format";
import { formatBytes } from "../../utils/storage-manager";
import { DeleteStorageModal } from "../delete-storage-modal";

const PAGE_SIZE = 20;

interface StorageFilesDrawerProps {
  /** The category + year to list; null keeps the drawer closed. */
  group: StorageGroup | null;
  canManage: boolean;
  onClose: () => void;
}

/** One category's files for one year, oldest first, to pick the ones to delete. */
export function StorageFilesDrawer({
  group,
  canManage,
  onClose,
}: StorageFilesDrawerProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const { data, isFetching } = useStoredFiles(group, page, PAGE_SIZE);

  const columns: ColumnsType<StoredFileResponse> = [
    {
      title: STORAGE_MANAGER_LABEL.FILE_NAME,
      key: "file",
      render: (_, row) =>
        row.attachmentId ? (
          <Button
            type="link"
            className="h-auto! p-0! text-left! whitespace-normal!"
            onClick={() => void openAttachment(row.attachmentId ?? "")}
          >
            {row.fileName}
          </Button>
        ) : (
          <span className="break-all">{row.fileName}</span>
        ),
    },
    {
      title: STORAGE_MANAGER_LABEL.RECORD,
      key: "record",
      render: (_, row) => (
        <div className="flex flex-col items-start gap-1">
          {row.recordLabel && <span>{row.recordLabel}</span>}
          {row.locked && (
            <Tooltip title={STORAGE_MANAGER_LABEL.LOCKED_TIP}>
              <Tag color="orange">{STORAGE_MANAGER_LABEL.LOCKED}</Tag>
            </Tooltip>
          )}
          {!row.deletable && (
            <Tooltip title={STORAGE_MANAGER_LABEL.PROCESSING_TIP}>
              <Tag>{STORAGE_MANAGER_LABEL.PROCESSING}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: STORAGE_MANAGER_LABEL.STORED,
      key: "stored",
      render: (_, row) => formatManilaDate(row.storedAtUtc),
    },
    {
      title: STORAGE_MANAGER_LABEL.SIZE,
      key: "size",
      align: "right",
      render: (_, row) => formatBytes(row.sizeBytes),
    },
  ];

  const close = () => {
    setPage(1);
    setSelected([]);
    onClose();
  };

  return (
    <Drawer
      open={!!group}
      onClose={close}
      width="min(760px, 100vw)"
      title={group ? `${group.label} · ${group.year}` : ""}
      destroyOnHidden
      extra={
        canManage && (
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selected.length === 0}
            onClick={() => setDeleting(selected)}
          >
            {STORAGE_MANAGER_LABEL.DELETE_SELECTED}
            {selected.length > 0 ? ` (${selected.length})` : ""}
          </Button>
        )
      }
    >
      <Table
        rowKey="key"
        size="small"
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        rowSelection={
          canManage
            ? {
                selectedRowKeys: selected,
                preserveSelectedRowKeys: true,
                onChange: (keys) => setSelected(keys.map(String)),
                getCheckboxProps: (row) => ({ disabled: !row.deletable }),
              }
            : undefined
        }
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />

      <DeleteStorageModal
        key={deleting?.join("|") ?? "none"}
        request={deleting ? { keys: deleting } : null}
        onClose={() => setDeleting(null)}
        onDeleted={() => setSelected([])}
      />
    </Drawer>
  );
}
