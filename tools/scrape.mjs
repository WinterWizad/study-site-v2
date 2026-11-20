#!/usr/bin/env node
/**
 * scrape.mjs — dependency-free explorer/scraper for the BIM study sources.
 *
 *   node tools/scrape.mjs <url> [<url> ...]          fetch, convert HTML→markdown, cache
 *   node tools/scrape.mjs --links <url>              list same-host links found on a page
 *   node tools/scrape.mjs --crawl <url> --match <s> [--max 60] [--depth 2] [--force]
 *   node tools/scrape.mjs --pdf <url>                download a PDF and extract its text
 *
 * Everything lands in _raw/ :
 *   _raw/html/<site>/<slug>.html   original markup (the truth, in case conversion loses something)
 *   _raw/text/<site>/<slug>.md     readable markdown-ish text
 *   _raw/pdf/<slug>.pdf            downloaded PDFs
 *   _raw/manifest.tsv              url, status, bytes, title, saved path, time
 *
 * Cache-first: an existing text file is not re-fetched unless --force is passed.
 * Polite: sequential requests, 400 ms apart, identifies itself.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const RAW = "_raw";
const DELAY_MS = 400;
const UA =
  "Mozilla/5.0 (compatible; bim-exam-prep/1.0; personal study archive; +local)";
const args = process.argv.slice(2);

const flags = { force: false, max: 60, depth: 2, match: null, mode: "fetch" };
const urls = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--force") flags.force = true;
  else if (a === "--links") flags.mode = "links";
  else if (a === "--crawl") flags.mode = "crawl";
  else if (a === "--pdf") flags.mode = "pdf";
  else if (a === "--match") flags.match = args[++i];
  else if (a === "--max") flags.max = parseInt(args[++i], 10);
  else if (a === "--depth") flags.depth = parseInt(args[++i], 10);
  else if (a.startsWith("http")) urls.push(a);
}

/* ---------------------------------------------------------------- helpers */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function siteKey(u) {
  return new URL(u).hostname.replace(/^www\./, "").replace(/[^a-z0-9.]/gi, "-");
}

function slugFor(u) {
  const p = new URL(u);
  const raw = (p.pathname + (p.search ? "?" + p.search : ""))
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (raw || "index").slice(0, 140).toLowerCase();
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function manifest(line) {
  ensureDir(RAW);
  fs.appendFileSync(path.join(RAW, "manifest.tsv"), line + "\n", "utf8");
}

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", middot: "·", times: "×", rarr: "→", deg: "°",
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** Crude but faithful HTML → markdown. Tables survive, which is the whole point. */
function htmlToMarkdown(html) {
  let h = html;

  // keep only the main content when the site marks it
  const main = h.match(/<main[\s\S]*?<\/main>/i);
  if (main && main[0].length > 800) h = main[0];

  h = h
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

  // structural → markdown
  h = h
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h1>/gi, "\n\n")
    .replace(/<h1[^>]*>/gi, "\n\n# ")
    .replace(/<\/h2>/gi, "\n\n")
    .replace(/<h2[^>]*>/gi, "\n\n## ")
    .replace(/<\/h3>/gi, "\n\n")
    .replace(/<h3[^>]*>/gi, "\n\n### ")
    .replace(/<\/h[4-6]>/gi, "\n")
    .replace(/<h[4-6][^>]*>/gi, "\n#### ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<tr[^>]*>/gi, "\n| ")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<t[dh][^>]*>/gi, "")
    .replace(/<\/table>/gi, "\n\n")
    .replace(/<hr[^>]*>/gi, "\n\n---\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n");

  // inline links: keep the text, and the href when it is a real path
  h = h.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const t = text.replace(/<[^>]+>/g, "").trim();
    if (!t) return "";
    return href.startsWith("http") || href.startsWith("/")
      ? `[${t}](${href})`
      : t;
  });

  h = h.replace(/<[^>]+>/g, "");
  h = decodeEntities(h);

  // tidy: collapse whitespace, drop empty table rows, normalise blank lines
  h = h
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l) => !/^\|\s*\|?$/.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return h;
}

function titleOf(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]).replace(/\s+/g, " ").trim() : "";
}

function linksOf(html, base) {
  const out = new Set();
  const re = /<a[^>]*href="([^"#]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1], base).toString().split("#")[0];
      if (abs.startsWith("http")) out.add(abs);
    } catch {}
  }
  return [...out];
}

/* ------------------------------------------------------------------ fetch */

async function fetchPage(url, { tries = 3 } = {}) {
  let lastErr;
  for (let t = 1; t <= tries; t++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/pdf,*/*" },
        redirect: "follow",
      });
      const buf = Buffer.from(await res.arrayBuffer());
      return { status: res.status, buf, type: res.headers.get("content-type") || "" };
    } catch (e) {
      lastErr = e;
      await sleep(600 * t);
    }
  }
  throw lastErr;
}

async function savePage(url, { force = false } = {}) {
  const site = siteKey(url);
  const slug = slugFor(url);
  const htmlPath = path.join(RAW, "html", site, slug + ".html");
  const txtPath = path.join(RAW, "text", site, slug + ".md");

  if (!force && fs.existsSync(txtPath)) {
    return { url, cached: true, txtPath, title: "", bytes: fs.statSync(txtPath).size };
  }

  const { status, buf, type } = await fetchPage(url);
  ensureDir(path.dirname(htmlPath));
  ensureDir(path.dirname(txtPath));

  if (type.includes("pdf") || buf.subarray(0, 4).toString() === "%PDF") {
    const pdfPath = path.join(RAW, "pdf", slug + ".pdf");
    ensureDir(path.dirname(pdfPath));
    fs.writeFileSync(pdfPath, buf);
    const text = extractPdfText(buf);
    fs.writeFileSync(txtPath, `# ${url}\n\n${text}`, "utf8");
    manifest([url, status, buf.length, "(pdf)", pdfPath, new Date().toISOString()].join("\t"));
    return { url, status, bytes: buf.length, txtPath, title: "(pdf)", chars: text.length };
  }

  const html = buf.toString("utf8");
  fs.writeFileSync(htmlPath, html, "utf8");
  const title = titleOf(html);
  const md = htmlToMarkdown(html);
  fs.writeFileSync(txtPath, `# ${title || url}\n_Source: ${url}_\n\n${md}\n`, "utf8");
  manifest([url, status, buf.length, title.replace(/\t/g, " "), txtPath, new Date().toISOString()].join("\t"));
  return { url, status, bytes: buf.length, txtPath, title, chars: md.length };
}

/* -------------------------------------------------------------- pdf text */

function pdfUnescape(s) {
  return s
    .replace(/\\([nrtbf()\\])/g, (_, c) => ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" }[c]))
    .replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
}

/**
 * Dependency-free PDF text extraction: inflate FlateDecode content streams and
 * pull the text-showing operators. Word→PDF exports often place one word (or
 * word fragment) per BT/ET block, so line structure is rebuilt from the `Tm`
 * text-matrix Y coordinate rather than from block boundaries. If a PDF uses CID
 * fonts with a custom encoding the letters themselves cannot be recovered
 * without the embedded ToUnicode map; such output is detected and rejected, and
 * the caller should fall back to an HTML transcription of the same content.
 */
function extractPdfText(buf) {
  const chunks = [];
  const s = buf.toString("latin1");
  // (?<!end) is load-bearing: without it the match starts inside "endstream"
  // and every capture is misaligned, which silently yields zero output.
  const re = /(?<!end)stream\r?\n([\s\S]*?)endstream/g;
  let m;
  while ((m = re.exec(s))) {
    const raw = Buffer.from(m[1], "latin1");
    let data = null;
    for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
      try { data = fn(raw); break; } catch {}
    }
    if (!data) continue;
    const content = data.toString("latin1");
    if (!/(Tj|TJ)/.test(content)) continue;

    const token =
      /\((?:\\.|[^\\()])*\)\s*Tj|\[(?:[^\]\\]|\\.)*\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*Tj|([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm|\bT[dD]\b|\bT\*\b|\bET\b/g;

    let out = "";
    let lastY = null;
    let t;
    while ((t = token.exec(content))) {
      const tok = t[0];

      if (t[5] !== undefined) {
        // text matrix: a new Y means a new visual line
        const y = parseFloat(t[6]);
        if (lastY !== null && Math.abs(y - lastY) > 1) out += "\n";
        lastY = y;
        continue;
      }
      if (/^T[dD]$|^T\*$/.test(tok)) { out += "\n"; continue; }
      if (tok === "ET") continue; // one word per block: no separator needed

      if (tok.startsWith("[")) {
        const inner = tok.match(/\((?:\\.|[^\\()])*\)/g) || [];
        out += inner.map((x) => pdfUnescape(x.slice(1, -1))).join("");
      } else if (t[1]) {
        const hex = t[1].replace(/\s+/g, "");
        let hx = "";
        for (let i = 0; i < hex.length; i += 2) {
          const code = parseInt(hex.slice(i, i + 2), 16);
          if (code >= 32 && code < 127) hx += String.fromCharCode(code);
        }
        out += hx;
      } else if (tok.endsWith("Tj")) {
        out += pdfUnescape(tok.replace(/\)\s*Tj$/, "").slice(1));
      }
    }
    if (out.trim()) chunks.push(out);
  }

  let text = chunks.join("\n");

  // Detect the failure mode we cannot fix: a CID-encoded font with no usable
  // mapping produces text with almost no real words.
  const words = text.match(/[A-Za-z]{3,}/g) || [];
  if (text.length > 500 && words.length < text.length / 40) {
    return "[PDF text layer is CID-encoded and could not be decoded dependably — use an HTML transcription of this document instead.]";
  }

  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------------------- main */

async function doFetch(list) {
  for (const u of list) {
    try {
      const r = await savePage(u, { force: flags.force });
      if (r.cached) console.log(`cached   ${u}`);
      else console.log(`ok ${r.status}  ${String(r.bytes).padStart(7)} B  ${String(r.chars).padStart(6)} ch  ${r.txtPath}`);
      await sleep(DELAY_MS);
    } catch (e) {
      console.log(`FAIL     ${u}  — ${e.message}`);
    }
  }
}

async function doLinks(u) {
  const { buf } = await fetchPage(u);
  const html = buf.toString("utf8");
  const links = linksOf(html, u).filter((l) => new URL(l).hostname === new URL(u).hostname);
  for (const l of links.sort()) console.log(l);
  console.log(`\n${links.length} same-host links`);
}

async function doCrawl(start) {
  const host = new URL(start).hostname;
  const queue = [{ url: start, depth: 0 }];
  const seen = new Set();
  let saved = 0;

  while (queue.length && saved < flags.max) {
    const { url, depth } = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    let html;
    try {
      const r = await fetchPage(url);
      if (r.type.includes("pdf") || r.buf.subarray(0, 4).toString() === "%PDF") {
        const slug = slugFor(url);
        const pdfPath = path.join(RAW, "pdf", slug + ".pdf");
        ensureDir(path.dirname(pdfPath));
        fs.writeFileSync(pdfPath, r.buf);
        manifest([url, r.status, r.buf.length, "(pdf)", pdfPath, new Date().toISOString()].join("\t"));
        console.log(`ok pdf   ${url}`);
        saved++;
        await sleep(DELAY_MS);
        continue;
      }
      html = r.buf.toString("utf8");

      const slug = slugFor(url);
      const site = siteKey(url);
      const htmlPath = path.join(RAW, "html", site, slug + ".html");
      const txtPath = path.join(RAW, "text", site, slug + ".md");
      ensureDir(path.dirname(htmlPath));
      ensureDir(path.dirname(txtPath));
      fs.writeFileSync(htmlPath, html, "utf8");
      const title = titleOf(html);
      const md = htmlToMarkdown(html);
      fs.writeFileSync(txtPath, `# ${title || url}\n_Source: ${url}_\n\n${md}\n`, "utf8");
      manifest([url, r.status, r.buf.length, title.replace(/\t/g, " "), txtPath, new Date().toISOString()].join("\t"));
      console.log(`ok ${r.status}  ${String(r.buf.length).padStart(7)} B  ${txtPath}`);
      saved++;
    } catch (e) {
      console.log(`FAIL     ${url}  — ${e.message}`);
      await sleep(DELAY_MS);
      continue;
    }

    if (depth < flags.depth) {
      for (const l of linksOf(html, url)) {
        if (new URL(l).hostname !== host) continue;
        if (flags.match && !l.includes(flags.match)) continue;
        if (seen.has(l)) continue;
        if (/\.(jpg|jpeg|png|gif|svg|webp|css|js|ico|woff2?|zip)$/i.test(l)) continue;
        queue.push({ url: l, depth: depth + 1 });
      }
    }
    await sleep(DELAY_MS);
  }
  console.log(`\n${saved} pages saved to ${RAW}/  (see manifest.tsv)`);
}

async function doPdf(u) {
  const { buf } = await fetchPage(u);
  const slug = slugFor(u);
  const pdfPath = path.join(RAW, "pdf", slug + ".pdf");
  ensureDir(path.dirname(pdfPath));
  fs.writeFileSync(pdfPath, buf);
  const text = extractPdfText(buf);
  const txtPath = path.join(RAW, "text", "pdf", slug + ".md");
  ensureDir(path.dirname(txtPath));
  fs.writeFileSync(txtPath, `# ${u}\n\n${text}`, "utf8");
  manifest([u, 200, buf.length, "(pdf)", pdfPath, new Date().toISOString()].join("\t"));
  console.log(`saved ${pdfPath}  (${buf.length} B)`);
  console.log(`extracted ${text.length} chars → ${txtPath}`);
  console.log(`\n--- first 700 chars ---\n${text.slice(0, 700)}`);
}

/** Rebuild _raw/INDEX.md from manifest.tsv: what we have, where it came from. */
function doIndex() {
  const mf = path.join(RAW, "manifest.tsv");
  if (!fs.existsSync(mf)) {
    console.log("no manifest yet — scrape something first");
    return;
  }
  const rows = fs
    .readFileSync(mf, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.split("\t"));

  // manifest can contain duplicates after --force; keep the last write per url
  const byUrl = new Map();
  for (const r of rows) byUrl.set(r[0], r);

  const bySite = new Map();
  for (const r of byUrl.values()) {
    let host = "?";
    try { host = new URL(r[0]).hostname.replace(/^www\./, ""); } catch {}
    if (!bySite.has(host)) bySite.set(host, []);
    bySite.get(host).push(r);
  }

  const lines = [
    "# _raw index",
    "",
    `Generated ${new Date().toISOString()} · ${byUrl.size} unique URLs`,
    "",
    "Regenerate with `node tools/scrape.mjs --index`. Original HTML is kept alongside the text so nothing lost in conversion is lost for good.",
    "",
  ];

  for (const [host, rs] of [...bySite.entries()].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`## ${host} — ${rs.length} pages`, "");
    lines.push("| Title | URL | Local text |");
    lines.push("|---|---|---|");
    for (const r of rs.sort((a, b) => a[0].localeCompare(b[0]))) {
      const title = (r[3] || "—").replace(/\|/g, "\\|").slice(0, 90);
      const local = (r[4] || "").replace(/\\/g, "/").replace(/\|/g, "\\|");
      lines.push(`| ${title} | ${r[0]} | \`${local}\` |`);
    }
    lines.push("");
  }

  fs.writeFileSync(path.join(RAW, "INDEX.md"), lines.join("\n"), "utf8");
  console.log(`_raw/INDEX.md written · ${byUrl.size} unique URLs across ${bySite.size} hosts`);
}

if (!urls.length && !args.includes("--index")) {
  console.log("usage: node tools/scrape.mjs [--links|--crawl|--pdf|--index] <url> [--match s] [--max n] [--depth n] [--force]");
  process.exit(0);
}

if (args.includes("--index")) doIndex();
else if (flags.mode === "crawl") await doCrawl(urls[0]);
else if (flags.mode === "links") await doLinks(urls[0]);
else if (flags.mode === "pdf") await doPdf(urls[0]);
else await doFetch(urls);
