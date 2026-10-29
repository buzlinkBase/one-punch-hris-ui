import { useRef, useState } from "react";
import { Button, Popconfirm, Spin, message } from "antd";
import {
  DeleteOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { problemDetail } from "@/core/auth/guard-error";
import {
  useAttachments,
  useAttachmentsEnabled,
} from "@/shared/hooks/use-attachment-queries";
import type {
  AttachmentOwnerType,
  AttachmentResponse,
} from "@/shared/types/attachment.model";
import {
  ATTACHMENT_ACCEPT_ALL,
  ATTACHMENT_ACCEPT_IMAGES,
  ATTACHMENT_MAX_FILES,
  attachmentFileProblem,
  formatFileSize,
  isImageType,
} from "@/shared/utils/attachment-file.util";
import { openAttachment } from "./open-attachment";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

interface AttachmentFieldProps {
  ownerType: AttachmentOwnerType;
  /**
   * The saved record the files belong to. Leave it out on a form whose record doesn't exist yet:
   * files are then staged, and the form claims them once the record is saved
   * (`useLinkAttachments`, or `attachmentIds` in the save payload).
   */
  ownerId?: string;
  /** Heading above the list. */
  label?: string;
  /** Only photos (PNG, JPG, WebP), e.g. for an asset. */
  imagesOnly?: boolean;
  /** Show the files but allow no changes, e.g. on a decided application. */
  readOnly?: boolean;
}

/**
 * The files of a record: list, open, add several at once, remove. Hidden when the company hasn't
 * turned attachments on for this feature (Company Policy > Attachments) and there is nothing to
 * show; when it is off but files already exist they stay visible and removable, but nothing new
 * can be added.
 */
export function AttachmentField({
  ownerType,
  ownerId,
  label = "Attachments",
  imagesOnly,
  readOnly: readOnlyProp,
}: AttachmentFieldProps) {
  // A closed company (read-only, suspended, on hold) still lists and opens files, but changes none.
  const closed = useCompanyClosed();
  const readOnly = readOnlyProp || closed;
  const enabled = useAttachmentsEnabled(ownerType);
  const { files, upload, remove } = useAttachments(ownerType, ownerId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const items = files.data ?? [];
  const canAdd =
    enabled && !readOnly && !busy && items.length < ATTACHMENT_MAX_FILES;
  if (!enabled && items.length === 0) return null;

  async function addFiles(picked: File[]) {
    setBusy(true);
    let count = items.length;
    try {
      for (const file of picked) {
        if (count >= ATTACHMENT_MAX_FILES) {
          message.warning(`Only ${ATTACHMENT_MAX_FILES} files are allowed.`);
          break;
        }
        const problem = attachmentFileProblem(file, imagesOnly);
        if (problem) {
          message.error(`${file.name}: ${problem}`);
          continue;
        }
        try {
          await upload.mutateAsync(file);
          count += 1;
        } catch (err) {
          message.error(
            problemDetail(
              err,
              `Couldn't upload ${file.name}. Please try again.`,
            ),
          );
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function open(item: AttachmentResponse) {
    try {
      await openAttachment(item.id);
    } catch (err) {
      message.error(problemDetail(err, "Couldn't open the file."));
    }
  }

  async function removeFile(item: AttachmentResponse) {
    try {
      await remove.mutateAsync(item.id);
    } catch (err) {
      message.error(problemDetail(err, "Couldn't remove the file."));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          <PaperClipOutlined /> {label}
        </span>
        {enabled && !readOnly && (
          <Button
            size="small"
            icon={busy ? <Spin size="small" /> : <UploadOutlined />}
            disabled={!canAdd}
            onClick={() => inputRef.current?.click()}
          >
            Add files
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded border border-(--ant-color-border-secondary) px-2 py-1"
            >
              {isImageType(item.contentType) ? (
                <FileImageOutlined />
              ) : (
                <FilePdfOutlined />
              )}
              <Button
                type="link"
                size="small"
                className="h-auto! min-w-0 flex-1 justify-start! truncate p-0!"
                onClick={() => void open(item)}
              >
                {item.fileName}
              </Button>
              <span className="shrink-0 text-xs text-(--ant-color-text-secondary)">
                {formatFileSize(item.sizeBytes)}
              </span>
              {!readOnly && (
                <Popconfirm
                  title="Remove this file?"
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => removeFile(item)}
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Remove ${item.fileName}`}
                  />
                </Popconfirm>
              )}
            </li>
          ))}
        </ul>
      )}

      {enabled && !readOnly && (
        <div className="text-xs text-(--ant-color-text-secondary)">
          {imagesOnly ? "PNG, JPG or WebP" : "PNG, JPG, WebP or PDF"}, up to 5
          MB each, {ATTACHMENT_MAX_FILES} files at most.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={imagesOnly ? ATTACHMENT_ACCEPT_IMAGES : ATTACHMENT_ACCEPT_ALL}
        hidden
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (picked.length > 0) void addFiles(picked);
        }}
      />
    </div>
  );
}
