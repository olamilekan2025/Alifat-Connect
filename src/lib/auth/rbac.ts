import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function requireRole(
  allowedRoles: string[]
) {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role =
    (
      (session.user as any).role ?? "user"
    ).toLowerCase();

  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden");
  }

  return session;
}