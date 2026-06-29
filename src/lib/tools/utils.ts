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
  const words = i.match(/[a-z0-9]+/gi) || [];
  switch (fmt) {
    case "camel":
      return words
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : cap(w)))
        .join("");
    case "pascal":
      return words.map(cap).join("");
    case "snake":
      return words.map((w) => w.toLowerCase()).join("_");
    case "constant":
      return words.map((w) => w.toUpperCase()).join("_");
    case "kebab":
      return words.map((w) => w.toLowerCase()).join("-");
    case "lower":
      return words.map((w) => w.toLowerCase()).join(" ");
    case "upper":
      return words.map((w) => w.toUpperCase()).join(" ");
    case "sentence":
      return sentenceCase(i);
    case "title":
      return titleCase(i);
    default:
      return i;
  }
}
