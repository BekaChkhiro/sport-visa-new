"use client";

import { useRef, useState } from "react";
import { useDark, useT } from "./theme";
import { Ic } from "./icons";

type Kind = "photo" | "grades" | "contract";

const ACCEPT: Record<Kind, string> = {
  photo: "image/jpeg,image/png,image/webp",
  grades: "image/jpeg,image/png,image/webp,application/pdf",
  contract: "image/jpeg,image/png,image/webp,application/pdf",
};

// Single-file uploader → R2. Reports the stored public URL via onChange.
export function FileUpload({
  kind,
  value,
  onChange,
  label,
  hint,
  variant = "box",
}: {
  kind: Kind;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  // "box" = square dropzone (photo); "row" = compact line (docs)
  variant?: "box" | "row";
}) {
  const dark = useDark();
  const T = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPdf = Boolean(value && /\.pdf($|\?)/i.test(value));
  const isImage = Boolean(value && !isPdf);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/upload/asset", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "ატვირთვა ვერ მოხერხდა");
        return;
      }
      onChange(data.url);
    } catch {
      setError("ატვირთვა ვერ მოხერხდა");
    } finally {
      setBusy(false);
    }
  }

  const dashed = dark
    ? "border-ink-700 text-ink-400 hover:border-brand-500/60 hover:text-brand-300"
    : "border-ink-300 text-ink-500 hover:border-brand-500/60 hover:text-brand-700";

  return (
    <div className="block">
      <span className={`mb-1.5 block text-[13px] font-medium ${T.t2}`}>
        {label}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={onPick}
      />

      {variant === "box" ? (
        <div className="flex items-start gap-3">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value!}
              alt=""
              className="h-24 w-24 shrink-0 rounded-card object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={`grid h-24 w-24 shrink-0 place-items-center rounded-card border border-dashed transition-colors ${dashed}`}
            >
              {busy ? Ic.clock("h-5 w-5 animate-pulse") : Ic.upload("h-5 w-5")}
            </button>
          )}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={`inline-flex h-9 items-center gap-1.5 rounded-btn px-3.5 text-[13px] font-medium transition-colors ${
                dark
                  ? "bg-ink-800 text-ink-50 border border-ink-700 hover:bg-ink-700"
                  : "bg-ink-100 text-ink-900 border border-ink-200 hover:bg-ink-200"
              } disabled:opacity-40`}
            >
              {Ic.upload("h-4 w-4")}
              {busy ? "იტვირთება…" : value ? "შეცვლა" : "ატვირთვა"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn px-3.5 text-[13px] font-medium text-danger-500 transition-colors hover:bg-danger-500/10"
              >
                {Ic.trash("h-4 w-4")} წაშლა
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={`inline-flex h-11 flex-1 items-center gap-2 rounded-field border border-dashed px-3.5 text-sm transition-colors ${dashed} disabled:opacity-40`}
          >
            {value ? Ic.check("h-4 w-4") : Ic.upload("h-4 w-4")}
            <span className="truncate">
              {busy
                ? "იტვირთება…"
                : value
                  ? isPdf
                    ? "PDF ატვირთულია"
                    : "ფაილი ატვირთულია"
                  : "ატვირთე ფაილი (სურათი ან PDF)"}
            </span>
          </button>
          {value && (
            <>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-11 items-center rounded-field px-3 text-sm ${T.t2} transition-colors hover:text-brand-500`}
              >
                {Ic.eye("h-4 w-4")}
              </a>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex h-11 items-center rounded-field px-3 text-danger-500 transition-colors hover:bg-danger-500/10"
              >
                {Ic.trash("h-4 w-4")}
              </button>
            </>
          )}
        </div>
      )}

      {error ? (
        <span className="mt-1 block text-xs text-danger-500">{error}</span>
      ) : hint ? (
        <span className={`mt-1 block text-xs ${T.muted}`}>{hint}</span>
      ) : null}
    </div>
  );
}
