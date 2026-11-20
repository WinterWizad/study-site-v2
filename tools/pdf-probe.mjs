#!/usr/bin/env node
// pdf-probe.mjs — diagnose why a PDF's text layer is/isn't extractable.
import fs from "node:fs";
import zlib from "node:zlib";

const file = process.argv[2];
const buf = fs.readFileSync(file);
const s = buf.toString("latin1");

console.log(`size: ${buf.length} B`);
console.log(`header: ${buf.subarray(0, 8).toString("latin1").trim()}`);
console.log(`"stream" occurrences: ${(s.match(/stream/g) || []).length}`);
console.log(`filters present: ${[...new Set((s.match(/\/Filter\s*\/?\w+/g) || []))].join(", ")}`);
console.log(`fonts: ${[...new Set((s.match(/\/Subtype\s*\/\w+/g) || []))].join(", ")}`);
console.log(`object streams (/ObjStm): ${(s.match(/\/ObjStm/g) || []).length}`);
console.log(`ToUnicode maps: ${(s.match(/\/ToUnicode/g) || []).length}`);
console.log(`encodings: ${[...new Set((s.match(/\/Encoding\s*\/[\w-]+/g) || []))].join(", ")}`);

const re = /stream\r\n|stream\n|stream\r/g;
let idx = 0, n = 0, inflated = 0, withText = 0, shown = 0;
while ((idx = s.indexOf("stream", idx)) !== -1) {
  n++;
  let start = idx + 6;
  if (s[start] === "\r") start++;
  if (s[start] === "\n") start++;
  const end = s.indexOf("endstream", start);
  if (end === -1) break;
  const raw = Buffer.from(s.slice(start, end), "latin1");
  idx = end + 9;
  let out = null;
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { out = fn(raw); break; } catch {}
  }
  if (out) inflated++;
  const txt = out ? out.toString("latin1") : raw.toString("latin1");
  const hasText = /Tj|TJ/.test(txt);
  if (hasText) withText++;
  if (hasText && shown < 2) {
    shown++;
    console.log(`\n--- stream #${n} (${raw.length} raw, inflated=${!!out}) ---`);
    console.log(txt.slice(0, 600).replace(/\n/g, "\\n"));
  }
}
console.log(`\nstreams: ${n}, inflated: ${inflated}, containing text ops: ${withText}`);
