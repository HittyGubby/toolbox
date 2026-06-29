import CryptoJS from "crypto-js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { utf8 } from "./utils";
import { fieldSha } from "./fields";
import type { ToolDef } from "./index";

function hashMd5(s: string) {
  return CryptoJS.MD5(s).toString(CryptoJS.enc.Hex);
}

function hashSha1(s: string) {
  return CryptoJS.SHA1(s).toString(CryptoJS.enc.Hex);
}

function hashSha256(s: string) {
  return CryptoJS.SHA256(s).toString(CryptoJS.enc.Hex);
}

function hashSha512(s: string) {
  return CryptoJS.SHA512(s).toString(CryptoJS.enc.Hex);
}

function hashSha3256(s: string) {
  return bytesToHex(sha3_256(utf8(s)));
}

const CRC32_TABLE = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function hashCrc32(s: string) {
  let crc = 0xffffffff;
  for (let i = 0; i < s.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ s.charCodeAt(i)) & 0xff];
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

export const hashTools: ToolDef[] = [
  { id: "md5", name: "MD5", params: [], compute: (i) => hashMd5(i) },
  { id: "crc32", name: "CRC32", params: [], compute: (i) => hashCrc32(i) },
  { id: "sha1", name: "SHA-1", params: [], compute: (i) => hashSha1(i) },
  { id: "sha256", name: "SHA-256", params: [], compute: (i) => hashSha256(i) },
  { id: "sha512", name: "SHA-512", params: [], compute: (i) => hashSha512(i) },
  {
    id: "sha3-256",
    name: "SHA3-256",
    params: [],
    compute: (i) => hashSha3256(i),
  },
  {
    id: "sha",
    name: "SHA",
    params: [fieldSha],
    compute: (i, p) => {
      switch (p.variant) {
        case "sha1":
          return hashSha1(i);
        case "sha256":
          return hashSha256(i);
        case "sha512":
          return hashSha512(i);
        case "sha3-256":
          return hashSha3256(i);
        default:
          return hashSha256(i);
      }
    },
  },
];
