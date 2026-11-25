"use client";
// A form generated from the shape of the content itself: every string, number, list and nested object in
// SiteContent gets an input, so anything added to the content model is editable here without more UI code.
import { useEffect, useRef, useState, useTransition } from "react";
import { FONTS, merge, type SiteContent } from "@/lib/content";
import { logout, saveContent } from "./actions";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const HEX = /^#[0-9a-f]{6}$/i;
const COLOR_KEY = /color|background|foreground|accent|gradient|button|^ieee-/i;
const IMAGE_KEY = /^(src|cover|logo|art|image)$/;
const LONG_KEY = /^(body|description|excerpt|blurb|intro|legal|tagline)$/;
const human = (k: string) => k.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const blank = (v: Json): Json =>
  typeof v === "string" ? "" : typeof v === "number" ? 0 : typeof v === "boolean" ? false : Array.isArray(v) ? [] :
  v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : "";

const summary = (v: Json, i: number) => {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const first = Object.values(v).find((x) => typeof x === "string" && x.trim());
    if (typeof first === "string") return `${i + 1}. ${first.slice(0, 60)}`;
  }
  return `Item ${i + 1}`;
};

const input =
  "w-full rounded-xl border border-[#6dcff6]/25 bg-[#001a3a]/70 px-4 py-2.5 text-sm text-white placeholder:text-[#6dcff6]/40 outline-none transition-colors hover:border-[#6dcff6]/50 focus:border-[#00b5e2] focus:ring-2 focus:ring-[#00b5e2]/25";
const btn =
  "rounded-full border border-[#6dcff6]/40 px-3 py-1 text-xs font-medium text-[#b9e5fa] transition-colors hover:bg-[#b9e5fa]/15 aria-pressed:bg-[#b9e5fa]/25 aria-pressed:text-white disabled:pointer-events-none disabled:opacity-30";
const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#00b5e2]";
const panel = "rounded-2xl border border-[#6dcff6]/20 bg-[#001a3a]/50";

function Upload({ onDone }: { onDone: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState("");
  async function pick(file?: File) {
    if (!file) return;
    setState("Uploading…");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    if (res.ok) { onDone(json.url); setState(""); } else setState(json.error ?? "Upload failed.");
  }
  return (
    <>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" className={btn} onClick={() => ref.current?.click()}>Upload</button>
      {state && <span className="text-xs text-[#ffc72c]">{state}</span>}
    </>
  );
}

function Str({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  if (k === "font")
    return (
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(FONTS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    );
  if (HEX.test(value) || COLOR_KEY.test(k))
    return (
      <div className="flex items-center gap-2">
        <input type="color" aria-label={k} value={HEX.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-[#6dcff6]/25 bg-[#001a3a]/70 p-1" />
        <input className={input + " max-w-32 font-mono"} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  if (IMAGE_KEY.test(k))
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value && <img src={value} alt="" className="h-10 w-24 rounded-lg bg-[#001a3a] object-contain p-1" />}
        <input className={input + " min-w-48 flex-1"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/path/to/image or upload" />
        <Upload onDone={onChange} />
      </div>
    );
  if (LONG_KEY.test(k) || value.includes("\n") || value.length > 90)
    return <textarea className={input + " min-h-28 leading-6"} rows={Math.min(14, Math.max(3, value.split("\n").length + Math.ceil(value.length / 90)))} value={value} onChange={(e) => onChange(e.target.value)} />;
  return <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Node({ k, value, onChange }: { k: string; value: Json; onChange: (v: Json) => void }) {
  if (typeof value === "string") return <Str k={k} value={value} onChange={onChange} />;
  if (typeof value === "number") return <input type="number" className={input + " max-w-32"} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
  if (typeof value === "boolean") return <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />;
  if (Array.isArray(value)) return <List k={k} items={value} onChange={onChange} />;
  if (value && typeof value === "object") return <Fields value={value} onChange={onChange} />;
  return null;
}

function Fields({ value, onChange, top = false }: { value: Obj; onChange: (v: Obj) => void; top?: boolean }) {
  return (
    <div className="space-y-5">
      {Object.entries(value).map(([k, v]) => {
        const group = v !== null && typeof v === "object";
        const body = <Node k={k} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />;
        if (top && group)
          return (
            <section key={k} className={panel + " p-5 sm:p-6"}>
              <h3 className="mb-4 text-base font-semibold text-white">{human(k)}</h3>
              {body}
            </section>
          );
        return (
          <div key={k} className={group ? "border-l border-[#6dcff6]/25 pl-4" : top ? panel + " p-5 sm:p-6" : ""}>
            <label className={label}>{human(k)}</label>
            {body}
          </div>
        );
      })}
    </div>
  );
}

function List({ k, items, onChange }: { k: string; items: Json[]; onChange: (v: Json[]) => void }) {
  const set = (i: number, v: Json) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const nested = item !== null && typeof item === "object";
        const controls = (
          <span className="flex shrink-0 gap-1">
            <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button type="button" className={btn + " hover:!border-[#ff8a9b] hover:!bg-[#ba0c2f]/30"} onClick={() => confirm("Delete this item?") && onChange(items.filter((_, j) => j !== i))} aria-label="Delete">✕</button>
          </span>
        );
        return nested ? (
          <details key={i} className="group rounded-xl border border-[#6dcff6]/20 bg-[#002855]/40 open:border-[#6dcff6]/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium text-white marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2"><span aria-hidden className="text-[#00b5e2] transition-transform group-open:rotate-90">›</span><span className="truncate">{summary(item, i)}</span></span>
              <span onClick={(e) => e.preventDefault()}>{controls}</span>
            </summary>
            <div className="border-t border-[#6dcff6]/15 p-4"><Node k={k} value={item} onChange={(v) => set(i, v)} /></div>
          </details>
        ) : (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1"><Node k={k} value={item} onChange={(v) => set(i, v)} /></div>
            {controls}
          </div>
        );
      })}
      <button type="button" className={btn + " !border-[#00b5e2]/60 !px-4 !py-1.5 !text-[#00b5e2]"} onClick={() => onChange([...items, blank(items[0] ?? "")])}>+ Add</button>
    </div>
  );
}

const FRAME_HEIGHT: Record<string, number> = { seo: 240, nav: 200 };

// Live preview: the real site components, rendered in an iframe from the unsaved draft.
function PreviewFrame({ section, content }: { section: string; content: Obj }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const latest = useRef({ section, content });
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const vw = mobile ? 390 : 1280;
  const scale = size.w ? Math.min(1, size.w / vw) : 1;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  useEffect(() => {
    latest.current = { section, content };
  });

  useEffect(() => {
    const send = () => ref.current?.contentWindow?.postMessage({ type: "preview", ...latest.current }, location.origin);
    const onReady = (e: MessageEvent) => e.source === ref.current?.contentWindow && e.data?.type === "ready" && send();
    window.addEventListener("message", onReady);
    const t = setTimeout(send, 150); // debounce typing
    return () => {
      window.removeEventListener("message", onReady);
      clearTimeout(t);
    };
  }, [section, content, open]);

  return (
    <div className={panel + " flex flex-col overflow-hidden xl:sticky xl:top-[4.75rem] xl:h-[calc(100vh-5.75rem)]"}>
      <div className="flex items-center gap-2 border-b border-[#6dcff6]/15 px-4 py-2.5">
        <span className="mr-auto text-xs font-semibold uppercase tracking-wider text-[#00b5e2]">Live preview</span>
        <button type="button" className={btn} aria-pressed={!mobile} onClick={() => setMobile(false)}>Desktop</button>
        <button type="button" className={btn} aria-pressed={mobile} onClick={() => setMobile(true)}>Mobile</button>
        <button type="button" className={btn + " xl:hidden"} onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"}</button>
      </div>
      {open && (
        <div ref={box} className="relative h-[var(--fh)] flex-none overflow-hidden bg-[#000a1a] p-3 xl:h-auto xl:flex-1" style={{ ["--fh" as string]: `${FRAME_HEIGHT[section] ?? 560}px` }}>
          {/* desktop renders at a true 1280px viewport and is scaled down to fit, so the site's breakpoints match a real screen */}
          <div className="relative mx-auto h-full" style={{ width: vw * scale }}>
            <iframe
              ref={ref}
              src="/admin/preview"
              title={`${human(section)} preview`}
              className="absolute left-0 top-0 origin-top-left rounded-lg border border-[#6dcff6]/20 bg-[#002855]"
              style={{ width: vw, height: size.h / scale, transform: `scale(${scale})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const download = (data: unknown, name: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

// Paste JSON to change any part of the site. Only the keys you include change; lists inside them are replaced whole.
function JsonPanel({ content, defaults, onApply }: { content: Obj; defaults: SiteContent; onApply: (next: Obj, save: boolean) => void }) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const parse = (): Obj | null => {
    let v: unknown;
    try { v = JSON.parse(text); } catch (e) { setNote(`Invalid JSON: ${e instanceof Error ? e.message : "could not parse"}`); return null; }
    if (!v || typeof v !== "object" || Array.isArray(v)) { setNote("The JSON must be an object like { \"hero\": { ... } }."); return null; }
    const unknown = Object.keys(v).filter((k) => !(k in defaults));
    if (unknown.length) { setNote(`Unknown top-level key${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Valid keys: ${Object.keys(defaults).join(", ")}.`); return null; }
    return v as Obj;
  };
  const apply = (save: boolean) => {
    const v = parse();
    if (!v) return;
    onApply(merge(content, v) as Obj, save);
    setNote(save ? "Applied and saved." : "Applied to the editor. Check the other tabs, then Save changes.");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6">
        Paste JSON to change the site in one go. Include only the parts you want to change, for example{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-white">{`{ "hero": { "slogan": ["Build.", "Ship."] } }`}</code>. Lists
        (slogan, events, team groups…) are replaced whole, so include every item you want to keep. Download the current JSON to see the exact format.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => { setText(JSON.stringify(content, null, 2)); setNote("Loaded the current content."); }}>Load current</button>
        <button type="button" className={btn} onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}>{copied ? "Copied" : "Copy"}</button>
        <button type="button" className={btn} onClick={() => download(content, "site-content.json")}>Download current</button>
        <button type="button" className={btn} onClick={() => download(defaults, "site-content-original.json")}>Download original format</button>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setNote(""); }}
        spellCheck={false}
        aria-label="Site content JSON"
        className={input + " h-[60vh] min-h-80 resize-y font-mono text-xs leading-5"}
      />
      {note && <p role="status" className={`text-sm ${/^(Invalid|The JSON|Unknown)/.test(note) ? "text-[#ff8a9b]" : "text-[#6dcff6]"}`}>{note}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => apply(false)} className="rounded-full border border-[#6dcff6]/60 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b9e5fa]/15">
          Apply to editor
        </button>
        <button type="button" onClick={() => apply(true)} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#002855] transition-colors hover:bg-[#b9e5fa]">
          Apply and save
        </button>
      </div>
    </div>
  );
}

export default function Editor({ initial, defaults }: { initial: SiteContent; defaults: SiteContent }) {
  const [content, setContent] = useState<Obj>(initial as unknown as Obj);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const tabs = [...Object.keys(content), "json"];
  const [tab, setTab] = useState(tabs[0]);
  const isJson = tab === "json";
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(content) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const persist = (c: Obj) =>
    start(async () => {
      const body = JSON.stringify(c);
      const r = await saveContent(body);
      if (r.ok) { setSaved(body); setMsg("Saved. The site is updated."); } else setMsg(r.error ?? "Could not save.");
    });
  const save = () => persist(content);

  const importFile = async (file?: File) => {
    if (!file) return;
    try { setContent(JSON.parse(await file.text())); setMsg("Imported. Review it, then Save."); } catch { setMsg("That file is not valid JSON."); }
  };

  const exportJson = () => download(content, "site-content.json");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[#6dcff6]/15 bg-[#002855]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3 md:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={initial.nav.logo} alt="IEEE" className="h-6 w-auto" />
          <span className="mr-auto rounded-full bg-[#00b5e2]/20 px-3 py-0.5 text-xs font-semibold text-[#6dcff6]">Admin</span>
          <span aria-live="polite" className={`text-xs ${dirty && !pending ? "text-[#ffc72c]" : "text-[#6dcff6]"}`}>
            {dirty && !pending ? "● Unsaved changes" : msg}
          </span>
          <a href="/" target="_blank" className={btn + " !py-1.5"}>View site ↗</a>
          <button type="button" className={btn + " !py-1.5"} onClick={exportJson}>Export</button>
          <label className={btn + " cursor-pointer !py-1.5"}>
            Import
            <input type="file" accept="application/json" hidden onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <button type="button" className={btn + " !py-1.5"} onClick={() => logout()}>Sign out</button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#002855] transition-colors hover:bg-[#b9e5fa] disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] gap-6 px-5 py-6 md:px-8 xl:grid-cols-[170px_minmax(0,1fr)_minmax(0,1.15fr)] xl:gap-7">
        <nav aria-label="Sections" className="order-1 flex gap-1.5 overflow-x-auto pb-1 xl:sticky xl:top-[4.75rem] xl:flex-col xl:self-start xl:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={t === tab}
              className={`shrink-0 rounded-full px-4 py-2 text-left text-sm font-medium transition-colors xl:rounded-xl ${
                t === tab ? "bg-white text-[#002855]" : "text-[#b9e5fa] hover:bg-[#b9e5fa]/10"
              }`}
            >
              {t === "json" ? "JSON" : human(t)}
            </button>
          ))}
        </nav>

        <main className={`order-3 min-w-0 pb-24 xl:order-2 ${isJson ? "xl:col-span-2" : ""}`}>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{isJson ? "JSON" : human(tab)}</h2>
            {!isJson && (
              <button
                type="button"
                className={btn}
                onClick={() => confirm(`Reset "${human(tab)}" to the original content?`) && setContent({ ...content, [tab]: structuredClone(defaults[tab as keyof SiteContent]) as unknown as Json })}
              >
                Reset to defaults
              </button>
            )}
          </div>
          {isJson ? (
            <JsonPanel
              content={content}
              defaults={defaults}
              onApply={(next, andSave) => {
                setContent(next);
                if (andSave) persist(next);
              }}
            />
          ) : (
            <div key={tab}>
              <Fields top value={content[tab] as Obj} onChange={(v) => setContent({ ...content, [tab]: v })} />
            </div>
          )}
        </main>

        {!isJson && (
          <aside aria-label="Live preview" className="order-2 min-w-0 xl:order-3">
            <PreviewFrame section={tab} content={content} />
          </aside>
        )}
      </div>
    </div>
  );
}
