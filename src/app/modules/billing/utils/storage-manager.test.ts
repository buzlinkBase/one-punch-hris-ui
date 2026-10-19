import { describe, expect, it } from "vitest";
import {
  DELETE_CONFIRM_WORD,
  canConfirmDelete,
  fileCount,
  formatBytes,
} from "./storage-manager";

describe("formatBytes", () => {
  it("picks the unit people read", () => {
    expect(formatBytes(1)).toBe("1 byte");
    expect(formatBytes(820)).toBe("820 bytes");
    expect(formatBytes(14_540)).toBe("14.2 KB");
    expect(formatBytes(3.5 * 1024 * 1024)).toBe("3.5 MB");
    expect(formatBytes(1.25 * 1024 * 1024 * 1024)).toBe("1.25 GB");
  });
});

describe("fileCount", () => {
  it("is singular for one file", () => {
    expect(fileCount(1)).toBe("1 file");
    expect(fileCount(2)).toBe("2 files");
  });
});

describe("canConfirmDelete", () => {
  it("needs the typed word only when decided records are involved", () => {
    expect(canConfirmDelete(0, "")).toBe(true);
    expect(canConfirmDelete(3, "")).toBe(false);
    expect(canConfirmDelete(3, "delete")).toBe(false);
    expect(canConfirmDelete(3, ` ${DELETE_CONFIRM_WORD} `)).toBe(true);
  });
});
