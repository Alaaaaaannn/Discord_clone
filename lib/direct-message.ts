import { MemberRole, Profile } from "@/generated/prisma";

/**
 * Direct messages are authored by a Profile, but ChatMessages/ChatItem are
 * shared with channel messages and expect a Member-shaped author.
 *
 * Rather than fork those components, DM payloads are given a synthetic `member`
 * at the API boundary. The role is always GUEST, which is what we want: it
 * makes ChatItem's "admins and moderators may delete others' messages" rule
 * inert in a DM, so only the author can delete their own message.
 */
const memberFrom = (profile: Profile) => ({
  id: profile.id,
  role: MemberRole.GUEST,
  profileId: profile.id,
  profile,
});

type DmLike = {
  profileId: string;
  profile: Profile;
  // A replied-to message, already loaded with its author.
  parent?: ({ profileId: string; profile: Profile } & object) | null;
};

export const withMemberShape = <T extends DmLike>(message: T) => ({
  ...message,
  member: memberFrom(message.profile),
  // The parent needs the same treatment, or the reply preview has no author.
  parent: message.parent
    ? { ...message.parent, member: memberFrom(message.parent.profile) }
    : null,
});

/** The Member-shaped stand-in for the signed-in user in a DM. */
export const asCurrentMember = (profile: Profile) => memberFrom(profile);
