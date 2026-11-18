export type ThemeName = "light" | "dark";

const THEME_KEY = "toolbox-theme";
const PRIMARY_KEY = "toolbox-primary";
const BACKGROUND_KEY = "toolbox-background";
export const DEFAULT_PRIMARY = "#3b82f6";

/** 未自定义背景时，picker 展示的兜底色 */
export const DEFAULT_BACKGROUND: Record<ThemeName, string> = {
  light: "#f2f2f2ff",
  dark: "#1d1d1dff",
};

/** 相对亮度（0-255），用于决定色块上的文字颜色 */
export function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contentColor(hex: string): "#000000" | "#ffffff" {
  return luminance(hex) > 128 ? "#000000" : "#ffffff";
}

export function loadTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(name: ThemeName): void {
  document.documentElement.setAttribute("data-theme", name);
  try {
    localStorage.setItem(THEME_KEY, name);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(name: ThemeName): ThemeName {
  const next = name === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}

export function loadPrimary(): string {
  try {
    const saved = localStorage.getItem(PRIMARY_KEY);
    if (saved && /^#[0-9a-f]{6,8}$/i.test(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_PRIMARY;
}

/** 把主色写入 CSS 变量并持久化 */
export function applyPrimary(hex: string): void {
  document.documentElement.style.setProperty("--color-primary", hex);
  document.documentElement.style.setProperty(
    "--color-primary-content",
    contentColor(hex),
  );
  try {
    localStorage.setItem(PRIMARY_KEY, hex);
  } catch {
    /* ignore */
  }
}

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const f = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return "#" + f(r) + f(g) + f(b);
}

/** 线性 RGB 插值，t=0 取 a，t=1 取 b */
function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return toHex(lerp(r1, r2), lerp(g1, g2), lerp(b1, b2));
}

/** daisyUI 的 base 色阶由这四个变量构成，改背景就要整组重算 */
const BASE_VARS = [
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--color-base-content",
];

/**
 * 用一个背景色派生整套 daisyUI base 色阶：
 * base-200 为原色，base-100 为面板色（顶栏、输入框），base-300 为边框色，
 * base-content 按亮度取黑/白，保证文字可读。
 * hex 为 null 时移除覆盖，回到主题自带配色。
 */
export function applyBackground(hex: string | null): void {
  const root = document.documentElement;
  if (!hex) {
    for (const k of BASE_VARS) root.style.removeProperty(k);
    try {
      localStorage.removeItem(BACKGROUND_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  const [r, g, b] = parseHex(hex);
  const dark = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;

  root.style.setProperty("--color-base-200", hex);
  root.style.setProperty(
    "--color-base-100",
    dark ? mixHex(hex, "#ffffff", 0.07) : mixHex(hex, "#ffffff", 0.55),
  );
  root.style.setProperty(
    "--color-base-300",
    dark ? mixHex(hex, "#ffffff", 0.15) : mixHex(hex, "#000000", 0.07),
  );
  root.style.setProperty("--color-base-content", dark ? "#f2f2f2" : "#111111");

  try {
    localStorage.setItem(BACKGROUND_KEY, hex);
  } catch {
    /* ignore */
  }
}

export function loadBackground(): string | null {
  try {
    const saved = localStorage.getItem(BACKGROUND_KEY);
    if (saved && /^#[0-9a-f]{8}$/i.test(saved)) return saved;
    if (saved && /^#[0-9a-f]{6}$/i.test(saved)) return saved;
  } catch {
    /* ignore */
  }
  return null;
}
