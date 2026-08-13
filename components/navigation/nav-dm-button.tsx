"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

export const NavDmButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname?.startsWith("/me") ?? false;

  return (
    <ActionTooltip side="right" align="center" label="Direct Messages">
      <button
        onClick={() => router.push("/me")}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 w-[4px] rounded-r-full bg-primary transition-all",
            !isActive && "group-hover:h-[20px]",
            isActive ? "h-[36px]" : "h-[8px]",
          )}
        />
        <div
          className={cn(
            "relative mx-3 flex h-[48px] w-[48px] rounded-[16px] items-center justify-center overflow-hidden bg-background transition-all group-hover:rounded-[16px] group-hover:bg-indigo-500 dark:group-hover:bg-emerald-500 cursor-pointer group-hover:text-white dark:bg-zinc-800",
            isActive && " bg-indigo-500 text-white",
          )}
        >
          <MessageSquare className="h-6 w-6" />
        </div>
      </button>
    </ActionTooltip>
  );
};
