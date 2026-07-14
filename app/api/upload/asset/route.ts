import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  saveUpload,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  MAX_IMAGE_BYTES,
  MAX_DOC_BYTES,
} from "@/lib/storage";
import { r2Configured } from "@/lib/r2";

// Uploads a single passport asset (profile photo / grades sheet / contract)
// to R2 and returns its public URL. Does NOT create a PlayerMedia row — the
// caller stores the URL on the profile field.

type AssetKind = "photo" | "grades" | "contract";

const FOLDER: Record<AssetKind, string> = {
  photo: "photos",
  grades: "grades",
  contract: "contracts",
};

// photo → images only; grades/contract → images or PDF.
function allowedTypes(kind: AssetKind): string[] {
  return kind === "photo"
    ? ALLOWED_IMAGE_TYPES
    : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PLAYER") {
    return NextResponse.json({ error: "არაავტორიზებული" }, { status: 401 });
  }

  if (!r2Configured()) {
    return NextResponse.json(
      { error: "ფაილების ატვირთვა დროებით მიუწვდომელია" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "არასწორი მოთხოვნა" }, { status: 400 });
  }

  const file = formData.get("file");
  const kindRaw = (formData.get("kind") as string | null) ?? "photo";
  const kind = (["photo", "grades", "contract"].includes(kindRaw)
    ? kindRaw
    : "photo") as AssetKind;

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "ფაილი არ არის მიმაგრებული" },
      { status: 400 },
    );
  }

  const mime = file.type;
  if (!allowedTypes(kind).includes(mime)) {
    return NextResponse.json(
      { error: "დაუშვებელი ფაილის ტიპი" },
      { status: 400 },
    );
  }

  const isDoc = ALLOWED_DOC_TYPES.includes(mime);
  const maxBytes = isDoc ? MAX_DOC_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { error: `ფაილი ძალიან დიდია (მაქს. ${mb}MB)` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveUpload(buffer, mime, FOLDER[kind]);

  return NextResponse.json({ ok: true, url: saved.url });
}
