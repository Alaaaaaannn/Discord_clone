"use client";

import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

interface DmItemProps {
  profileId: string;
  name: string;
  imageUrl: string;
  subtitle?: string;
}

export const DmItem = ({
  profileId,
  name,
  imageUrl,
  subtitle,
}: DmItemProps) => {
  const params = useParams();
  const router = useRouter();
  const isActive = params?.profileId === profileId;

  return (
    <button
      onClick={() => router.push(`/me/${profileId}`)}
      className={cn(
        "group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
        isActive && "bg-zinc-700/20 dark:bg-[#1a1a1e]",
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8" />
        <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#F2F3F5] bg-emerald-500 dark:border-[#2B2D31]" />
      </div>
      <div className="min-w-0 text-left">
        <p
          className={cn(
            "truncate text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300",
            isActive && "text-primary dark:text-zinc-200",
          )}
        >
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
