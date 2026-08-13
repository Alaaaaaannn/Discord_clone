"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { ImagePlay, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface GiphyGif {
  id: string;
  url: string;
  preview: string;
  description: string;
  width: number;
  height: number;
}

interface GifPickerProps {
  onSelect: (gif: GiphyGif) => void;
}

export const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [configured, setConfigured] = useState(true);

  const fetchGifs = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/giphy", {
        params: search ? { q: search } : {},
      });
      setConfigured(data.configured !== false);
      setGifs(data.results ?? []);
    } catch (error) {
      console.log(error);
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load trending on open, then debounce each search so typing doesn't fire a
  // request per keystroke.
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => fetchGifs(query), query ? 350 : 0);
    return () => clearTimeout(timeout);
  }, [open, query, fetchGifs]);

  const handleSelect = (gif: GiphyGif) => {
    onSelect(gif);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cursor-pointer">
        <ImagePlay className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="mb-16 w-auto border-none bg-transparent p-0 shadow-none ring-0 drop-shadow-none"
      >
        <div className="isolate flex h-92 w-88 flex-col overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/10 dark:bg-[#282b30] dark:ring-white/10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIPHY"
            className="mx-2 mt-2 appearance-none rounded-md bg-zinc-100 px-2.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none dark:bg-[#1e1f22] dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />

          <div className="relative flex-1 overflow-y-auto p-1.5">
            {!configured && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-1 px-6 text-center">
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  GIFs aren&apos;t set up yet
                </p>
                <p className="text-xs text-zinc-400">
                  Add GIPHY_API_KEY to .env and restart the server.
                </p>
              </div>
            )}

            {configured && isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            )}

            {configured && !isLoading && gifs.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
                No GIFs found.
              </div>
            )}

            {configured && !isLoading && gifs.length > 0 && (
              // Masonry-ish columns keep the varied GIF aspect ratios tidy.
              <div className="columns-2 gap-1.5 [column-fill:_balance]">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => handleSelect(gif)}
                    className="mb-1.5 block w-full overflow-hidden rounded-md ring-offset-1 transition hover:ring-2 hover:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    {/* Deliberately a plain <img>: GIPHY URLs are hotlinked
                        previews, not worth routing through next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.preview}
                      alt={gif.description}
                      loading="lazy"
                      className="w-full bg-zinc-200 dark:bg-zinc-700"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="px-3 py-1.5 text-[10px] tracking-wide text-zinc-400 uppercase">
            Powered by GIPHY
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
