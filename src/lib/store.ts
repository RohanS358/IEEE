// Persistence for the content document: Vercel Blob when BLOB_READ_WRITE_TOKEN is set, a local file otherwise.
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { cacheTag } from "next/cache";
import { defaultContent, merge, type SiteContent } from "./content";

const KEY = "site/content.json";
const FILE = path.join(process.cwd(), ".data", "content.json");
export const blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function readRaw(): Promise<unknown> {
  try {
    if (blobEnabled()) {
      const res = await get(KEY, { access: "private", useCache: false }); // null when nothing has been saved yet
      return res?.stream ? await new Response(res.stream).json() : null;
    }
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return null;
  }
}

/** Live-site read: cached until the admin saves (which expires the "content" tag). */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("content");
  return merge(defaultContent, await readRaw());
}

/** Admin read: always fresh. */
export async function readContent(): Promise<SiteContent> {
  return merge(defaultContent, await readRaw());
}

export async function writeContent(content: SiteContent): Promise<void> {
  const json = JSON.stringify(content, null, 2);
  if (blobEnabled()) {
    await put(KEY, json, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, json);
}
