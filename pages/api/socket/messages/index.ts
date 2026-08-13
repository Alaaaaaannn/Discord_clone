import { currentProfilePages } from "@/lib/current-profile-pages";
import { messageInclude } from "@/lib/message-includes";
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
    const { serverId, channelId } = req.query;
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server Id missing" });
    }
    if (!channelId) {
      return res.status(400).json({ error: "Channel Id missing" });
    }
    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    const server = await prisma.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id,
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Guard the reply target: it must be a real message in this channel, or a
    // client could thread a message onto any other channel's message.
    const validParentId = parentId
      ? (
          await prisma.message.findFirst({
            where: { id: parentId as string, channelId: channelId as string },
            select: { id: true },
          })
        )?.id ?? null
      : null;

    const message = await prisma.message.create({
      data: {
        content,
        fileUrl,
        fileName,
        fileType,
        channelId: channelId as string,
        memberId: member.id,
        // Only accept a parent that lives in this same channel.
        parentId: validParentId,
      },
      include: messageInclude,
    });
    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
