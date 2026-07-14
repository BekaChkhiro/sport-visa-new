import "server-only";
import { randomUUID } from "crypto";
import { readFile, stat } from "fs/promises";
import path from "path";
import { putObject, deleteObject, keyFromUrl } from "./r2";

// Media & document storage backed by Cloudflare R2 (S3-compatible).
// New uploads go to R2 and are served from its public URL. The legacy
// local-disk readers below still resolve any pre-R2 /api/media/* URLs.

// Legacy local-disk dir — only read for old uploads, never written to.
const LEGACY_UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const LEGACY_PREFIX = "/api/media/";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
export const ALLOWED_DOC_TYPES = ["application/pdf"];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_DOC_BYTES = 15 * 1024 * 1024; // 15MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

export type SavedFile = { url: string; storedName: string };

// Upload a file to R2 under the given folder. Returns its public URL.
export async function saveUpload(
  buffer: Buffer,
  mimeType: string,
  folder = "media",
): Promise<SavedFile> {
  const ext = EXT_BY_MIME[mimeType] ?? "bin";
  const storedName = `${randomUUID()}.${ext}`;
  const key = `${folder}/${storedName}`;
  const url = await putObject(key, buffer, mimeType);
  return { url, storedName };
}

// Delete a stored file given its public URL (no-op for external/legacy URLs).
export async function deleteByUrl(url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) return; // not an R2 URL — leave it alone
  try {
    await deleteObject(key);
  } catch {
    // already gone — ignore
  }
}

// ---- Legacy local-disk read (pre-R2 /api/media/* URLs only) ----

function safeName(name: string): string | null {
  if (!name || name.includes("/") || name.includes("\\") || name.includes(".."))
    return null;
  return name;
}

export async function readUpload(
  name: string,
): Promise<{ data: Buffer; size: number } | null> {
  const safe = safeName(name);
  if (!safe) return null;
  const filePath = path.join(LEGACY_UPLOAD_DIR, safe);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    const data = await readFile(filePath);
    return { data, size: info.size };
  } catch {
    return null;
  }
}

export function isLegacyUrl(url: string): boolean {
  return url.startsWith(LEGACY_PREFIX);
}

export function contentTypeForName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
  };
  return (ext && map[ext]) || "application/octet-stream";
}
