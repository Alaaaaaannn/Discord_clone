import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { currentProfile } from "@/lib/current-profile";
import { getDmList } from "@/lib/friends";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserDock } from "@/components/user-dock";
import { DmItem } from "./dm-item";
import { DmFriendsButton } from "./dm-friends-button";
import { AddFriendButton } from "./add-friend-button";

/**
 * Replaces the server sidebar while in the Direct Messages section.
 */
export const DmSidebar = async () => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/");
  }

  // Friends plus anyone you have an open DM with — including server members
  // you're not friends with.
  const entries = await getDmList(profile.id);

  return (
    <div className="flex h-full  w-full flex-col bg-[#F2F3F5] text-primary dark:bg-[#121214]">
      <div className="border-b-2 border-neutral-200 px-3 dark:border-neutral-800">
        <div className="flex h-12 items-center">
          <p className="text-md font-semibold">Direct Messages</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 pt-2">
        <DmFriendsButton />

        <div className="mt-4 mb-1 flex items-center justify-between px-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
            Direct Messages
          </p>
          <AddFriendButton />
        </div>

        {entries.length === 0 && (
          <div className="flex flex-col items-center gap-y-1 px-2 py-6 text-center">
            <Users className="h-6 w-6 text-zinc-400" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No conversations yet. Share your invite link, or message someone
              from a server.
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <DmItem
            key={entry.profile.id}
            profileId={entry.profile.id}
            name={entry.profile.name}
            imageUrl={entry.profile.imageUrl}
            subtitle={entry.isFriend ? undefined : "Server member"}
          />
        ))}
      </ScrollArea>

      <UserDock name={profile.name} imageUrl={profile.imageUrl} />
    </div>
  );
};
