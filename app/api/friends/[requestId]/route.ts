import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ requestId: string }>;
}

/**
 * Unfriend. `requestId` is the FriendRequest row that represents the
 * friendship; either side may delete it.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { requestId } = await params;
    const request = await prisma.friendRequest.findFirst({
      where: {
        id: requestId,
        OR: [{ requesterId: profile.id }, { addresseeId: profile.id }],
      },
    });
    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.friendRequest.delete({ where: { id: requestId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[FRIEND_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
