import { attachmentApi } from "@/shared/services/attachment.api";

/**
 * Opens an attachment in a new tab. The tab is opened first, inside the click, so the browser
 * doesn't block it while the link is fetched. Storage that can't make links (local disk) is
 * fetched through the API and shown from memory.
 */
export async function openAttachment(id: string): Promise<void> {
  const tab = window.open("", "_blank");
  try {
    const { url } = await attachmentApi.getLink(id);
    const target = url ?? URL.createObjectURL(await attachmentApi.download(id));
    if (tab) tab.location.href = target;
    else window.location.href = target;
  } catch (err) {
    tab?.close();
    throw err;
  }
}
