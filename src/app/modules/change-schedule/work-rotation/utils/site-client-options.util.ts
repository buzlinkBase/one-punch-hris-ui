// Client + Project Site pickers for a Work Rotation day. The client comes first and narrows the
// sites to its own; a site that belongs to a client fills the client in. With no client picked,
// every site is open.

export interface SiteLite {
  id: string;
  code: string;
  name: string;
  clientId?: string | null;
  clientName?: string | null;
}

export interface SiteOption {
  value: string;
  label: string;
}

export interface SiteOptionGroup {
  label: string;
  options: SiteOption[];
}

const NO_CLIENT_GROUP = "Not tied to a client";

const toOption = (s: SiteLite): SiteOption => ({
  value: s.id,
  label: `${s.code} - ${s.name}`,
});

const byLabel = (a: SiteOption, b: SiteOption) =>
  a.label.localeCompare(b.label);

// The sites to offer. With a client picked: only that client's own sites. Without one: every
// site, grouped under its client, client-less sites last. Empty
// groups are left out. keepSiteId is the site already picked: it always stays listed (under
// "Currently set") even when it no longer fits the client, so an older entry never shows a bare id.
export function siteOptionGroups(
  sites: SiteLite[],
  clientId: string | null,
  clientNameOf: (id: string) => string = (id) => id,
  keepSiteId: string | null = null,
): SiteOptionGroup[] {
  const untied = sites.filter((s) => !s.clientId);

  if (clientId) {
    const own = sites.filter((s) => s.clientId === clientId);
    const groups = [
      {
        label: `${clientNameOf(clientId)} sites`,
        options: own.map(toOption).sort(byLabel),
      },
    ];
    const kept = sites.find((s) => s.id === keepSiteId);
    if (kept && !own.includes(kept))
      groups.push({ label: "Currently set", options: [toOption(kept)] });
    return groups.filter((g) => g.options.length > 0);
  }

  const byClient = new Map<string, SiteLite[]>();
  for (const s of sites) {
    if (!s.clientId) continue;
    const list = byClient.get(s.clientId) ?? [];
    list.push(s);
    byClient.set(s.clientId, list);
  }
  const groups = [...byClient.entries()]
    .map(([id, list]) => ({
      label: list[0].clientName || clientNameOf(id),
      options: list.map(toOption).sort(byLabel),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return [
    ...groups,
    { label: NO_CLIENT_GROUP, options: untied.map(toOption).sort(byLabel) },
  ].filter((g) => g.options.length > 0);
}

// After the client changes: keep the picked site if it still fits (it belongs to the new client,
// or the client was cleared); otherwise drop it.
export function siteAfterClientChange(
  sites: SiteLite[],
  newClientId: string | null,
  currentSiteId: string | null,
): string | null {
  if (!currentSiteId || !newClientId) return currentSiteId;
  const site = sites.find((s) => s.id === currentSiteId);
  if (!site) return null;
  return site.clientId === newClientId ? currentSiteId : null;
}

// After a site is picked: a site that belongs to a client fills the client in; a client-less site,
// or clearing the site, leaves whatever client was already chosen.
export function clientAfterSiteChange(
  sites: SiteLite[],
  newSiteId: string | null,
  currentClientId: string | null,
): string | null {
  if (!newSiteId) return currentClientId;
  return sites.find((s) => s.id === newSiteId)?.clientId ?? currentClientId;
}

// Whether the picked client and the picked site's own client disagree. The pickers prevent this for
// new choices, so it only shows for an older entry saved before they narrowed each other.
export function clientSiteMismatch(
  sites: SiteLite[],
  clientId: string | null,
  siteId: string | null,
): SiteLite | null {
  if (!clientId || !siteId) return null;
  const site = sites.find((s) => s.id === siteId);
  return site?.clientId && site.clientId !== clientId ? site : null;
}
