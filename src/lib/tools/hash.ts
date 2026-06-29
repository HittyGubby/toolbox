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

function hashCrc32(s: string) {
  return CryptoJS.CRC32(s).toString(CryptoJS.enc.Hex);
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
