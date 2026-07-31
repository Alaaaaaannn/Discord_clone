import { initProfile } from "@/lib/init-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const { inviteCode } = await params;
  if (!inviteCode) {
    return redirect("/");
  }

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: `/invite/${inviteCode}` });
  }

  // initProfile, not currentProfile: someone following an invite link as their
  // first visit has a Clerk session but no Profile row yet. currentProfile would
  // return null and send them to sign-in, which Clerk bounces straight back
  // here -> infinite redirect loop.
  const profile = await initProfile();

  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  // Invalid or expired invite code (e.g. the link was regenerated): send home
  // instead of letting `update` throw on a missing record.
  const serverToJoin = await prisma.server.findUnique({
    where: {
      inviteCode,
    },
  });

  if (!serverToJoin) {
    return redirect("/");
  }

  const server = await prisma.server.update({
    where: {
      inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return redirect("/");
};

export default InviteCodePage;
