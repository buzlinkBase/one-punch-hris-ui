import { useState } from "react";
import { Alert, Input, Modal, Skeleton, message } from "antd";
import { STORAGE_MANAGER_LABEL } from "../../constants/label.const";
import {
  useDeleteStoredFiles,
  useStorageDeletePreview,
} from "../../hooks/use-storage-manager-queries";
import type { StorageDeleteRequest } from "../../models/api/request/storage-manager-request.model";
import {
  DELETE_CONFIRM_WORD,
  canConfirmDelete,
  fileCount,
  formatBytes,
} from "../../utils/storage-manager";

interface DeleteStorageModalProps {
  /** What to delete; null keeps the modal closed. */
  request: StorageDeleteRequest | null;
  onClose: () => void;
  onDeleted?: () => void;
}

/**
 * Confirms a delete: asks the server what it would remove (count, space freed, how many belong to
 * decided records) and, when decided records are involved, makes the user type DELETE first.
 * Mount with a fresh `key` per request so the typed word never carries over.
 */
export function DeleteStorageModal({
  request,
  onClose,
  onDeleted,
}: DeleteStorageModalProps) {
  const { data: preview, isLoading } = useStorageDeletePreview(request);
  const remove = useDeleteStoredFiles();
  const [typed, setTyped] = useState("");

  if (!request) return null;

  const locked = preview?.lockedCount ?? 0;
  const nothing = preview?.fileCount === 0;
  const ready = !!preview && !nothing && canConfirmDelete(locked, typed);

  const submit = () =>
    remove.mutate(
      { ...request, confirmLocked: locked > 0 },
      {
        onSuccess: (result) => {
          message.success(
            STORAGE_MANAGER_LABEL.DELETED.replace(
              "{files}",
              fileCount(result.deletedCount),
            ).replace("{size}", formatBytes(result.freedBytes)),
          );
          if (result.failedCount > 0) {
            message.warning(
              STORAGE_MANAGER_LABEL.DELETE_FAILED_SOME.replace(
                "{count}",
                String(result.failedCount),
              ),
            );
          }
          onDeleted?.();
          onClose();
        },
      },
    );

  return (
    <Modal
      open
      title={STORAGE_MANAGER_LABEL.DELETE_TITLE}
      onCancel={onClose}
      onOk={submit}
      okText={STORAGE_MANAGER_LABEL.DELETE_CONFIRM}
      okButtonProps={{ danger: true, disabled: !ready }}
      confirmLoading={remove.isPending}
    >
      {isLoading || !preview ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : nothing ? (
        <p className="mt-0">{STORAGE_MANAGER_LABEL.NOTHING_TO_DELETE}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="m-0 font-medium">
            {STORAGE_MANAGER_LABEL.DELETE_SUMMARY.replace(
              "{files}",
              fileCount(preview.fileCount),
            ).replace("{size}", formatBytes(preview.bytes))}
          </p>
          <Alert
            type="warning"
            showIcon
            message={STORAGE_MANAGER_LABEL.DELETE_PERMANENT}
          />
          {locked > 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-sm">
                {STORAGE_MANAGER_LABEL.DELETE_LOCKED.replace(
                  "{count}",
                  String(locked),
                ).replace("{word}", DELETE_CONFIRM_WORD)}
              </span>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={DELETE_CONFIRM_WORD}
                autoComplete="off"
              />
            </label>
          )}
        </div>
      )}
    </Modal>
  );
}
