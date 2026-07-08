"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ka">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f2f6f4", color: "#131d1a" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>დროებითი შეფერხება</h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "#4b5f58" }}>
              გვერდი ვერ ჩაიტვირთა. სცადე თავიდან.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                height: 44,
                padding: "0 24px",
                border: "none",
                borderRadius: 10,
                background: "#22e07a",
                color: "#04140c",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              თავიდან ცდა
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
