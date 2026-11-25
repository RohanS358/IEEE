import type { SiteContent } from "./content";

const HEX = /^#[0-9a-f]{3,8}$/i;
const SAFE_KEY = /^[a-z0-9-]+$/;

/** CSS variables for the saved theme. Only well-formed hex values and known keys get through, so content can't inject CSS. */
export function themeCss(theme: SiteContent["theme"]): string {
  const vars = Object.entries(theme.colors)
    .filter(([k, v]) => SAFE_KEY.test(k) && HEX.test(v))
    .map(([k, v]) => `--color-${k}:${v}`);
  if (HEX.test(theme.background)) vars.push(`--background:${theme.background}`);
  if (HEX.test(theme.foreground)) vars.push(`--foreground:${theme.foreground}`);
  vars.push(`--font-active:var(--font-${SAFE_KEY.test(theme.font) ? theme.font : "jakarta"})`);
  return `:root{${vars.join(";")}}`;
}
