import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/sign-in");
  }

  const { serverId } = await params;

  const server = await prisma.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    // Sidebar starts after the 72px nav rail, and its width is kept identical
    // to main's padding so the two can never drift apart. Together the rail and
    // the sidebar take a quarter of the viewport, never narrower than before.
    <div className="h-full">
      <div className="hidden md:flex h-full w-[max(240px,calc(25vw-72px))] z-20 flex-col fixed inset-y-0 md:left-[72px]">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-[max(240px,calc(25vw-72px))]">
        {children}
      </main>
    </div>
  );
};

export default ServerIdLayout;
