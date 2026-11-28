// Team badge: the hand-made /team/<slug>.svg when there is one, otherwise the same template
// filled in with the person's role and name, so people added in the admin never get a blank card.
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
// squeeze text that would overflow the 560px pill/card instead of letting it spill off the badge
const fit = (text: string, px: number) => (text.length * px * 0.6 > 500 ? ` textLength="500" lengthAdjust="spacingAndGlyphs"` : "");

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const slug = (q.get("slug") ?? "").replace(/[^a-z0-9-]/gi, "");
  const headers = { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300", "Content-Security-Policy": "sandbox" };

  const own = slug && (await fetch(new URL(`/team/${slug}.svg`, request.url)));
  if (own && own.ok) return new Response(own.body, { headers });

  const template = await fetch(new URL("/team/media.svg", request.url));
  if (!template.ok) return new Response("Not found", { status: 404 });
  const role = (q.get("role") ?? "").slice(0, 60);
  const name = (q.get("name") ?? "").slice(0, 60);
  const svg = (await template.text())
    .replace(/(y="687"[^>]*)>[^<]*</, `$1${fit(role, 40)}>${esc(role)}<`)
    .replace(/(y="778"[^>]*)>[^<]*</, `$1${fit(name, 44)}>${esc(name)}<`);
  return new Response(svg, { headers });
}
