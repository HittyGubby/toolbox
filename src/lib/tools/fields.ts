import type { ParamField } from "./index";

export const toggleEnc: ParamField = {
  key: "dir",
  label: "方向",
  type: "toggle",
  default: "encode",
  options: [
    { label: "编码", value: "encode" },
    { label: "解码", value: "decode" },
  ],
};

export const toggleCipher: ParamField = {
  key: "dir",
  label: "操作",
  type: "toggle",
  default: "encrypt",
  options: [
    { label: "加密", value: "encrypt" },
    { label: "解密", value: "decrypt" },
  ],
};

export const fieldKey: ParamField = {
  key: "key",
  label: "密钥",
  type: "text",
  placeholder: "输入密钥",
};

export const fieldIv: ParamField = {
  key: "iv",
  label: "IV",
  type: "text",
  placeholder: "初始向量（可选）",
};

export const fieldMode: ParamField = {
  key: "cmode",
  label: "模式",
  type: "select",
  default: "CBC",
  options: [
    { label: "CBC", value: "CBC" },
    { label: "ECB", value: "ECB" },
    { label: "CFB", value: "CFB" },
    { label: "OFB", value: "OFB" },
    { label: "CTR", value: "CTR" },
  ],
};

export const fieldPad: ParamField = {
  key: "pad",
  label: "填充",
  type: "select",
  default: "Pkcs7",
  options: [
    { label: "PKCS7", value: "Pkcs7" },
    { label: "补零", value: "ZeroPadding" },
    { label: "不填充", value: "NoPadding" },
  ],
};

export const toggleJson: ParamField = {
  key: "mode",
  label: "模式",
  type: "toggle",
  default: "format",
  options: [
    { label: "美化", value: "format" },
    { label: "压缩", value: "minify" },
  ],
};

export const fieldCase: ParamField = {
  key: "fmt",
  label: "格式",
  type: "select",
  default: "camel",
  options: [
    { label: "camelCase", value: "camel" },
    { label: "PascalCase", value: "pascal" },
    { label: "snake_case", value: "snake" },
    { label: "CONSTANT_CASE", value: "constant" },
    { label: "kebab-case", value: "kebab" },
    { label: "全小写", value: "lower" },
    { label: "全大写", value: "upper" },
    { label: "句首大写", value: "sentence" },
    { label: "词首大写", value: "title" },
  ],
};

export const fieldQrSize: ParamField = {
  key: "size",
  label: "尺寸",
  type: "select",
  default: "256",
  options: [
    { label: "128px", value: "128" },
    { label: "256px", value: "256" },
    { label: "512px", value: "512" },
    { label: "1024px", value: "1024" },
  ],
};

export const fieldQrDark: ParamField = {
  key: "dark",
  label: "前景色",
  type: "color",
  default: "#000000",
};

export const fieldQrLight: ParamField = {
  key: "light",
  label: "背景色",
  type: "color",
  default: "#ffffff",
};

export const fieldSha: ParamField = {
  key: "variant",
  label: "变体",
  type: "select",
  default: "sha256",
  options: [
    { label: "SHA-1", value: "sha1" },
    { label: "SHA-256", value: "sha256" },
    { label: "SHA-512", value: "sha512" },
    { label: "SHA3-256", value: "sha3-256" },
  ],
};
