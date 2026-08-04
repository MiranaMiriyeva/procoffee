"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createItem, updateItem } from "@/app/admin/actions/items";
import { uploadItemImage } from "@/app/admin/actions/upload";
import type { UIItem } from "./ItemManager";

export type ItemFormValues = {
  title: string;
  titleAz: string;
  titleRu: string;
  subtitle: string;
  subtitleAz: string;
  subtitleRu: string;
  description: string;
  descriptionAz: string;
  descriptionRu: string;
  price: string;
  imageUrl: string;
  available: boolean;
};

const empty: ItemFormValues = {
  title: "",
  titleAz: "",
  titleRu: "",
  subtitle: "",
  subtitleAz: "",
  subtitleRu: "",
  description: "",
  descriptionAz: "",
  descriptionRu: "",
  price: "",
  imageUrl: "",
  available: true,
};

type Lang = "en" | "az" | "ru";
const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  az: "AZ",
  ru: "RU",
};

export default function ItemFormDialog({
  open,
  onOpenChange,
  categoryId,
  editingId,
  initialValues,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  editingId: string | null;
  initialValues: Partial<ItemFormValues>;
  onSaved: (item: UIItem) => void;
}) {
  const [values, setValues] = useState<ItemFormValues>({ ...empty, ...initialValues });
  const [lang, setLang] = useState<Lang>("en");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setValues({ ...empty, ...initialValues });
      setLang("en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadItemImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setValues((v) => ({ ...v, imageUrl: result.url }));
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!values.title.trim()) {
      toast.error("Title is required");
      setLang("en");
      return;
    }
    if (!values.price || Number.isNaN(parseFloat(values.price))) {
      toast.error("Enter a valid price");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          categoryId,
          title: values.title.trim(),
          titleAz: values.titleAz.trim(),
          titleRu: values.titleRu.trim(),
          subtitle: values.subtitle.trim() || null,
          subtitleAz: values.subtitleAz.trim(),
          subtitleRu: values.subtitleRu.trim(),
          description: values.description.trim() || null,
          descriptionAz: values.descriptionAz.trim(),
          descriptionRu: values.descriptionRu.trim(),
          price: values.price,
          imageUrl: values.imageUrl || null,
          available: values.available,
        };
        const saved = editingId
          ? await updateItem(editingId, payload)
          : await createItem(payload);
        onSaved({
          ...saved,
          price: saved.price.toString(),
        });
        toast.success(editingId ? "Item updated" : "Item added");
      } catch {
        toast.error("Couldn't save item");
      }
    });
  }

  if (!open) return null;

  const suffix = lang === "en" ? "" : lang === "az" ? "Az" : "Ru";
  const titleKey = `title${suffix}` as keyof ItemFormValues;
  const subtitleKey = `subtitle${suffix}` as keyof ItemFormValues;
  const descKey = `description${suffix}` as keyof ItemFormValues;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-card-xl border border-border max-h-[92dvh] overflow-y-auto"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit item" : "New item"}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Photo</label>
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                {values.imageUrl ? (
                  <Image
                    src={values.imageUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center px-2">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-background hover:bg-muted text-sm disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {values.imageUrl ? "Replace" : "Upload"}
                </button>
                {values.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, imageUrl: "" }))}
                    className="block text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove image
                  </button>
                )}
                <p className="text-xs text-muted-foreground">JPEG, PNG, or WEBP · up to 5 MB.</p>
              </div>
            </div>
          </div>

          {/* Language tabs */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-full">
              {(["en", "az", "ru"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`flex-1 h-8 rounded-full text-xs font-semibold uppercase tracking-widest transition ${
                    lang === l
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            {lang !== "en" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Optional — customers see the English text if left blank.
              </p>
            )}
          </div>

          <Field label={`Title (${LANG_LABELS[lang]})`} required={lang === "en"}>
            <input
              value={values[titleKey] as string}
              onChange={(e) => setValues((v) => ({ ...v, [titleKey]: e.target.value }))}
              maxLength={80}
              required={lang === "en"}
              className={inputCls}
              placeholder={
                lang === "en" ? "e.g. Cappuccino" : lang === "az" ? "Cappuccino" : "Капучино"
              }
            />
          </Field>

          <Field label={`Subtitle (${LANG_LABELS[lang]})`}>
            <input
              value={values[subtitleKey] as string}
              onChange={(e) => setValues((v) => ({ ...v, [subtitleKey]: e.target.value }))}
              maxLength={120}
              className={inputCls}
              placeholder={
                lang === "en"
                  ? "Espresso + steamed milk + foam"
                  : lang === "az"
                    ? "Espresso + isti süd + köpük"
                    : "Эспрессо + молоко + пенка"
              }
            />
          </Field>

          <Field label={`Description (${LANG_LABELS[lang]})`}>
            <textarea
              value={values[descKey] as string}
              onChange={(e) => setValues((v) => ({ ...v, [descKey]: e.target.value }))}
              maxLength={500}
              rows={3}
              className={`${inputCls} h-auto py-2 resize-y`}
              placeholder="Optional longer description."
            />
          </Field>

          {/* Price + available — language-independent */}
          <Field label="Price" required>
            <input
              value={values.price}
              onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              className={inputCls}
              placeholder="4.50"
            />
          </Field>

          <label className="flex items-center gap-3 py-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={values.available}
              onChange={(e) => setValues((v) => ({ ...v, available: e.target.checked }))}
              className="w-4 h-4 accent-[var(--primary)]"
            />
            <span className="text-sm">
              Available — uncheck to show as sold out on the menu
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-11 px-4 rounded-full text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover"
            >
              {isPending ? "Saving…" : editingId ? "Save" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-11 rounded-lg border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-ring";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
