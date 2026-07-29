"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Recovery page for a stale Clerk session token.
 *
 * Clerk session tokens live for 60 seconds. When one lapses, the server reports
 * signed-out even though the browser still holds a perfectly good Clerk client.
 * Redirecting that state straight to /sign-up is what caused the redirect loop:
 * ClerkJS sees a valid client, bounces back, and the ping-pong trips Clerk's
 * __clerk_redirect_count guard — after which Clerk refuses to handshake at all
 * and the session can never recover.
 *
 * The middleware sends those requests here instead. getToken({ skipCache: true })
 * forces ClerkJS to mint a new token and write a fresh __session cookie, then we
 * hand the user back to where they were actually going.
 */
const RefreshSessionPage = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasRun.current) return;
    hasRun.current = true;

    // Read the return path here rather than with useSearchParams so this page
    // doesn't need a Suspense boundary.
    const returnTo =
      new URLSearchParams(window.location.search).get("return_to") || "/";

    const run = async () => {
      // Genuinely signed out — nothing to refresh.
      if (!isSignedIn) {
        router.replace("/sign-up");
        return;
      }

      try {
        await getToken({ skipCache: true });
      } catch {
        router.replace("/sign-up");
        return;
      }

      router.replace(returnTo);
    };

    void run();
  }, [isLoaded, isSignedIn, getToken, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-2 text-zinc-100">
      <Loader2 className="h-7 w-7 animate-spin" />
      <p className="text-sm">Restoring your session…</p>
    </div>
  );
};

export default RefreshSessionPage;
