"use client";

import { EmojiPicker as EmojiPickerPrimitive } from "frimousse";
import { Smile } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onChange: (value: string) => void;
  /** Custom trigger. Defaults to the composer's smiley. */
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export const EmojiPicker = ({
  onChange,
  children,
  side = "right",
  sideOffset = 40,
}: EmojiPickerProps) => {
  // Controlled so picking an emoji closes the popover.
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer">
        {children ?? (
          <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
        )}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        // Base UI's popover ships w-72/p-4/ring/shadow. frimousse is headless, so
        // the picker below supplies its own surface — strip the wrapper's chrome.
        className="mb-16 w-auto border-none bg-transparent p-0 shadow-none ring-0 drop-shadow-none"
      >
        <EmojiPickerPrimitive.Root
          columns={9}
          onEmojiSelect={({ emoji }) => {
            onChange(emoji);
            setOpen(false);
          }}
          className="isolate flex h-92 w-88 flex-col overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/10 dark:bg-[#282b30] dark:ring-white/10"
        >
          <EmojiPickerPrimitive.Search
            placeholder="Search emoji"
            className="mx-2 mt-2 appearance-none rounded-md bg-zinc-100 px-2.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none dark:bg-[#1e1f22] dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <EmojiPickerPrimitive.Viewport className="relative flex-1 outline-hidden">
            <EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
              Loading emoji…
            </EmojiPickerPrimitive.Loading>
            <EmojiPickerPrimitive.Empty className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
              No emoji found.
            </EmojiPickerPrimitive.Empty>
            <EmojiPickerPrimitive.List
              className="select-none pb-1.5"
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div
                    className="bg-white px-3 pt-3 pb-1.5 text-xs font-semibold text-zinc-500 dark:bg-[#282b30] dark:text-zinc-400"
                    {...props}
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }) => (
                  <div className="scroll-my-1.5 px-1.5" {...props}>
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }) => (
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-md text-lg data-active:bg-zinc-100 dark:data-active:bg-white/10"
                    {...props}
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </EmojiPickerPrimitive.Viewport>
        </EmojiPickerPrimitive.Root>
      </PopoverContent>
    </Popover>
  );
};
