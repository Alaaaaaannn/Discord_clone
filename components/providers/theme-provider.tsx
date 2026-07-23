"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{
        // next-themes injects an anti-flash <script>. This Next.js build errors
        // when a <script> is rendered on the client, so mark it executable only
        // on the server ("text/javascript") and inert on the client ("text/plain").
        // The provider already sets suppressHydrationWarning on the script.
        type:
          typeof window === "undefined" ? "text/javascript" : "text/plain",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
