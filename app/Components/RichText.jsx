"use client";

function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export default function RichText({
  content = "",
  className = "",
  asHeading = false,
  headingLevel = 2,
  inline = false,
}) {
  if (!stripHtml(content)) {
    return null;
  }

  const headingProps = asHeading
    ? { role: "heading", "aria-level": headingLevel }
    : {};

  const inlineClass = inline ? "rt-inline" : "";

  return (
    <div
      {...headingProps}
      className={`rt-render max-w-full min-w-0 ${inlineClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
