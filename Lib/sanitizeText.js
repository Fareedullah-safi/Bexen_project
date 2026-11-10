// Lib/sanitizeText.js
// Standalone utility file for Admin forms and input validation.

export function stripHtml(html) {
  if (html === null || html === undefined) return "";
  if (typeof html !== "string") return "";

  let text = html;

  text = text.replace(/&nbsp;|&#160;|\u00a0/gi, " ");
  text = text.replace(/<br\s*\/?>/gi, " ");
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, " ");
  text = text.replace(/<[^>]+>/g, "");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  return text.replace(/\s+/g, " ").trim();
}

export function hasText(value) {
  return stripHtml(value) !== "";
}

export function fixHtml(html) {
  if (html === null || html === undefined) return "";
  if (typeof html !== "string") return "";

  let cleaned = html.trim();
  if (!cleaned) return "";

  if (
    cleaned.length > 1 &&
    ((cleaned.charAt(0) === '"' &&
      cleaned.charAt(cleaned.length - 1) === '"') ||
      (cleaned.charAt(0) === "'" && cleaned.charAt(cleaned.length - 1) === "'"))
  ) {
    cleaned = cleaned.slice(1, cleaned.length - 1).trim();
  }

  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;|&#160;|\u00a0/gi, " ");

  cleaned = cleaned.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "");
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "");

  return cleaned.trim();
}

export function sanitizeHtml(html) {
  return fixHtml(html);
}

function isPlainObject(v) {
  if (!v || typeof v !== "object") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

export function sanitizeData(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return fixHtml(data);
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(sanitizeData(data[i]));
    }
    return result;
  }

  if (isPlainObject(data)) {
    const result = {};
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result[key] = sanitizeData(data[key]);
    }
    return result;
  }

  return data;
}

export function fixData(data) {
  return sanitizeData(data);
}
