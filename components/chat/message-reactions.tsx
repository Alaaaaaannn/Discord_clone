"use client";

import { ChatReaction } from "@/types";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  reactions: ChatReaction[];
  currentProfileId: string;
  onToggle: (emoji: string) => void;
}

/**
 * The pills under a message. Reactions arrive as one row per person per emoji,
 * so they're grouped here for display.
 */
export const MessageReactions = ({
  reactions,
  currentProfileId,
  onToggle,
}: MessageReactionsProps) => {
  if (!reactions?.length) return null;

  const grouped = new Map<string, { count: number; mine: boolean }>();
  for (const reaction of reactions) {
    const entry = grouped.get(reaction.emoji) ?? { count: 0, mine: false };
    entry.count += 1;
    if (reaction.profileId === currentProfileId) entry.mine = true;
    grouped.set(reaction.emoji, entry);
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {[...grouped.entries()].map(([emoji, { count, mine }]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onToggle(emoji)}
          aria-label={`${emoji} ${count}${mine ? ", remove your reaction" : ""}`}
          className={cn(
            "flex items-center gap-x-1 rounded-md border px-1.5 py-0.5 text-xs transition cursor-pointer",
            mine
              ? "border-indigo-500 bg-indigo-500/15 text-indigo-400"
              : "border-transparent bg-zinc-300/40 text-zinc-500 hover:border-zinc-400 dark:bg-zinc-700/50 dark:text-zinc-300",
          )}
        >
          <span>{emoji}</span>
          <span className="font-semibold">{count}</span>
        </button>
      ))}
    </div>
  );
};
