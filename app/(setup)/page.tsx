import { initProfile } from "@/lib/init-profile";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InitialModal } from "@/components/modals/initial-modal";
const SetupPage = async () => {
  const profile = await initProfile();
  const server = await prisma.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }
  return <InitialModal></InitialModal>;
};

export default SetupPage;
