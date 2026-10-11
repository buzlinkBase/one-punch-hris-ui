/** Mirrors hrms-api ImageUploads: PNG, JPG or WebP, at most 2 MB. */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

const ALLOWED_TYPES = IMAGE_ACCEPT.split(",");

/**
 * Why this file can't be uploaded, or null when it's fine. The server checks the file's real
 * bytes too; this just saves a round trip for the obvious cases.
 */
/** A picked file that's cropped and shrunk before upload may start out much larger. */
export const IMAGE_SOURCE_MAX_BYTES = 20 * 1024 * 1024;

/** Why a picked file can't be cropped, or null when it's fine (checked before the crop dialog). */
export function imageSourceProblem(
  file: Pick<File, "type" | "size">,
): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Choose a PNG, JPG or WebP image.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > IMAGE_SOURCE_MAX_BYTES)
    return "The image is too large. Choose one under 20 MB.";
  return null;
}

export function imageFileProblem(
  file: Pick<File, "type" | "size">,
): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Choose a PNG, JPG or WebP image.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > IMAGE_MAX_BYTES)
    return "The image is too large. The limit is 2 MB.";
  return null;
}
