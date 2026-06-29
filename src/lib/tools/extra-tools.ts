import QRCode from "qrcode";
import { fieldQrSize, fieldQrDark, fieldQrLight } from "./fields";
import type { ToolDef } from "./index";

export const extraTools: ToolDef[] = [
  {
    id: "qr",
    name: "二维码",
    params: [fieldQrDark, fieldQrLight, fieldQrSize],
    compute: async (i, p) =>
      QRCode.toDataURL(i, {
        width: +p.size,
        color: { dark: p.dark, light: p.light },
        margin: 2,
      }),
  },
  {
    id: "stats",
    name: "文本统计",
    params: [],
    compute: (i) => {
      const c = i.length,
        ns = i.replace(/\s/g, "").length,
        w = i.trim() ? i.trim().split(/\s+/).length : 0,
        l = i ? i.split("\n").length : 0,
        b = new TextEncoder().encode(i).length;
      return `字符数: ${c}\n字符(去空格): ${ns}\n单词数: ${w}\n行数: ${l}\n字节数: ${b}`;
    },
  },
];
