import { utf8, fromUtf8 } from "./utils";
import { toggleEnc } from "./fields";
import type { ToolDef } from "./index";

function base64Encode(s: string) {
  return btoa(s);
}

function base64Decode(s: string) {
  try {
    return atob(s);
  } catch {
    return "无效的 Base64";
  }
}

function hexEncode(s: string) {
  return Array.from(utf8(s))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexDecode(s: string) {
  const h = s.replace(/[^0-9a-fA-F]/g, "");
  const b = new Uint8Array(h.length / 2);
  for (let i = 0; i < h.length; i += 2)
    b[i / 2] = parseInt(h.slice(i, i + 2), 16);
  return fromUtf8(b);
}

function urlEncode(s: string) {
  return encodeURIComponent(s);
}

function urlDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return "无效的 URL 编码";
  }
}

function unicodeEncode(s: string) {
  return Array.from(s)
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      return cp < 128 ? ch : "\\u" + cp.toString(16).padStart(4, "0");
    })
    .join("");
}

function unicodeDecode(s: string) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
    String.fromCodePoint(parseInt(h, 16)),
  );
}

export const encodingTools: ToolDef[] = [
  {
    id: "base64",
    name: "Base64",
    params: [toggleEnc],
    compute: (i, p) => (p.dir === "encode" ? base64Encode(i) : base64Decode(i)),
  },
  {
    id: "hex",
    name: "Hex",
    params: [toggleEnc],
    compute: (i, p) => (p.dir === "encode" ? hexEncode(i) : hexDecode(i)),
  },
  {
    id: "url",
    name: "URL",
    params: [toggleEnc],
    compute: (i, p) => (p.dir === "encode" ? urlEncode(i) : urlDecode(i)),
  },
  {
    id: "unicode",
    name: "Unicode",
    params: [toggleEnc],
    compute: (i, p) =>
      p.dir === "encode" ? unicodeEncode(i) : unicodeDecode(i),
  },
];
