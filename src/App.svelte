<script lang="ts">
  import { groups, type ToolDef } from "./lib/tools/compute";
  import type { ParamField } from "./lib/tools/index";
  import {
    groupFields,
    imageChannel,
    promoteToImage,
    resolveAction,
    resolveInput,
    visibleParams,
  } from "./lib/tools/field-view";
  import { loadSession, saveSession } from "./lib/session";
  import {
    DEFAULT_BACKGROUND,
    DEFAULT_PRIMARY,
    applyBackground,
    applyPrimary,
    contentColor,
    loadBackground,
    loadPrimary,
    loadTheme,
  } from "./lib/theme";
  import { canRun, runTool } from "./lib/runner";
  import { loadImageSource, type ImageSource } from "./lib/input/image";
  import { imageFilesFrom, writeToClipboard } from "./lib/input/clipboard";
  import { Sun, Moon, ArrowRightLeft, Copy, Play, X } from "lucide-svelte";
  import ColorPicker from "./lib/ColorPicker.svelte";

  const browser = typeof window !== "undefined";
  const allTools = groups.flatMap((g) => g.children);
  const saved = browser ? loadSession() : null;

  let activeTool = $state<ToolDef>(
    allTools.find((t) => t.id === saved?.tool) ?? allTools[0],
  );
  let input = $state(saved?.input ?? "");
  let output = $state("");
  let autoMode = $state(saved?.autoMode ?? true);
  let params = $state<Record<string, string>>({});
  let processing = $state(false);
  let openDropdown = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement>();
  let pasteSink = $state<HTMLTextAreaElement>();
  /** 图片输入不落 localStorage：object URL 无持久意义，位图体积也过大 */
  let imageSource = $state.raw<ImageSource | null>(null);

  const initialPrimary = browser ? loadPrimary() : DEFAULT_PRIMARY;
  if (browser) applyPrimary(initialPrimary);
  let theme = $state<"light" | "dark">(browser ? loadTheme() : "light");
  let primaryColor = $state(initialPrimary);
  let bgColor = $state<string | null>(browser ? loadBackground() : null);
  if (browser && bgColor) applyBackground(bgColor);
  /** 同一个色板在「主题色 / 背景色」之间切换，避免两个 picker 挤在一起 */
  let colorTarget = $state<"primary" | "background">("primary");

  let outputIsImage = $derived(output.startsWith("data:image"));
  let inputSpec = $derived(resolveInput(activeTool, params));
  let inputKind = $derived(inputSpec.kind ?? "text");
  let paramRows = $derived(groupFields(visibleParams(activeTool, params)));
  let actionLabel = $derived(
    resolveAction(activeTool, params) ??
      (inputKind === "none" ? "生成" : "转换"),
  );
  let pickerValue = $derived(
    colorTarget === "primary"
      ? primaryColor
      : (bgColor ?? DEFAULT_BACKGROUND[theme]),
);
  let runnable = $derived(
    canRun(activeTool, params, { text: input, image: imageSource?.image }),
  );

  function persist() {
    if (!browser) return;
    saveSession({ tool: activeTool.id, input, params, autoMode });
  }

  function initParams(from?: Record<string, string>): Record<string, string> {
    const p: Record<string, string> = {};
    for (const f of activeTool.params) p[f.key] = f.default ?? "";
    if (from) for (const k of Object.keys(p)) if (k in from) p[k] = from[k];
    params = p;
    return p;
  }
  initParams(saved?.params);

  function clearImage() {
    imageSource?.release();
    imageSource = null;
  }

  async function convert() {
    const ctx = { text: input, image: imageSource?.image };
    if (processing || !canRun(activeTool, params, ctx)) return;
    processing = true;
    output = await runTool(activeTool, params, {
      ...ctx,
      url: imageSource?.url,
    });
    processing = false;
  }

  function onInput() {
    persist();
    if (autoMode && input.trim()) convert();
    else if (!input.trim()) output = "";
  }

  function onParamChange(key: string, val: string) {
    params = { ...params, [key]: val };
    persist();
    // 图片通道无图时不触发；有图则按新参数重跑
    if (
      (resolveInput(activeTool, params).kind ?? "text") === "image" &&
      !imageSource
    ) {
      output = "";
      return;
    }
    if (autoMode && canRun(activeTool, params, { text: input, image: imageSource?.image }))
      convert();
  }

  function selectTool(t: ToolDef) {
    activeTool = t;
    openDropdown = null;
    clearImage();
    initParams();
    output = "";
    persist();
    if (autoMode && canRun(t, params, { text: input })) setTimeout(convert, 0);
  }

  async function acceptImage(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    clearImage();
    try {
      imageSource = await loadImageSource(file);
    } catch (e) {
      output = "出错了: " + (e as Error).message;
      return;
    }
    if (autoMode) convert();
    else output = "";
    pasteSink?.focus();
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = imageFilesFrom(e.dataTransfer)[0];
    if (file) acceptImage(file);
  }

  /** 按通道自身的 when 声明切换参数，让图片通道生效 */
  function focusImageChannel(tool: ToolDef): boolean {
    if (!imageChannel(tool)) return false;
    const next = promoteToImage(tool, params);
    if (next) {
      params = next;
      persist();
    }
    return true;
  }

  function onPaste(e: ClipboardEvent) {
    if (e.defaultPrevented) return;
    const file = imageFilesFrom(e.clipboardData)[0];
    if (!file) return;
    if (!focusImageChannel(activeTool)) return;
    e.preventDefault();
    acceptImage(file);
  }

  function pickFile() {
    fileInput?.click();
  }

  function onFileChange(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    acceptImage(el.files?.[0]);
    el.value = "";
  }

  function runFieldAction(f: ParamField) {
    if (!f.action) return;
    input = f.action.fill(params);
    persist();
    if (autoMode) setTimeout(convert, 0);
  }

  function setAutoMode(v: boolean) {
    autoMode = v;
    persist();
  }

  async function copyOutput() {
    await writeToClipboard(output);
  }

  function swap() {
    input = output;
    output = "";
    persist();
    if (autoMode) setTimeout(convert, 0);
  }

  function handleKeydown(e: KeyboardEvent) {
    // Firefox 只向可编辑元素派发 paste：按 Ctrl+V 前把焦点交给接收层
    if (e.ctrlKey && (e.key === "v" || e.key === "V") && inputKind === "image") {
      pasteSink?.focus();
    }
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      convert();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "I" && inputKind === "text") {
      e.preventDefault();
      swap();
    }
    if (e.key === "Escape") openDropdown = null;
  }

  function onColorPick(hex: string) {
    if (colorTarget === "primary") {
      primaryColor = hex;
      applyPrimary(hex);
    } else {
      bgColor = hex;
      applyBackground(hex);
    }
  }

  // 进入图片通道时把焦点交给接收层：Firefox 只把 paste 派发给可编辑元素
  $effect(() => {
    if (inputKind !== "image" || !browser) return;
    const id = requestAnimationFrame(() => pasteSink?.focus());
    return () => cancelAnimationFrame(id);
  });

  function activeInGroup(g: (typeof groups)[number]): boolean {
    return !!g.children.find((t: ToolDef) => t.id === activeTool.id);
  }
</script>

{#snippet control(f: ParamField, i: number, n: number)}
  {#if f.type === "toggle"}
    <div class="join w-full">
      {#each f.options ?? [] as opt}
        <button
          class="btn join-item flex-1 {(params[f.key] ?? f.default) === opt.value
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
      radius={n < 2 ? "all" : i === 0 ? "left" : i === n - 1 ? "right" : "middle"}
      wrapperClass={n > 1 && i > 0 ? "-ml-px" : ""}
      align={n > 1 && i > 0 ? "right" : "left"}
    />
  {/if}
{/snippet}

<svelte:window
  onkeydown={handleKeydown}
  onpaste={onPaste}
  onclick={() => {
    openDropdown = null;
  }}
/>

{#snippet themeIcon()}
  {@const ink = contentColor(pickerValue)}
  {#if theme === "light"}
    <Sun class="w-4 h-4" style="color: {ink}" />
  {:else}
    <Moon class="w-4 h-4" style="color: {ink}" />
  {/if}
{/snippet}

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
      <div class="flex justify-end shrink-0 w-9">
        <ColorPicker
          value={pickerValue}
          onchange={onColorPick}
          size="w-9 h-9"
          align="right"
          direction="down"
          trigger={themeIcon}
        >
          <div class="join w-full">
            <button
              class="btn btn-xs join-item flex-1 {colorTarget === 'primary'
                ? 'btn-primary'
                : 'btn-soft'}"
              onclick={() => (colorTarget = "primary")}>主题色</button
            >
            <button
              class="btn btn-xs join-item flex-1 {colorTarget === 'background'
                ? 'btn-primary'
                : 'btn-soft'}"
              onclick={() => (colorTarget = "background")}>背景色</button
            >
          </div>
        </ColorPicker>
      </div>
    </div>
  </header>

  <main class="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
    <div
      class="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-3 flex-1 min-h-0"
    >
      <div class="flex flex-col gap-1.5 min-h-0 flex-1">
        {#if inputKind === "none"}
          <div
            class="flex-1 flex items-center justify-center bg-base-100 border border-base-300 rounded-box min-h-32 text-center px-4 text-sm text-base-content/40"
          >
            {inputSpec.hint ?? "无需输入内容，点击「生成」即可获得随机结果"}
          </div>
        {:else if inputKind === "image"}
          <input
            bind:this={fileInput}
            type="file"
            class="hidden"
            accept={inputSpec.accept ?? "image/*"}
            onchange={onFileChange}
          />
          <div class="relative flex-1 min-h-32">
            {#if imageSource?.url}
              <img
                src={imageSource.url}
                alt="待处理图片"
                class="absolute inset-0 w-full h-full object-contain p-3 pointer-events-none"
              />
              <button
                class="btn btn-sm btn-circle btn-soft absolute top-2 right-2 z-10"
                aria-label="移除图片"
                onclick={(e) => {
                  e.stopPropagation();
                  clearImage();
                  output = "";
                }}
              >
                <X class="w-4 h-4" />
              </button>
            {/if}
            <textarea
              bind:this={pasteSink}
              class="textarea textarea-bordered w-full h-full absolute inset-0 bg-transparent resize-none text-transparent caret-transparent placeholder:text-base-content/40"
              spellcheck={false}
              aria-label={inputSpec.hint ?? "图片输入"}
              placeholder={imageSource
                ? ""
                : (inputSpec.hint ?? "粘贴、拖拽或点击选择图片")}
              onpaste={onPaste}
              oninput={(e) =>
                ((e.currentTarget as HTMLTextAreaElement).value = "")}
              ondragover={(e) => e.preventDefault()}
              ondrop={onDrop}
              onclick={pickFile}
            ></textarea>
          </div>
        {:else}
          <textarea
            class="textarea textarea-bordered font-mono resize-y w-full flex-1 min-h-32"
            placeholder={inputSpec.placeholder ?? "在此输入内容..."}
            bind:value={input}
            oninput={onInput}
          ></textarea>
        {/if}
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
          disabled={processing || !runnable}
        >
          <Play class="w-4 h-4 shrink-0" />
          {processing ? "处理中..." : actionLabel}
        </button>
        <button
          class="btn btn-soft w-full md:flex-none"
          onclick={swap}
          disabled={inputKind !== "text"}
        >
          <ArrowRightLeft class="w-4 h-4 shrink-0" /> 交换
        </button>
        <button class="btn btn-soft w-full md:flex-none" onclick={copyOutput}>
          <Copy class="w-4 h-4 shrink-0" /> 复制
        </button>

        {#if paramRows.length > 0}
          <hr class="border-base-300 my-1 w-full hidden md:block" />

          {#each paramRows as row}
            <div
              class="flex {row.length > 1 && row.every((x) => x.type === 'color')
                ? 'gap-0'
                : 'gap-2'} w-full items-stretch"
            >
              {#each row as f, i}
                <div
                  class="flex flex-col gap-1 {row.length > 1
                    ? 'flex-1 min-w-0'
                    : 'w-full'}"
                >
                  {#if f.action}
                    <button
                      class="btn btn-soft w-full"
                      onclick={() => runFieldAction(f)}
                    >
                      {f.action.label}
                    </button>
                  {/if}
                  {@render control(f, i, row.length)}
                </div>
              {/each}
            </div>
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
      Ctrl+Enter {actionLabel}{inputKind === "image"
        ? " · Ctrl+V 粘贴图片"
        : " · Ctrl+Shift+I 交换"}
    </div>
  </main>
</div>
