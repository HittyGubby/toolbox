import type {
  Condition,
  InputSpec,
  ParamField,
  ToolDef,
} from "./index";

/** 取字段当前生效值：显式参数优先，其次字段默认值 */
export function fieldValue(
  f: ParamField,
  values: Record<string, string>,
): string {
  return values[f.key] ?? f.default ?? "";
}

/** 条件求值；undefined 条件视为恒真 */
export function matches(
  cond: Condition | undefined,
  values: Record<string, string>,
  fields: ParamField[],
): boolean {
  if (!cond) return true;
  const target = fields.find((f) => f.key === cond.key);
  const v = values[cond.key] ?? target?.default ?? "";
  return cond.values.includes(v);
}

/** 当前参数下应渲染的字段 */
export function visibleParams(
  tool: ToolDef,
  values: Record<string, string>,
): ParamField[] {
  return tool.params.filter((f) => matches(f.dependsOn, values, tool.params));
}

/** 把连续的 span: half 字段聚成一行，其余字段各自独占一行 */
export function groupFields(fields: ParamField[]): ParamField[][] {
  const rows: ParamField[][] = [];
  for (const f of fields) {
    const last = rows[rows.length - 1];
    if (f.span === "half" && last && last[0].span === "half") last.push(f);
    else rows.push([f]);
  }
  return rows;
}

/** 解析当前生效的输入通道；无声明时视为纯文本 */
export function resolveInput(
  tool: ToolDef,
  values: Record<string, string>,
): InputSpec {
  const list = tool.inputs ?? [];
  if (list.length === 0) return { kind: "text" };
  const hit = list.find((s) =>
    s.when ? matches(s.when, values, tool.params) : false,
  );
  return hit ?? list.find((s) => !s.when) ?? list[0];
}

/** 工具声明的图片输入通道（每个工具至多一条） */
export function imageChannel(tool: ToolDef): InputSpec | undefined {
  return (tool.inputs ?? []).find((s) => (s.kind ?? "text") === "image");
}

/**
 * 把参数推到图片通道生效所需的取值。
 * 返回 null 表示无需/无法提升；纯函数，不碰组件状态。
 */
export function promoteToImage(
  tool: ToolDef,
  values: Record<string, string>,
): Record<string, string> | null {
  const spec = imageChannel(tool);
  if (!spec?.when) return null;
  if ((resolveInput(tool, values).kind ?? "text") === "image") return null;
  return { ...values, [spec.when.key]: spec.when.values[0] };
}

/** 主按钮动词：先看当前选中项声明的 action，再回落默认 */
export function resolveAction(
  tool: ToolDef,
  values: Record<string, string>,
): string | undefined {
  let action: string | undefined;
  for (const f of tool.params) {
    const v = fieldValue(f, values);
    for (const o of f.options ?? [])
      if (o.value === v && o.action) action = o.action;
  }
  return action;
}
