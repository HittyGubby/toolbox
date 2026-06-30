export function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function fromUtf8(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function sentenceCase(s: string): string {
  return s.replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase());
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
  return s.replace(/\w+/g, (w, i) =>
    i === 0 || !minor.has(w.toLowerCase()) ? cap(w) : w.toLowerCase(),
  );
}

export function caseConvert(i: string, fmt: string): string {
  switch (fmt) {
    case "camel":
      return i
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : cap(w)))
        .join("");
    case "pascal":
      return i
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .map(cap)
        .join("");
    case "snake":
      return i
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase()
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    case "constant":
      return i
        .replace(/[^a-z0-9]+/gi, "_")
        .toUpperCase()
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_");
    case "kebab":
      return i
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
    case "lower":
      return i.toLowerCase();
    case "upper":
      return i.toUpperCase();
    case "sentence":
      return sentenceCase(i);
    case "title":
      return titleCase(i);
    default:
      return i;
  }
}
