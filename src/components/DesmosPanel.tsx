import { useEffect, useRef, useState } from "react";
import { Calculator, X, Minimize2, Maximize2 } from "lucide-react";

// Lazy-loaded Desmos Graphing Calculator. Loads the official Desmos API
// script on first open so unused visits never pay the cost.

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (elt: HTMLElement, opts?: Record<string, unknown>) => DesmosCalc;
    };
  }
}

interface DesmosCalc {
  destroy(): void;
  resize(): void;
}

// Free public API key — Desmos allows this for personal/educational embeds.
const DESMOS_SCRIPT = "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

let scriptPromise: Promise<boolean> | null = null;
function loadDesmosScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Desmos?.GraphingCalculator) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-desmos="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(!!window.Desmos), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = DESMOS_SCRIPT;
    s.async = true;
    s.dataset.desmos = "true";
    s.onload = () => resolve(!!window.Desmos);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DesmosPanel({ open, onClose }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const calcRef = useRef<DesmosCalc | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [maximized, setMaximized] = useState(false);

  // Initialise the calculator when the panel opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus("loading");
    loadDesmosScript().then((ok) => {
      if (cancelled) return;
      if (!ok || !window.Desmos) {
        setStatus("failed");
        return;
      }
      if (!mountRef.current) return;
      // Destroy a prior instance if reopening.
      calcRef.current?.destroy();
      calcRef.current = window.Desmos.GraphingCalculator(mountRef.current, {
        keypad: true,
        graphpaper: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        border: false,
        lockViewport: false,
      });
      setStatus("ready");
    });
    return () => { cancelled = true; };
  }, [open]);

  // Tear down the calculator when the panel closes.
  useEffect(() => {
    if (open) return;
    calcRef.current?.destroy();
    calcRef.current = null;
  }, [open]);

  // Resize when maximize toggles.
  useEffect(() => {
    if (status === "ready") {
      // Give CSS a tick to apply, then ask Desmos to redraw.
      const id = setTimeout(() => calcRef.current?.resize(), 60);
      return () => clearTimeout(id);
    }
  }, [maximized, status]);

  if (!open) return null;

  const sizeClass = maximized
    ? "inset-3 w-auto h-auto"
    : "bottom-20 right-5 w-[min(96vw,720px)] h-[min(80vh,560px)]";

  return (
    <div
      className={`fixed z-40 card flex flex-col p-0 overflow-hidden shadow-card ${sizeClass} animate-[fadeIn_0.15s_ease-out]`}
      role="dialog"
      aria-label="Desmos graphing calculator"
    >
      <header className="px-3 py-2 border-b border-[color:var(--line)] flex items-center gap-2">
        <Calculator size={14} className="text-[color:var(--accent)]" />
        <h2 className="font-display text-sm">Desmos graphing calculator</h2>
        <span className="ml-2 text-[10px] text-[color:var(--ink-soft)] font-mono">
          {status === "loading" && "loading…"}
          {status === "failed" && "failed to load — check your network"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMaximized((v) => !v)}
            className="btn btn-ghost p-1.5"
            aria-label={maximized ? "Restore size" : "Maximize"}
            title={maximized ? "Restore" : "Maximize"}
          >
            {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost p-1.5"
            aria-label="Close calculator"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </header>
      <div className="relative flex-1 min-h-0">
        {status === "failed" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Desmos didn't load. You can still use the built-in grapher.
            </p>
            <a href="#/graph" onClick={onClose} className="btn btn-primary">Open built-in grapher</a>
          </div>
        ) : (
          <div ref={mountRef} className="absolute inset-0" />
        )}
      </div>
    </div>
  );
}
