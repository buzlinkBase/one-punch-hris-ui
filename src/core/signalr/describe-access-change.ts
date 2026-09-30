/** The parts of a session that decide what the user can see, before or after a refresh. */
export interface AccessSnapshot {
  tenantId?: string | null;
  tenantName?: string | null;
  roles: string[];
  permissions: string[];
}

export interface AccessChangeNotice {
  title: string;
  description: string;
}

/** Up to this many changed permissions are named one by one; more are counted. */
const NAMED_PERMISSION_LIMIT = 3;

const MENU_UPDATED = "Your menu has been updated.";

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function difference(a: string[], b: string[]): string[] {
  const other = new Set(b);
  return [...new Set(a)].filter((x) => !other.has(x)).sort();
}

/** "Payroll Analytics:View" -> "view Payroll Analytics". */
function describePermission(code: string): string {
  const [feature, action] = code.split(":");
  return action ? `${action.toLowerCase()} ${feature}` : code;
}

function describeRoles(added: string[], removed: string[]): string {
  if (added.length === 1 && removed.length === 1) {
    return `Your role changed from ${removed[0]} to ${added[0]}.`;
  }
  const parts: string[] = [];
  if (added.length) {
    parts.push(
      `You now have the ${joinNames(added)} role${added.length > 1 ? "s" : ""}.`,
    );
  }
  if (removed.length) {
    parts.push(
      `You no longer have the ${joinNames(removed)} role${removed.length > 1 ? "s" : ""}.`,
    );
  }
  return parts.join(" ");
}

function describePermissions(
  added: string[],
  removed: string[],
  roles: string[],
): string {
  if (added.length + removed.length <= NAMED_PERMISSION_LIMIT) {
    const parts: string[] = [];
    if (added.length) {
      parts.push(`You can now ${joinNames(added.map(describePermission))}.`);
    }
    if (removed.length) {
      parts.push(
        `You can no longer ${joinNames(removed.map(describePermission))}.`,
      );
    }
    return parts.join(" ");
  }

  const whose = roles.length === 1 ? `your ${roles[0]} role` : "your roles";
  const counts = [
    added.length ? `${plural(added.length, "permission")} added` : "",
    removed.length ? `${plural(removed.length, "permission")} removed` : "",
  ].filter(Boolean);
  return `An admin changed what ${whose} can do: ${counts.join(", ")}.`;
}

/**
 * The notice shown after an admin changed this user's access: names the company and says what
 * changed -- roles gained or lost, or (when only a role's permissions were edited) the screens
 * they can now or no longer use.
 */
export function describeAccessChange(
  before: AccessSnapshot,
  after: AccessSnapshot,
): AccessChangeNotice {
  const company = before.tenantName || after.tenantName || "this company";
  const title = `Your access in ${company} was updated`;

  // The refresh re-mints for the default company, so it can land somewhere else; comparing the
  // roles of two different companies would say something false.
  if (
    before.tenantId &&
    after.tenantId &&
    before.tenantId.toLowerCase() !== after.tenantId.toLowerCase()
  ) {
    return {
      title,
      description: `You're now working in ${after.tenantName || "your default company"}. ${MENU_UPDATED}`,
    };
  }

  const addedRoles = difference(after.roles, before.roles);
  const removedRoles = difference(before.roles, after.roles);
  if (addedRoles.length || removedRoles.length) {
    return {
      title,
      description: `${describeRoles(addedRoles, removedRoles)} ${MENU_UPDATED}`,
    };
  }

  const addedPermissions = difference(after.permissions, before.permissions);
  const removedPermissions = difference(before.permissions, after.permissions);
  if (addedPermissions.length || removedPermissions.length) {
    return {
      title,
      description: `${describePermissions(addedPermissions, removedPermissions, after.roles)} ${MENU_UPDATED}`,
    };
  }

  return { title, description: "Your menu has been refreshed." };
}
