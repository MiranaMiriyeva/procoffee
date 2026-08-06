import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth, signIn } from "@/auth";
import { loginSchema } from "@/lib/validators";
import { AuthError } from "next-auth";
import { getSettings } from "@/lib/settings";
import { PasswordInput } from "./PasswordInput";

export const metadata = { title: "Sign in" };

async function loginAction(formData: FormData) {
  "use server";

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/admin/login?error=credentials");
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const settings = await getSettings().catch(() => null);
  const logoUrl = settings?.logoUrl ?? "/logo.png";
  const shopName = settings?.shopName ?? "Procoffee";

  const { error } = await searchParams;
  const errorMessage =
    error === "credentials"
      ? "Wrong email or password. Try again."
      : error === "invalid"
        ? "Please enter a valid email and password."
        : null;

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-card shadow-lg border border-border p-7">
        <Link href="/" className="flex justify-center mb-5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/15">
            <Image src={logoUrl} alt={shopName} fill sizes="64px" className="object-cover" priority />
          </div>
        </Link>
        <h1 className="text-2xl font-semibold text-center font-heading">Sign in</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Manage the {shopName} menu.
        </p>

        <form action={loginAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium transition hover:bg-primary-hover active:scale-[0.98] shadow-sm"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
