// TEMPORARY diagnostic route — delete after use.
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  const hasSocket = !!res.socket;
  const hasServer = !!res.socket?.server;
  const hasIo = !!res.socket?.server?.io;

  res.socket?.server?.io?.emit("probe:event", { ok: true });

  return res.status(200).json({ hasSocket, hasServer, hasIo });
}
