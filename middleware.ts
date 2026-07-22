import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that should be reachable WITHOUT being signed in.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/uploadthing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Unauthenticated users hitting any non-public route are redirected to sign-up.
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-up", req.url).toString(),
    });
  }
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
