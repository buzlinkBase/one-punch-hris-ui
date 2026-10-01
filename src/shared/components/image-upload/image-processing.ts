/** A rectangle in the source image's own pixels (react-easy-crop's croppedAreaPixels). */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CropPresetName = "photo" | "logo";

export interface CropPreset {
  /** Width ÷ height of the crop; null keeps the image's own shape. */
  aspect: number | null;
  cropShape: "round" | "rect";
  maxWidth: number;
  maxHeight: number;
  /** Tried first; falls back to `fallbackType` where the browser can't encode it. */
  outputType: "image/jpeg" | "image/webp";
  fallbackType: "image/jpeg" | "image/png";
  quality: number;
}

/**
 * Photos: a square, small enough to load instantly yet sharp in any avatar. Logos: their own
 * shape, WebP so a transparent background stays transparent (PNG where WebP can't be written).
 */
export const CROP_PRESETS: Record<CropPresetName, CropPreset> = {
  photo: {
    aspect: 1,
    cropShape: "round",
    maxWidth: 512,
    maxHeight: 512,
    outputType: "image/jpeg",
    fallbackType: "image/jpeg",
    quality: 0.85,
  },
  logo: {
    aspect: null,
    cropShape: "rect",
    maxWidth: 1024,
    maxHeight: 512,
    outputType: "image/webp",
    fallbackType: "image/png",
    quality: 0.9,
  },
};

/** The largest size within the bounds that keeps the shape -- never larger than the source. */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/png": ".png",
};

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Cuts `area` out of the image and shrinks it to the preset's size. Drawing onto a canvas and
 * saving it again also drops everything else the file carried -- camera details and, on phone
 * photos, the GPS location. `createImageBitmap` applies the photo's rotation first, the same way
 * the crop dialog showed it.
 */
export async function cropAndResize(
  file: File,
  area: CropArea,
  preset: CropPreset,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const size = fitWithin(
      area.width,
      area.height,
      preset.maxWidth,
      preset.maxHeight,
    );
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser can't process images.");
    context.imageSmoothingQuality = "high";
    if (preset.outputType === "image/jpeg") {
      // JPEG has no transparency: put transparent areas on white rather than black.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size.width, size.height);
    }
    context.drawImage(
      bitmap,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      size.width,
      size.height,
    );

    // A browser that can't write the requested type quietly returns PNG instead.
    let blob = await toBlob(canvas, preset.outputType, preset.quality);
    if (!blob || blob.type !== preset.outputType)
      blob = await toBlob(canvas, preset.fallbackType, preset.quality);
    if (!blob) throw new Error("The image couldn't be processed.");

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}${EXTENSIONS[blob.type] ?? ""}`, {
      type: blob.type,
    });
  } finally {
    bitmap.close();
  }
}
