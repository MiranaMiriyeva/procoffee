import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — used by middleware.
 * Do NOT import Prisma, bcrypt, or Node-only modules here.
 */
export default {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    // 8 hours — long enough for a shift, short enough that a lost/stolen laptop
    // doesn't stay logged in indefinitely.
    maxAge: 60 * 60 * 8,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;

      const isOnAdmin = path.startsWith("/admin");
      const isOnLogin = path === "/admin/login";

      if (isOnLogin) return true;
      if (isOnAdmin) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
