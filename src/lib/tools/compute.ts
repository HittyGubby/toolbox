import type { ToolDef, ToolSubgroup, GroupDef, ParamField } from "./index";
export type { ToolDef, ToolSubgroup, GroupDef, ParamField };

import { hashTools } from "./hash";
import { encodingTools } from "./encoding";
import { cipherTools } from "./cipher";
import { conversionTools } from "./conversion";
import { extraTools } from "./extra-tools";
import { transliterateTool } from "./transliterate";

const all: ToolDef[] = [
  ...hashTools,
  ...encodingTools,
  ...cipherTools,
  ...conversionTools,
  ...extraTools,
  transliterateTool,
];

export const groups: GroupDef[] = [
  {
    id: "hash",
    name: "哈希",
    children: [
      all.find((t) => t.id === "md5")!,
      all.find((t) => t.id === "crc32")!,
      all.find((t) => t.id === "sha")!,
    ],
  },
  {
    id: "encoding",
    name: "编码",
    children: ["base64", "hex", "url", "unicode"].map((id) =>
      all.find((t) => t.id === id)!,
    ) as ToolDef[],
  },
  {
    id: "encryption",
    name: "加密",
    children: ["aes", "des"].map((id) =>
      all.find((t) => t.id === id)!,
    ) as ToolDef[],
  },
  {
    id: "conversion",
    name: "转换",
    children: ["json", "case", "base-convert", "timestamp"].map((id) =>
      all.find((t) => t.id === id)!,
    ) as ToolDef[],
  },
  {
    id: "tools",
    name: "工具",
    children: ["qr", "stats", "transliterate"].map((id) =>
      all.find((t) => t.id === id)!,
    ) as ToolDef[],
  },
];

export const tools = all;

export function getTool(id: string): ToolDef | undefined {
  return all.find((t) => t.id === id);
}

export function flattenTools(): ToolDef[] {
  return all;
}

function isSubgroup(item: any): item is ToolSubgroup {
  return "children" in item && !("params" in item);
}

export function isTool(item: any): item is ToolDef {
  return "params" in item;
}

export function isToolSubgroup(item: any): item is ToolSubgroup {
  return isSubgroup(item);
}
