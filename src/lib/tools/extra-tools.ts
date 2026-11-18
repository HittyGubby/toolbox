import {
  toggleQrMode,
  fieldQrSize,
  fieldQrDark,
  fieldQrLight,
  fieldQrFormat,
} from "./fields";
import { renderQr, scanQr } from "../qr";
import type { ToolDef } from "./index";

export const extraTools: ToolDef[] = [
  {
    id: "qr",
    name: "二维码",
    params: [
      toggleQrMode,
      fieldQrFormat,
      fieldQrDark,
      fieldQrLight,
      fieldQrSize,
    ],
    inputs: [
      {
        kind: "text",
        when: { key: "mode", values: ["encode"] },
        placeholder: "输入要编码的文本或链接...",
      },
      {
        kind: "image",
        when: { key: "mode", values: ["decode"] },
        hint: "粘贴 (Ctrl+V)、拖拽或点击选择二维码图片",
        accept: "image/*",
      },
    ],
    compute: (i, p, assets) => {
      if ((p.mode ?? "encode") === "decode") {
        if (!assets?.image) throw new Error("请先粘贴或选择一张二维码图片");
        return scanQr(assets.image);
      }
      return renderQr(i, {
        size: +(p.size || 256),
        dark: p.dark,
        light: p.light,
        format: p.format === "svg" ? "svg" : "png",
      });
    },
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
