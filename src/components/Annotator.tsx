import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Pen, X, Trash2, Undo2 } from "lucide-react";

// Full-viewport drawing overlay. When active, captures pointer events so the
// user can mark up the page like a whiteboard. When inactive, the overlay is
// invisible and pointer-events pass through.

interface Props {
  active: boolean;
  onClose: () => void;
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  erase: boolean;
}

const COLORS = [
  { id: "ink", value: "#15131a", label: "Ink" },
  { id: "red", value: "#dc2626", label: "Red" },
  { id: "amber", value: "#c2701b", label: "Amber" },
  { id: "teal", value: "#0e7c7b", label: "Teal" },
  { id: "violet", value: "#6f4ab8", label: "Violet" },
];
const SIZES = [
  { id: "thin", value: 2 },
  { id: "med", value: 4 },
  { id: "thick", value: 8 },
];

export default function Annotator({ active, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [width, setWidth] = useState(SIZES[1].value);
  const [eraser, setEraser] = useState(false);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const [, force] = useState(0);

  // Keep canvas pixel-perfect with the viewport.
  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) return;
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [active, resize]);

  const redraw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    for (const s of strokes.current) drawStroke(ctx, s);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    if (s.points.length < 1) return;
    ctx.save();
    ctx.lineWidth = s.width;
    ctx.strokeStyle = s.color;
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.beginPath();
    const [first, ...rest] = s.points;
    ctx.moveTo(first.x, first.y);
    if (rest.length === 0) {
      // Dot
      ctx.lineTo(first.x + 0.01, first.y + 0.01);
    } else {
      for (const p of rest) ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const startStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    const x = e.clientX, y = e.clientY;
    drawing.current = { points: [{ x, y }], color, width, erase: eraser };
    strokes.current.push(drawing.current);
    e.preventDefault();
  };

  const continueStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const x = e.clientX, y = e.clientY;
    drawing.current.points.push({ x, y });
    // Incremental draw — append just the new segment for speed.
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const pts = drawing.current.points;
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    ctx.save();
    ctx.lineWidth = drawing.current.width;
    ctx.strokeStyle = drawing.current.color;
    ctx.globalCompositeOperation = drawing.current.erase ? "destination-out" : "source-over";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  };

  const endStroke = () => {
    drawing.current = null;
    force((n) => n + 1); // re-enable undo button visibly
  };

  const undo = () => {
    strokes.current.pop();
    redraw();
    force((n) => n + 1);
  };

  const clearAll = () => {
    strokes.current = [];
    redraw();
    force((n) => n + 1);
  };

  // Stop drawing if the user toggles off (or navigates).
  useEffect(() => {
    if (!active) drawing.current = null;
  }, [active]);

  // ESC = exit, U = undo.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-40"
        style={{
          pointerEvents: active ? "auto" : "none",
          cursor: active ? (eraser ? "cell" : "crosshair") : "default",
          touchAction: active ? "none" : "auto",
          background: "transparent",
        }}
        onPointerDown={active ? startStroke : undefined}
        onPointerMove={active ? continueStroke : undefined}
        onPointerUp={active ? endStroke : undefined}
        onPointerCancel={active ? endStroke : undefined}
        onPointerLeave={active ? endStroke : undefined}
        aria-label="Annotation layer"
      />
      {active && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 card px-3 py-2 flex flex-wrap items-center gap-2 shadow-card animate-[fadeIn_0.12s_ease-out]"
          role="toolbar"
          aria-label="Annotation tools"
        >
          <Pen size={14} className="text-[color:var(--accent)]" />
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setColor(c.value); setEraser(false); }}
              className={`w-6 h-6 rounded-full border-2 transition ${
                color === c.value && !eraser ? "border-[color:var(--accent)] scale-110" : "border-transparent"
              }`}
              style={{ background: c.value }}
              aria-label={`${c.label} pen`}
              title={c.label}
            />
          ))}
          <div className="w-px h-5 bg-[color:var(--line)] mx-1" />
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setWidth(s.value)}
              className={`flex items-center justify-center w-7 h-7 rounded-md border ${
                width === s.value ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10" : "border-[color:var(--line)]"
              }`}
              aria-label={`Stroke size ${s.id}`}
              title={`Size ${s.id}`}
            >
              <span
                className="rounded-full"
                style={{ width: s.value + 2, height: s.value + 2, background: "currentColor" }}
              />
            </button>
          ))}
          <div className="w-px h-5 bg-[color:var(--line)] mx-1" />
          <button
            type="button"
            onClick={() => setEraser((v) => !v)}
            className={`btn p-1.5 ${eraser ? "bg-[color:var(--accent)]/15 border-[color:var(--accent)]/50" : ""}`}
            aria-pressed={eraser}
            title="Eraser"
          >
            <Eraser size={14} />
          </button>
          <button type="button" onClick={undo} disabled={strokes.current.length === 0} className="btn btn-ghost p-1.5 disabled:opacity-40" title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button type="button" onClick={clearAll} disabled={strokes.current.length === 0} className="btn btn-ghost p-1.5 disabled:opacity-40 text-red-600 dark:text-red-300" title="Clear all">
            <Trash2 size={14} />
          </button>
          <div className="w-px h-5 bg-[color:var(--line)] mx-1" />
          <button type="button" onClick={onClose} className="btn p-1.5" title="Exit annotation mode (Esc)">
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
