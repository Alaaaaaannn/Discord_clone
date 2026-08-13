import { auth } from "@clerk/nextjs/server";

import { currentProfile } from "@/lib/current-profile";
import { getFriends } from "@/lib/friends";
import { FriendsClient } from "@/components/dm/friends-client";

interface MePageProps {
  searchParams: Promise<{ tab?: string }>;
}

const MePage = async ({ searchParams }: MePageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  const { tab } = await searchParams;
  const initialTab = tab === "add" ? "add" : "all";

  const friends = await getFriends(profile.id);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#313338]">
      <FriendsClient
        friends={friends}
        friendCode={profile.friendCode}
        initialTab={initialTab}
      />
    </div>
  );
};

export default MePage;
