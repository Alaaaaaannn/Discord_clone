"use client";

import Image from "next/image";
import { X } from "lucide-react";

import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
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
            onClick={() => onChange("")}
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
        onChange(res?.[0]?.ufsUrl);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};
