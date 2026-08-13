import { FriendRequestStatus, Profile } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface FriendEntry {
  /** FriendRequest row id — what unfriending deletes. */
  id: string;
  profile: Profile;
}

/**
 * A friendship is a single FriendRequest row with status ACCEPTED. Either
 * profile may be the requester, so every lookup has to check both directions.
 *
 * Friendships are created by following someone's /friend/[friendCode] link.
 */
export const getFriends = async (
  profileId: string,
): Promise<FriendEntry[]> => {
  const accepted = await prisma.friendRequest.findMany({
    where: {
      status: FriendRequestStatus.ACCEPTED,
      OR: [{ requesterId: profileId }, { addresseeId: profileId }],
    },
    include: { requester: true, addressee: true },
    orderBy: { updatedAt: "desc" },
  });

  return accepted.map((row) => ({
    id: row.id,
    profile: row.requesterId === profileId ? row.addressee : row.requester,
  }));
};

export interface DmListEntry {
  profile: Profile;
  isFriend: boolean;
}

/**
 * What the DM sidebar shows: every conversation you have open, plus friends you
 * haven't messaged yet.
 *
 * Open conversations matter because you can DM anyone you share a server with
 * without being friends — those threads would otherwise be unreachable from the
 * Direct Messages section once you navigated away from the server.
 */
export const getDmList = async (profileId: string): Promise<DmListEntry[]> => {
  const [friends, conversations] = await Promise.all([
    getFriends(profileId),
    prisma.conversation.findMany({
      where: {
        OR: [{ profileOneId: profileId }, { profileTwoId: profileId }],
      },
      include: {
        profileOne: true,
        profileTwo: true,
        directMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
  ]);

  const friendIds = new Set(friends.map((entry) => entry.profile.id));

  // Most recently active conversations first; never-used ones sort last.
  const ordered = [...conversations].sort((a, b) => {
    const aAt = a.directMessages[0]?.createdAt?.getTime() ?? 0;
    const bAt = b.directMessages[0]?.createdAt?.getTime() ?? 0;
    return bAt - aAt;
  });

  const entries: DmListEntry[] = [];
  const seen = new Set<string>();

  for (const conversation of ordered) {
    const other =
      conversation.profileOneId === profileId
        ? conversation.profileTwo
        : conversation.profileOne;
    // A self-conversation would otherwise list you against yourself.
    if (other.id === profileId || seen.has(other.id)) continue;
    seen.add(other.id);
    entries.push({ profile: other, isFriend: friendIds.has(other.id) });
  }

  for (const entry of friends) {
    if (seen.has(entry.profile.id)) continue;
    seen.add(entry.profile.id);
    entries.push({ profile: entry.profile, isFriend: true });
  }

  return entries;
};

export const areFriends = async (a: string, b: string) => {
  const row = await prisma.friendRequest.findFirst({
    where: {
      status: FriendRequestStatus.ACCEPTED,
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
  return !!row;
};

/**
 * Who you may open a DM with: friends, plus anyone you share a server with
 * (which is how DMing a server member from the members list keeps working).
 */
export const canDirectMessage = async (a: string, b: string) => {
  if (await areFriends(a, b)) return true;

  const sharedServer = await prisma.server.findFirst({
    where: {
      AND: [
        { members: { some: { profileId: a } } },
        { members: { some: { profileId: b } } },
      ],
    },
    select: { id: true },
  });
  return !!sharedServer;
};
