"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data;
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id
        }
      })
      await axios.delete(url);
      router.refresh();
      router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#242429] text-black p-0 overflow-hidden rounded-lg">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center dark:text-white font-bold normal-case tracking-normal">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center font-semibold dark:text-zinc-300 text-zinc-500">
            <p className="text-zinc-500 dark:text-zinc-300">Are you sure you want to do this?</p>
            <div>
              <span className="text-indigo-500">#{channel?.name}</span> will be
              permanently deleted.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 dark:bg-[#242429] px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost" className="dark:text-white">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => onClick()}
              variant="primary"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
