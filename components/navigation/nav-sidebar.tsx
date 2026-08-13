import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NavAction from "./nav-action";
import { NavDmButton } from "./nav-dm-button";
import { Separator } from "@base-ui/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavItem } from "./nav-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

const NavSideBar = async () => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/");
  }

  const servers = await prisma.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#121214] border-r bg-[#E3E5E8] py-3">
      <NavDmButton />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
              description={server.description}
            />
          </div>
        ))}
        <NavAction />
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col cursor-pointer gap-y-4">
        <ModeToggle />
      </div>
    </div>
  );
};

export default NavSideBar;
