import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const state = true;

export default function Home() {
  return (
    <div className="flex flex-col">
      <UserButton afterSignOutUrl="/" />
      This is a protected route.
    </div>
  );
}
