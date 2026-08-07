// UUID 生成，使用原生 Web Crypto（crypto.randomUUID + getRandomValues 兜底）。
// v4 为完全随机，v7 为时间排序型（RFC 9562），均无任何效力。

function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const x of bytes) out += x.toString(16).padStart(2, "0");
  return out;
}

/** 生成一个 v4 UUID（16 字节随机，固定版本/变体位） */
export function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = bytesToHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** 生成一个 v7 UUID（48 位毫秒时间戳 + 随机位，可按时间排序） */
export function uuidV7(): string {
  const b = randomBytes(16);
  const ts = BigInt(Date.now());
  b[0] = Number((ts >> 40n) & 0xffn);
  b[1] = Number((ts >> 32n) & 0xffn);
  b[2] = Number((ts >> 24n) & 0xffn);
  b[3] = Number((ts >> 16n) & 0xffn);
  b[4] = Number((ts >> 8n) & 0xffn);
  b[5] = Number(ts & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = bytesToHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** 生成 UUID，可选 v4/v7、大小写 */
export function generateUuid(
  version: "v4" | "v7" = "v4",
  uppercase = false,
): string {
  const u = version === "v7" ? uuidV7() : uuidV4();
  return uppercase ? u.toUpperCase() : u;
}
