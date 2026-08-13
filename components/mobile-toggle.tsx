import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import NavSideBar from "./navigation/nav-sidebar";
import { ServerSidebar } from "./server/server-sidebar";
export const MobileToggle = ({ serverId }: { serverId: string }) => {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 gap-0 flex-row">
        <div className="w-[72px]">
          <NavSideBar />
        </div>
        <div className="flex-1">
          <ServerSidebar serverId={serverId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
