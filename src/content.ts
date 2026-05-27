/// <reference path="./shared.ts" />

(() => {
  const STYLE_ID = "demo-tap-style";
  const CURSOR_ID = "demo-tap-cursor";

  let settings: DemoTap.Settings = DemoTap.DEFAULTS;
  let cursorEl: HTMLDivElement | null = null;

  function buildStyleSheet(s: DemoTap.Settings): string {
    const base = `
      .demo-tap-ripple {
        position: fixed;
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        width: ${s.size}px;
        height: ${s.size}px;
        will-change: transform, opacity;
      }
      .demo-tap-cursor {
        position: fixed;
        pointer-events: none;
        z-index: 2147483646;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        width: ${Math.max(s.size * 1.4, 28)}px;
        height: ${Math.max(s.size * 1.4, 28)}px;
        background: radial-gradient(circle, ${withAlpha(s.color, 0.35)} 0%, ${withAlpha(s.color, 0)} 70%);
        transition: transform 80ms ease-out, opacity 120ms ease-out;
        opacity: 0;
      }
    `;

    let variant = "";
    switch (s.style) {
      case "ring":
        variant = `
          .demo-tap-ripple {
            border: 3px solid ${s.color};
            background: transparent;
            animation: demoTapRing ${s.duration}ms cubic-bezier(.22,.61,.36,1) forwards;
          }
          @keyframes demoTapRing {
            0%   { transform: translate(-50%,-50%) scale(.4); opacity: 1; }
            100% { transform: translate(-50%,-50%) scale(3);  opacity: 0; }
          }
        `;
        break;
      case "solid":
        variant = `
          .demo-tap-ripple {
            background: ${s.color};
            box-shadow: 0 0 18px ${withAlpha(s.color, 0.55)};
            animation: demoTapSolid ${s.duration}ms cubic-bezier(.22,.61,.36,1) forwards;
          }
          @keyframes demoTapSolid {
            0%   { transform: translate(-50%,-50%) scale(.2); opacity: .9; }
            70%  { opacity: .6; }
            100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
          }
        `;
        break;
      case "pulse":
        variant = `
          .demo-tap-ripple {
            background: ${withAlpha(s.color, 0.35)};
            border: 2px solid ${s.color};
            animation: demoTapPulse ${s.duration}ms ease-out forwards;
          }
          @keyframes demoTapPulse {
            0%   { transform: translate(-50%,-50%) scale(.3); opacity: 1; }
            40%  { transform: translate(-50%,-50%) scale(1.6); opacity: .8; }
            100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
          }
        `;
        break;
    }

    return base + variant;
  }

  function withAlpha(color: string, alpha: number): string {
    const hex = color.trim();
    const m3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
    const m6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (m6) {
      const r = parseInt(m6[1], 16);
      const g = parseInt(m6[2], 16);
      const b = parseInt(m6[3], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (m3) {
      const r = parseInt(m3[1] + m3[1], 16);
      const g = parseInt(m3[2] + m3[2], 16);
      const b = parseInt(m3[3] + m3[3], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  function ensureStyle(): void {
    let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = STYLE_ID;
      document.documentElement.appendChild(tag);
    }
    tag.textContent = buildStyleSheet(settings);
  }

  function ensureCursor(): void {
    if (!settings.showCursor) {
      cursorEl?.remove();
      cursorEl = null;
      return;
    }
    if (!cursorEl) {
      cursorEl = document.createElement("div");
      cursorEl.id = CURSOR_ID;
      cursorEl.className = "demo-tap-cursor";
      document.documentElement.appendChild(cursorEl);
    }
  }

  function onClick(e: MouseEvent): void {
    if (!settings.enabled) return;
    const ripple = document.createElement("div");
    ripple.className = "demo-tap-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.documentElement.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), settings.duration + 50);
  }

  function onMove(e: MouseEvent): void {
    if (!settings.enabled || !settings.showCursor || !cursorEl) return;
    cursorEl.style.left = `${e.clientX}px`;
    cursorEl.style.top = `${e.clientY}px`;
    cursorEl.style.opacity = "1";
  }

  function onLeave(): void {
    if (cursorEl) cursorEl.style.opacity = "0";
  }

  function applySettings(next: DemoTap.Settings): void {
    settings = next;
    ensureStyle();
    ensureCursor();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const change = changes[DemoTap.STORAGE_KEY];
    if (!change) return;
    applySettings({ ...DemoTap.DEFAULTS, ...(change.newValue ?? {}) });
  });

  DemoTap.loadSettings().then(applySettings).catch(() => applySettings(DemoTap.DEFAULTS));

  document.addEventListener("click", onClick, true);
  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("mouseleave", onLeave, true);
})();
