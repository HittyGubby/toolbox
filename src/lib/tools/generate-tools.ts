import type { ParamField, ToolDef } from "./index";
import { generateIban, ibanCountries } from "./generate/iban";
import { generateCard } from "./generate/card";
import { generateIdCard, regions } from "./generate/idcard";
import { generateUuid } from "./generate/uuid";
import { generatePhone, phoneCountries } from "./generate/phone";

const fieldCount: ParamField = {
  key: "count",
  label: "数量",
  type: "text",
  default: "1",
  placeholder: "生成条数，如 5",
};

const fieldIbanCountry: ParamField = {
  key: "country",
  label: "国家",
  type: "select",
  default: "Netherlands",
  options: ibanCountries,
};

const fieldCardNetwork: ParamField = {
  key: "network",
  label: "卡组织",
  type: "select",
  default: "visa",
  options: [
    { label: "Visa", value: "visa" },
    { label: "MasterCard", value: "mastercard" },
    { label: "American Express", value: "amex" },
    { label: "Discover", value: "discover" },
    { label: "JCB", value: "jcb" },
    { label: "银联", value: "unionpay" },
    { label: "自定义 BIN", value: "custom" },
  ],
};

const fieldCardBin: ParamField = {
  key: "bin",
  label: "BIN",
  type: "text",
  placeholder: "如 438108（x 为随机位）",
};

const fieldIdRegion: ParamField = {
  key: "region",
  label: "地区",
  type: "select",
  default: "110101",
  options: regions.map((r) => ({ label: r.label, value: r.code })),
};

const fieldIdGender: ParamField = {
  key: "gender",
  label: "性别",
  type: "toggle",
  default: "random",
  options: [
    { label: "随机", value: "random" },
    { label: "男", value: "male" },
    { label: "女", value: "female" },
  ],
};

const fieldIdYear: ParamField = {
  key: "year",
  label: "出生年份",
  type: "text",
  default: "1970-2005",
  placeholder: "范围，如 1970-2005",
};

const fieldUuidVersion: ParamField = {
  key: "version",
  label: "版本",
  type: "toggle",
  default: "v4",
  options: [
    { label: "v4 随机", value: "v4" },
    { label: "v7 时间", value: "v7" },
  ],
};

const fieldUuidCase: ParamField = {
  key: "case",
  label: "大小写",
  type: "toggle",
  default: "lower",
  options: [
    { label: "小写", value: "lower" },
    { label: "大写", value: "upper" },
  ],
};

const fieldPhoneCountry: ParamField = {
  key: "country",
  label: "国家",
  type: "select",
  default: "中国",
  options: phoneCountries.map((c) => ({ label: c.label, value: c.label })),
};

const fieldPhoneFormat: ParamField = {
  key: "format",
  label: "格式",
  type: "toggle",
  default: "plain",
  options: [
    { label: "纯数字", value: "plain" },
    { label: "带区号", value: "cc" },
  ],
};

function parseCount(s: string): number {
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 1) return 1;
  return Math.min(n, 100);
}

export const generateTools: ToolDef[] = [
  {
    id: "iban",
    name: "IBAN",
    inputs: [{ kind: "none" }],
    params: [fieldIbanCountry, fieldCount],
    compute: (_i, p) => {
      const n = parseCount(p.count);
      const list: string[] = [];
      for (let i = 0; i < n; i++) list.push(generateIban(p.country));
      return list.join("\n");
    },
  },
  {
    id: "card",
    name: "信用卡号",
    inputs: [{ kind: "none" }],
    params: [fieldCardNetwork, fieldCardBin, fieldCount],
    compute: (_i, p) => {
      const n = parseCount(p.count);
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        const card = generateCard(p.network, p.bin);
        out.push(
          `${card.network}\t${card.number} | ${card.month}/${card.year} | CVV ${card.cvv}`,
        );
      }
      return out.join("\n");
    },
  },
  {
    id: "idcard",
    name: "身份证号",
    inputs: [{ kind: "none" }],
    params: [fieldIdRegion, fieldIdGender, fieldIdYear, fieldCount],
    compute: (_i, p) => {
      const n = parseCount(p.count);
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        out.push(generateIdCard({ region: p.region, gender: (p.gender as "male" | "female" | "random") ?? "random", yearRange: p.year }));
      }
      return out.join("\n");
    },
  },
  {
    id: "uuid",
    name: "UUID",
    inputs: [{ kind: "none" }],
    params: [fieldUuidVersion, fieldUuidCase, fieldCount],
    compute: (_i, p) => {
      const n = parseCount(p.count);
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        out.push(generateUuid(p.version === "v7" ? "v7" : "v4", p.case === "upper"));
      }
      return out.join("\n");
    },
  },
  {
    id: "phone",
    name: "随机手机号",
    inputs: [{ kind: "none" }],
    params: [fieldPhoneCountry, fieldPhoneFormat, fieldCount],
    compute: (_i, p) => {
      const n = parseCount(p.count);
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        out.push(generatePhone(p.country, p.format === "cc"));
      }
      return out.join("\n");
    },
  },
];
