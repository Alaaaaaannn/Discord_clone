"use client";

import { useState } from "react";
import { Headphones, Mic, MicOff, Settings } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";

interface UserDockProps {
  name: string;
  imageUrl: string;
}

/**
 * The bar pinned to the bottom of the second column (channel list / DM list),
 * mirroring Discord's user panel.
 *
 * Mic and headphone toggles are local UI state — they mute the controls, not a
 * live call, since LiveKit owns the actual devices inside MediaRoom.
 */
export const UserDock = ({ name, imageUrl }: UserDockProps) => {
  const { openUserProfile } = useClerk();
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const MicIcon = muted ? MicOff : Mic;

  return (
    <div className="mt-auto flex items-center mx-2 my-4 rounded-2xl gap-x-1 bg-[#EBEDEF] px-2 py-3 dark:bg-[#202024]">
      <button
        onClick={() => openUserProfile()}
        className="flex min-w-0 flex-1 items-center gap-x-2 rounded-md p-1 transition hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40"
      >
        <div className="relative shrink-0">
          <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8" />
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#EBEDEF] bg-emerald-500 dark:border-[#232428]" />
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {name}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            Online
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center">
        <ActionTooltip side="top" label={muted ? "Unmute" : "Mute"}>
          <button
            onClick={() => setMuted((value) => !value)}
            className={cn(
              "rounded-md p-1.5 transition hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40",
              muted && "text-rose-500",
            )}
          >
            <MicIcon className="h-5 w-5" />
          </button>
        </ActionTooltip>

        <ActionTooltip side="top" label={deafened ? "Undeafen" : "Deafen"}>
          <button
            onClick={() => setDeafened((value) => !value)}
            className={cn(
              "rounded-md p-1.5 transition hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40",
              deafened && "text-rose-500",
            )}
          >
            <Headphones className="h-5 w-5" />
          </button>
        </ActionTooltip>

        <ActionTooltip side="top" label="User settings">
          <button
            onClick={() => openUserProfile()}
            className="rounded-md p-1.5 transition hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40"
          >
            <Settings className="h-5 w-5" />
          </button>
        </ActionTooltip>
      </div>
    </div>
  );
};
