import { Hash, Mic, Video } from "lucide-react";
import { MobileToggle } from "../mobile-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { SocketIndicator } from "../socket-indicator";
import { ChannelType } from "@/generated/prisma";
import { ChatVideoButton } from "./chat-video-button";
import { ChatVoiceButton } from "./chat-voice-button";

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
  channelType?: ChannelType;
}

const iconMap = {
  [ChannelType.TEXT]: (
    <Hash className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
  ),
  [ChannelType.AUDIO]: (
    <Mic className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
  ),
  [ChannelType.VIDEO]: (
    <Video className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
  ),
};

export const ChatHeader = ({
  serverId,
  name,
  type,
  channelType,
  imageUrl,
}: ChatHeaderProps) => {
  return (
    <div className="text-md font-semibold px-3 dark:bg-[#1a1a1e] flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle serverId={serverId} />

      {type === "channel" &&
        (channelType ? iconMap[channelType] : iconMap[ChannelType.TEXT])}
      {type === "conversation" && (
        <UserAvatar src={imageUrl} className="h-6 w-6 md:w-6 md:h-6" />
      )}
      <p className="font-semibold text-md ml-2 text-black dark:text-white">
        {name}
      </p>
      <div className="ml-auto flex items-center">
        {type === "conversation" && (
          <>
            <ChatVoiceButton />
            <ChatVideoButton />
          </>
        )}
        <SocketIndicator />
      </div>
    </div>
  );
};
