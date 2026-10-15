/** Opens a downloaded file in a new browser tab (printouts open there, not in an in-app preview). */
export function openBlobInNewTab(blob: Blob, type: string): void {
  const url = URL.createObjectURL(new Blob([blob], { type }));
  window.open(url, "_blank", "noopener");
  // Give the new tab time to read it before the address is released.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Saves a downloaded file under the given name. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
