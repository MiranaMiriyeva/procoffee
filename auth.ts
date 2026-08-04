import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          console.error("[auth] Invalid login shape:", parsed.error.issues);
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        // Rate-limit by email — 5 failed attempts / 15 min.
        const rl = rateLimit(`login:${normalizedEmail}`, {
          limit: 5,
          windowMs: 15 * 60_000,
        });
        if (!rl.allowed) {
          console.error(
            `[auth] Rate limit hit for ${normalizedEmail} — retry in ${rl.retryAfterSeconds}s`
          );
          return null;
        }

        let user;
        try {
          user = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
          });
        } catch (err) {
          console.error("[auth] Database lookup failed:", err);
          return null;
        }

        if (!user) {
          console.error(
            `[auth] No admin user found for "${normalizedEmail}". Did you run \`npm run db:seed\`? Check ADMIN_EMAIL in .env matches.`
          );
        }

        // Always run bcrypt.compare to avoid timing side-channels.
        const dummyHash =
          "$2a$12$CwTycUXWue0Thq9StjUM0uJ8dp8p6Aq4Km6dJ2gV0m4z9Zv5r1s2K";
        const hash = user?.passwordHash ?? dummyHash;
        const valid = await bcrypt.compare(password, hash);
        if (!user || !valid) {
          if (user && !valid) {
            console.error(
              `[auth] Wrong password for ${normalizedEmail}. Re-run \`npm run db:seed\` to reset it to the ADMIN_PASSWORD in .env.`
            );
          }
          return null;
        }

        return { id: user.id, email: user.email, name: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
