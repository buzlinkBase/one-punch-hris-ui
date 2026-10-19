const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

/** A size in bytes as people read it: "820 bytes", "14.2 KB", "3.5 MB", "1.25 GB". */
export function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${Number((bytes / GB).toFixed(2))} GB`;
  if (bytes >= MB) return `${Number((bytes / MB).toFixed(1))} MB`;
  if (bytes >= KB) return `${Number((bytes / KB).toFixed(1))} KB`;
  return `${bytes} ${bytes === 1 ? "byte" : "bytes"}`;
}

/** "12 files" / "1 file" */
export function fileCount(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "file" : "files"}`;
}

/** The word the user must type before files of decided records are deleted. */
export const DELETE_CONFIRM_WORD = "DELETE";

/** Whether the delete may go ahead: always without locked files, otherwise only once the word is typed. */
export function canConfirmDelete(lockedCount: number, typed: string): boolean {
  return lockedCount === 0 || typed.trim() === DELETE_CONFIRM_WORD;
}
