import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI configuration (loaded automatically by every `prisma` command).
// NOTE: Do NOT instantiate PrismaClient here — this file is loaded before the
// client is generated. The runtime client lives in `lib/prisma.ts`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Used by CLI commands like `migrate` / `db push` / introspection.
    url: env("DATABASE_URL"),
  },
});
