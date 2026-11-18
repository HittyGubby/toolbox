export type FieldType = "toggle" | "select" | "text" | "color";

/** 输入通道类型；工具按当前参数解析出一条生效的 InputSpec */
export type InputKind = "text" | "image" | "none";

/** 条件声明：当前参数值落在 values 中时生效；key 缺省时用该字段自身的 default 兜底 */
export interface Condition {
  key: string;
  values: string[];
}

export interface ParamOption {
  label: string;
  value: string;
  /** 选中该项时充当主按钮动词（如「生成」「扫描」）；多处命中时后者覆盖 */
  action?: string;
}

/** 参数附带的动作按钮：结果由引擎写入输入框，组件不认识任何具体工具 */
export interface ParamAction {
  label: string;
  fill: (values: Record<string, string>) => string;
}

export interface ParamField {
  key: string;
  label: string;
  type: FieldType;
  options?: ParamOption[];
  default?: string;
  placeholder?: string;
  /** 仅当另一参数取指定值时显示；未声明则恒显示 */
  dependsOn?: Condition;
  /** 控件占位：half 表示与相邻 half 字段并排各占半宽，默认独占一行 */
  span?: "half" | "full";
  /** 渲染在控件上方的动作按钮 */
  action?: ParamAction;
}

/** 一条输入通道声明；同一工具可声明多条，按 when 选出生效的那条 */
export interface InputSpec {
  kind?: InputKind;
  /** 生效条件；未声明视为兜底候选 */
  when?: Condition;
  /** 文本占位 / 空态提示 */
  placeholder?: string;
  /** 空态说明文字 */
  hint?: string;
  /** image 时的文件类型过滤，默认 image/* */
  accept?: string;
}

/** 引擎随输入提供的附件（图片输入时填充） */
export interface InputAssets {
  /** 已按上限缩放解码的位图，供图像类工具直接消费 */
  image?: ImageData;
  /** 预览用 object URL */
  url?: string;
}

export interface ToolDef {
  id: string;
  name: string;
  params: ParamField[];
  /** 未声明时默认 [{ kind: "text" }] */
  inputs?: InputSpec[];
  compute: (
    input: string,
    params: Record<string, string>,
    assets?: InputAssets,
  ) => string | Promise<string>;
}

export interface GroupDef {
  id: string;
  name: string;
  children: ToolDef[];
}
