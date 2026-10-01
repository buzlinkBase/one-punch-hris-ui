import { useRef, useState, type ReactNode } from "react";
import { Avatar, Button, Space, Spin, message } from "antd";
import {
  CameraOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { problemDetail } from "@/core/auth/guard-error";
import { IMAGE_ACCEPT, imageFileProblem } from "./image-file";

interface ImageUploadProps {
  /** What to show now: a link or inline image; empty for none. */
  value?: string | null;
  /** "circle" for a person's photo, "square" for a logo. */
  shape?: "circle" | "square";
  /** Shown when there's no image. */
  placeholder: ReactNode;
  /** Stores the chosen file. Rejects with a message to show when it fails. */
  onUpload: (file: File) => Promise<unknown>;
  /** Removes the image; Remove is hidden without it. */
  onRemove?: () => Promise<unknown>;
  disabled?: boolean;
  /** e.g. "PNG, JPG or WebP, up to 2 MB." */
  hint?: string;
  /** What the image is, for messages and screen readers: "logo", "photo". */
  label: string;
  /** Just the image (click it to change) and a small Remove link -- for tight headers. */
  compact?: boolean;
}

const SIZE = { circle: "size-[72px]", square: "size-24" } as const;

function avatarClass(shape: "circle" | "square", hasImage: boolean): string {
  const base = `${SIZE[shape]} flex! items-center justify-center text-3xl`;
  if (shape === "square")
    return `${base} bg-(--ant-color-fill-tertiary)! text-(--ant-color-text-tertiary)! [&_img]:object-contain`;
  return hasImage ? base : `${base} bg-[#1DA081]!`;
}

/**
 * Pick-and-upload for a single image (a logo or a profile photo). Checks the file first, shows a
 * spinner while it uploads, and offers Change / Remove. The image itself is clickable too.
 */
export function ImageUpload({
  value,
  shape = "circle",
  placeholder,
  onUpload,
  onRemove,
  disabled,
  hint,
  label,
  compact,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const locked = disabled || busy;

  const choose = () => {
    if (!locked) inputRef.current?.click();
  };

  const upload = async (file: File) => {
    const problem = imageFileProblem(file);
    if (problem) {
      message.error(problem);
      return;
    }
    setBusy(true);
    try {
      await onUpload(file);
    } catch (err) {
      message.error(
        problemDetail(err, `Couldn't upload the ${label}. Please try again.`),
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!onRemove) return;
    setBusy(true);
    try {
      await onRemove();
    } catch (err) {
      message.error(
        problemDetail(err, `Couldn't remove the ${label}. Please try again.`),
      );
    } finally {
      setBusy(false);
    }
  };

  const image = (
    <button
      type="button"
      onClick={choose}
      disabled={locked}
      aria-label={value ? `Change ${label}` : `Upload ${label}`}
      title={
        disabled ? undefined : value ? `Change ${label}` : `Upload ${label}`
      }
      className={`group relative shrink-0 cursor-pointer overflow-hidden border-0 bg-transparent p-0 disabled:cursor-not-allowed ${
        shape === "circle" ? "rounded-full" : "rounded-lg"
      }`}
    >
      <Avatar
        shape={shape}
        src={value || undefined}
        icon={!value ? placeholder : undefined}
        className={avatarClass(shape, Boolean(value))}
      />
      {!disabled && (
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/35 text-xl text-white transition-opacity ${
            busy
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          {busy ? <Spin size="small" /> : <CameraOutlined />}
        </span>
      )}
    </button>
  );

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_ACCEPT}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) void upload(file);
      }}
    />
  );

  if (compact) {
    return (
      <div className="flex shrink-0 flex-col items-center">
        {image}
        {value && onRemove && !disabled && (
          <Button
            type="link"
            size="small"
            danger
            onClick={remove}
            disabled={busy}
            className="h-auto! px-0! text-xs"
          >
            Remove
          </Button>
        )}
        {fileInput}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {image}
      <div className="min-w-0">
        {!disabled && (
          <Space wrap size="small">
            <Button
              size="small"
              icon={<UploadOutlined />}
              onClick={choose}
              disabled={busy}
            >
              {value ? "Change" : "Upload"}
            </Button>
            {value && onRemove && (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={remove}
                disabled={busy}
              >
                Remove
              </Button>
            )}
          </Space>
        )}
        {hint && (
          <div className="mt-1 text-xs text-(--ant-color-text-secondary)">
            {hint}
          </div>
        )}
      </div>
      {fileInput}
    </div>
  );
}
