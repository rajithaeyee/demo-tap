namespace DemoTap {
  export type RippleStyle = "ring" | "solid" | "pulse";

  export interface Settings {
    enabled: boolean;
    color: string;
    size: number;
    duration: number;
    style: RippleStyle;
    showCursor: boolean;
  }

  export const DEFAULTS: Settings = {
    enabled: true,
    color: "#ff3b30",
    size: 18,
    duration: 600,
    style: "ring",
    showCursor: false,
  };

  export const STORAGE_KEY = "demoTapSettings";

  export const PRESETS: ReadonlyArray<{ name: string; color: string }> = [
    { name: "Signal Red",   color: "#ff3b30" },
    { name: "Sunset",       color: "#ff9500" },
    { name: "Lemon",        color: "#ffcc00" },
    { name: "Mint",         color: "#34c759" },
    { name: "Sky",          color: "#0a84ff" },
    { name: "Indigo",       color: "#5e5ce6" },
    { name: "Magenta",      color: "#ff2d92" },
    { name: "Graphite",     color: "#1c1c1e" },
  ];

  export async function loadSettings(): Promise<Settings> {
    const stored = await chrome.storage.sync.get(STORAGE_KEY);
    const raw = (stored?.[STORAGE_KEY] ?? {}) as Partial<Settings>;
    return { ...DEFAULTS, ...raw };
  }

  export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
    const current = await loadSettings();
    const next: Settings = { ...current, ...patch };
    await chrome.storage.sync.set({ [STORAGE_KEY]: next });
    return next;
  }
}
