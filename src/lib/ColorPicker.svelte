<script lang="ts">
  interface Props {
    value: string;
    onchange?: (hex: string) => void;
    class?: string;
    size?: string;
    direction?: "down" | "up";
    align?: "left" | "right";
  }

  let {
    value,
    onchange,
    class: className = "",
    size = "w-9 h-9",
    direction = "down",
    align = "left",
  }: Props = $props();

  let open = $state(false);
  let containerEl = $state<HTMLDivElement>();
  let svCanvas = $state<HTMLCanvasElement>();
  let hueCanvas = $state<HTMLCanvasElement>();
  let alphaCanvas = $state<HTMLCanvasElement>();
  let hexInput = $state<HTMLInputElement>();
  let dragging = $state<"sv" | "hue" | "alpha" | null>(null);

  let hue = $state(0);
  let sat = $state(100);
  let bri = $state(100);
  let alpha = $state(100);
  let hexText = $state("");

  let popTop = $state("0px");
  let popLeft = $state("0px");
  let popRight = $state("");
  let popW = $state(200);

  let sliderW = $derived(popW - 24);
  let svH = $derived(Math.round(sliderW * 0.75));

  function hexToHsva(hex: string): [number, number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) h = ((b - r) / d + 2) * 60;
      else h = ((r - g) / d + 4) * 60;
    }
    return [h, s * 100, v * 100, a * 100];
  }

  function hsvaToHex(h: number, s: number, v: number, a: number): string {
    s /= 100;
    v /= 100;
    a /= 100;
    const hh = h / 60;
    const i = Math.floor(hh);
    const f = hh - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r: number, g: number, b: number;
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        r = 0;
        g = 0;
        b = 0;
    }
    const toHex = (n: number) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
  }

  let currentHex = $derived(hsvaToHex(hue, sat, bri, alpha));
  let rgbHex = $derived(currentHex.slice(0, 7));

  function syncFromValue(hex: string) {
    const [h, s, v, a] = hexToHsva(hex);
    hue = h;
    sat = s;
    bri = v;
    alpha = a;
    hexText = hex;
  }

  $effect(() => {
    if (!open) syncFromValue(value);
  });

  let checker: CanvasPattern | null = null;

  function getChecker(ctx: CanvasRenderingContext2D): CanvasPattern {
    if (checker) return checker;
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    const cc = c.getContext("2d")!;
    cc.fillStyle = "#ccc";
    cc.fillRect(0, 0, 4, 4);
    cc.fillRect(4, 4, 4, 4);
    cc.fillStyle = "#fff";
    cc.fillRect(4, 0, 4, 4);
    cc.fillRect(0, 4, 4, 4);
    checker = cc.createPattern(c, "repeat")!;
    return checker;
  }

  function drawSV() {
    const canvas = svCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = sliderW;
    const h = svH;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);
    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, h);
    const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, "rgba(0,0,0,0)");
    blackGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, h);
    const cx = (sat / 100) * w;
    const cy = ((100 - bri) / 100) * h;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = bri > 50 ? "#000" : "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = rgbHex;
    ctx.fill();
  }

  function drawHue() {
    const canvas = hueCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = sliderW;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 360; i += 30)
      grad.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    ctx.fillStyle = grad;
    const h = 16;
    ctx.fillRect(0, 0, w, h);
    const cx = (hue / 360) * w;
    ctx.beginPath();
    ctx.arc(cx, h / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fill();
  }

  function drawAlpha() {
    const canvas = alphaCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = sliderW;
    const h = 16;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getChecker(ctx);
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `${rgbHex}00`);
    grad.addColorStop(1, rgbHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const cx = (alpha / 100) * w;
    ctx.beginPath();
    ctx.arc(cx, h / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = alpha > 50 ? "#000" : "#fff";
    ctx.fill();
  }

  $effect(() => {
    drawSV();
  });

  $effect(() => {
    drawHue();
  });

  $effect(() => {
    drawAlpha();
  });

  function emit() {
    hexText = currentHex;
    onchange?.(currentHex);
  }

  function svFromPointer(e: PointerEvent) {
    const rect = svCanvas!.getBoundingClientRect();
    sat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100;
    bri =
      (1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))) *
      100;
    emit();
  }

  function hueFromPointer(e: PointerEvent) {
    const rect = hueCanvas!.getBoundingClientRect();
    hue = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 360;
    emit();
  }

  function alphaFromPointer(e: PointerEvent) {
    const rect = alphaCanvas!.getBoundingClientRect();
    alpha =
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100;
    emit();
  }

  function onHexInput(e: Event) {
    hexText = (e.target as HTMLInputElement).value;
  }

  function applyHex() {
    let h = hexText.trim();
    if (!h.startsWith("#")) h = "#" + h;
    if (/^#[0-9a-fA-F]{6}$/.test(h)) h += "ff";
    if (/^#[0-9a-fA-F]{8}$/.test(h)) {
      const [hh, s, v, a] = hexToHsva(h);
      hue = hh;
      sat = s;
      bri = v;
      alpha = a;
      hexText = h;
      onchange?.(h);
    } else {
      hexText = currentHex;
    }
  }

  function toggle(e: Event) {
    e.stopPropagation();
    open = !open;
  }

  function close() {
    open = false;
  }

  function calcPosition() {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    popW = rect.width;
    if (align === "right") {
      popRight = `${window.innerWidth - rect.right}px`;
    } else {
      popLeft = `${rect.left}px`;
    }
    if (direction === "up") {
      popTop = `${rect.top - svH - 64 - 32}px`;
    } else {
      popTop = `${rect.bottom + 4}px`;
    }
  }

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => calcPosition());
      const handler = () => calcPosition();
      window.addEventListener("resize", handler);
      window.addEventListener("scroll", handler, true);
      return () => {
        window.removeEventListener("resize", handler);
        window.removeEventListener("scroll", handler, true);
      };
    }
  });
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape" && open) close();
  }}
/>

<div class="relative w-full" bind:this={containerEl}>
  <button
    class="rounded border border-base-300 cursor-pointer {size} {className}"
    style="background: {value}"
    onclick={toggle}
    aria-label="选择颜色"
  ></button>

  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-[995]"
      role="presentation"
      onclick={close}
    ></div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed z-[996] bg-base-100 rounded-box shadow-lg border border-base-200 p-3 flex flex-col gap-2"
      style="top: {popTop}; width: {popW}px; {align === 'right'
        ? `right: ${popRight}`
        : `left: ${popLeft}`};"
      onclick={(e: MouseEvent) => e.stopPropagation()}
    >
      <canvas
        bind:this={svCanvas}
        width={sliderW}
        height={svH}
        class="rounded cursor-crosshair touch-none"
        onpointerdown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          dragging = "sv";
          svFromPointer(e);
        }}
        onpointermove={(e) => {
          if (dragging === "sv") svFromPointer(e);
        }}
        onpointerup={() => (dragging = null)}
      ></canvas>
      <canvas
        bind:this={hueCanvas}
        width={sliderW}
        height={16}
        class="rounded cursor-pointer touch-none"
        onpointerdown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          dragging = "hue";
          hueFromPointer(e);
        }}
        onpointermove={(e) => {
          if (dragging === "hue") hueFromPointer(e);
        }}
        onpointerup={() => (dragging = null)}
      ></canvas>
      <canvas
        bind:this={alphaCanvas}
        width={sliderW}
        height={16}
        class="rounded cursor-pointer touch-none"
        onpointerdown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          dragging = "alpha";
          alphaFromPointer(e);
        }}
        onpointermove={(e) => {
          if (dragging === "alpha") alphaFromPointer(e);
        }}
        onpointerup={() => (dragging = null)}
      ></canvas>
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded border border-base-300 shrink-0"
          style="background: {currentHex}"
        ></div>
        <input
          bind:this={hexInput}
          type="text"
          class="input input-bordered input-xs flex-1 font-mono text-xs min-w-0"
          value={hexText}
          oninput={onHexInput}
          onblur={applyHex}
          onkeydown={(e) => {
            if (e.key === "Enter") applyHex();
          }}
          spellcheck={false}
          maxlength={9}
        />
      </div>
    </div>
  {/if}
</div>
