"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  MessageSquare,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";

import { Profile } from "@/generated/prisma";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrigin } from "@/hooks/use-origin";
import { cn } from "@/lib/utils";

interface FriendEntry {
  /** FriendRequest row id — what unfriending deletes. */
  id: string;
  profile: Profile;
}

interface FriendsClientProps {
  friends: FriendEntry[];
  friendCode: string;
  initialTab: Tab;
}

type Tab = "all" | "add";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "add", label: "Add Friend" },
];

export const FriendsClient = ({
  friends,
  friendCode,
  initialTab,
}: FriendsClientProps) => {
  const router = useRouter();
  const origin = useOrigin();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [code, setCode] = useState(friendCode);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inviteUrl = `${origin}/friend/${code}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const onNew = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.patch("/api/friends/invite-code");
      setCode(data.friendCode);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async (id: string) => {
    try {
      await axios.delete(`/api/friends/${id}`);
      startTransition(() => router.refresh());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full flex-col ">
      <div className="flex items-center gap-x-2 dark:bg-[#1a1a1e] border-b-2 border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <UserPlus className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <p className="mr-2 font-semibold text-black dark:text-white">Friends</p>
        {TABS.map((entry) => (
          <button
            key={entry.value}
            onClick={() => setTab(entry.value)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium text-zinc-500 transition hover:bg-zinc-700/10 dark:text-zinc-400 dark:hover:bg-zinc-700/50",
              tab === entry.value &&
                "bg-zinc-700/10 text-black dark:bg-zinc-700 dark:text-white",
              entry.value === "add" &&
                "bg-indigo-500 text-white hover:bg-indigo-500/90 dark:bg-indigo-500 dark:text-white",
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 dark:bg-[#1a1a1e]">
        {tab === "add" && (
          <div className="max-w-xl">
            <Label className="text-xs font-bold text-zinc-500 uppercase dark:text-secondary/70">
              Your friend invite link
            </Label>
            <div className="mt-2 flex items-center gap-x-2">
              <Input
                readOnly
                disabled={isLoading}
                value={inviteUrl}
                className="border-0 bg-zinc-300/50 px-3 text-black focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
              />
              <Button size="icon" variant="secondary" onClick={onCopy}>
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Share this link. Anyone who opens it is added to your friends
              straight away and lands in a DM with you.
            </p>
            <Button
              variant="link"
              size="sm"
              disabled={isLoading}
              onClick={onNew}
              className="mt-2 px-0 text-xs text-zinc-500 dark:text-zinc-400"
            >
              Generate a new link
              <RefreshCw />
            </Button>
          </div>
        )}

        {tab === "all" && (
          <>
            <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase dark:text-zinc-400">
              All friends — {friends.length}
            </p>
            {friends.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No friends yet. Share your invite link from the Add Friend tab.
              </p>
            )}
            {friends.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-x-3 rounded-md px-2 py-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
              >
                <UserAvatar
                  src={entry.profile.imageUrl}
                  className="h-8 w-8 md:h-8 md:w-8"
                />
                <p className="text-sm font-semibold text-black dark:text-white">
                  {entry.profile.name}
                </p>
                <div className="ml-auto flex items-center gap-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/me/${entry.profile.id}`)}
                  >
                    <MessageSquare />
                    Message
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => removeFriend(entry.id)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
