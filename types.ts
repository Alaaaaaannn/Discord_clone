import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Member, MemberRole, Profile, Server } from "./generated/prisma";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

/**
 * All the chat components need of the signed-in user: an identity to compare
 * against a message's author, and a role for the moderator delete rule.
 *
 * A real Member satisfies this, and so does the synthetic member a DM builds
 * from a Profile — DMs have no server, so there is no full Member to pass.
 */
export type ChatViewer = {
  id: string;
  role: MemberRole;
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
