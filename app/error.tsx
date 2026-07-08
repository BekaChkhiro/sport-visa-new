"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-6 text-ink-900">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-danger-500/12 text-danger-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <h1 className="font-display text-[24px] font-extrabold tracking-tight">დროებითი შეფერხება</h1>
        <p className="mt-2 text-[14px] text-ink-500">
          გვერდი ვერ ჩაიტვირთა. სცადე თავიდან — ხშირად ეს დროებითია.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-btn bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300"
          >
            თავიდან ცდა
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center rounded-btn border border-ink-200 px-6 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
          >
            მთავარზე
          </a>
        </div>
      </div>
    </div>
  );
}
