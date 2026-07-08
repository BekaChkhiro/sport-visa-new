import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile, stat } from "fs/promises";
import path from "path";

// Local-disk storage for uploaded media.
// Swap this module for S3/Cloudinary later — the public interface stays the same.

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

// URL prefix that maps to the media-serving route handler.
const PUBLIC_PREFIX = "/api/media/";

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

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type SavedFile = { url: string; storedName: string };

export async function saveUpload(
  buffer: Buffer,
  mimeType: string,
): Promise<SavedFile> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = EXT_BY_MIME[mimeType] ?? "bin";
  const storedName = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);
  return { url: `${PUBLIC_PREFIX}${storedName}`, storedName };
}

// Guard against path traversal — only allow bare file names.
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
  const filePath = path.join(UPLOAD_DIR, safe);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    const data = await readFile(filePath);
    return { data, size: info.size };
  } catch {
    return null;
  }
}

// Delete a stored file given its public URL (no-op for external URLs).
export async function deleteByUrl(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  const name = safeName(url.slice(PUBLIC_PREFIX.length));
  if (!name) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // already gone — ignore
  }
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
  };
  return (ext && map[ext]) || "application/octet-stream";
}
