import { Channel, ChannelType } from "@/generated/prisma";
import { ServerWithMembersWithProfiles } from "@/types";
import { create } from "zustand";

export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage";

interface ModalData {
  server?: ServerWithMembersWithProfiles;
  channelType?: ChannelType;
  channel?: Channel;
  apiUrl?: string;
  // Optional: most modals carry no query, and onOpen's data is optional too.
  query?: Record<string, any>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) =>
    set({
      isOpen: true,
      type,
      data,
    }),
  onClose: () => set({ type: null, isOpen: false }),
}));
