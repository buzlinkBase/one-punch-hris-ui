/** Mirrors hrms-api AttachmentFiles: PNG, JPG, WebP or PDF, at most 5 MB, at most 5 per record. */
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 5;

export const ATTACHMENT_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ATTACHMENT_ACCEPT_ALL = [
  ...ATTACHMENT_IMAGE_TYPES,
  "application/pdf",
].join(",");
export const ATTACHMENT_ACCEPT_IMAGES = ATTACHMENT_IMAGE_TYPES.join(",");

/**
 * Why this file can't be uploaded, or null when it's fine. The server checks the file's real
 * bytes too; this just saves a round trip for the obvious cases.
 */
export function attachmentFileProblem(
  file: Pick<File, "type" | "size">,
  imagesOnly = false,
): string | null {
  const allowed = (
    imagesOnly ? ATTACHMENT_ACCEPT_IMAGES : ATTACHMENT_ACCEPT_ALL
  ).split(",");
  if (!allowed.includes(file.type))
    return imagesOnly
      ? "Choose a PNG, JPG or WebP image."
      : "Choose a PNG, JPG, WebP image or a PDF.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > ATTACHMENT_MAX_BYTES)
    return "The file is too large. The limit is 5 MB.";
  return null;
}

/** "1.2 MB", "340 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function isImageType(contentType: string): boolean {
  return ATTACHMENT_IMAGE_TYPES.includes(contentType);
}
