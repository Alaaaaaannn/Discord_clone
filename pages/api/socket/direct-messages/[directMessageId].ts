import { currentProfilePages } from "@/lib/current-profile-pages";
import { withMemberShape } from "@/lib/direct-message";
import { prisma } from "@/lib/prisma";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const profile = await currentProfilePages(req);
    const { directMessageId, conversationId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation Id missing" });
    }

    // DMs are global now — the participants are profiles, not members.
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }],
      },
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    let message = await prisma.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: { profile: true },
    });
    if (!message || message.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    // A DM has no moderators — only the author may edit or delete.
    if (message.profileId !== profile.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      message = await prisma.directMessage.update({
        where: { id: directMessageId as string },
        data: {
          fileUrl: null,
          fileName: null,
          fileType: null,
          content: "This message has been deleted.",
          deleted: true,
        },
        include: { profile: true },
      });
    }

    if (req.method === "PATCH") {
      if (!content) {
        return res.status(400).json({ error: "Content missing" });
      }
      message = await prisma.directMessage.update({
        where: { id: directMessageId as string },
        data: { content },
        include: { profile: true },
      });
    }

    const updateKey = `chat:${conversationId}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, withMemberShape(message));
    return res.status(200).json(withMemberShape(message));
  } catch (error) {
    console.log("[DIRECT_MESSAGE_ID]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
