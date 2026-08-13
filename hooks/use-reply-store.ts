import { create } from "zustand";

export interface ReplyTarget {
  id: string;
  name: string;
  content: string;
  /** Which chat it belongs to, so a stale target can't leak across channels. */
  chatId: string;
}

interface ReplyStore {
  replyTo: ReplyTarget | null;
  setReplyTo: (target: ReplyTarget) => void;
  clearReplyTo: () => void;
}

export const useReply = create<ReplyStore>((set) => ({
  replyTo: null,
  setReplyTo: (replyTo) => set({ replyTo }),
  clearReplyTo: () => set({ replyTo: null }),
}));
