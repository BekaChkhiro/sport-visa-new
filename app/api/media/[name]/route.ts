import { readUpload, contentTypeForName } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = await readUpload(name);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file.data), {
    status: 200,
    headers: {
      "Content-Type": contentTypeForName(name),
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
