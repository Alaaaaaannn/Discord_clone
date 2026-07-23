import { Member, Profile, Server } from "./generated/prisma"

export type ServerWithMembersWithProfiles = Server & {
    members: (Member & {profile: Profile})[];
}