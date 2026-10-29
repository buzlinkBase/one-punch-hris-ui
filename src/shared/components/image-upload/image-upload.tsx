import { useRef, useState, type ReactNode } from "react";
import { Avatar, Button, Space, Spin, message } from "antd";
import {
  CameraOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { problemDetail } from "@/core/auth/guard-error";
import {
  IMAGE_ACCEPT,
  imageFileProblem,
  imageSourceProblem,
} from "./image-file";
import { CROP_PRESETS, type CropPresetName } from "./image-processing";
import { ImageCropModal } from "./image-crop-modal";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

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
  /**
   * Frame the picked image in a crop dialog, then shrink it before upload ("photo": a square,
   * "logo": its own shape). Without it the file is uploaded as picked.
   */
  crop?: CropPresetName;
}

// Set through antd's own size prop -- antd's .ant-avatar sizing outranks utility classes.
const SIZE = { circle: 72, square: 96 } as const;

// Look-and-feel lives in index.css (.image-upload-*), which also outranks antd's styles.
function avatarClass(shape: "circle" | "square", hasImage: boolean): string {
  if (shape === "square") return "image-upload-avatar is-logo";
  return hasImage ? "image-upload-avatar" : "image-upload-avatar is-empty";
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
  disabled: disabledProp,
  hint,
  label,
  compact,
  crop,
}: ImageUploadProps) {
  // A closed company (read-only, suspended, on hold) shows the image but takes no change.
  const closed = useCompanyClosed();
  const disabled = disabledProp || closed;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // The file waiting in the crop dialog, its preview URL, and a new key per pick so the dialog
  // starts fresh. The URL is created on pick and released on close -- in event handlers, never
  // an effect.
  const [cropping, setCropping] = useState<{
    file: File;
    source: string;
    key: number;
  } | null>(null);
  const locked = disabled || busy;

  const closeCrop = () => {
    if (cropping) URL.revokeObjectURL(cropping.source);
    setCropping(null);
  };

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

  // A picked file goes to the crop dialog first when cropping is on, else straight up.
  const picked = (file: File) => {
    if (!crop) {
      void upload(file);
      return;
    }
    const problem = imageSourceProblem(file);
    if (problem) {
      message.error(problem);
      return;
    }
    setCropping({ file, source: URL.createObjectURL(file), key: Date.now() });
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
      className={`image-upload-trigger ${shape === "circle" ? "is-circle" : "is-square"}`}
    >
      <Avatar
        shape={shape}
        size={SIZE[shape]}
        src={value || undefined}
        icon={!value ? placeholder : undefined}
        className={avatarClass(shape, Boolean(value))}
      />
      {!disabled && (
        <span className={`image-upload-overlay ${busy ? "is-busy" : ""}`}>
          {busy ? <Spin size="small" /> : <CameraOutlined />}
        </span>
      )}
    </button>
  );

  const fileInput = (
    // The hidden attribute, not a class: nothing can ever show the bare "Choose File" box.
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_ACCEPT}
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) picked(file);
      }}
    />
  );

  const fileInputAndCrop = (
    <>
      {fileInput}
      {crop && cropping && (
        <ImageCropModal
          key={cropping.key}
          file={cropping.file}
          source={cropping.source}
          preset={CROP_PRESETS[crop]}
          label={label}
          onCancel={closeCrop}
          onDone={(processed) => {
            closeCrop();
            void upload(processed);
          }}
        />
      )}
    </>
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
        {fileInputAndCrop}
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
      {fileInputAndCrop}
    </div>
  );
}
