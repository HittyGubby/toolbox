import type { InputAssets, ToolDef } from "./tools/index";
import { resolveInput } from "./tools/field-view";

export interface RunInput {
  text: string;
  image?: ImageData;
  url?: string;
}

/** 当前输入是否满足该工具的输入通道要求 */
export function canRun(
  tool: ToolDef,
  values: Record<string, string>,
  input: RunInput,
): boolean {
  const kind = resolveInput(tool, values).kind ?? "text";
  if (kind === "none") return true;
  if (kind === "image") return !!input.image;
  return !!input.text.trim();
}

/** 统一同步/异步结果并把异常转成界面可显示的一行文字 */
export async function runTool(
  tool: ToolDef,
  values: Record<string, string>,
  input: RunInput,
): Promise<string> {
  const assets: InputAssets | undefined = input.image
    ? { image: input.image, url: input.url }
    : undefined;
  try {
    return await tool.compute(input.text, values, assets);
  } catch (e) {
    return "出错了: " + (e as Error).message;
  }
}
