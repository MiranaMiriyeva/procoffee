import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Settings } from "lucide-react";
import { auth, signOut } from "@/auth";
import { getSettings } from "@/lib/settings";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/10 shrink-0">
              <Image
                src={settings.logoUrl}
                alt={settings.shopName}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-semibold text-sm leading-tight truncate">
                {settings.shopName}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">Admin</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="h-9 px-3 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
      <Toaster position="bottom-center" richColors closeButton />
    </div>
  );
}
