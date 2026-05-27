/// <reference path="./shared.ts" />

(() => {
  const $ = <T extends HTMLElement>(id: string): T => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el as T;
  };

  const enabledEl   = $<HTMLInputElement>("enabled");
  const colorEl     = $<HTMLInputElement>("color");
  const colorHexEl  = $<HTMLElement>("colorHex");
  const swatchesEl  = $<HTMLElement>("swatches");
  const sizeEl      = $<HTMLInputElement>("size");
  const sizeValueEl = $<HTMLElement>("sizeValue");
  const durationEl  = $<HTMLInputElement>("duration");
  const durationValueEl = $<HTMLElement>("durationValue");
  const showCursorEl = $<HTMLInputElement>("showCursor");
  const styleGroupEl = $<HTMLElement>("styleGroup");
  const resetEl     = $<HTMLButtonElement>("reset");
  const previewEl   = $<HTMLElement>("preview");
  const brandDotEl  = $<HTMLElement>("brandDot");

  let settings: DemoTap.Settings = DemoTap.DEFAULTS;

  function render(): void {
    enabledEl.checked = settings.enabled;
    colorEl.value = normalizeHex(settings.color);
    colorHexEl.textContent = colorEl.value.toUpperCase();
    sizeEl.value = String(settings.size);
    sizeValueEl.textContent = `${settings.size}px`;
    durationEl.value = String(settings.duration);
    durationValueEl.textContent = `${settings.duration}ms`;
    showCursorEl.checked = settings.showCursor;
    brandDotEl.style.background = settings.color;
    brandDotEl.style.boxShadow = `0 0 12px ${settings.color}`;

    for (const btn of styleGroupEl.querySelectorAll<HTMLButtonElement>("button")) {
      btn.classList.toggle("active", btn.dataset.value === settings.style);
    }

    for (const sw of swatchesEl.querySelectorAll<HTMLButtonElement>(".swatch")) {
      sw.classList.toggle("active", (sw.dataset.color ?? "").toLowerCase() === settings.color.toLowerCase());
    }
  }

  function normalizeHex(input: string): string {
    const m3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(input);
    if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`.toLowerCase();
    if (/^#[0-9a-f]{6}$/i.test(input)) return input.toLowerCase();
    return "#ff3b30";
  }

  async function update(patch: Partial<DemoTap.Settings>): Promise<void> {
    settings = await DemoTap.saveSettings(patch);
    render();
  }

  function buildSwatches(): void {
    swatchesEl.innerHTML = "";
    for (const preset of DemoTap.PRESETS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.dataset.color = preset.color;
      btn.title = preset.name;
      btn.style.background = preset.color;
      btn.addEventListener("click", () => update({ color: preset.color }));
      swatchesEl.appendChild(btn);
    }
  }

  function bindEvents(): void {
    enabledEl.addEventListener("change", () => update({ enabled: enabledEl.checked }));
    colorEl.addEventListener("input", () => update({ color: colorEl.value }));
    sizeEl.addEventListener("input", () => update({ size: Number(sizeEl.value) }));
    durationEl.addEventListener("input", () => update({ duration: Number(durationEl.value) }));
    showCursorEl.addEventListener("change", () => update({ showCursor: showCursorEl.checked }));

    styleGroupEl.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("button[data-value]") as HTMLButtonElement | null;
      if (!btn) return;
      const value = btn.dataset.value as DemoTap.RippleStyle | undefined;
      if (value) update({ style: value });
    });

    resetEl.addEventListener("click", () => update(DemoTap.DEFAULTS));

    previewEl.addEventListener("click", (e) => {
      const rect = previewEl.getBoundingClientRect();
      showPreviewRipple(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  function showPreviewRipple(x: number, y: number): void {
    const ripple = document.createElement("div");
    Object.assign(ripple.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${settings.size}px`,
      height: `${settings.size}px`,
      borderRadius: "50%",
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
    } as Partial<CSSStyleDeclaration>);

    if (settings.style === "ring") {
      ripple.style.border = `3px solid ${settings.color}`;
      ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(.4)", opacity: 1 },
          { transform: "translate(-50%, -50%) scale(3)",  opacity: 0 },
        ],
        { duration: settings.duration, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" },
      );
    } else if (settings.style === "solid") {
      ripple.style.background = settings.color;
      ripple.style.boxShadow = `0 0 18px ${settings.color}88`;
      ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(.2)",  opacity: .9 },
          { transform: "translate(-50%, -50%) scale(2.4)", opacity: 0 },
        ],
        { duration: settings.duration, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" },
      );
    } else {
      ripple.style.background = `${settings.color}59`;
      ripple.style.border = `2px solid ${settings.color}`;
      ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(.3)",  opacity: 1 },
          { transform: "translate(-50%, -50%) scale(1.6)", opacity: .8, offset: .4 },
          { transform: "translate(-50%, -50%) scale(3.2)", opacity: 0 },
        ],
        { duration: settings.duration, easing: "ease-out", fill: "forwards" },
      );
    }

    previewEl.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), settings.duration + 50);
  }

  async function init(): Promise<void> {
    settings = await DemoTap.loadSettings();
    buildSwatches();
    bindEvents();
    render();
  }

  init();
})();
