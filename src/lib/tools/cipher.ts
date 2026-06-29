import CryptoJS from "crypto-js";
import { toggleCipher, fieldKey, fieldIv, fieldMode, fieldPad } from "./fields";
import type { ToolDef } from "./index";

const modeMap: Record<string, typeof CryptoJS.mode.CBC> = {
  CBC: CryptoJS.mode.CBC,
  ECB: CryptoJS.mode.ECB,
  CFB: CryptoJS.mode.CFB,
  OFB: CryptoJS.mode.OFB,
  CTR: CryptoJS.mode.CTR,
};

const padMap: Record<string, typeof CryptoJS.pad.Pkcs7> = {
  Pkcs7: CryptoJS.pad.Pkcs7,
  ZeroPadding: CryptoJS.pad.ZeroPadding,
  NoPadding: CryptoJS.pad.NoPadding,
};

function aesDo(
  enc: boolean,
  s: string,
  k: string,
  iv: string,
  m: string,
  p: string,
) {
  const key = CryptoJS.enc.Utf8.parse(k.padEnd(32, "\0").slice(0, 32));
  const i = iv
    ? CryptoJS.enc.Utf8.parse(iv.padEnd(16, "\0").slice(0, 16))
    : undefined;
  const opts = { iv: i, mode: modeMap[m], padding: padMap[p] };
  try {
    return enc
      ? CryptoJS.AES.encrypt(s, key, opts).toString()
      : CryptoJS.AES.decrypt(s, key, opts).toString(CryptoJS.enc.Utf8) ||
          "解密失败";
  } catch {
    return "解密失败，请检查密钥";
  }
}

function desDo(
  enc: boolean,
  s: string,
  k: string,
  iv: string,
  m: string,
  p: string,
) {
  const key = CryptoJS.enc.Utf8.parse(k.padEnd(8, "\0").slice(0, 8));
  const i = iv
    ? CryptoJS.enc.Utf8.parse(iv.padEnd(8, "\0").slice(0, 8))
    : undefined;
  const opts = { iv: i, mode: modeMap[m], padding: padMap[p] };
  try {
    return enc
      ? CryptoJS.DES.encrypt(s, key, opts).toString()
      : CryptoJS.DES.decrypt(s, key, opts).toString(CryptoJS.enc.Utf8) ||
          "解密失败";
  } catch {
    return "解密失败，请检查密钥";
  }
}

export const cipherTools: ToolDef[] = [
  {
    id: "aes",
    name: "AES",
    params: [toggleCipher, fieldKey, fieldIv, fieldMode, fieldPad],
    compute: (i, p) =>
      aesDo(p.dir === "encrypt", i, p.key, p.iv, p.cmode, p.pad),
  },
  {
    id: "des",
    name: "DES",
    params: [toggleCipher, fieldKey, fieldIv, fieldMode, fieldPad],
    compute: (i, p) =>
      desDo(p.dir === "encrypt", i, p.key, p.iv, p.cmode, p.pad),
  },
];
