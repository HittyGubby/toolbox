<script lang="ts">
  import { groups, type ToolDef } from "./lib/tools/compute";
  import { Sun, Moon, ArrowRightLeft, Copy, Play } from "lucide-svelte";
  import ColorPicker from "./lib/ColorPicker.svelte";

  const browser = typeof window !== "undefined";
  const STORAGE_KEY = "toolbox-state";

  let activeTool = $state<ToolDef>(groups[0].children[0] as ToolDef);
  let input = $state("");
  let output = $state("");
  let autoMode = $state(true);
  let params = $state<Record<string, string>>({});
  let processing = $state(false);
  let openDropdown = $state<string | null>(null);
  let themePopupOpen = $state(false);

  let outputIsImage = $derived(output.startsWith("data:image"));

  function saveState() {
    if (!browser) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tool: activeTool.id,
        input,
        params,
        autoMode,
      }),
    );
  }

  function initParams(saved?: Record<string, string>) {
    const p: Record<string, string> = {};
    for (const f of activeTool.params) p[f.key] = f.default ?? "";
    if (saved) for (const k of Object.keys(p)) if (k in saved) p[k] = saved[k];
    params = p;
  }

  function selectTool(t: ToolDef) {
    activeTool = t;
    openDropdown = null;
    initParams();
    output = "";
    saveState();
    if (autoMode && input.trim()) setTimeout(convert, 0);
  }

  // Restore state on mount
  if (browser) {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      } catch {
        return null;
      }
    })();
    if (saved) {
      const found = groups
        .flatMap((g) => g.children)
        .find((t: ToolDef) => t.id === saved.tool);
      if (found) {
        activeTool = found;
        if (saved.autoMode !== undefined) autoMode = saved.autoMode;
        initParams(saved.params || {});
        if (saved.input) input = saved.input;
        if (saved.autoMode !== false && saved.input) setTimeout(convert, 0);
      }
    }
  }

  async function convert() {
    if (!input.trim() || processing) return;
    processing = true;
    try {
      const r = activeTool.compute(input, params);
      output =
        r && typeof r === "object" && "then" in r
          ? await (r as Promise<string>)
          : (r as string);
    } catch (e) {
      output = "出错了: " + (e as Error).message;
    }
    processing = false;
  }

  function onInput() {
    saveState();
    if (autoMode && input.trim()) convert();
    else if (!input.trim()) output = "";
  }

  function onParamChange(key: string, val: string) {
    params = { ...params, [key]: val };
    saveState();
    if (autoMode && input.trim()) convert();
  }

  function fillNow() {
    const dir = params.dir || "ts2date";
    if (dir === "date2ts") {
      const d = new Date();
      input = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    } else {
      const mul = params.unit === "ms" ? 1 : 1000;
      input = String(Math.floor(Date.now() / mul));
    }
    saveState();
    if (autoMode) setTimeout(convert, 0);
  }

  function setAutoMode(v: boolean) {
    autoMode = v;
    saveState();
  }

  async function copyOutput() {
    if (outputIsImage) {
      const resp = await fetch(output);
      const blob = await resp.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } else {
      await navigator.clipboard.writeText(output);
    }
  }

  function swap() {
    input = output;
    output = "";
    saveState();
    if (autoMode) setTimeout(convert, 0);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      convert();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      swap();
    }
    if (e.key === "Escape") openDropdown = null;
  }

  let theme = $state("light");
  if (browser)
    theme = document.documentElement.getAttribute("data-theme") || "light";
  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    if (browser) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("toolbox-theme", theme);
    }
  }

  function applyThemeColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    document.documentElement.style.setProperty("--color-primary", hex);
    document.documentElement.style.setProperty(
      "--color-primary-content",
      lum > 128 ? "#000000" : "#ffffff",
    );
  }

  const DEFAULT_PRIMARY = "#3b82f6";
  let primaryColor = $state(DEFAULT_PRIMARY);
  if (browser) {
    const saved = localStorage.getItem("toolbox-primary");
    if (saved) primaryColor = saved;
    applyThemeColor(primaryColor);
  }
  let primaryColorLum = $derived(
    (() => {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    })(),
  );

  function activeInGroup(g: (typeof groups)[number]): boolean {
    return !!g.children.find((t: ToolDef) => t.id === activeTool.id);
  }
</script>

<svelte:window
  onkeydown={handleKeydown}
  onclick={() => {
    openDropdown = null;
    themePopupOpen = false;
  }}
/>

<div class="flex flex-col h-dvh overflow-hidden bg-base-200">
  <header class="bg-base-100 border-b border-base-300 sticky top-0 z-30 w-full">
    <div class="flex items-center justify-between px-4 py-3 w-full">
      <div class="flex items-center justify-start gap-1 flex-1">
        {#each groups as g}
          <div class="relative">
            <button
              class="btn btn-ghost rounded-none border-b-2 whitespace-nowrap px-2 {activeInGroup(
                g,
              )
                ? 'border-primary text-primary'
                : 'border-transparent'}"
              onclick={(e) => {
                e.stopPropagation();
                openDropdown = openDropdown === g.id ? null : g.id;
              }}
            >
              {g.name}
            </button>
            {#if openDropdown === g.id}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="absolute top-full left-0 mt-1 bg-base-100 rounded-box shadow-lg border border-base-200 p-1 min-w-40 z-50"
                onclick={(e) => e.stopPropagation()}
              >
                {#each g.children as item}
                  <button
                    class="btn btn-ghost w-full justify-start font-normal rounded"
                    class:btn-primary={activeTool.id === item.id}
                    onclick={() => selectTool(item)}
                  >
                    {item.name}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex justify-end shrink-0">
        <div class="relative">
          <button
            class="btn btn-square border-0"
            style="background: {primaryColor}; color: {primaryColorLum > 128
              ? '#000'
              : '#fff'}"
            onclick={(e) => {
              e.stopPropagation();
              themePopupOpen = !themePopupOpen;
            }}
            aria-label="主题设置"
          >
            {#if theme === "light"}
              <Sun class="w-5 h-5" />
            {:else}
              <Moon class="w-5 h-5" />
            {/if}
          </button>
          {#if themePopupOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="absolute top-full right-0 mt-1 bg-base-100 rounded-box shadow-lg border border-base-200 p-3 z-50 min-w-44"
              onclick={(e) => e.stopPropagation()}
            >
              <div class="flex gap-1 mb-3">
                <button
                  class="btn btn-sm flex-1 {theme === 'light'
                    ? 'btn-primary'
                    : 'btn-soft'}"
                  onclick={() => {
                    toggleTheme();
                  }}><Sun class="w-4 h-4" /></button
                >
                <button
                  class="btn btn-sm flex-1 {theme === 'dark'
                    ? 'btn-primary'
                    : 'btn-soft'}"
                  onclick={() => {
                    toggleTheme();
                  }}><Moon class="w-4 h-4" /></button
                >
              </div>
              <ColorPicker
                value={primaryColor}
                onchange={(hex) => {
                  primaryColor = hex;
                  applyThemeColor(hex);
                  localStorage.setItem("toolbox-primary", hex);
                }}
                size="w-full h-10"
                align="right"
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
    <div
      class="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-3 flex-1 min-h-0"
    >
      <div class="flex flex-col gap-1.5 min-h-0 flex-1">
        <textarea
          class="textarea textarea-bordered font-mono resize-y w-full flex-1 min-h-32"
          placeholder="在此输入内容..."
          bind:value={input}
          oninput={onInput}></textarea>
      </div>

      <div
        class="grid grid-cols-2 md:flex md:flex-col items-stretch md:justify-center gap-2 py-2 w-full md:w-60 [&:has(>:nth-child(5))>:last-child:nth-child(even)]:col-span-2"
      >
        <div class="join w-full md:flex-none">
          <button
            class="btn join-item flex-1 whitespace-nowrap {!autoMode
              ? 'btn-primary'
              : 'btn-soft'}"
            onclick={() => setAutoMode(false)}>手动</button
          >
          <button
            class="btn join-item flex-1 whitespace-nowrap {autoMode
              ? 'btn-primary'
              : 'btn-soft'}"
            onclick={() => setAutoMode(true)}>自动</button
          >
        </div>
        <button
          class="btn btn-primary w-full md:flex-none"
          onclick={convert}
          disabled={processing}
        >
          <Play class="w-4 h-4 shrink-0" />
          {processing ? "处理中..." : "转换"}
        </button>
        <button class="btn btn-soft w-full md:flex-none" onclick={swap}>
          <ArrowRightLeft class="w-4 h-4 shrink-0" /> 交换
        </button>
        <button class="btn btn-soft w-full md:flex-none" onclick={copyOutput}>
          <Copy class="w-4 h-4 shrink-0" /> 复制
        </button>

        {#if activeTool.params.length > 0}
          <hr class="border-base-300 my-1 w-full hidden md:block" />

          {#each activeTool.params as f}
            {#if activeTool.id === "timestamp" && f.key === "unit"}
              <button
                class="btn btn-soft flex-1 min-w-0 md:flex-none"
                onclick={fillNow}
              >
                实时时间
              </button>
            {/if}
            {#if f.type === "toggle"}
              <div class="join w-full">
                {#each f.options as opt}
                  <button
                    class="btn join-item flex-1 {(params[f.key] ??
                      f.default) === opt.value
                      ? 'btn-primary'
                      : 'btn-soft'}"
                    onclick={() => onParamChange(f.key, opt.value)}
                  >
                    {opt.label}
                  </button>
                {/each}
              </div>
            {:else if f.type === "select"}
              <select
                class="select select-bordered w-full"
                value={params[f.key] ?? f.default}
                onchange={(e) =>
                  onParamChange(f.key, (e.target as HTMLSelectElement).value)}
              >
                {#each f.options || [] as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            {:else if f.type === "text"}
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder={f.placeholder}
                value={params[f.key] ?? ""}
                oninput={(e) =>
                  onParamChange(f.key, (e.target as HTMLInputElement).value)}
              />
            {:else if f.type === "color"}
              {@const colorVal = params[f.key] ?? f.default}
              <ColorPicker
                value={colorVal}
                onchange={(hex) => onParamChange(f.key, hex)}
                size="w-full h-10"
                direction="up"
              />
            {/if}
          {/each}
        {/if}
      </div>

      <div class="flex flex-col gap-1.5 min-h-0 flex-1">
        {#if outputIsImage}
          <div
            class="flex-1 flex items-center justify-center bg-base-100 border border-base-300 rounded-box min-h-32"
          >
            <img src={output} alt="二维码" class="max-w-full max-h-64" />
          </div>
        {:else}
          <textarea
            class="textarea textarea-bordered font-mono resize-y w-full flex-1 min-h-32"
            readonly
            placeholder="结果会显示在这里..."
            value={output}></textarea>
        {/if}
      </div>
    </div>

    <div class="text-sm text-base-content/30 text-center hidden md:block">
      Ctrl+Enter 转换 · Ctrl+Shift+I 交换
    </div>
  </main>
</div>
