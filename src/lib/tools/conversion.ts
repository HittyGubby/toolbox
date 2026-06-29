import { caseConvert } from "./utils";
import { toggleJson, fieldCase } from "./fields";
import type { ToolDef, ParamField } from "./index";

const fieldInputBase: ParamField = {
  key: "inputBase",
  label: "输入进制",
  type: "select",
  default: "10",
  options: [
    { label: "二进制 (2)", value: "2" },
    { label: "八进制 (8)", value: "8" },
    { label: "十进制 (10)", value: "10" },
    { label: "十六进制 (16)", value: "16" },
  ],
};

const fieldOutputBase: ParamField = {
  key: "outputBase",
  label: "输出进制",
  type: "select",
  default: "16",
  options: [
    { label: "二进制 (2)", value: "2" },
    { label: "八进制 (8)", value: "8" },
    { label: "十进制 (10)", value: "10" },
    { label: "十六进制 (16)", value: "16" },
  ],
};

const fieldTsDirection: ParamField = {
  key: "dir",
  label: "方向",
  type: "toggle",
  default: "ts2date",
  options: [
    { label: "时间戳→日期", value: "ts2date" },
    { label: "日期→时间戳", value: "date2ts" },
  ],
};

const fieldTsUnit: ParamField = {
  key: "unit",
  label: "单位",
  type: "select",
  default: "ms",
  options: [
    { label: "秒 (s)", value: "s" },
    { label: "毫秒 (ms)", value: "ms" },
  ],
};

export const conversionTools: ToolDef[] = [
  {
    id: "json",
    name: "JSON",
    params: [toggleJson],
    compute: (i, p) => {
      try {
        const parsed = JSON.parse(i);
        return p.mode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, 2);
      } catch (e) {
        return "JSON 解析失败: " + (e as Error).message;
      }
    },
  },
  {
    id: "case",
    name: "大小写",
    params: [fieldCase],
    compute: (i, p) => caseConvert(i, p.fmt),
  },
  {
    id: "base-convert",
    name: "进制转换",
    params: [fieldInputBase, fieldOutputBase],
    compute: (i, p) => {
      try {
        const num = parseInt(i.trim(), parseInt(p.inputBase));
        if (isNaN(num)) return "无效的数字";
        return num.toString(parseInt(p.outputBase)).toUpperCase();
      } catch {
        return "转换失败";
      }
    },
  },
  {
    id: "timestamp",
    name: "时间戳",
    params: [fieldTsDirection, fieldTsUnit],
    compute: (i, p) => {
      try {
        if (p.dir === "ts2date") {
          const ts = parseInt(i.trim());
          if (isNaN(ts)) return "无效的时间戳";
          const mul = p.unit === "ms" ? 1 : 1000;
          const d = new Date(ts * mul);
          if (isNaN(d.getTime())) return "无效的时间戳";
          return (
            d.toLocaleString("zh-CN", { timeZone: "UTC", hour12: false }) +
            " UTC\n" +
            d.toLocaleString("zh-CN", { hour12: false }) +
            " (本地时间)"
          );
        } else {
          const d = new Date(i.trim());
          if (isNaN(d.getTime()))
            return "无效的日期格式，试试: 2024-01-15 10:30:00";
          const ts = Math.floor(d.getTime() / (p.unit === "ms" ? 1 : 1000));
          return ts.toString();
        }
      } catch {
        return "转换失败";
      }
    },
  },
];
