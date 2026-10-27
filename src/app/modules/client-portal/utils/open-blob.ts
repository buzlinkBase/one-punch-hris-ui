import { clientPortalApi } from "../services/client-portal.api";

/**
 * Opens a protected portal file (printout, proof, certificate) in a new browser tab -- printouts
 * open there, not in an in-app preview. The tab opens before the download, while still inside
 * the click: opened after an await, popup blockers treat it as unrequested and block it. A failed
 * download closes the tab again; the error interceptor has already said why.
 */
export async function openPortalFile(path: string, type?: string) {
  const tab = window.open("about:blank", "_blank");
  try {
    const blob = await clientPortalApi.fetchBlob(path);
    const url = URL.createObjectURL(type ? new Blob([blob], { type }) : blob);
    if (tab) tab.location.href = url;
    // Give the new tab time to read it before the address is released.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    tab?.close();
  }
}

/** Saves a protected portal file under the given name. */
export async function savePortalFile(path: string, fileName: string) {
  const blob = await clientPortalApi.fetchBlob(path);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
