// Image upload for the admin: Vercel Blob in production, public/uploads locally.
import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { blobEnabled } from "@/lib/store";

const TYPES: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif",
};
const MAX = 4 * 1024 * 1024; // Vercel function bodies cap at 4.5 MB

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Use a PNG, JPG, WebP, GIF, SVG or AVIF image." }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "Image is over 4 MB." }, { status: 400 });

  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
  const name = `${base}-${Date.now().toString(36)}.${ext}`;
  if (blobEnabled()) {
    // The store is private, so images are served through /api/media.
    await put(`uploads/${name}`, file, { access: "private", addRandomSuffix: false, contentType: file.type });
    return Response.json({ url: `/api/media/uploads/${name}` });
  }
  await fs.mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${name}` });
}
