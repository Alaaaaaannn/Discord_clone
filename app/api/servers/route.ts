import { MemberRole } from "@/generated/prisma";
import { currentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, imageUrl, description } = await req.json();
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await prisma.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        description,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
            create: [{profileId: profile.id, role: MemberRole.ADMIN, description:"The alpha wolf of this server"}]
        }
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
