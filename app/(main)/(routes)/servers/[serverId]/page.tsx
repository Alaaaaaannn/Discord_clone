import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
    params: Promise<{
        serverId: string;
    }>
}

const ServerIdPage = async ({params}: ServerIdPageProps) => {
    const profile = await currentProfile();
    if(!profile){
        const { redirectToSignIn } = await auth();
        return redirectToSignIn();
    }

    const { serverId } = await params;

    const server = await prisma.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id,
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    const initialChannel = server?.channels[0];

    if(initialChannel?.name !== "general") return null;

    return redirect(`/servers/${serverId}/channel/${initialChannel.id}`);
}

export default ServerIdPage;