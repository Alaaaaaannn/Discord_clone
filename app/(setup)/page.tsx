import { initProfile } from "@/lib/init-profile";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InitialModal } from "@/components/modals/initial-modal";
const SetupPage = async () => {
  const profile = await initProfile();

  // Like Discord, the landing page is Direct Messages — not a server's channel.
  // The initial "create a server" modal only shows for a brand new account.
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
    return redirect("/me");
  }
  return <InitialModal />;
};

export default SetupPage;