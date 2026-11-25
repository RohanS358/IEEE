"use server";
import { updateTag } from "next/cache";
import { checkLogin, endSession, isAdmin, startSession } from "@/lib/auth";
import { defaultContent, merge } from "@/lib/content";
import { writeContent } from "@/lib/store";

export async function login(_prev: string, form: FormData): Promise<string> {
  if (!checkLogin(String(form.get("username") ?? ""), String(form.get("password") ?? ""))) return "Wrong username or password.";
  await startSession();
  return "";
}

export async function logout() {
  await endSession();
}

export async function saveContent(json: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Session expired. Sign in again." };
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Not an object");
    await writeContent(merge(defaultContent, parsed));
    updateTag("content");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}
