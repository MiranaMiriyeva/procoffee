"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";
import { InstagramIcon, FacebookIcon, WhatsappIcon } from "@/lib/brand-icons";
import { updateSettings } from "@/app/admin/actions/settings";
import { uploadItemImage } from "@/app/admin/actions/upload";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [values, setValues] = useState<SiteSettings>(initial);
  const [isPending, startTransition] = useTransition();
  const [uploadingKey, setUploadingKey] = useState<null | "logoUrl" | "heroImageUrl">(null);
  const logoInput = useRef<HTMLInputElement | null>(null);
  const heroInput = useRef<HTMLInputElement | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleUpload(
    key: "logoUrl" | "heroImageUrl",
    file: File | undefined
  ) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadItemImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        set(key, result.url);
      }
    } finally {
      setUploadingKey(null);
      if (logoInput.current) logoInput.current.value = "";
      if (heroInput.current) heroInput.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateSettings(values);
        toast.success("Settings saved");
      } catch {
        toast.error("Couldn't save settings");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="Brand">
        <Field label="Shop name" required>
          <input
            value={values.shopName}
            onChange={(e) => set("shopName", e.target.value)}
            maxLength={80}
            required
            className={inputCls}
          />
        </Field>

        <LangGroup label="Tagline">
          <input
            value={values.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            maxLength={160}
            className={inputCls}
            placeholder="Freshly brewed, all day."
            aria-label="Tagline (English)"
          />
          <input
            value={values.taglineAz}
            onChange={(e) => set("taglineAz", e.target.value)}
            maxLength={160}
            className={inputCls}
            placeholder="Təzə dəmlənmiş, bütün gün. (AZ)"
            aria-label="Tagline (Azerbaijani)"
          />
          <input
            value={values.taglineRu}
            onChange={(e) => set("taglineRu", e.target.value)}
            maxLength={160}
            className={inputCls}
            placeholder="Свежий кофе, весь день. (RU)"
            aria-label="Tagline (Russian)"
          />
        </LangGroup>

        <LangGroup label="About">
          <textarea
            value={values.about}
            onChange={(e) => set("about", e.target.value)}
            maxLength={2000}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder="A short paragraph shown on the homepage."
            aria-label="About (English)"
          />
          <textarea
            value={values.aboutAz}
            onChange={(e) => set("aboutAz", e.target.value)}
            maxLength={2000}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder="Azərbaycanca (AZ)"
            aria-label="About (Azerbaijani)"
          />
          <textarea
            value={values.aboutRu}
            onChange={(e) => set("aboutRu", e.target.value)}
            maxLength={2000}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder="Русский (RU)"
            aria-label="About (Russian)"
          />
        </LangGroup>

        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <ImageField
            label="Logo"
            hint="Square image works best. Falls back to the default Procoffee logo if empty."
            url={values.logoUrl}
            onClear={() => set("logoUrl", "")}
            onUpload={(f) => handleUpload("logoUrl", f)}
            uploading={uploadingKey === "logoUrl"}
            inputRef={logoInput}
            aspect="aspect-square"
          />
          <ImageField
            label="Hero image (homepage)"
            hint="Landscape looks best. Optional — a warm gradient shows if empty."
            url={values.heroImageUrl}
            onClear={() => set("heroImageUrl", "")}
            onUpload={(f) => handleUpload("heroImageUrl", f)}
            uploading={uploadingKey === "heroImageUrl"}
            inputRef={heroInput}
            aspect="aspect-video"
          />
        </div>
      </Card>

      <Card title="Location & hours">
        <Field label="Address">
          <textarea
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            maxLength={400}
            rows={2}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder={"123 Main Street\nSpringfield"}
          />
        </Field>
        <LangGroup label="Hours">
          <textarea
            value={values.hours}
            onChange={(e) => set("hours", e.target.value)}
            maxLength={400}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder={"Mon–Fri  7:00 – 19:00\nSat–Sun  8:00 – 17:00"}
            aria-label="Hours (English)"
          />
          <textarea
            value={values.hoursAz}
            onChange={(e) => set("hoursAz", e.target.value)}
            maxLength={400}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder="Azərbaycanca (AZ)"
            aria-label="Hours (Azerbaijani)"
          />
          <textarea
            value={values.hoursRu}
            onChange={(e) => set("hoursRu", e.target.value)}
            maxLength={400}
            rows={3}
            className={`${inputCls} h-auto py-2 resize-y`}
            placeholder="Русский (RU)"
            aria-label="Hours (Russian)"
          />
        </LangGroup>
      </Card>

      <Card title="Contact & socials">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              maxLength={60}
              className={inputCls}
              placeholder="+1 (555) 123-4567"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              maxLength={200}
              className={inputCls}
              placeholder="hello@procoffee.com"
            />
          </Field>
        </div>

        <div className="space-y-3 pt-2">
          <SocialField
            icon={<InstagramIcon className="w-4 h-4" />}
            label="Instagram"
            value={values.instagramUrl}
            onChange={(v) => set("instagramUrl", v)}
            placeholder="https://instagram.com/procoffee"
          />
          <SocialField
            icon={<FacebookIcon className="w-4 h-4" />}
            label="Facebook"
            value={values.facebookUrl}
            onChange={(v) => set("facebookUrl", v)}
            placeholder="https://facebook.com/procoffee"
          />
          <SocialField
            icon={<WhatsappIcon className="w-4 h-4" />}
            label="WhatsApp"
            value={values.whatsappUrl}
            onChange={(v) => set("whatsappUrl", v)}
            placeholder="https://wa.me/1234567890"
          />
        </div>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-full bg-card border border-border shadow-lg p-1.5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground pl-3">
            Changes are live the moment you save.
          </p>
          <button
            type="submit"
            disabled={isPending || uploadingKey !== null}
            className="h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full h-11 rounded-lg border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:border-ring";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

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

function LangGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode[];
}) {
  const [en, az, ru] = children as [React.ReactNode, React.ReactNode, React.ReactNode];
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>
      <div className="space-y-2">
        <LangRow flag="🇬🇧" code="EN">{en}</LangRow>
        <LangRow flag="🇦🇿" code="AZ">{az}</LangRow>
        <LangRow flag="🇷🇺" code="RU">{ru}</LangRow>
      </div>
      <p className="text-xs text-muted-foreground">
        Optional translations — customers see the English text if a translation is blank.
      </p>
    </div>
  );
}

function LangRow({
  flag,
  code,
  children,
}: {
  flag: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center gap-1 w-8 shrink-0 pt-2">
        <span className="text-base leading-none">{flag}</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          {code}
        </span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function ImageField({
  label,
  hint,
  url,
  onClear,
  onUpload,
  uploading,
  inputRef,
  aspect,
}: {
  label: string;
  hint: string;
  url: string;
  onClear: () => void;
  onUpload: (file: File | undefined) => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  aspect: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className={`relative w-full ${aspect} rounded-xl overflow-hidden bg-muted border border-border`}>
        {url ? (
          <Image src={url} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
            No image
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onUpload(e.target.files?.[0])}
        className="hidden"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-background hover:bg-muted text-sm disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

function SocialField({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={400}
        placeholder={placeholder}
        aria-label={label}
        className={inputCls}
      />
    </div>
  );
}
