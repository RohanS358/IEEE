// One shared admin password (ADMIN_PASSWORD) and a signed, HTTP-only session cookie. No user accounts.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const DAYS = 7;

// ponytail: in development with no ADMIN_PASSWORD set, "admin" works so `npm run dev` needs no setup. Production never falls back.
const isDev = () => process.env.NODE_ENV !== "production";
const password = () => process.env.ADMIN_PASSWORD || (isDev() ? "admin" : "");
const username = () => process.env.ADMIN_USERNAME || "admin";
const sign = (exp: string) => createHmac("sha256", `session:${username()}:${password()}`).update(exp).digest("hex");

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const passwordConfigured = () => !!password();
export const checkLogin = (user: string, pass: string) =>
  !!password() && same(user.trim().toLowerCase(), username().toLowerCase()) && same(pass, password());

export async function startSession() {
  const exp = String(Date.now() + DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!password()) return false;
  const [exp, sig] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  return !!exp && !!sig && Number(exp) > Date.now() && same(sig, sign(exp));
}
