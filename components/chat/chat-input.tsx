"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import qs from "query-string";
import { Field } from "@/components/ui/field";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "../emoji-picker";
import { GifPicker, type GiphyGif } from "../gif-picker";

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
      await axios.post(url, values);
      form.reset();
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
              </div>
            </div>
          </Field>
        )}
      />
    </form>
  );
};
