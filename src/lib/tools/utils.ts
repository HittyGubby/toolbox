import OpenCC from "opencc-js";

// Chinese has no case distinction, so we treat Simplified as the "lower" form
// and Traditional as the "upper" form. opencc-js is already a dependency.
const toSimplified = OpenCC.Converter({ from: "twp", to: "cn" });
const toTraditional = OpenCC.Converter({ from: "cn", to: "twp" });

export function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function fromUtf8(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

export function cap(s: string): string {
  if (!s) return s;
  const [first, ...rest] = [...s];
  return first.toUpperCase() + rest.join("").toLowerCase();
}

export function sentenceCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^\s*\p{L})|([.!?]\s*\p{L})/gu, (m) => m.toUpperCase());
}

export function titleCase(s: string): string {
  const minor = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "by",
    "with",
    "in",
    "of",
  ]);
  return s.replace(/\p{L}+/gu, (w, i) =>
    i === 0 || !minor.has(w.toLowerCase()) ? cap(w) : w.toLowerCase(),
  );
}

export function caseConvert(i: string, fmt: string): string {
  // Normalize CJK: Simplified is the "lower" form, Traditional the "upper" form.
  // Every mode maps CJK to Simplified, except `upper` which maps to Traditional.
  // Other cased scripts (extended Latin, Cyrillic, Greek, Armenian, Georgian…)
  // are handled by the native Unicode case mappings + \p{L} tokenization above.
  const s = fmt === "upper" ? toTraditional(i) : toSimplified(i);
  switch (fmt) {
    case "camel":
      return s
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : cap(w)))
        .join("");
    case "pascal":
      return s
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
        .map(cap)
        .join("");
    case "snake":
      return s
        .replace(/[^\p{L}\p{N}]+/gu, "_")
        .toLowerCase()
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    case "constant":
      return s
        .replace(/[^\p{L}\p{N}]+/gu, "_")
        .toUpperCase()
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    case "kebab":
      return s
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .toLowerCase()
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
    case "lower":
      return s.toLowerCase();
    case "upper":
      return s.toUpperCase();
    case "sentence":
      return sentenceCase(s);
    case "title":
      return titleCase(s);
    default:
      return i;
  }
}
