import { currentProfilePages } from "@/lib/current-profile-pages";
import { withMemberShape } from "@/lib/direct-message";
import {
  directMessageInclude,
  messageInclude,
} from "@/lib/message-includes";
import { prisma } from "@/lib/prisma";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

/**
 * Toggle a reaction on a channel message or a DM.
 *
 * Reacting mutates an existing message, so this reuses the update channel that
 * edit/delete already emit on (`chat:<id>:messages:update`). useChatSocket
 * swaps the message in the cache by id, so reactions land live for everyone
 * with no extra socket wiring.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const profile = await currentProfilePages(req);
    const { emoji } = req.body;
    const { messageId, conversationId, channelId, serverId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ error: "Emoji missing" });
    }
    if (!messageId) {
      return res.status(400).json({ error: "Message Id missing" });
    }

    const isDirect = !!conversationId;

    if (isDirect) {
      // Must be a participant in the conversation.
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId as string,
          OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }],
        },
      });
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const target = await prisma.directMessage.findFirst({
        where: {
          id: messageId as string,
          conversationId: conversationId as string,
        },
      });
      if (!target || target.deleted) {
        return res.status(404).json({ message: "Message not found" });
      }

      const existing = await prisma.reaction.findFirst({
        where: {
          directMessageId: target.id,
          profileId: profile.id,
          emoji,
        },
      });

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.reaction.create({
          data: {
            emoji,
            profileId: profile.id,
            directMessageId: target.id,
          },
        });
      }

      const updated = await prisma.directMessage.findUnique({
        where: { id: target.id },
        include: directMessageInclude,
      });
      if (!updated) {
        return res.status(404).json({ message: "Message not found" });
      }

      const updateKey = `chat:${conversationId}:messages:update`;
      res?.socket?.server?.io?.emit(updateKey, withMemberShape(updated));
      return res.status(200).json(withMemberShape(updated));
    }

    // Channel message.
    if (!serverId || !channelId) {
      return res
        .status(400)
        .json({ error: "Server Id and Channel Id missing" });
    }

    // Must be a member of the server that owns the channel.
    const server = await prisma.server.findFirst({
      where: {
        id: serverId as string,
        members: { some: { profileId: profile.id } },
      },
      include: { members: true },
    });
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const member = server.members.find((m) => m.profileId === profile.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const target = await prisma.message.findFirst({
      where: { id: messageId as string, channelId: channelId as string },
    });
    if (!target || target.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existing = await prisma.reaction.findFirst({
      where: { messageId: target.id, profileId: profile.id, emoji },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({
        data: { emoji, profileId: profile.id, messageId: target.id },
      });
    }

    const updated = await prisma.message.findUnique({
      where: { id: target.id },
      include: messageInclude,
    });
    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    const updateKey = `chat:${channelId}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, updated);
    return res.status(200).json(updated);
  } catch (error) {
    console.log("[REACTIONS_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
