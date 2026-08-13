import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import qs from "query-string";

import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";

interface MemberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>;
  searchParams: Promise<{
    video?: string;
    audio?: string;
  }>;
}

/**
 * DMs are global now, so a server-scoped conversation URL is just an alias:
 * resolve the member to their profile and hand off to /me/[profileId], which
 * is the same thread you'd get from the friends list.
 */
const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  const { serverId, memberId } = await params;
  const { video, audio } = await searchParams;

  const member = await prisma.member.findFirst({
    where: { id: memberId, serverId },
    select: { profileId: true },
  });

  if (!member) {
    return redirect(`/servers/${serverId}`);
  }

  return redirect(
    qs.stringifyUrl(
      {
        url: `/me/${member.profileId}`,
        query: { video, audio },
      },
      { skipNull: true },
    ),
  );
};

export default MemberIdPage;
