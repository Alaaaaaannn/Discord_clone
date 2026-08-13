"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import qs from "query-string";
import { Field } from "@/components/ui/field";
import { Input } from "../ui/input";
import { CornerUpRight, Plus, Send, X } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { useReply } from "@/hooks/use-reply-store";
import { EmojiPicker } from "../emoji-picker";
import { GifPicker, type GiphyGif } from "../gif-picker";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const { onOpen } = useModal();
  const { replyTo, clearReplyTo } = useReply();

  // The chat this composer belongs to, so a reply picked in one channel can't
  // follow you into another.
  const chatId = query.channelId ?? query.conversationId;
  const activeReply = replyTo?.chatId === chatId ? replyTo : null;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // GIFs send immediately on pick, as an image attachment rather than text, so
  // chat-item renders them inline (it keys off fileType starting with "image/").
  const onSelectGif = async (gif: GiphyGif) => {
    try {
      const url = qs.stringifyUrl({ url: apiUrl, query });
      await axios.post(url, {
        content: gif.url,
        fileUrl: gif.url,
        fileName: gif.description,
        fileType: "image/gif",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      await axios.post(url, {
        ...values,
        // Server-side validated against this chat before it's stored.
        parentId: activeReply?.id,
      });
      form.reset();
      clearReplyTo();
      // No router.refresh() — the message comes back over the socket as
      // `chat:<id>:messages` and useChatSocket writes it into the query cache.
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-[]">
      <Controller
        control={form.control}
        name="content"
        render={({ field }) => (
          <Field className="dark:bg-[#1a1a1e]">
            {activeReply && (
              <div className="mx-8 flex items-center gap-x-2 rounded-t-lg bg-zinc-200/90 px-3 py-1.5 text-xs text-zinc-600 dark:bg-[#1c1d21] dark:text-zinc-300">
                <CornerUpRight className="h-3 w-3 shrink-0" />
                <span>
                  Replying to{" "}
                  <span className="font-semibold">{activeReply.name}</span>
                </span>
                <span className="truncate opacity-70">
                  {activeReply.content}
                </span>
                <button
                  type="button"
                  onClick={clearReplyTo}
                  aria-label="Cancel reply"
                  className="ml-auto shrink-0 cursor-pointer transition hover:text-zinc-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="relative p-4">
              <button
                type="button"
                onClick={() => onOpen("messageFile", { apiUrl, query })}
                className="absolute top-9 left-8 h-[28px] w-[28px] bg-zinc-500 dark:bg-[#222327] hover:bg-zinc-600 dark:hover:bg-[#434242] transition rounded-full p-1 flex items-center justify-center"
              >
                <Plus className="text-white cursor-pointer" />
              </button>
              <Input
                disabled={isLoading}
                className="px-14 py-8 rounded-lg bg-zinc-200/90 dark:bg-[#222327] border-none border-0 focus:visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                {...field}
              />
              <div className="absolute top-9 right-8 flex items-center gap-x-2">
                <GifPicker onSelect={onSelectGif} />
                <EmojiPicker
                  onChange={(emoji: string) =>
                    field.onChange(`${field.value} ${emoji}`)
                  }
                />
                <button
                  type="submit"
                  disabled={isLoading || !field.value.trim()}
                  aria-label="Send message"
                  className={cn(
                    "cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300",
                    // Nothing to send yet — visible, but inert and non-reactive.
                    "disabled:cursor-default disabled:opacity-40 disabled:hover:text-zinc-500 dark:disabled:hover:text-zinc-400",
                  )}
                >
                  <Send />
                </button>
              </div>
            </div>
          </Field>
        )}
      />
    </form>
  );
};
