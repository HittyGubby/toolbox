<script lang="ts">
  import {
    groups,
    type ToolDef,
    type ToolSubgroup,
    isTool,
    isToolSubgroup,
  } from "./lib/tools/compute";
  import { Sun, Moon, ArrowRightLeft, Copy, Play } from "lucide-svelte";

  const browser = typeof window !== "undefined";
  const STORAGE_KEY = "toolbox-state";

  let activeTool = $state<ToolDef>(groups[0].children[0] as ToolDef);
  let input = $state("");
  let output = $state("");
  let autoMode = $state(true);
  let params = $state<Record<string, string>>({});
  let processing = $state(false);
  let openDropdown = $state<string | null>(null);

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
        .flatMap((g: (typeof groups)[number]) => g.children)
        .flatMap((c: ToolDef | ToolSubgroup) =>
          isToolSubgroup(c) ? c.children : [c as ToolDef],
        )
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

  function activeInGroup(g: (typeof groups)[number]): boolean {
    return !!g.children
      .flatMap((c: ToolDef | ToolSubgroup) =>
        isToolSubgroup(c) ? c.children : [c as ToolDef],
      )
      .find((t: ToolDef) => t.id === activeTool.id);
  }
</script>

<svelte:window
  onkeydown={handleKeydown}
  onclick={() => (openDropdown = null)}
/>

<div class="flex flex-col min-h-screen bg-base-200">
  <header class="bg-base-100 border-b border-base-300 sticky top-0 z-30 w-full">
    <div class="flex items-center justify-between px-4 py-3 w-full">
      <a
        href="#"
        class="font-bold w-20"
        onclick={(e) => {
          e.preventDefault();
          open("https://github.com/HittyGubby/toolbox");
        }}>Toolbox</a
      >
      <div class="flex items-center justify-center gap-2 flex-1">
        {#each groups as g}
          <div class="relative">
            <button
               class="btn btn-ghost rounded-none border-b-2 whitespace-nowrap {activeInGroup(g)
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
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-base-100 rounded-box shadow-lg border border-base-200 p-1 min-w-40 z-50"
                onclick={(e) => e.stopPropagation()}
              >
                {#each g.children as item}
                  {#if isTool(item)}
                    <button
                      class="btn btn-ghost w-full justify-start font-normal rounded"
                      class:btn-primary={activeTool.id === item.id}
                      onclick={() => selectTool(item)}
                    >
                      {item.name}
                    </button>
                  {:else if isToolSubgroup(item)}
                    <div
                      class="px-3 pt-1 pb-0.5 text-sm font-semibold text-base-content/50"
                    >
                      {item.name}
                    </div>
                    {#each item.children as sub}
                      <button
                        class="btn btn-ghost w-full justify-start font-normal rounded"
                        class:btn-primary={activeTool.id === sub.id}
                        onclick={() => selectTool(sub)}
                      >
                        {sub.name}
                      </button>
                    {/each}
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex justify-end w-20 shrink-0">
        <button
          class="btn btn-ghost btn-square"
          onclick={toggleTheme}
          aria-label="切换主题"
        >
          {#if theme === "light"}
            <Moon class="w-5 h-5" />
          {:else}
            <Sun class="w-5 h-5" />
          {/if}
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col p-3 gap-3">
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
        class="flex flex-row flex-wrap md:flex-col items-stretch md:justify-center gap-2 py-2 w-full md:w-60"
      >
        <div class="join flex-1 min-w-0 md:flex-none">
          <button
            class="btn join-item flex-1 {!autoMode
              ? 'btn-primary'
              : 'btn-soft'}"
            onclick={() => setAutoMode(false)}>手动</button
          >
          <button
            class="btn join-item flex-1 {autoMode ? 'btn-primary' : 'btn-soft'}"
            onclick={() => setAutoMode(true)}>自动</button
          >
        </div>
        <button
          class="btn btn-primary flex-1 min-w-0 md:flex-none"
          onclick={convert}
          disabled={processing}
        >
          <Play class="w-4 h-4 shrink-0" />
          {processing ? "处理中..." : "转换"}
        </button>
        <button class="btn btn-soft flex-1 min-w-0 md:flex-none" onclick={swap}>
          <ArrowRightLeft class="w-4 h-4 shrink-0" /> 交换
        </button>
        {#if output}
          <button
            class="btn btn-soft flex-1 min-w-0 md:flex-none"
            onclick={() => navigator.clipboard.writeText(output)}
          >
            <Copy class="w-4 h-4 shrink-0" /> 复制
          </button>
        {/if}

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
              <input
                type="color"
                class="input input-bordered w-full p-0.5"
                value={params[f.key] ?? f.default}
                oninput={(e) =>
                  onParamChange(f.key, (e.target as HTMLInputElement).value)}
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

    <div class="text-sm text-base-content/30 text-center">
      Ctrl+Enter 转换 · Ctrl+Shift+I 交换
    </div>
  </main>
</div>
