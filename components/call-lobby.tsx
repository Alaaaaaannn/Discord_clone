"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Video } from "lucide-react";

import { MediaRoom } from "@/components/media-room";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

interface CallLobbyProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  /** Channel name (with #) or the other person's name. */
  name: string;
  /** Where "Cancel" goes — back to the server, or back to the DM's messages. */
  cancelHref: string;
  /** Only set for conversations, so the other person's avatar is shown. */
  imageUrl?: string;
}

/**
 * Confirmation screen shown before joining a call. MediaRoom is only mounted
 * after the user opts in, so landing on an audio/video channel (or opening a
 * call from a DM) never connects the mic or camera on its own.
 */
export const CallLobby = ({
  chatId,
  video,
  audio,
  name,
  cancelHref,
  imageUrl,
}: CallLobbyProps) => {
  const router = useRouter();
  const [joined, setJoined] = useState(false);

  if (joined) {
    return <MediaRoom chatId={chatId} video={video} audio={audio} />;
  }

  const Icon = video ? Video : Phone;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-y-4 px-6 text-center">
      {imageUrl ? (
        <UserAvatar src={imageUrl} className="h-20 w-20 md:h-20 md:w-20" />
      ) : (
        <div className="h-20 w-20 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
          <Icon className="h-10 w-10 text-zinc-500 dark:text-zinc-400" />
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          {video ? "Join video call" : "Join voice call"}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{name}</p>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
        Your {video ? "camera and microphone" : "microphone"} will turn on when
        you join.
      </p>

      <div className="flex items-center gap-x-3 pt-2">
        <Button variant="ghost" onClick={() => router.push(cancelHref)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => setJoined(true)}>
          <Icon />
          Join call
        </Button>
      </div>
    </div>
  );
};
