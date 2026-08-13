import { currentProfile } from "@/lib/current-profile";
import { withMemberShape } from "@/lib/direct-message";
import { directMessageInclude } from "@/lib/message-includes";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 12;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
    }

    // Only the two participants may read the thread.
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }],
      },
    });
    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const messages = await prisma.directMessage.findMany({
      take: MESSAGES_BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { conversationId },
      include: directMessageInclude,
      orderBy: { createdAt: "desc" },
    });

    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages.map(withMemberShape),
      nextCursor,
    });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
