import type { UserLinkResponse } from "../models/api/response/user-link-response.model";
import type {
  UserKind,
  UserResponse,
  UserRow,
} from "../models/api/response/user-response.model";

export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

/** An invited member has no account yet, so no user id to link or show activity for. */
export function hasAccount(member: UserResponse): boolean {
  return !!member.userId && member.userId !== EMPTY_GUID;
}

const normalizeEmail = (email: string | null | undefined) =>
  (email ?? "").trim().toLowerCase();

interface LinkIndex {
  byUserId: Map<string, UserLinkResponse>;
  byEmail: Map<string, UserLinkResponse>;
}

type Classifier = (
  member: UserResponse,
  index: LinkIndex,
) => { kind: UserKind; link?: UserLinkResponse } | undefined;

// Tried in order; the first that recognises a member decides its kind.
const CLASSIFIERS: Classifier[] = [
  // An accepted account is known by its user id.
  (member, index) => {
    const link = hasAccount(member)
      ? index.byUserId.get(member.userId)
      : undefined;
    return link && { kind: link.type, link };
  },
  // An invite not yet accepted only has its email to go on.
  (member, index) => {
    const link = index.byEmail.get(normalizeEmail(member.email));
    return link && { kind: link.type, link };
  },
  // A client login is only recorded once its invite is accepted, so a pending client invite is
  // recognised by its role.
  (member) =>
    member.roles?.includes("Client") ? { kind: "Client" } : undefined,
];

/** Tags each member as an employee user, a client user, or other (admins, staff). */
export function classifyUsers(
  members: UserResponse[],
  links: UserLinkResponse[],
): UserRow[] {
  const index: LinkIndex = { byUserId: new Map(), byEmail: new Map() };
  for (const link of links) {
    if (link.userId) index.byUserId.set(link.userId, link);
    else index.byEmail.set(normalizeEmail(link.email), link);
  }

  return members.map((member) => {
    const match = CLASSIFIERS.reduce<ReturnType<Classifier>>(
      (found, classify) => found ?? classify(member, index),
      undefined,
    );
    return { ...member, kind: match?.kind ?? "Other", link: match?.link };
  });
}
