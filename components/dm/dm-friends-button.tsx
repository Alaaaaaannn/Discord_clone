"use client";

import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { cn } from "@/lib/utils";

export const DmFriendsButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === "/me";

  return (
    <button
      onClick={() => router.push("/me")}
      className={cn(
        "group flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
        isActive && "bg-zinc-700/20 dark:bg-zinc-700",
      )}
    >
      <Users className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300",
          isActive && "text-primary dark:text-zinc-200",
        )}
      >
        Friends
      </p>
    </button>
  );
};
