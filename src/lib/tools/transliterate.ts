import { transliterate as tl } from "transliteration";
import { toHiragana, toKatakana } from "wanakana";
import Sanscript from "@indic-transliteration/sanscript";
import { assemble } from "es-hangul";
import { pinyin as pinyinPro } from "pinyin-pro";
import type { ToolDef, ParamField } from "./index";

// ──── Mapping tables: Latin → Target script ────
const latinToGreek: Record<string, string> = {
  th: "θ",
  ch: "χ",
  ps: "ψ",
  ks: "ξ",
  a: "α",
  b: "β",
  g: "γ",
  d: "δ",
  e: "ε",
  z: "ζ",
  i: "ι",
  k: "κ",
  l: "λ",
  m: "μ",
  n: "ν",
  o: "ο",
  p: "π",
  r: "ρ",
  s: "σ",
  t: "τ",
  y: "υ",
  f: "φ",
  h: "η",
  x: "ξ",
  A: "Α",
  B: "Β",
  G: "Γ",
  D: "Δ",
  E: "Ε",
  Z: "Ζ",
  I: "Ι",
  K: "Κ",
  L: "Λ",
  M: "Μ",
  N: "Ν",
  O: "Ο",
  P: "Π",
  R: "Ρ",
  S: "Σ",
  T: "Τ",
  Y: "Υ",
  F: "Φ",
  H: "Η",
  X: "Ξ",
};

const latinToArabic: Record<string, string> = {
  th: "ث",
  kh: "خ",
  dh: "ذ",
  sh: "ش",
  gh: "غ",
  "'": "ع",
  "`": "ء",
  a: "ا",
  b: "ب",
  t: "ت",
  j: "ج",
  h: "ح",
  d: "د",
  r: "ر",
  z: "ز",
  s: "س",
  S: "ص",
  D: "ض",
  T: "ط",
  Z: "ظ",
  f: "ف",
  q: "ق",
  k: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  w: "و",
  y: "ي",
};

const latinToHebrew: Record<string, string> = {
  sh: "שׁ",
  ts: "צ",
  tz: "צ",
  a: "א",
  b: "ב",
  g: "ג",
  d: "ד",
  h: "ה",
  w: "ו",
  z: "ז",
  H: "ח",
  T: "ט",
  y: "י",
  k: "כ",
  l: "ל",
  m: "מ",
  n: "נ",
  s: "ס",
  p: "פ",
  q: "ק",
  r: "ר",
  t: "ת",
};

const latinToArmenian: Record<string, string> = {
  ev: "և",
  dzh: "ջ",
  ch: "չ",
  ts: "ց",
  "r'": "ր",
  "k'": "ք",
  "p'": "փ",
  "o'": "օ",
  "e'": "է",
  a: "ա",
  b: "բ",
  g: "գ",
  d: "դ",
  e: "ե",
  z: "զ",
  y: "յ",
  i: "ի",
  l: "լ",
  x: "խ",
  c: "ծ",
  k: "կ",
  h: "հ",
  j: "ձ",
  n: "ն",
  o: "ո",
  p: "պ",
  r: "ռ",
  s: "ս",
  v: "վ",
  t: "տ",
  u: "ու",
  f: "ֆ",
};

const latinToGeorgian: Record<string, string> = {
  zh: "ჟ",
  sh: "შ",
  ch: "ჩ",
  ts: "ც",
  dz: "ძ",
  gh: "ღ",
  kh: "ხ",
  j: "ჯ",
  "k'": "კ",
  "t'": "ტ",
  "p'": "პ",
  "ch'": "ჭ",
  "ts'": "წ",
  a: "ა",
  b: "ბ",
  g: "გ",
  d: "დ",
  e: "ე",
  v: "ვ",
  z: "ზ",
  t: "თ",
  i: "ი",
  l: "ლ",
  m: "მ",
  n: "ნ",
  o: "ო",
  p: "ფ",
  r: "რ",
  s: "ს",
  u: "უ",
  k: "ქ",
  q: "ყ",
  h: "ჰ",
};

const latinToAmharic: Record<string, string> = {
  ha: "ሀ",
  hu: "ሁ",
  hi: "ሂ",
  he: "ሄ",
  h: "ህ",
  la: "ለ",
  lu: "ሉ",
  li: "ሊ",
  le: "ሌ",
  l: "ል",
  ma: "መ",
  mu: "ሙ",
  mi: "ሚ",
  me: "ሜ",
  m: "ም",
  sa: "ሰ",
  su: "ሱ",
  si: "ሲ",
  se: "ሴ",
  s: "ስ",
  ra: "ራ",
  ru: "ሩ",
  ri: "ሪ",
  re: "ሬ",
  r: "ር",
  sha: "ሻ",
  sh: "ሽ",
  qa: "ቃ",
  qu: "ቁ",
  qi: "ቂ",
  qe: "ቄ",
  q: "ቅ",
  ba: "ባ",
  bu: "ቡ",
  bi: "ቢ",
  be: "ቤ",
  b: "ብ",
  ta: "ታ",
  tu: "ቱ",
  ti: "ቲ",
  te: "ቴ",
  t: "ት",
  na: "ና",
  nu: "ኑ",
  ni: "ኒ",
  ne: "ኔ",
  n: "ን",
  ga: "ጋ",
  gu: "ጉ",
  gi: "ጊ",
  ge: "ጌ",
  g: "ግ",
  ka: "ካ",
  ku: "ኩ",
  ki: "ኪ",
  ke: "ኬ",
  k: "ክ",
  wa: "ዋ",
  w: "ው",
  za: "ዛ",
  zu: "ዙ",
  zi: "ዚ",
  ze: "ዜ",
  z: "ዝ",
  ya: "ያ",
  y: "ይ",
  da: "ዳ",
  du: "ዱ",
  di: "ዲ",
  de: "ዴ",
  d: "ድ",
  ja: "ጃ",
  ju: "ጁ",
  ji: "ጂ",
  je: "ጄ",
  j: "ጅ",
  fa: "ፋ",
  fu: "ፉ",
  fi: "ፊ",
  fe: "ፌ",
  f: "ፍ",
  pa: "ፓ",
  pu: "ፑ",
  pi: "ፒ",
  pe: "ፔ",
  p: "ፕ",
  a: "አ",
  u: "ኡ",
  i: "ኢ",
  e: "ኤ",
  o: "ኦ",
};

const latinToCyrillicUpper: Record<string, string> = {
  SHCH: "Щ",
  SH: "Ш",
  CH: "Ч",
  ZH: "Ж",
  YA: "Я",
  YU: "Ю",
  YE: "Е",
  YO: "Ё",
  EH: "Э",
  A: "А",
  B: "Б",
  V: "В",
  G: "Г",
  D: "Д",
  E: "Е",
  Z: "З",
  I: "И",
  Y: "Й",
  K: "К",
  L: "Л",
  M: "М",
  N: "Н",
  O: "О",
  P: "П",
  R: "Р",
  S: "С",
  T: "Т",
  U: "У",
  F: "Ф",
  H: "Х",
  C: "Ц",
  W: "Щ",
  X: "Кс",
  Q: "К",
};

const latinToCyrillicLower: Record<string, string> = {
  shch: "щ",
  sh: "ш",
  ch: "ч",
  zh: "ж",
  ya: "я",
  yu: "ю",
  ye: "е",
  yo: "ё",
  eh: "э",
  a: "а",
  b: "б",
  v: "в",
  g: "г",
  d: "д",
  e: "е",
  z: "з",
  i: "и",
  y: "й",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  f: "ф",
  h: "х",
  c: "ц",
  w: "щ",
  x: "кс",
  q: "к",
};

// ──── Korean Revised Romanization → Hangul ────
const krVowels: [string, string][] = [
  ["yae", "ㅒ"],
  ["yeo", "ㅕ"],
  ["ye", "ㅖ"],
  ["wa", "ㅘ"],
  ["wae", "ㅙ"],
  ["oe", "ㅚ"],
  ["wo", "ㅝ"],
  ["we", "ㅞ"],
  ["wi", "ㅟ"],
  ["ui", "ㅢ"],
  ["ae", "ㅐ"],
  ["ya", "ㅑ"],
  ["yo", "ㅛ"],
  ["yu", "ㅠ"],
  ["eu", "ㅡ"],
  ["eo", "ㅓ"],
  ["a", "ㅏ"],
  ["e", "ㅔ"],
  ["o", "ㅗ"],
  ["u", "ㅜ"],
  ["i", "ㅣ"],
];

const krConsonant: Record<string, string> = {
  kk: "ㄲ",
  tt: "ㄸ",
  pp: "ㅃ",
  ss: "ㅆ",
  jj: "ㅉ",
  ch: "ㅊ",
  g: "ㄱ",
  n: "ㄴ",
  d: "ㄷ",
  r: "ㄹ",
  l: "ㄹ",
  m: "ㅁ",
  b: "ㅂ",
  s: "ㅅ",
  j: "ㅈ",
  k: "ㅋ",
  t: "ㅌ",
  p: "ㅍ",
  h: "ㅎ",
  ng: "ㅇ", // only as final
};

const krFinalCluster: Record<string, string> = {
  gs: "ㄳ",
  nj: "ㄵ",
  nh: "ㄶ",
  lg: "ㄺ",
  lm: "ㄻ",
  lb: "ㄼ",
  ls: "ㄽ",
  lt: "ㄾ",
  lp: "ㄿ",
  lh: "ㅀ",
  bs: "ㅄ",
};

// ──── Sanscript targets ────
const sanscriptTargets = new Set([
  "devanagari",
  "bengali",
  "gurmukhi",
  "gujarati",
  "oriya",
  "tamil",
  "telugu",
  "kannada",
  "malayalam",
  "sinhala",
  "thai",
]);

// ──── Transliteration field ────
const fieldTlTarget: ParamField = {
  key: "target",
  label: "目标文字",
  type: "select",
  default: "latin",
  options: [
    { label: "拉丁字母（自动检测）", value: "latin" },
    { label: "—— CJK ——", value: "" },
    { label: "中文拼音", value: "pinyin" },
    { label: "日文罗马字", value: "romaji" },
    { label: "平假名", value: "hiragana" },
    { label: "片假名", value: "katakana" },
    { label: "韩文", value: "hangul" },
    { label: "伪中国语", value: "pseudo-chinese" },
    { label: "—— 欧洲 ——", value: "" },
    { label: "西里尔字母", value: "cyrillic" },
    { label: "希腊字母", value: "greek" },
    { label: "—— 中东 / 高加索 ——", value: "" },
    { label: "阿拉伯字母", value: "arabic" },
    { label: "希伯来字母", value: "hebrew" },
    { label: "亚美尼亚字母", value: "armenian" },
    { label: "格鲁吉亚字母", value: "georgian" },
    { label: "—— 南亚 ——", value: "" },
    { label: "天城文（印地语/梵语）", value: "devanagari" },
    { label: "孟加拉文", value: "bengali" },
    { label: "古木基文（旁遮普语）", value: "gurmukhi" },
    { label: "古吉拉特文", value: "gujarati" },
    { label: "奥里亚文", value: "oriya" },
    { label: "泰米尔文", value: "tamil" },
    { label: "泰卢固文", value: "telugu" },
    { label: "卡纳达文", value: "kannada" },
    { label: "马拉雅拉姆文", value: "malayalam" },
    { label: "僧伽罗文", value: "sinhala" },
    { label: "—— 东南亚 ——", value: "" },
    { label: "泰文", value: "thai" },
    { label: "—— 非洲 ——", value: "" },
    { label: "阿姆哈拉文", value: "amharic" },
  ],
};

// ──── Helpers ────

function greedyMap(s: string, table: Record<string, string>): string {
  let r = "",
    i = 0;
  while (i < s.length) {
    let found = false;
    for (let l = 3; l >= 1; l--) {
      const sub = s.slice(i, i + l);
      if (table[sub] !== undefined) {
        r += table[sub];
        i += l;
        found = true;
        break;
      }
    }
    if (!found) {
      r += s[i];
      i++;
    }
  }
  return r;
}

function latinToCyrillicFn(s: string): string {
  let r = "",
    i = 0;
  while (i < s.length) {
    let found = false;
    for (let l = 4; l >= 1; l--) {
      const sub = s.slice(i, i + l);
      const lower = sub.toLowerCase();
      const isUpper =
        sub[0] === sub[0]?.toUpperCase() && sub[0] !== sub[0]?.toLowerCase();
      const table = isUpper ? latinToCyrillicUpper : latinToCyrillicLower;
      const match = table[lower];
      if (match) {
        r +=
          isUpper && match.length > 0
            ? match[0].toUpperCase() + match.slice(1)
            : match;
        i += l;
        found = true;
        break;
      }
    }
    if (!found) {
      r += s[i];
      i++;
    }
  }
  return r;
}

function hasChinese(s: string): boolean {
  return /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(s);
}

// ──── Korean RR → Hangul ────

function findVowel(
  s: string,
  start: number,
): { jamo: string; pos: number; len: number } | null {
  for (let i = start; i < s.length; i++) {
    for (const [key, jamo] of krVowels) {
      if (s.slice(i, i + key.length) === key) {
        return { jamo, pos: i, len: key.length };
      }
    }
  }
  return null;
}

function hasConsonant(s: string, pos: number): string | null {
  for (let l = 2; l >= 1; l--) {
    const sub = s.slice(pos, pos + l);
    if (krConsonant[sub]) return sub;
  }
  return null;
}

function hasFinalCluster(s: string, pos: number): string | null {
  for (let l = 2; l >= 1; l--) {
    const sub = s.slice(pos, pos + l);
    if (krFinalCluster[sub]) return sub;
  }
  return null;
}

function parseRR(s: string): string[] {
  const jamos: string[] = [];
  let pos = 0;

  while (pos < s.length) {
    const v = findVowel(s, pos);
    if (!v) {
      for (; pos < s.length; pos++) {
        const c = hasConsonant(s, pos);
        if (c) {
          jamos.push(krConsonant[c]);
          pos += c.length - 1;
        }
      }
      break;
    }

    // ── Null initial if syllable starts with vowel ──
    if (pos === v.pos) {
      jamos.push("ㅇ");
    }

    // ── Initial consonants ──
    let ip = pos;
    while (ip < v.pos) {
      const c = hasConsonant(s, ip);
      if (c) {
        jamos.push(krConsonant[c]);
        ip += c.length;
      } else ip++;
    }

    // ── Vowel ──
    jamos.push(v.jamo);

    // ── Final consonants ──
    const afterV = v.pos + v.len;
    const nextV = findVowel(s, afterV);

    if (nextV) {
      // Consonants between vowels — split as final + initial
      const cluster = s.slice(afterV, nextV.pos);

      // Is "ng" at the boundary? "ng" → n (final) + g (initial of next)
      const ngPos = cluster.lastIndexOf("ng");
      if (ngPos >= 0 && ngPos + 2 === cluster.length) {
        // "ng" at end of cluster (before next vowel)
        const beforeNg = cluster.slice(0, ngPos);
        let fp = 0;
        while (fp < beforeNg.length) {
          const fc =
            hasFinalCluster(beforeNg, fp) || hasConsonant(beforeNg, fp);
          if (fc) {
            jamos.push(krFinalCluster[fc] || krConsonant[fc]);
            fp += fc.length;
          } else fp++;
        }
        jamos.push("ㄴ"); // n → final ㄴ
        // position of 'g' in original string
        pos = afterV + ngPos + 1;
        // 'g' will be picked up as initial in next syllable
        continue;
      }

      // No consonants → nothing to do for this syllable's final
      if (cluster.length === 0) {
        pos = nextV.pos;
        continue;
      }
      // Single consonant → initial of next syllable
      if (cluster.length === 1) {
        pos = afterV;
        continue;
      }

      // Multiple consonants → last 1-2 are initial of next syllable
      // Try with last 1 first
      const init1 = cluster[cluster.length - 1];
      const init1Valid = hasConsonant(s, nextV.pos - 1) !== null;
      let finalCluster: string;

      if (init1Valid) {
        finalCluster = cluster.slice(0, cluster.length - 1);
        pos = afterV + cluster.length - 1;
      } else {
        // Try last 2
        const init2 = cluster.slice(cluster.length - 2);
        if (krConsonant[init2]) {
          finalCluster = cluster.slice(0, cluster.length - 2);
          pos = afterV + cluster.length - 2;
        } else {
          // Fallback: all to next syllable
          pos = nextV.pos;
          continue;
        }
      }

      let fp = 0;
      while (fp < finalCluster.length) {
        const fc =
          hasFinalCluster(finalCluster, fp) || hasConsonant(finalCluster, fp);
        if (fc) {
          jamos.push(krFinalCluster[fc] || krConsonant[fc]);
          fp += fc.length;
        } else fp++;
      }
    } else {
      // No next vowel — all remaining chars are finals
      const cluster = s.slice(afterV);
      let fp = 0;
      while (fp < cluster.length) {
        const fc = hasFinalCluster(cluster, fp);
        if (fc) {
          jamos.push(krFinalCluster[fc]);
          fp += fc.length;
          continue;
        }
        const c = hasConsonant(cluster, fp);
        if (c) {
          jamos.push(krConsonant[c]);
          fp += c.length;
          continue;
        }
        fp++;
      }
      pos = s.length;
    }
  }

  return jamos;
}

function latinToHangul(s: string): string {
  const words = s.replace(/-/g, " ").split(/(\s+)/);
  return words
    .map((word) => {
      if (/^\s+$/.test(word)) return word;
      const jamos = parseRR(word.toLowerCase());
      try {
        return assemble(jamos);
      } catch {
        return jamos.join("");
      }
    })
    .join("");
}

function pseudoChinese(s: string): string {
  const noKana = s.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, "").trim();
  return noKana.replace(/([^\w\s])\1+/g, "$1");
}

// ──── Main ────

export function transliterate(input: string, target: string): string {
  try {
    switch (target) {
      case "latin":
      case "romaji":
        return tl(input);

      case "hiragana":
        return toHiragana(tl(input));
      case "katakana":
        return toKatakana(tl(input));

      case "pinyin":
        return hasChinese(input)
          ? pinyinPro(input, { toneType: "symbol", type: "string" })
          : input;

      case "hangul":
        return latinToHangul(tl(input));

      case "pseudo-chinese":
        return pseudoChinese(input);

      case "cyrillic":
        return latinToCyrillicFn(tl(input));
      case "greek":
        return greedyMap(tl(input), latinToGreek);
      case "arabic":
        return greedyMap(tl(input).toLowerCase(), latinToArabic);
      case "hebrew":
        return greedyMap(tl(input).toLowerCase(), latinToHebrew);
      case "armenian":
        return greedyMap(tl(input).toLowerCase(), latinToArmenian);
      case "georgian":
        return greedyMap(tl(input).toLowerCase(), latinToGeorgian);
      case "amharic":
        return greedyMap(tl(input).toLowerCase(), latinToAmharic);

      default:
        if (sanscriptTargets.has(target)) {
          return Sanscript.t(tl(input), "itrans", target);
        }
        return `不支持的转写目标: ${target}`;
    }
  } catch (e) {
    return `转写失败: ${(e as Error).message}`;
  }
}

export const transliterateTool: ToolDef = {
  id: "transliterate",
  name: "转写",
  params: [fieldTlTarget],
  compute: (i, p) => transliterate(i, p.target),
};
