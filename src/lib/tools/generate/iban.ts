// IBAN 生成逻辑，移植自 https://randomiban.com（本站该脚本声明可自由使用）。
// 生成的 IBAN 仅按格式与 MOD-97 校验位构造，不代表真实银行账户，无任何效力。

const isoAbbreviations: Record<string, string> = {
  Andorra: "AD",
  Albania: "AL",
  Austria: "AT",
  Azerbaijan: "AZ",
  Bahrain: "BH",
  Belgium: "BE",
  Bosnia: "BA",
  Brazil: "BR",
  Bulgaria: "BG",
  Costa_rica: "CR",
  Croatia: "HR",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  Dominicana: "DO",
  Estonia: "EE",
  Faroe_Islands: "FO",
  Finland: "FI",
  France: "FR",
  Georgia: "GE",
  Germany: "DE",
  Gibraltar: "GI",
  Greece: "GR",
  Greenland: "GL",
  Guatemala: "GT",
  Hungary: "HU",
  Iceland: "IS",
  Ireland: "IE",
  Israel: "IL",
  Italy: "IT",
  Jordan: "JO",
  Kazakhstan: "KZ",
  Kuwait: "KW",
  Latvia: "LV",
  Lebanon: "LB",
  Liechtenstein: "LI",
  Lithuania: "LT",
  Luxembourg: "LU",
  Macedonia: "MK",
  Malta: "MT",
  Mauritania: "MR",
  Mauritius: "MU",
  Moldova: "MD",
  Monaco: "MC",
  Montenegro: "ME",
  Netherlands: "NL",
  Norway: "NO",
  Pakistan: "PK",
  Poland: "PL",
  Palestine: "PS",
  Portugal: "PT",
  Qatar: "QA",
  Kosovo: "XK",
  Romania: "RO",
  Saint_Lucia: "LC",
  San_Marino: "SM",
  Sao_Tome_Principe: "ST",
  Saudi: "SA",
  Serbia: "RS",
  Seychelles: "SC",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Timor_Leste: "TL",
  Tunisia: "TN",
  Turkey: "TR",
  Ukraine: "UA",
  UAE: "AE",
  UK: "GB",
  Virgin_Islands: "VG",
  Algeria: "DZ",
  Angola: "AO",
  Benin: "BJ",
  Burkina_Faso: "BF",
  Burundi: "BI",
  Cameroon: "CM",
  Cape_Verde: "CV",
  Iran: "IR",
  Ivory_Coast: "CI",
  Madagascar: "MG",
  Mali: "ML",
  Mozambique: "MZ",
  Senegal: "SN",
  Comoros: "KM",
  Chad: "TD",
  Congo: "CG",
  Egypt: "EG",
  Gabon: "GA",
  Honduras: "HN",
  Morocco: "MA",
  Nicuragua: "NI",
  Niger: "NE",
  Togo: "TG",
};

const countryLength: Record<string, number> = {
  Andorra: 24,
  Albania: 28,
  Austria: 20,
  Azerbaijan: 28,
  Bahrain: 22,
  Belgium: 16,
  Bosnia: 20,
  Brazil: 29,
  Bulgaria: 22,
  Costa_rica: 21,
  Croatia: 21,
  Cyprus: 28,
  Czechia: 24,
  Denmark: 18,
  Dominicana: 28,
  Estonia: 20,
  Faroe_Islands: 18,
  Finland: 18,
  France: 27,
  Georgia: 22,
  Germany: 22,
  Gibraltar: 23,
  Greece: 27,
  Greenland: 18,
  Guatemala: 28,
  Hungary: 28,
  Iceland: 26,
  Ireland: 22,
  Israel: 23,
  Italy: 27,
  Jordan: 30,
  Kazakhstan: 20,
  Kuwait: 30,
  Latvia: 21,
  Lebanon: 28,
  Liechtenstein: 21,
  Lithuania: 20,
  Luxembourg: 20,
  Macedonia: 19,
  Malta: 31,
  Mauritania: 27,
  Mauritius: 30,
  Moldova: 24,
  Monaco: 27,
  Montenegro: 22,
  Netherlands: 18,
  Norway: 15,
  Pakistan: 24,
  Poland: 28,
  Palestine: 29,
  Portugal: 25,
  Qatar: 29,
  Kosovo: 20,
  Romania: 24,
  Saint_Lucia: 32,
  San_Marino: 27,
  Sao_Tome_Principe: 25,
  Saudi: 24,
  Serbia: 22,
  Seychelles: 31,
  Slovakia: 24,
  Slovenia: 19,
  Spain: 24,
  Sweden: 24,
  Switzerland: 21,
  Timor_Leste: 23,
  Tunisia: 24,
  Turkey: 26,
  Ukraine: 29,
  UAE: 23,
  UK: 22,
  Virgin_Islands: 24,
  Algeria: 24,
  Angola: 25,
  Benin: 26,
  Burkina_Faso: 27,
  Burundi: 16,
  Cameroon: 27,
  Cape_Verde: 25,
  Iran: 26,
  Ivory_Coast: 28,
  Madagascar: 27,
  Mozambique: 25,
  Mali: 28,
  Senegal: 28,
  Comoros: 27,
  Chad: 27,
  Congo: 27,
  Egypt: 27,
  Gabon: 27,
  Honduras: 28,
  Morocco: 28,
  Nicuragua: 32,
  Niger: 28,
  Togo: 28,
};

// 每个国家 IBAN 中 BBAN 部分开头固定的字母数量（BIC 字符）
const characterCountries: Record<string, number> = {
  Albania: 0,
  Andorra: 0,
  Austria: 0,
  Azerbaijan: 4,
  Bahrain: 4,
  Belgium: 0,
  Bosnia: 0,
  Brazil: 0,
  Bulgaria: 4,
  Costa_rica: 0,
  Croatia: 0,
  Cyprus: 0,
  Czechia: 0,
  Denmark: 0,
  Dominicana: 4,
  Estonia: 0,
  Faroe_Islands: 0,
  Finland: 0,
  France: 0,
  Georgia: 0,
  Germany: 0,
  Gibraltar: 4,
  Greece: 0,
  Greenland: 0,
  Guatemala: 0,
  Hungary: 0,
  Iceland: 0,
  Ireland: 4,
  Israel: 0,
  Italy: 1,
  Jordan: 4,
  Kazakhstan: 0,
  Kuwait: 4,
  Latvia: 4,
  Lebanon: 0,
  Liechtenstein: 0,
  Lithuania: 0,
  Luxembourg: 0,
  Macedonia: 0,
  Malta: 4,
  Mauritania: 0,
  Mauritius: 4,
  Moldova: 0,
  Monaco: 0,
  Montenegro: 0,
  Netherlands: 4,
  Norway: 0,
  Pakistan: 4,
  Poland: 0,
  Palestine: 4,
  Portugal: 0,
  Qatar: 4,
  Kosovo: 0,
  Romania: 4,
  Saint_Lucia: 4,
  San_Marino: 1,
  Sao_Tome_Principe: 0,
  Saudi: 0,
  Serbia: 0,
  Seychelles: 4,
  Slovenia: 0,
  Slovakia: 0,
  Spain: 0,
  Sweden: 0,
  Switzerland: 0,
  Timor_Leste: 0,
  Tunisia: 0,
  Turkey: 0,
  Ukraine: 0,
  UAE: 0,
  UK: 4,
  Virgin_Islands: 4,
  Algeria: 0,
  Angola: 0,
  Benin: 1,
  Burkina_Faso: 0,
  Burundi: 0,
  Cameroon: 0,
  Cape_Verde: 0,
  Iran: 0,
  Ivory_Coast: 1,
  Madagascar: 0,
  Mali: 1,
  Mozambique: 0,
  Senegal: 1,
  Comoros: 0,
  Chad: 0,
  Congo: 0,
  Egypt: 0,
  Gabon: 0,
  Honduras: 4,
  Morocco: 0,
  Nicuragua: 4,
  Niger: 0,
  Togo: 0,
};

const letterMap: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18,
  J: 19, K: 20, L: 21, M: 22, N: 23, O: 24, P: 25, Q: 26, R: 27,
  S: 28, T: 29, U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35,
};

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDigits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function randomLetters(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++)
    out += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return out;
}

function replaceLetters(s: string): string {
  let out = "";
  for (const ch of s) {
    if (ch in letterMap) out += String(letterMap[ch]);
    else out += ch;
  }
  return out;
}

function mod97(s: string): number {
  // 分块计算大数对 97 的模
  let rem = 0;
  for (let i = 0; i < s.length; i++) {
    rem = (rem * 10 + (s.charCodeAt(i) - 48)) % 97;
  }
  return rem;
}

function calcChecksum(countryCode: string, randomPart: string): string {
  const check = 98 - mod97(replaceLetters(randomPart + countryCode + "00"));
  return countryCode + String(check).padStart(2, "0") + randomPart;
}

function mod11(input: string): number {
  const cifras = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];
  let check = 0;
  for (let i = 0; i < 10; i++) check += Number(input[i]) * cifras[i];
  check = 11 - (check % 11);
  if (check === 11) check = 0;
  if (check === 10) check = 1;
  return check;
}

function estoniaCheckDigit(account: string): number {
  const weights = [7, 3, 1];
  let total = 0;
  for (let i = 0; i < account.length; i++)
    total += Number(account[account.length - 1 - i]) * weights[i % 3];
  return Math.ceil(total / 10) * 10 - total;
}

function ribCheck(numeric: number, y: string, z: string): number {
  let rib = "";
  for (const ch of z) {
    const c = ch;
    if (/[A-Z]/.test(c)) {
      const map = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1,
        K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 2, T: 3, U: 4,
        V: 5, W: 6, X: 7, Y: 8, Z: 9 };
      rib += String(map[c as keyof typeof map]);
    } else {
      rib += c;
    }
  }
  const t = 97 - ((89 * numeric + 15 * Number(y) + 3 * Number(rib)) % 97);
  return t;
}

function spanishCheck(): string {
  const sortCodes = ["2100", "2095", "0081", "2080", "0182", "0487", "0075", "3190", "2038", "1465", "3004", "0128"];
  const bnb = "00" + randomElement(sortCodes) + randomDigits(4);
  const account = randomDigits(10);
  const d1 = mod11(bnb);
  const d2 = mod11(account);
  return bnb.substr(2, 8) + d1 + d2 + account;
}

function mod97_10(input: string): string {
  let a = 1;
  let ch = input.charCodeAt(0) - 48;
  let check = ch;
  for (let i = input.length - 2; i >= 0; i--) {
    ch = input.charCodeAt(i) - 48;
    a = (a * 10) % 97;
    check += a * ch;
  }
  const x = 98 - (check % 97);
  return String(x).padStart(2, "0");
}

function norwayCheck(input: string): number {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let total = 0;
  for (let i = 0; i < 10; i++) total += Number(input[i]) * weights[i];
  return (11 - (total % 11)) % 11;
}

const IBAN_COUNTRIES = Object.keys(isoAbbreviations);

function buildIban(countryInput: string): string {
  const ISO = isoAbbreviations[countryInput];
  const IBAN_length = countryLength[countryInput];
  const middle = characterCountries[countryInput];

  switch (countryInput) {
    case "Netherlands": {
      const NL_Banks = ["ABNA", "RABO", "INGB"];
      const NL_Accounts = [
        "3767744449", "8849764685", "1679475908", "7568468658",
        "7356737620", "6465126079", "4353368141", "3115404417",
        "5198491756", "8877477636", "6787979517", "3014449407",
        "2749559820", "5985611140", "5138773127", "9471241308",
        "1878166956", "7108893045", "3729480081", "8201469062",
        "6333227641", "9238197806", "3659950165", "4458972219",
        "9549565319", "9317387888", "7910683588", "9747720019",
      ];
      return calcChecksum(
        ISO,
        randomElement(NL_Banks) + randomElement(NL_Accounts),
      );
    }
    case "UK": {
      const BARCLAYS_sort = ["200318", "200326", "200353", "200378", "200380", "200384", "200395", "200401", "200404"];
      const suffix = IBAN_length - 4 - middle;
      return calcChecksum(
        ISO,
        "BARC" + randomElement(BARCLAYS_sort) + randomDigits(suffix - 6),
      );
    }
    case "Brazil":
      return calcChecksum(
        ISO,
        randomDigits(IBAN_length - 6) + randomLetters(1) + randomDigits(1),
      );
    case "Seychelles":
      return calcChecksum(
        ISO,
        randomDigits(IBAN_length - 7) + randomLetters(3),
      );
    case "Switzerland":
      return calcChecksum(ISO, "89144" + randomDigits(IBAN_length - 9));
    case "Mauritius":
      return calcChecksum(
        ISO,
        randomLetters(middle) + randomDigits(IBAN_length - 11) + randomLetters(3),
      );
    case "Albania": {
      const Albania_sort = ["61456613", "13411321", "21451126", "87938313"];
      return calcChecksum(
        ISO,
        randomElement(Albania_sort) + randomDigits(IBAN_length - 12),
      );
    }
    case "Belgium": {
      const Belgium_sort = ["199", "173", "798", "587", "988", "817", "978", "548", "897", "557", "631", "519", "953", "663", "456", "233", "954", "812", "999", "561", "549", "957", "485", "321", "436", "429", "131", "735", "878"];
      const numeric = randomElement(Belgium_sort) + randomDigits(IBAN_length - 9);
      const how = String(Number(numeric) % 97).padStart(2, "0");
      return calcChecksum(ISO, numeric + how);
    }
    case "Bosnia":
      return calcChecksum(ISO, "102" + randomDigits(IBAN_length - 7));
    case "Estonia": {
      const numeric = randomDigits(IBAN_length - 7);
      return calcChecksum(ISO, "12" + numeric + estoniaCheckDigit(numeric));
    }
    case "Czechia":
      return calcChecksum(ISO, "5051" + randomDigits(IBAN_length - 8));
    case "Greece": {
      const Greek_sort = ["010", "011", "014", "017"];
      return calcChecksum(
        ISO,
        randomElement(Greek_sort) + randomDigits(IBAN_length - 7),
      );
    }
    case "Germany":
      return calcChecksum(ISO, "50010517" + randomDigits(IBAN_length - 12));
    case "Denmark":
      return calcChecksum(ISO, "5051" + randomDigits(IBAN_length - 8));
    case "Italy": {
      const Italy_map = { 0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21 };
      const Italy_CIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numeric = "0300203280" + randomDigits(IBAN_length - 15);
      let yy = 0;
      let xx = 0;
      for (let i = 1; i < 22; i += 2) yy += Number(numeric.charAt(i));
      for (let j = 0; j < 22; j += 2)
        xx += Italy_map[Number(numeric.charAt(j)) as keyof typeof Italy_map];
      const kk = Italy_CIN[(xx + yy) % 26];
      return calcChecksum(ISO, kk + numeric);
    }
    case "Luxembourg":
      return calcChecksum(ISO, "010" + randomDigits(IBAN_length - 7));
    case "Liechtenstein":
      return calcChecksum(ISO, "08800" + randomDigits(IBAN_length - 9));
    case "Ireland":
      return calcChecksum(ISO, "BOFI900017" + randomDigits(IBAN_length - 14));
    case "Poland":
      return calcChecksum(ISO, "10902402" + randomDigits(IBAN_length - 12));
    case "Austria": {
      const Austria_sort = ["14000", "19360", "19470", "11000", "54000", "12000", "20604", "32000", "60000", "54000", "20404", "36218", "32195", "66163", "34000", "20111", "22500"];
      return calcChecksum(
        ISO,
        randomElement(Austria_sort) + randomDigits(IBAN_length - 9),
      );
    }
    case "Croatia": {
      const Croatia_sort = ["2340009", "2500009", "2402006", "2360000", "2484008"];
      return calcChecksum(
        ISO,
        randomElement(Croatia_sort) + randomDigits(IBAN_length - 11),
      );
    }
    case "Kosovo":
      return calcChecksum(ISO, "11" + randomDigits(IBAN_length - 6));
    case "San_Marino":
      return calcChecksum(ISO, "0322509800" + randomDigits(IBAN_length - 14));
    case "Hungary": {
      const Hungray_sort = ["10700024", "13100007", "10918001"];
      return calcChecksum(
        ISO,
        randomElement(Hungray_sort) + randomDigits(IBAN_length - 12),
      );
    }
    case "UAE": {
      const UAE_sort = ["021", "003", "033", "035", "026"];
      return calcChecksum(
        ISO,
        randomElement(UAE_sort) + randomDigits(IBAN_length - 7),
      );
    }
    case "Bulgaria": {
      const Bulgaria_sort = ["STSA9300", "UNCR7000", "RZBB9155", "TTBB9400", "BNPA9440", "IORT8094"];
      return calcChecksum(
        ISO,
        randomElement(Bulgaria_sort) + randomDigits(IBAN_length - 12),
      );
    }
    case "Spain":
      return calcChecksum(ISO, spanishCheck());
    case "Turkey":
      return calcChecksum(ISO, "00062" + randomDigits(IBAN_length - 9));
    case "Norway": {
      let numeric = randomDigits(IBAN_length - 5);
      let check = norwayCheck(numeric);
      while (check === 10) {
        numeric = randomDigits(IBAN_length - 5);
        check = norwayCheck(numeric);
      }
      return calcChecksum(ISO, numeric + check);
    }
    case "Monaco":
    case "France": {
      const Monaco_sort = ["12739", "10096", "14508", "17569", "30003"];
      const Monaco_sort1 = ["00070", "00050", "00040", "00030"];
      const numeric = randomElement(Monaco_sort);
      const y = randomElement(Monaco_sort1);
      const z = randomDigits(10) + randomLetters(1);
      const x = ribCheck(Number(numeric), y, z);
      return calcChecksum(ISO, numeric + y + z + String(x).padStart(2, "0"));
    }
    case "Romania": {
      const Romania_sort = ["PORL", "RZBR"];
      return calcChecksum(
        ISO,
        randomElement(Romania_sort) + randomDigits(IBAN_length - 8),
      );
    }
    case "Costa_rica":
      return calcChecksum(ISO, "0" + randomDigits(IBAN_length - 5));
    case "Portugal": {
      const Portugal_sort = ["00350651"];
      const numeric = randomElement(Portugal_sort) + randomDigits(IBAN_length - 14);
      return calcChecksum(ISO, numeric + mod97_10(numeric));
    }
    default: {
      const numericSuffix = IBAN_length - 4 - middle;
      return calcChecksum(
        ISO,
        randomLetters(middle) + randomDigits(numericSuffix),
      );
    }
  }
}

/** 生成指定国家的一个 IBAN（无空格，规范格式） */
export function generateIban(country: string): string {
  return buildIban(country);
}

/** 可生成 IBAN 的国家列表 */
export const ibanCountries = IBAN_COUNTRIES.map((c) => ({
  label: c.replace(/_/g, " "),
  value: c,
}));
