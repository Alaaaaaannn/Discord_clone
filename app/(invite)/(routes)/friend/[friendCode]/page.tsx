import { FriendRequestStatus } from "@/generated/prisma";
import { initProfile } from "@/lib/init-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface FriendCodePageProps {
  params: Promise<{
    friendCode: string;
  }>;
}

/**
 * Friend-invite link, the personal counterpart to /invite/[inviteCode].
 * Following a valid link makes the two people friends immediately, the same way
 * a server invite joins you immediately.
 */
const FriendCodePage = async ({ params }: FriendCodePageProps) => {
  const { friendCode } = await params;
  if (!friendCode) {
    return redirect("/");
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: `/friend/${friendCode}` });
  }

  // initProfile, not currentProfile: someone following a friend link on their
  // first visit has a Clerk session but no Profile row yet.
  const profile = await initProfile();

  // Invalid or regenerated code.
  const owner = await prisma.profile.findUnique({ where: { friendCode } });
  if (!owner) {
    return redirect("/me");
  }

  // Your own link — nothing to do.
  if (owner.id === profile.id) {
    return redirect("/me");
  }

  // A row may already exist in either direction, at any status.
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { requesterId: profile.id, addresseeId: owner.id },
        { requesterId: owner.id, addresseeId: profile.id },
      ],
    },
  });

  if (existing) {
    if (existing.status !== FriendRequestStatus.ACCEPTED) {
      await prisma.friendRequest.update({
        where: { id: existing.id },
        data: { status: FriendRequestStatus.ACCEPTED },
      });
    }
  } else {
    await prisma.friendRequest.create({
      data: {
        requesterId: owner.id,
        addresseeId: profile.id,
        status: FriendRequestStatus.ACCEPTED,
      },
    });
  }

  return redirect(`/me/${owner.id}`);
};

export default FriendCodePage;
