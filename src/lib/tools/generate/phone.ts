// 随机手机号生成，使用各国真实号段前缀。生成的号码仅格式合法，无任何效力。

interface Country {
  label: string;
  /** 国际区号 */
  code: string;
  /** 号码总位数（不含区号） */
  length: number;
  /** 有效号段前缀 */
  prefixes: string[];
}

export const phoneCountries: Country[] = [
  {
    label: "中国",
    code: "86",
    length: 11,
    prefixes: [
      "130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
      "145", "147", "149",
      "150", "151", "152", "153", "155", "156", "157", "158", "159",
      "166", "170", "171", "172", "173", "175", "176", "177", "178",
      "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
      "198", "199",
    ],
  },
  { label: "美国/加拿大", code: "1", length: 10, prefixes: ["2", "3", "4", "5", "6", "7", "8", "9"] },
  { label: "英国", code: "44", length: 10, prefixes: ["7"] },
  { label: "日本", code: "81", length: 10, prefixes: ["70", "80", "90"] },
  { label: "德国", code: "49", length: 10, prefixes: ["15", "16", "17"] },
  { label: "法国", code: "33", length: 9, prefixes: ["6", "7"] },
  { label: "澳大利亚", code: "61", length: 9, prefixes: ["4"] },
  { label: "新加坡", code: "65", length: 8, prefixes: ["8", "9"] },
  { label: "香港", code: "852", length: 8, prefixes: ["5", "6", "9"] },
  { label: "台湾", code: "886", length: 9, prefixes: ["9"] },
  { label: "韩国", code: "82", length: 9, prefixes: ["10"] },
  { label: "印度", code: "91", length: 10, prefixes: ["6", "7", "8", "9"] },
];

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

/** 生成一个手机号，withCountryCode 为 true 时输出 "+区号 号码" */
export function generatePhone(
  countryLabel: string,
  withCountryCode = false,
): string {
  const c =
    phoneCountries.find((x) => x.label === countryLabel) ?? phoneCountries[0];
  const prefix = randomElement(c.prefixes);
  const number = prefix + randomDigits(c.length - prefix.length);
  return withCountryCode ? `+${c.code} ${number}` : number;
}
