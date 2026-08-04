import { handlers } from "@/auth";

// The Node runtime is required because our Credentials provider uses bcryptjs
// and Prisma, both of which need Node APIs.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
