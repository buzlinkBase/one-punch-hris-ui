/** Which files to delete: a whole category + year, or the picked keys. */
export interface StorageDeleteRequest {
  category?: string;
  year?: number;
  keys?: string[];
  /** Required when any file belongs to a record that is already decided. */
  confirmLocked?: boolean;
}
