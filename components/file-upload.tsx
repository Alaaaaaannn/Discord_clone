"use client";

import Image from "next/image";
import { FileIcon, X } from "lucide-react";
import { useState } from "react";

import { UploadDropzone } from "@/lib/uploadthing";

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

interface FileUploadProps {
  value: string;
  endpoint: "messageFile" | "serverImage";
  onChange: (url?: string) => void;
  onFileUploaded?: (file: UploadedFile) => void;
}

/**
 * Fallback for a `value` that didn't come from this session's upload (e.g. a form
 * default). Only inspects the pathname — `new URL(...).hostname` is full of dots,
 * so splitting the whole URL on "." would match the host instead of an extension.
 */
const looksLikePdf = (value: string) => {
  try {
    return new URL(value).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return value.toLowerCase().split("?")[0].endsWith(".pdf");
  }
};

export const FileUpload = ({ onChange, value, endpoint, onFileUploaded }: FileUploadProps) => {
  // UploadThing's ufsUrl is https://<appId>.ufs.sh/f/<key>, where <key> is an
  // opaque id carrying no file extension. The type therefore can't be derived
  // from the URL — it has to come off the upload result, which reports the real
  // MIME type and original filename.
  const [uploaded, setUploaded] = useState<{
    name: string;
    type: string;
  } | null>(null);

  const clear = () => {
    setUploaded(null);
    onChange(undefined);
  };

  const isPdf = uploaded
    ? uploaded.type === "application/pdf"
    : looksLikePdf(value ?? "");

  if (value && isPdf) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 shrink-0 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 truncate text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {uploaded?.name ?? value}
        </a>
        <button
          type="button"
          onClick={clear}
          className="absolute -top-1 -right-1 rounded-full bg-rose-500 p-1 text-white shadow-sm cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  if (value) {
    return (
      // Outer wrapper absorbs the `*:w-full` that <Field> applies to its direct
      // children, so the avatar below keeps its fixed square size.
      <div className="flex justify-center">
        <div className="relative size-20 shrink-0">
          <Image
            fill
            sizes="80px"
            src={value}
            alt="Upload"
            className="rounded-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute -top-1 -right-1 rounded-full bg-rose-500 p-1 text-white shadow-sm cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      className="w-full ut-label:text-sm ut-button:bg-indigo-500 ut-button:ut-readying:bg-indigo-500/50 cursor-pointer"
      onClientUploadComplete={(res) => {
        const file = res?.[0];

        if (!file) return;

        setUploaded({
          name: file.name,
          type: file.type,
        });

        onChange(file.ufsUrl);
        onFileUploaded?.({
          url: file.ufsUrl,name:file.name,type:file.type
        })
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};
