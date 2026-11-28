// Serves uploaded images from the private Blob store to site visitors.
import { get } from "@vercel/blob";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathname = (await params).path.join("/");
  if (!pathname.startsWith("uploads/")) return new Response("Not found", { status: 404 });
  const res = await get(pathname, { access: "private" }).catch(() => null);
  if (!res?.stream) return new Response("Not found", { status: 404 });
  return new Response(res.stream, {
    headers: { "Content-Type": res.blob.contentType, "Cache-Control": "public, max-age=31536000, immutable", "Content-Security-Policy": "sandbox" },
  });
}
