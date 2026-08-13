import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@/generated/prisma";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onUpdate = (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages?.length) {
          return oldData;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) =>
              item.id === message.id ? message : item,
            ),
          })),
        };
      });
    };

    const onAdd = (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [message] }],
          };
        }
        const pages = [...oldData.pages];
        pages[0] = {
          ...pages[0],
          items: [message, ...pages[0].items],
        };
        return { ...oldData, pages };
      });
    };

    socket.on(updateKey, onUpdate);
    socket.on(addKey, onAdd);

    return () => {
      socket.off(updateKey, onUpdate);
      socket.off(addKey, onAdd);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
