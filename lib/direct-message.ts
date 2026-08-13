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
export const withMemberShape = <
  T extends { profileId: string; profile: Profile },
>(
  message: T,
) => ({
  ...message,
  member: {
    id: message.profileId,
    role: MemberRole.GUEST,
    profileId: message.profileId,
    profile: message.profile,
  },
});

/** The Member-shaped stand-in for the signed-in user in a DM. */
export const asCurrentMember = (profile: Profile) => ({
  id: profile.id,
  role: MemberRole.GUEST,
  profileId: profile.id,
  profile,
});
