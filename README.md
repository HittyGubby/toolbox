# Toolbox

好用的在线工具合集 —— 哈希、编码、加密、文本转换、二维码生成、文字转写等。

## 功能

| 分类         | 工具                                                                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **哈希**     | MD5, CRC32, SHA-1/256/512, SHA3-256                                                                                                                                                                                               |
| **编码**     | Base64, Hex, URL, Unicode 编解码                                                                                                                                                                                                  |
| **加密**     | AES, DES（支持 CBC/ECB/CFB/OFB/CTR 模式）                                                                                                                                                                                         |
| **转换**     | JSON 格式化/压缩, 大小写转换, 进制转换, 时间戳转换                                                                                                                                                                                |
| **工具**     | 二维码生成/扫描, 文本统计, 文字转写                                                                                                                                                                                               |
| **生成**     | IBAN, 信用卡号, 身份证号, UUID, 随机手机号（本地随机生成，仅格式合法，无任何效力）                                                                                                                                                 |
| **文字转写** | 拉丁字母 / 西里尔 / 希腊 / 阿拉伯 / 希伯来 / 亚美尼亚 / 格鲁吉亚 / 阿姆哈拉 / 天城文 / 孟加拉 / 古木基 / 古吉拉特 / 奥里亚 / 泰米尔 / 泰卢固 / 卡纳达 / 马拉雅拉姆 / 僧伽罗 / 泰文 / 平假名 / 片假名 / 韩文 / 中文拼音 / 伪中国语 |

## 外观

右上角色块即颜色选择器（色块上的太阳/月亮图标按当前颜色的对比色着色），点击后可在**主题色**与**背景色**之间切换，共用同一个色板：

- 主题色写入 `--color-primary`，同时按亮度推导 `--color-primary-content`；
- 背景色会重算整套 daisyUI base 色阶（`base-100/200/300/base-content`），顶栏、面板、输入框、按钮、边框一起变化，并按亮度自动切换文字深浅；
- 亮/暗主题不再需要手动切换，跟随系统偏好即可，配色由上述两个颜色完全决定。

## 技术栈

- [Svelte 5](https://svelte.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [qrcode](https://github.com/soldair/node-qrcode) / [jsQR](https://github.com/cozmo/jsQR)（二维码生成与识别）

## 工具接口

工具是纯数据声明（`src/lib/tools/index.ts` 的 `ToolDef`），界面由 `App.svelte` 通用渲染，新增工具通常不需要碰组件：

- `params`：参数声明。`type` 决定控件（toggle/select/text/color），`dependsOn` 按其它参数值决定显隐，`span: "half"` 让相邻字段并排（连续同类型按钮自动拼成 join 组）。
- `inputs`：输入通道声明。`kind` 为 `text` / `image` / `none`，`when` 指定生效条件；引擎按当前参数选出生效的那条，图片通道自带粘贴、拖拽与文件选择。
- `compute(input, params, assets)`：`assets.image` 是解码后的位图，供图像类工具（如二维码扫描）直接使用。
- `params[].action`：参数附带的动作按钮，`fill(values)` 的返回值写入输入框（如时间戳的「实时时间」），组件不认识任何具体工具。

切换参数的 `options[].action` 会覆盖主按钮动词（例如「生成」/「扫描」）。

界面之外的能力也各有归属：`session.ts`（持久化）、`theme.ts`（主题与主色）、`runner.ts`（执行与可运行判定）、`input/clipboard.ts`（剪贴板读写）、`input/image.ts`（图片源生命周期）、`media.ts`（图片解码缩放）。

## 开发

```bash
bun install
bun run dev
```

## 构建

```bash
bun run build
```

构建产物输出到 `dist/` 目录。
