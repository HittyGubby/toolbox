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
  compute: (
    input: string,
    params: Record<string, string>,
  ) => string | Promise<string>;
}

export interface ToolSubgroup {
  name: string;
  children: ToolDef[];
}

export type DropdownItem = ToolDef | ToolSubgroup;

export interface GroupDef {
  id: string;
  name: string;
  children: DropdownItem[];
}
