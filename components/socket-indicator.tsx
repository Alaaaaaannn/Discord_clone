"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-600 p-2 rounded-md text-white border-none"
      >
        Connecting...
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-emerald-600 p-2 rounded-md text-white border-none"
    >
      Connected
    </Badge>
  );
};
