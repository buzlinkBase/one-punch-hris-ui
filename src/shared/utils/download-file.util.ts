import httpClient from "@/core/http/http-client";
import { message } from "antd";

/**
 * Opens a backend-generated PDF in a new tab. Mirrors the pattern already used for
 * payslip/payroll-summary/201 printing — the tab is opened synchronously (before the
 * await) so popup blockers treat it as a direct response to the click.
 */
export async function openPdfInNewTab(
  url: string,
  params?: Record<string, string | number>,
) {
  const printTab = window.open("about:blank", "_blank");
  try {
    const blob = await httpClient.get<Blob>(url, {
      params,
      responseType: "blob",
    });
    const objectUrl = URL.createObjectURL(blob);
    if (printTab) printTab.location.href = objectUrl;
  } catch {
    printTab?.close();
    message.error("Failed to generate the document. Please try again.");
  }
}

/**
 * Downloads a backend-generated file (CSV/DAT/etc — anything not meant to display inline)
 * by saving the response blob via a synthetic anchor click.
 */
export async function downloadBlobFile(
  url: string,
  params: Record<string, string | number> | undefined,
  filename: string,
) {
  try {
    const blob = await httpClient.get<Blob>(url, {
      params,
      responseType: "blob",
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    message.error("Failed to generate the file. Please try again.");
  }
}
