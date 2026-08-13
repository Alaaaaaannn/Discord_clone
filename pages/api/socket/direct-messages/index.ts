import { currentProfilePages } from "@/lib/current-profile-pages";
import { withMemberShape } from "@/lib/direct-message";
import { directMessageInclude } from "@/lib/message-includes";
import { prisma } from "@/lib/prisma";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl, fileName, fileType, parentId } = req.body;
    const { conversationId } = req.query;
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation Id missing" });
    }
    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }],
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Guard the reply target: it must belong to this conversation.
    const validParentId = parentId
      ? (
          await prisma.directMessage.findFirst({
            where: {
              id: parentId as string,
              conversationId: conversationId as string,
            },
            select: { id: true },
          })
        )?.id ?? null
      : null;

    const message = await prisma.directMessage.create({
      data: {
        content,
        fileUrl,
        fileName,
        fileType,
        conversationId: conversationId as string,
        profileId: profile.id,
        parentId: validParentId,
      },
      include: directMessageInclude,
    });

    const channelKey = `chat:${conversationId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, withMemberShape(message));
    return res.status(200).json(withMemberShape(message));
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
