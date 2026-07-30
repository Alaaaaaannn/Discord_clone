import { getAuth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { NextApiRequest } from "next";

export const currentProfilePages = async (req: NextApiRequest) => {
  const { userId } = await getAuth(req);

  if (!userId) return null;

  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });
  return profile;
};
