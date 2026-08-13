"use client";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, MemberRole, Profile } from "@/generated/prisma";
import { ChatViewer } from "@/types";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import {
  Check,
  Copy,
  CornerUpRight,
  Edit,
  FileIcon,
  Reply,
  ShieldAlert,
  ShieldCheck,
  SmilePlus,
  Trash,
} from "lucide-react";
import { EmojiPicker } from "../emoji-picker";
import { MessageReactions } from "./message-reactions";
import { useReply } from "@/hooks/use-reply-store";
import { ChatReaction } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Field } from "../ui/field";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  deleted: boolean;
  currentMember: ChatViewer;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  reactions?: ChatReaction[];
  /** The message this one replies to, if any. */
  parent?: {
    id: string;
    content: string;
    deleted: boolean;
    member: { profile: { name: string } };
  } | null;
}

/** Quick picks in the hover toolbar; the picker covers everything else. */
const QUICK_REACTIONS = ["👍", "😂", "❤️", "🎉", "😮"];

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldAlert className="w-4 h-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldCheck className="w-4 h-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  fileType,
  fileName,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
  reactions = [],
  parent = null,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  // Touch devices have no hover, so a long press stands in for it.
  const [showActions, setShowActions] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);
  const { setReplyTo } = useReply();

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    isTouchRef.current = true;
    cancelLongPress();
    longPressTimer.current = setTimeout(() => setShowActions(true), 450);
  };

  // Clear any pending timer if the message unmounts mid-press.
  useEffect(() => cancelLongPress, []);

  // Tap anywhere else to dismiss.
  useEffect(() => {
    if (!showActions) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showActions]);

  // socketQuery identifies the chat: channelId for servers, conversationId for DMs.
  const chatId = socketQuery.channelId ?? socketQuery.conversationId ?? "";

  const onToggleReaction = async (emoji: string) => {
    try {
      const url = qs.stringifyUrl({
        url: "/api/socket/reactions",
        query: { ...socketQuery, messageId: id },
      });
      await axios.post(url, { emoji });
      setShowActions(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setShowActions(false);
    setTimeout(() => setCopied(false), 1000);
  };

  const onReply = () => {
    setReplyTo({
      id,
      name: member.profile.name,
      content,
      chatId,
    });
    setShowActions(false);
  };
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  const onMemberClick = () => {
    if(member.id === currentMember.id) return;
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);

  }
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      await axios.patch(url, values);
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [form, content]);
  const colors = "bg-[#444235] border-l-5 hover:bg-[#575544] border-[#998458]";
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  // Requires fileUrl, like isImage below — the branch renders a link to it.
  const isPDF = !!fileUrl && fileType === "application/pdf";
  const isImage = !!fileUrl && fileType?.startsWith("image/");
  return (
    <div
      ref={rootRef}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
      // Suppress the OS text-selection menu that a long press would otherwise
      // raise on top of ours. Right-click on desktop is left alone.
      onContextMenu={(e) => {
        if (isTouchRef.current) e.preventDefault();
      }}
      className={cn(
        "relative group flex my-1 items-center hover:bg-gray-200 dark:hover:bg-[#242429] p-4 transition w-full",
        showActions && "bg-gray-200 dark:bg-[#242429] select-none",
      )}
    >
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          {parent && (
            <div className="mb-1 flex items-center gap-x-1 text-xs text-zinc-500 dark:text-zinc-400">
              <CornerUpRight className="h-3 w-3 shrink-0" />
              <span className="font-semibold">
                {parent.member.profile.name}
              </span>
              <span className="truncate opacity-80">
                {parent.deleted ? "Original message was deleted" : parent.content}
              </span>
            </div>
          )}
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className={cn(
                  "font-semibold text-white text-sm hover:underline cursor-pointer",
                  isAdmin && "text-emerald-500",
                  isModerator && "text-indigo-500",
                )}
              >
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 shrink-0 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 truncate text-sm text-indigo-500 dark:text-indigo-300 hover:underline"
              >
                {fileName}
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-zinc-600 dark:text-zinc-300 text-sm",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1",
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <div>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <Field className="flex-1">
                      <div className="relative w-full">
                        <Input
                          disabled={isLoading}
                          className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                          placeholder="Edited message"
                          {...field}
                        />
                      </div>
                    </Field>
                  )}
                />
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="cursor-pointer"
                >
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </div>
          )}
          {!deleted && (
            <MessageReactions
              reactions={reactions}
              currentProfileId={currentMember.profileId}
              onToggle={onToggleReaction}
            />
          )}
        </div>
      </div>
      {!deleted && (
        <div
          className={cn(
            "hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm",
            // Long-pressed on touch: show it without needing hover.
            showActions && "flex",
          )}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <ActionTooltip key={emoji} label={emoji}>
              <button
                type="button"
                onClick={() => onToggleReaction(emoji)}
                className="cursor-pointer text-sm leading-none transition hover:scale-125"
              >
                {emoji}
              </button>
            </ActionTooltip>
          ))}

          <EmojiPicker onChange={onToggleReaction} side="left" sideOffset={8}>
            <ActionTooltip label="React">
              <SmilePlus className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
            </ActionTooltip>
          </EmojiPicker>

          <ActionTooltip label="Reply">
            <Reply
              onClick={onReply}
              className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>

          <ActionTooltip label={copied ? "Copied!" : "Copy text"}>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy
                onClick={onCopy}
                className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            )}
          </ActionTooltip>

          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          {canDeleteMessage && (
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          )}
        </div>
      )}
    </div>
  );
};
