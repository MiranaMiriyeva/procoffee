"use server";

import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/require-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadItemImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "You are not signed in." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Only JPEG, PNG, or WEBP images are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || token.startsWith("vercel_blob_rw_XXXX") || token === "dev_placeholder") {
    console.error(
      "[upload] BLOB_READ_WRITE_TOKEN is missing or placeholder. Set it in .env — see README section 'Attach a Vercel Blob store'."
    );
    return {
      error:
        "Image storage isn't set up yet. Add a Vercel Blob token to your .env (see README) or connect a Blob store on Vercel.",
    };
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const safeName = `menu/${crypto.randomUUID()}.${ext}`;

  try {
    const blob = await put(safeName, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      token,
    });
    return { url: blob.url };
  } catch (err) {
    console.error("[upload] Blob upload failed:", err);
    const message =
      err instanceof Error && /401|403|forbidden|unauthorized/i.test(err.message)
        ? "Blob rejected the request — is your BLOB_READ_WRITE_TOKEN correct?"
        : "Upload failed. Please try again.";
    return { error: message };
  }
}

export async function deleteBlob(url: string) {
  try {
    await requireAdmin();
  } catch {
    return;
  }
  try {
    await del(url);
  } catch (err) {
    // Non-fatal — the item row is more important than the orphaned file.
    console.warn("Blob delete failed:", err);
  }
}
