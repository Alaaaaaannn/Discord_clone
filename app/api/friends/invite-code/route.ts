import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/** Regenerate your friend-invite code, invalidating any link already shared. */
export async function PATCH() {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { friendCode: uuidv4() },
    });

    return NextResponse.json({ friendCode: updated.friendCode });
  } catch (error) {
    console.log("[FRIEND_INVITE_CODE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
