// 信用卡号生成，Luhn 校验位算法参考 https://github.com/mat1520/Credit-Card-Gen-Luhn。
// 生成的卡号仅通过 Luhn 算法校验，不代表真实卡片，无任何效力。

export interface CardNetwork {
  name: string;
  /** 可能的卡号总长度 */
  lengths: number[];
  /** 卡号前缀（BIN），随机选取一个作为起始 */
  prefixes: string[];
}

export const cardNetworks: Record<string, CardNetwork> = {
  visa: {
    name: "Visa",
    lengths: [16],
    prefixes: ["4"],
  },
  mastercard: {
    name: "MasterCard",
    lengths: [16],
    prefixes: ["51", "52", "53", "54", "55", "2221"],
  },
  amex: {
    name: "American Express",
    lengths: [15],
    prefixes: ["34", "37"],
  },
  discover: {
    name: "Discover",
    lengths: [16],
    prefixes: ["6011", "65", "622126"],
  },
  jcb: {
    name: "JCB",
    lengths: [16],
    prefixes: ["3528", "3530", "3566"],
  },
  unionpay: {
    name: "银联",
    lengths: [16],
    prefixes: ["62"],
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 根据 Luhn 算法为载荷（不含校验位的前缀部分）计算校验位 */
export function luhnCheckDigit(payload: string): number {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    let d = Number(payload[payload.length - 1 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateCardNumber(bin: string, length: number): string {
  const need = length - bin.length - 1;
  let payload = bin;
  for (let i = 0; i < need; i++) payload += randomInt(0, 9);
  return payload + luhnCheckDigit(payload);
}

function luhnValid(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export interface GeneratedCard {
  number: string;
  month: string;
  year: string;
  cvv: string;
  network: string;
}

/** 生成一张信用卡（卡号、有效期、CVV） */
export function generateCard(
  networkKey: string,
  customBin?: string,
): GeneratedCard {
  let networkName = "";
  let bin: string;
  let length: number;

  if (networkKey === "custom" && customBin && /^[0-9xX]{6,16}$/.test(customBin)) {
    // 自定义 BIN：x 用作通配随机位，默认生成 16 位卡号
    bin = customBin.replace(/x/gi, () => String(randomInt(0, 9)));
    if (bin.length > 15) bin = bin.slice(0, 15);
    length = 16;
    const net = Object.values(cardNetworks).find((n) =>
      n.prefixes.some((p) => bin.startsWith(p)),
    );
    networkName = net?.name ?? "自定义";
  } else {
    const net = cardNetworks[networkKey] ?? cardNetworks.visa;
    networkName = net.name;
    bin = net.prefixes[randomInt(0, net.prefixes.length - 1)];
    length = net.lengths[randomInt(0, net.lengths.length - 1)];
  }

  const number = generateCardNumber(bin, length);

  const year = new Date().getFullYear();
  const expYear = String(randomInt(year, year + 10)).slice(-2);
  const expMonth = String(randomInt(1, 12)).padStart(2, "0");
  const cvv = networkKey === "amex" ? String(randomInt(1000, 9999)) : String(randomInt(100, 999));

  return {
    number,
    month: expMonth,
    year: expYear,
    cvv,
    network: networkName,
  };
}

export { luhnValid };
