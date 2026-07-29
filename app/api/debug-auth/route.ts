import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// TEMPORARY diagnostic route — delete after debugging the sign-up redirect loop.
export async function GET(req: NextRequest) {
  const a = await auth();

  let profile = null;
  let profileError = null;
  if (a.userId) {
    try {
      profile = await prisma.profile.findUnique({ where: { userId: a.userId } });
    } catch (e) {
      profileError = (e as Error).message;
    }
  }

  const cookieNames = req.cookies.getAll().map((c) => c.name);

  // __client_uat is Clerk's non-HttpOnly "signed in at" timestamp.
  // "0" or missing => the browser genuinely has no signed-in Clerk client.
  const clientUat = req.cookies.get("__client_uat")?.value ?? null;

  // Which Clerk instance is this key for? A mismatch between the cookie's
  // issuer and this key makes a valid session look signed out.
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  let frontendApi = null;
  try {
    frontendApi = Buffer.from(
      pk.replace(/^pk_(test|live)_/, ""),
      "base64",
    ).toString();
  } catch {
    frontendApi = "<unparseable>";
  }

  // Decode (not verify) the session JWT so we can see WHY it is being rejected:
  // wrong issuer, expired, or not-yet-valid due to clock skew.
  const nowSec = Math.floor(Date.now() / 1000);
  let sessionClaims = null;
  const rawSession =
    req.cookies.get("__session")?.value ??
    req.cookies.get(`__session_${"9g3479OT"}`)?.value ??
    null;
  if (rawSession) {
    try {
      const payload = JSON.parse(
        Buffer.from(rawSession.split(".")[1], "base64url").toString(),
      );
      sessionClaims = {
        iss: payload.iss,
        sub: payload.sub,
        iat: payload.iat,
        nbf: payload.nbf,
        exp: payload.exp,
        serverNow: nowSec,
        expiredSecondsAgo: payload.exp ? nowSec - payload.exp : null,
        notValidForAnotherSeconds: payload.nbf ? payload.nbf - nowSec : null,
      };
    } catch (e) {
      sessionClaims = { decodeError: (e as Error).message };
    }
  }

  // Clerk DEV instances also require a valid dev-browser JWT. If this one is
  // expired, the server reports "dev-browser-missing" and treats you as signed
  // out even though __session looks fine.
  let devBrowserClaims = null;
  const rawDb =
    req.cookies.get("__clerk_db_jwt")?.value ??
    req.cookies.get("__clerk_db_jwt_9g3479OT")?.value ??
    null;
  if (rawDb) {
    try {
      const p = JSON.parse(
        Buffer.from(rawDb.split(".")[1], "base64url").toString(),
      );
      devBrowserClaims = {
        iat: p.iat,
        exp: p.exp,
        expiredSecondsAgo: p.exp ? nowSec - p.exp : null,
      };
    } catch (e) {
      devBrowserClaims = { decodeError: (e as Error).message };
    }
  }

  return NextResponse.json({
    sessionClaims,
    devBrowserClaims,
    redirectCount: req.cookies.get("__clerk_redirect_count")?.value ?? null,
    serverTimeIso: new Date().toISOString(),

    // --- what the server resolved ---
    userId: a.userId,
    sessionStatus: a.sessionStatus,
    isAuthenticated: a.isAuthenticated,
    profileExists: !!profile,
    profileError,

    // --- what the browser actually sent ---
    requestUrl: req.url,
    host: req.headers.get("host"),
    cookieNames,
    hasSessionCookie: cookieNames.includes("__session"),
    hasDevBrowser: cookieNames.includes("__clerk_db_jwt"),
    clientUat,

    // --- which Clerk instance this app is configured for ---
    frontendApi,
    pkPrefix: pk.slice(0, 12),
  });
}
