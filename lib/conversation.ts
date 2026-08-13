import { prisma } from "@/lib/prisma";

const includeProfiles = {
  profileOne: true,
  profileTwo: true,
} as const;

/**
 * DMs are global: one conversation per pair of profiles, regardless of which
 * server (if any) the two people opened it from.
 */
export const getOrCreateConversation = async (
  profileOneId: string,
  profileTwoId: string,
) => {
  let conversation =
    (await findConversation(profileOneId, profileTwoId)) ||
    (await findConversation(profileTwoId, profileOneId));

  if (!conversation) {
    conversation = await createNewConversation(profileOneId, profileTwoId);
  }
  return conversation;
};

const findConversation = async (
  profileOneId: string,
  profileTwoId: string,
) => {
  try {
    return await prisma.conversation.findFirst({
      where: {
        AND: [{ profileOneId }, { profileTwoId }],
      },
      include: includeProfiles,
    });
  } catch {
    return null;
  }
};

const createNewConversation = async (
  profileOneId: string,
  profileTwoId: string,
) => {
  try {
    return await prisma.conversation.create({
      data: {
        profileOneId,
        profileTwoId,
      },
      include: includeProfiles,
    });
  } catch {
    return null;
  }
};
