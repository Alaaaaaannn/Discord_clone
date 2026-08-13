"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";

export const AddFriendButton = () => {
  const router = useRouter();

  return (
    <ActionTooltip side="top" label="Add friend">
      <button
        onClick={() => router.push("/me?tab=add")}
        className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        <Plus className="h-4 w-4" />
      </button>
    </ActionTooltip>
  );
};
