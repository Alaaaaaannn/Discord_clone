import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { CallLobby } from "@/components/call-lobby";
import { currentProfile } from "@/lib/current-profile";
import { getOrCreateConversation } from "@/lib/conversation";
import { asCurrentMember } from "@/lib/direct-message";
import { canDirectMessage } from "@/lib/friends";
import { prisma } from "@/lib/prisma";

interface DmPageProps {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ video?: string; audio?: string }>;
}

const DmPage = async ({ params, searchParams }: DmPageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  const { profileId } = await params;
  const { video, audio } = await searchParams;
  const isVideoCall = video === "true";
  const isVoiceCall = audio === "true";
  const inCall = isVideoCall || isVoiceCall;

  if (profileId === profile.id) {
    return redirect("/me");
  }

  const allowed = await canDirectMessage(profile.id, profileId);
  if (!allowed) {
    return redirect("/me");
  }

  const other = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!other) {
    return redirect("/me");
  }

  const conversation = await getOrCreateConversation(profile.id, profileId);
  if (!conversation) {
    return redirect("/me");
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        imageUrl={other.imageUrl}
        name={other.name}
        serverId=""
        type="conversation"
      />
      {inCall && (
        <CallLobby
          chatId={conversation.id}
          video={isVideoCall}
          audio={true}
          name={other.name}
          imageUrl={other.imageUrl}
          cancelHref={`/me/${profileId}`}
        />
      )}
      {!inCall && (
        <>
          <ChatMessages
            member={asCurrentMember(profile)}
            name={other.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId: conversation.id }}
          />
          <ChatInput
            name={other.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{ conversationId: conversation.id }}
          />
        </>
      )}
    </div>
  );
};

export default DmPage;
