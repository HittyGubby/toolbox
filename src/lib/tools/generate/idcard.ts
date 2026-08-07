// 中国居民身份证号（18 位）生成与校验。
// 结构：6 位地区码 + 8 位出生日期(YYYYMMDD) + 3 位顺序码 + 1 位校验码。
// 校验码算法（GB 11643-1999）：前 17 位按权重 [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2]
// 加权求和后对 11 取模，映射表 '10X98765432'。生成的号码仅格式合法，无任何效力。

export interface Region {
  label: string;
  code: string;
}

export const regions: Region[] = [
  { label: "北京市东城区", code: "110101" },
  { label: "北京市西城区", code: "110102" },
  { label: "北京市朝阳区", code: "110105" },
  { label: "北京市丰台区", code: "110106" },
  { label: "北京市海淀区", code: "110108" },
  { label: "北京市顺义区", code: "110113" },
  { label: "北京市昌平区", code: "110114" },
  { label: "天津市和平区", code: "120101" },
  { label: "天津市河东区", code: "120102" },
  { label: "天津市河西区", code: "120103" },
  { label: "天津市南开区", code: "120104" },
  { label: "上海市黄浦区", code: "310101" },
  { label: "上海市徐汇区", code: "310104" },
  { label: "上海市长宁区", code: "310105" },
  { label: "上海市静安区", code: "310106" },
  { label: "上海市普陀区", code: "310107" },
  { label: "上海市虹口区", code: "310109" },
  { label: "上海市杨浦区", code: "310110" },
  { label: "上海市闵行区", code: "310112" },
  { label: "重庆市渝中区", code: "500103" },
  { label: "重庆市江北区", code: "500105" },
  { label: "重庆市沙坪坝区", code: "500106" },
  { label: "重庆市九龙坡区", code: "500107" },
  { label: "重庆市南岸区", code: "500108" },
  { label: "石家庄市", code: "130100" },
  { label: "唐山市", code: "130200" },
  { label: "邯郸市", code: "130400" },
  { label: "太原市", code: "140100" },
  { label: "呼和浩特市", code: "150100" },
  { label: "包头市", code: "150200" },
  { label: "沈阳市", code: "210100" },
  { label: "大连市", code: "210200" },
  { label: "长春市", code: "220100" },
  { label: "哈尔滨市", code: "230100" },
  { label: "南京市", code: "320100" },
  { label: "无锡市", code: "320200" },
  { label: "徐州市", code: "320300" },
  { label: "常州市", code: "320400" },
  { label: "苏州市", code: "320500" },
  { label: "南通市", code: "320600" },
  { label: "杭州市", code: "330100" },
  { label: "宁波市", code: "330200" },
  { label: "温州市", code: "330300" },
  { label: "合肥市", code: "340100" },
  { label: "福州市", code: "350100" },
  { label: "厦门市", code: "350200" },
  { label: "泉州市", code: "350500" },
  { label: "南昌市", code: "360100" },
  { label: "济南市", code: "370100" },
  { label: "青岛市", code: "370200" },
  { label: "烟台市", code: "370600" },
  { label: "潍坊市", code: "370700" },
  { label: "郑州市", code: "410100" },
  { label: "洛阳市", code: "410300" },
  { label: "武汉市", code: "420100" },
  { label: "长沙市", code: "430100" },
  { label: "广州市", code: "440100" },
  { label: "深圳市", code: "440300" },
  { label: "珠海市", code: "440400" },
  { label: "佛山市", code: "440600" },
  { label: "江门市", code: "440700" },
  { label: "惠州市", code: "441300" },
  { label: "东莞市", code: "441900" },
  { label: "中山市", code: "442000" },
  { label: "南宁市", code: "450100" },
  { label: "桂林市", code: "450300" },
  { label: "海口市", code: "460100" },
  { label: "三亚市", code: "460200" },
  { label: "成都市", code: "510100" },
  { label: "绵阳市", code: "510700" },
  { label: "贵阳市", code: "520100" },
  { label: "昆明市", code: "530100" },
  { label: "拉萨市", code: "540100" },
  { label: "西安市", code: "610100" },
  { label: "兰州市", code: "620100" },
  { label: "西宁市", code: "630100" },
  { label: "银川市", code: "640100" },
  { label: "乌鲁木齐市", code: "650100" },
  { label: "台湾省", code: "710000" },
  { label: "香港特别行政区", code: "810000" },
  { label: "澳门特别行政区", code: "820000" },
];

const CHECK_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_MAP = "10X98765432";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 计算 18 位身份证的校验码字符 */
export function checksum(seventeen: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += Number(seventeen[i]) * CHECK_WEIGHTS[i];
  return CHECK_MAP[sum % 11];
}

/** 校验 18 位身份证号码是否合法 */
export function isValidIdCard(id: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(id)) return false;
  return id[17].toUpperCase() === checksum(id.slice(0, 17));
}

export interface IdCardParams {
  region: string;
  gender: "male" | "female" | "random";
  /** 出生年份范围，如 "1970-2005" */
  yearRange: string;
}

function randomDate(yearRange: string): { y: number; m: number; d: number } {
  const m = yearRange.match(/(\d{4})\s*[-~]\s*(\d{4})/);
  const now = new Date();
  let min = 1940;
  let max = now.getFullYear() - 14;
  if (m) {
    min = Math.max(1900, Number(m[1]));
    max = Math.min(max, Number(m[2]));
  }
  if (min > max) min = max;
  const y = randomInt(min, max);
  const month = randomInt(1, 12);
  const daysInMonth = new Date(y, month, 0).getDate();
  const d = randomInt(1, daysInMonth);
  return { y, m: month, d };
}

/** 生成一个 18 位身份证号 */
export function generateIdCard(params: IdCardParams): string {
  const region = regions.find((r) => r.code === params.region) ?? regions[0];
  const { y, m, d } = randomDate(params.yearRange);
  const date =
    String(y).padStart(4, "0") +
    String(m).padStart(2, "0") +
    String(d).padStart(2, "0");

  let seq = randomInt(1, 999);
  const gender = params.gender;
  if (gender === "male" && seq % 2 === 0) seq += seq < 999 ? 1 : -1;
  if (gender === "female" && seq % 2 === 1) seq += seq < 999 ? 1 : -1;
  const seqStr = String(seq).padStart(3, "0");

  const seventeen = region.code + date + seqStr;
  return seventeen + checksum(seventeen);
}
