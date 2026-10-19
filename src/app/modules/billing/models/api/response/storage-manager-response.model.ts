export interface StorageYearResponse {
  year: number;
  fileCount: number;
  bytes: number;
}

export interface StorageCategoryResponse {
  /** Stable id sent back on delete, e.g. "attachments-leave" or "unlinked". */
  category: string;
  label: string;
  fileCount: number;
  bytes: number;
  years: StorageYearResponse[];
}

/** The current company's stored files, grouped by category, then by year. */
export interface StorageBreakdownResponse {
  fileCount: number;
  bytes: number;
  categories: StorageCategoryResponse[];
}

export interface StoredFileResponse {
  key: string;
  fileName: string;
  sizeBytes: number;
  storedAtUtc: string;
  recordLabel: string | null;
  /** The record is already decided -- deleting its file needs the typed confirmation. */
  locked: boolean;
  /** False for a file uploaded moments ago whose form may still be saving. */
  deletable: boolean;
  attachmentId: string | null;
}

export interface StoredFilePageResponse {
  items: StoredFileResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StorageDeletePreviewResponse {
  fileCount: number;
  bytes: number;
  lockedCount: number;
}

export interface StorageDeleteResultResponse {
  deletedCount: number;
  freedBytes: number;
  failedCount: number;
}
