export type FieldType = "toggle" | "select" | "text" | "color";

export interface ParamField {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  default?: string;
  placeholder?: string;
}

export interface ToolDef {
  id: string;
  name: string;
  params: ParamField[];
  /** 无需输入内容即可运行的工具（如随机生成器），运行时忽略 input */
  noInput?: boolean;
  compute: (
    input: string,
    params: Record<string, string>,
  ) => string | Promise<string>;
}

export interface GroupDef {
  id: string;
  name: string;
  children: ToolDef[];
}
