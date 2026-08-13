/**
 * Shared Prisma includes so every route that returns a message — the paginated
 * GET and each socket emit — ships the same shape. If they drift, a message
 * arriving over the socket loses its reactions or reply until a refetch.
 */

export const messageInclude = {
  member: { include: { profile: true } },
  reactions: true,
  // One level only: a reply shows its parent, not the whole chain.
  parent: { include: { member: { include: { profile: true } } } },
} as const;

export const directMessageInclude = {
  profile: true,
  reactions: true,
  parent: { include: { profile: true } },
} as const;
