import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Site settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl font-semibold">Site settings</h1>
        <p className="text-muted-foreground">
          Edit what shows on your homepage and menu — shop name, tagline, hours, contact, socials, logo.
        </p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
