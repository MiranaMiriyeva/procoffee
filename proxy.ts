import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Next.js 16 renamed `middleware.ts` → `proxy.ts`. Auth.js v5 docs still refer
// to it as "middleware" — same file, new name.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on /admin/* only. Public menu + landing page skip session lookups.
  matcher: ["/admin/:path*"],
};
