/** 会话持久化：工具、输入、参数、自动模式 */
export interface Session {
  tool: string;
  input: string;
  params: Record<string, string>;
  autoMode: boolean;
}

const KEY = "toolbox-state";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object" || typeof s.tool !== "string") return null;
    return {
      tool: s.tool,
      input: typeof s.input === "string" ? s.input : "",
      params: s.params && typeof s.params === "object" ? s.params : {},
      autoMode: s.autoMode !== false,
    };
  } catch {
    return null;
  }
}

export function saveSession(s: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 隐私模式或配额满时静默放弃 */
  }
}
