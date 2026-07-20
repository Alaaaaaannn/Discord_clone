"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

const state = true;

export default function Home() {
  return (
    <div className="">
      <UserButton afterSignOutUrl="/" />
      <ModeToggle />
    </div>
  );
}
