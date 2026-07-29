import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that should be reachable WITHOUT being signed in.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/refresh-session(.*)",
  "/api/uploadthing(.*)",
]);

const REFRESH_PATH = "/refresh-session";
// Short-lived marker so a failed refresh falls through to sign-up instead of
// looping. Deliberately shorter than a session token's 60s lifetime.
const REFRESH_GUARD = "__session_refresh_attempted";
const REFRESH_GUARD_MAX_AGE = 30;

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, redirectToSignUp } = await auth();

  if (userId) {
    // Healthy again — drop the guard so a later stale token can also self-heal.
    if (req.cookies.has(REFRESH_GUARD)) {
      const res = NextResponse.next();
      res.cookies.delete(REFRESH_GUARD);
      return res;
    }
    return;
  }

  // The server says signed out. Before bouncing, check what the BROWSER thinks.
  // __client_uat is Clerk's non-HttpOnly "signed in at" stamp; > 0 means a
  // signed-in Clerk client is still present and only the 60-second session
  // token went stale. Send that case somewhere that can mint a fresh token
  // rather than to /sign-up, which ClerkJS would immediately bounce back from.
  const clientUat = Number(req.cookies.get("__client_uat")?.value ?? "0");
  const alreadyTried = req.cookies.get(REFRESH_GUARD)?.value === "1";

  if (clientUat > 0 && !alreadyTried) {
    const url = new URL(REFRESH_PATH, req.url);
    url.searchParams.set(
      "return_to",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );

    const res = NextResponse.redirect(url);
    res.cookies.set(REFRESH_GUARD, "1", {
      maxAge: REFRESH_GUARD_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  // Genuinely signed out (or the refresh already failed). Use Clerk's own
  // redirect rather than a hand-rolled one: it preserves the return URL and
  // routes `pending` sessions to Clerk's /tasks flow instead of treating them
  // as signed out.
  return redirectToSignUp({ returnBackUrl: req.url });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
