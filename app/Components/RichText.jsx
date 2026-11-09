// app/Components/RichText.jsx
// ONE file for ALL admin-editor text. No dependencies. Works in server and client components.
//
//   <RichText html={value} />                    paragraphs, descriptions
//   <RichText html={value} inline as="h2" />     titles, labels, names, buttons
//   toPlainText(value)                           alt text, title attributes, meta

/* ───────── 1. Cleaner (fixes &nbsp;, empty lines, unsafe HTML) ───────── */

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

/* Editor HTML -> clean, safe HTML ("" when nothing visible).
   inline: true joins paragraphs into one flowing line (titles, labels). */
export function cleanHtml(value, { inline = false } = {}) {
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

  if (inline) {
    out = out
      .replace(/<\/p>\s*<p(?:\s[^>]*)?>/gi, " ")
      .replace(/<\/?p(?:\s[^>]*)?>/gi, "");
  }

  return out
    .replace(/ {2,}/g, " ")
    .replace(/^(?:\s*<br>)+|(?:<br>\s*)+$/gi, "")
    .trim();
}

/* HTML -> plain text (alt, title, meta) */
export function toPlainText(value) {
  return cleanHtml(value, { inline: true })
    .replace(/<br>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/* ───────── 2. Component ───────── */

const BASE = [
  "min-w-0 wrap-break-word",
  "[&_strong]:font-bold [&_b]:font-bold",
  "[&_em]:italic [&_i]:italic",
  "[&_u]:underline [&_s]:line-through",
  "[&_a]:text-[#1E8A8A] [&_a]:underline [&_a]:underline-offset-2",
  "[&_mark]:text-inherit",
  "[&_.ql-align-left]:text-left [&_.ql-align-center]:text-center",
  "[&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify",
].join(" ");

const BLOCK = [
  "[&_p+p]:mt-2",
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-5 [&_ol]:ps-5 [&_li]:mb-1",
  "[&_blockquote]:border-s-4 [&_blockquote]:ps-3",
].join(" ");

export default function RichText({
  html,
  fallback = "", // shown when `html` is empty (e.g. English text for a missing translation)
  as = "div",
  inline = false,
  className = "",
  ...rest
}) {
  const clean = cleanHtml(html, { inline }) || cleanHtml(fallback, { inline });
  if (!clean) return null;

  // block mode contains <p>, so it must never be wrapped in a <p>
  const Tag = !inline && as === "p" ? "div" : as;

  return (
    <Tag
      {...rest}
      className={`${BASE} ${inline ? "" : BLOCK} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
