import "server-only";
import { auth } from "@/auth";

/**
 * Server-side auth guard used inside server actions and API routes.
 * Throws (not redirects) so callers can decide how to respond.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
