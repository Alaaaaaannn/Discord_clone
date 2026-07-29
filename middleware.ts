import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that should be reachable WITHOUT being signed in.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/uploadthing(.*)",
  "/api/debug-auth", // TEMPORARY — remove with the debug route
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionStatus } = await auth();

  // A "pending" session IS signed in — it just has an outstanding Clerk task
  // (org selection, required onboarding, etc). Hand those to auth.protect() so
  // Clerk routes them to its /tasks flow. Sending them to /sign-up instead
  // strands a logged-in user on the sign-up page forever.
  if (userId || sessionStatus === "pending") {
    await auth.protect();
    return;
  }

  // Genuinely signed out.
  return NextResponse.redirect(new URL("/sign-up", req.url));
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
