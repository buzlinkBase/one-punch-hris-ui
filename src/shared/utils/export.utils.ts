const x = (v: string) =>
  v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function buildFlatCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  return [
    headers.map(esc).join(","),
    ...rows.map((row) => row.map(esc).join(",")),
  ].join("\n");
}

export function buildFlatExcel(headers: string[], rows: string[][]): string {
  const th = (v: string) =>
    `<th style="border:1px solid #bbb;background:#f0f0f0;font-weight:bold;text-align:center;padding:3px 6px;white-space:nowrap">${x(v)}</th>`;
  const td = (v: string) =>
    `<td style="border:1px solid #ddd;padding:2px 5px;white-space:nowrap">${x(v)}</td>`;
  const head = `<tr>${headers.map(th).join("")}</tr>`;
  const body = rows.map((row) => `<tr>${row.map(td).join("")}</tr>`).join("");
  return `<html><head><meta charset="utf-8"/></head><body>
<table border="1" style="border-collapse:collapse;font-size:11px;font-family:Arial,sans-serif">
<thead>${head}</thead><tbody>${body}</tbody>
</table></body></html>`;
}

export function triggerDownload(
  content: string,
  filename: string,
  mimeType: string,
): void {
  if (mimeType.includes("excel")) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } else {
    const a = document.createElement("a");
    a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
