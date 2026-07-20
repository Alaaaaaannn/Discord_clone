import { initProfile } from "@/lib/init-profile";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  return <div>Create a Server</div>;
};

export default SetupPage;
