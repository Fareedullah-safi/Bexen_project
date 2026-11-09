// Lib/fixText.js
// ONE file, no dependencies. Cleans admin-editor HTML ONCE on the server,
// so every block receives clean data and no block file needs to change.
//
//   fixData(block.data)  -> cleans every text field inside it
//
// Fixes: &nbsp; (cut words), empty paragraphs / stray <br> (big gaps),
// unsafe tags & attributes. Keeps bold, italic, underline, text color,
// highlight, alignment, lists and links.

const COLOR =
  /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\))$/i;
const SIZE = /^[\d.]+(px|rem|em|%)$/;

const STYLE_RULES = {
  color: COLOR,
  "background-color": COLOR,
  "font-size": SIZE,
  "font-weight": /^(bold|normal|[1-9]00)$/,
  "line-height": /^[\d.]+$/,
  padding: /^[\d.]+(px|rem|em)?(\s+[\d.]+(px|rem|em)?){0,3}$/,
  "border-radius": SIZE,
  "text-align": /^(left|right|center|justify)$/,
};

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "span",
  "mark",
  "a",
  "ul",
  "ol",
  "li",
  "sub",
  "sup",
  "blockquote",
  "h1",
  "h2",
  "h3",
]);

const ALIGN_CLASS = /^ql-align-(left|center|right|justify)$/;
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const TAG_RE =
  /<(\/?)([a-z][a-z0-9]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/gi;
const ATTR_RE = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

const EMPTY_INLINE =
  /<(span|strong|b|em|i|u|s|mark)(?:\s[^>]*)?>(?:\s|<br>)*<\/\1>/gi;
const EMPTY_P = /<p(?:\s[^>]*)?>(?:\s|<br>)*<\/p>/gi;
const TRAILING_BR = /(?:<br>\s*)+<\/p>/gi;
const LEADING_BR = /(<p(?:\s[^>]*)?>)\s*(?:<br>\s*)+/gi;
const MANY_BR = /(?:<br>\s*){3,}/gi;

const escapeText = (s) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) =>
  s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function cleanStyle(style) {
  return style
    .split(";")
    .map((decl) => {
      const i = decl.indexOf(":");
      if (i < 0) return "";
      const prop = decl.slice(0, i).trim().toLowerCase();
      const val = decl.slice(i + 1).trim();
      const rule = STYLE_RULES[prop];
      return rule && rule.test(val) ? `${prop}:${val}` : "";
    })
    .filter(Boolean)
    .join(";");
}

function buildTag(closing, rawName, rawAttrs) {
  const name = rawName.toLowerCase();
  if (!ALLOWED_TAGS.has(name)) return "";
  if (name === "br") return closing ? "" : "<br>";
  if (closing) return `</${name}>`;

  let style = "";
  let cls = "";
  let href = "";

  for (const m of rawAttrs.matchAll(ATTR_RE)) {
    const key = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? "";
    if (key === "style") style = cleanStyle(val);
    else if (key === "class")
      cls = val
        .split(/\s+/)
        .filter((c) => ALIGN_CLASS.test(c))
        .join(" ");
    else if (key === "href" && name === "a" && SAFE_HREF.test(val.trim()))
      href = val.trim();
  }

  let out = `<${name}`;
  if (cls) out += ` class="${cls}"`;
  if (style) out += ` style="${style}"`;
  if (href) out += ` href="${escapeAttr(href)}" rel="noopener noreferrer"`;
  return `${out}>`;
}

/* One string: editor HTML -> clean, safe HTML ("" when nothing visible) */
export function fixHtml(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const input = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/\\n/g, "<br>")
    .replace(/&nbsp;|&#160;|\u00a0/gi, " ");

  // Rebuild only allowed tags; everything else becomes escaped text.
  const tagRe = new RegExp(TAG_RE.source, "gi");
  let out = "";
  let last = 0;
  let m;
  while ((m = tagRe.exec(input))) {
    out += escapeText(input.slice(last, m.index)) + buildTag(m[1], m[2], m[3]);
    last = m.index + m[0].length;
  }
  out += escapeText(input.slice(last));

  out = out
    .replace(EMPTY_INLINE, "")
    .replace(EMPTY_P, "")
    .replace(TRAILING_BR, "</p>")
    .replace(LEADING_BR, "$1")
    .replace(MANY_BR, "<br><br>");

  return out
    .replace(/ {2,}/g, " ")
    .replace(/^(?:\s*<br>)+|(?:<br>\s*)+$/gi, "")
    .trim();
}

/* Only strings that look like editor HTML are touched.
   URLs, ids, dates and plain text pass through unchanged. */
const NEEDS_FIX = /<[a-z!/]|&nbsp;|&#160;|\u00a0/i;

const isPlainObject = (v) => {
  if (!v || typeof v !== "object") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

/* Any value (block.data, array, object): cleans every text field inside it.
   ObjectIds, Dates and other class instances are returned untouched. */
export function fixData(value) {
  if (typeof value === "string")
    return NEEDS_FIX.test(value) ? fixHtml(value) : value;
  if (Array.isArray(value)) return value.map(fixData);
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) out[key] = fixData(value[key]);
    return out;
  }
  return value;
}
