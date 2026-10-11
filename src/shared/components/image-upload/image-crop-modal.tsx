import { useState } from "react";
import { Modal, Slider } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { cropAndResize, type CropPreset } from "./image-processing";

interface ImageCropModalProps {
  /** The picked file. Mount with a new `key` per file so each starts fresh. */
  file: File;
  /**
   * A preview URL of `file`, owned by the caller (created when the file is picked, revoked when
   * the dialog closes). Not created here: React's dev-mode effect re-run would revoke it while
   * the cropper still shows it, leaving an empty box.
   */
  source: string;
  preset: CropPreset;
  /** What's being cropped, for the title: "photo", "logo". */
  label: string;
  /** Gets the cropped, resized image. */
  onDone: (file: File) => void;
  onCancel: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Frame the picked image: drag to move, scroll/pinch or the slider to zoom. A photo gets a round
 * guide (it's shown in a circle); a logo keeps its own shape by default, so "Use image" straight
 * away keeps the whole logo.
 */
export function ImageCropModal({
  file,
  source,
  preset,
  label,
  onDone,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [aspect, setAspect] = useState(preset.aspect ?? 1);
  const [area, setArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);

  const apply = async () => {
    if (!area) return;
    setProcessing(true);
    setFailed(false);
    try {
      onDone(await cropAndResize(file, area, preset));
    } catch {
      setFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      open
      title={`Adjust ${label}`}
      okText="Use image"
      onOk={apply}
      okButtonProps={{ disabled: !area, loading: processing }}
      onCancel={onCancel}
      cancelButtonProps={{ disabled: processing }}
      maskClosable={false}
    >
      <div className="relative h-72 w-full overflow-hidden rounded-lg bg-neutral-900">
        <Cropper
          image={source}
          crop={crop}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          aspect={aspect}
          cropShape={preset.cropShape}
          showGrid={preset.cropShape === "rect"}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
          onMediaLoaded={(media) => {
            // Logos keep their own shape unless the user zooms in.
            if (preset.aspect === null && media.naturalHeight > 0)
              setAspect(media.naturalWidth / media.naturalHeight);
          }}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ZoomOutOutlined
          aria-hidden
          className="text-(--ant-color-text-secondary)"
        />
        <Slider
          className="flex-1"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          onChange={setZoom}
          tooltip={{ open: false }}
          aria-label="Zoom"
        />
        <ZoomInOutlined
          aria-hidden
          className="text-(--ant-color-text-secondary)"
        />
      </div>
      <p className="mt-1 mb-0 text-xs text-(--ant-color-text-secondary)">
        Drag to move, scroll or pinch to zoom. The image is resized
        automatically and location details are removed.
      </p>
      {failed && (
        <p className="mt-2 mb-0 text-sm text-(--ant-color-error)">
          This image couldn't be processed. Try a different file.
        </p>
      )}
    </Modal>
  );
}
