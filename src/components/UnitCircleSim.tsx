import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tex from "./Math";

interface Props {
  /** Optional initial angle in radians. Default 0. */
  initialAngle?: number;
  /** Show the live sin/cos trace plots alongside the circle. */
  showTraces?: boolean;
  /** Height in pixels of the circle SVG. */
  size?: number;
}

const SPECIAL_ANGLES_DEG = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

const SPECIAL_LABELS: Record<number, { rad: string; cos: string; sin: string }> = {
  0:    { rad: "0",      cos: "1",          sin: "0" },
  30:   { rad: "\\pi/6",  cos: "\\sqrt{3}/2", sin: "1/2" },
  45:   { rad: "\\pi/4",  cos: "\\sqrt{2}/2", sin: "\\sqrt{2}/2" },
  60:   { rad: "\\pi/3",  cos: "1/2",         sin: "\\sqrt{3}/2" },
  90:   { rad: "\\pi/2",  cos: "0",           sin: "1" },
  120:  { rad: "2\\pi/3", cos: "-1/2",        sin: "\\sqrt{3}/2" },
  135:  { rad: "3\\pi/4", cos: "-\\sqrt{2}/2", sin: "\\sqrt{2}/2" },
  150:  { rad: "5\\pi/6", cos: "-\\sqrt{3}/2", sin: "1/2" },
  180:  { rad: "\\pi",     cos: "-1",          sin: "0" },
  210:  { rad: "7\\pi/6", cos: "-\\sqrt{3}/2", sin: "-1/2" },
  225:  { rad: "5\\pi/4", cos: "-\\sqrt{2}/2", sin: "-\\sqrt{2}/2" },
  240:  { rad: "4\\pi/3", cos: "-1/2",         sin: "-\\sqrt{3}/2" },
  270:  { rad: "3\\pi/2", cos: "0",            sin: "-1" },
  300:  { rad: "5\\pi/3", cos: "1/2",          sin: "-\\sqrt{3}/2" },
  315:  { rad: "7\\pi/4", cos: "\\sqrt{2}/2",  sin: "-\\sqrt{2}/2" },
  330:  { rad: "11\\pi/6", cos: "\\sqrt{3}/2", sin: "-1/2" },
};

export default function UnitCircleSim({ initialAngle = Math.PI / 6, showTraces = true, size = 360 }: Props) {
  const [theta, setTheta] = useState(initialAngle);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Map [-1.2, 1.2] in math coordinates to [0, size] in pixels.
  const SCALE = size / 2.4;
  const CENTER = size / 2;
  const toSvgX = (x: number) => CENTER + x * SCALE;
  const toSvgY = (y: number) => CENTER - y * SCALE;

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const tan = Math.abs(cos) < 1e-9 ? null : sin / cos;
  const deg = ((theta * 180) / Math.PI + 360) % 360;
  const quadrant = computeQuadrant(theta);

  const snapToSpecial = useCallback((d: number) => {
    const closest = SPECIAL_ANGLES_DEG.reduce(
      (acc, a) => Math.abs(a - d) < Math.abs(acc - d) ? a : acc, SPECIAL_ANGLES_DEG[0],
    );
    return Math.abs(closest - d) < 4 ? closest : d;
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - CENTER) / SCALE;
    const y = -(clientY - rect.top - CENTER) / SCALE;
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += 2 * Math.PI;
    let d = (angle * 180) / Math.PI;
    d = snapToSpecial(d);
    setTheta((d * Math.PI) / 180);
  }, [CENTER, SCALE, snapToSpecial]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => handleMove(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, handleMove]);

  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = e.shiftKey ? Math.PI / 12 : Math.PI / 36;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setTheta((t) => (t - step + 2 * Math.PI) % (2 * Math.PI));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setTheta((t) => (t + step) % (2 * Math.PI));
    }
  };

  // Live trace for sin and cos: as theta sweeps from 0 to current, plot the path.
  const traceData = useMemo(() => {
    const N = 120;
    const sinX: number[] = [], sinY: number[] = [];
    const cosX: number[] = [], cosY: number[] = [];
    for (let k = 0; k <= N; k++) {
      const t = (theta * k) / N;
      sinX.push(t); sinY.push(Math.sin(t));
      cosX.push(t); cosY.push(Math.cos(t));
    }
    return { sinX, sinY, cosX, cosY };
  }, [theta]);

  // Highlight color = unit-3 violet
  const accent = "#6f4ab8";
  const ink = "currentColor";

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-6 p-5">
      <div>
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          tabIndex={0}
          role="application"
          aria-label="Unit circle. Drag the point or use arrow keys to change the angle."
          onPointerDown={(e) => { setDragging(true); handleMove(e.clientX, e.clientY); }}
          onKeyDown={onKey}
          style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
          className="rounded-lg focusring"
        >
          {/* axes */}
          <line x1={0} y1={CENTER} x2={size} y2={CENTER} stroke={ink} strokeOpacity={0.2} />
          <line x1={CENTER} y1={0} x2={CENTER} y2={size} stroke={ink} strokeOpacity={0.2} />
          {/* unit circle */}
          <circle cx={CENTER} cy={CENTER} r={SCALE} stroke={ink} strokeOpacity={0.35} fill="none" />
          {/* quadrant tint */}
          {[1,2,3,4].map((q) => (
            <rect
              key={q}
              x={q === 1 || q === 4 ? CENTER : 0}
              y={q === 1 || q === 2 ? 0 : CENTER}
              width={CENTER} height={CENTER}
              fill={q === quadrant ? accent : "transparent"}
              fillOpacity={q === quadrant ? 0.06 : 0}
              pointerEvents="none"
            />
          ))}
          {/* terminal ray */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={toSvgX(cos)}
            y2={toSvgY(sin)}
            stroke={accent}
            strokeWidth={2}
          />
          {/* sin (vertical leg) */}
          <line
            x1={toSvgX(cos)} y1={toSvgY(0)}
            x2={toSvgX(cos)} y2={toSvgY(sin)}
            stroke="#0e7c7b" strokeWidth={2}
          />
          {/* cos (horizontal leg) */}
          <line
            x1={toSvgX(0)} y1={toSvgY(0)}
            x2={toSvgX(cos)} y2={toSvgY(0)}
            stroke="#c2701b" strokeWidth={2}
          />
          {/* angle arc */}
          <path
            d={describeArc(CENTER, CENTER, SCALE * 0.25, 0, theta)}
            stroke={accent} strokeWidth={1.5} fill="none"
          />
          {/* terminal point */}
          <circle
            cx={toSvgX(cos)} cy={toSvgY(sin)} r={7}
            fill={accent}
            stroke="white" strokeWidth={2}
            style={{ cursor: "grab" }}
          />
          {/* special-angle ticks */}
          {SPECIAL_ANGLES_DEG.map((d) => {
            const a = (d * Math.PI) / 180;
            const x1 = toSvgX(Math.cos(a) * 0.96);
            const y1 = toSvgY(Math.sin(a) * 0.96);
            const x2 = toSvgX(Math.cos(a) * 1.04);
            const y2 = toSvgY(Math.sin(a) * 1.04);
            return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeOpacity={0.3} />;
          })}
        </svg>
        <p className="text-xs mt-2 text-[color:var(--ink-soft)]">
          Drag the point. Snaps to special angles when nearby. Arrow keys nudge by 5°; Shift + arrow by 15°.
        </p>
      </div>

      <div className="text-sm">
        <ReadoutRow label="Angle (rad)" value={SPECIAL_LABELS[Math.round(deg)]?.rad ?? theta.toFixed(4)} />
        <ReadoutRow label="Angle (deg)" value={`${deg.toFixed(1)}°`} />
        <ReadoutRow label="Quadrant" value={`${quadrant}`} />
        <ReadoutRow label="cos θ" value={SPECIAL_LABELS[Math.round(deg)]?.cos ?? cos.toFixed(4)} accent="#c2701b" />
        <ReadoutRow label="sin θ" value={SPECIAL_LABELS[Math.round(deg)]?.sin ?? sin.toFixed(4)} accent="#0e7c7b" />
        <ReadoutRow label="tan θ" value={tan === null ? "undefined" : tan.toFixed(4)} accent="#6f4ab8" />

        {showTraces && (
          <div className="mt-4 space-y-3">
            <MiniTrace title="sin θ" color="#0e7c7b" xs={traceData.sinX} ys={traceData.sinY} />
            <MiniTrace title="cos θ" color="#c2701b" xs={traceData.cosX} ys={traceData.cosY} />
          </div>
        )}
      </div>
    </div>
  );
}

function ReadoutRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[color:var(--line)] py-1.5">
      <span className="text-xs uppercase tracking-wide text-[color:var(--ink-soft)]">{label}</span>
      <span className="font-mono" style={{ color: accent }}>
        <Tex>{value}</Tex>
      </span>
    </div>
  );
}

function MiniTrace({ title, color, xs, ys }: { title: string; color: string; xs: number[]; ys: number[] }) {
  const W = 280, H = 80;
  const xMax = 2 * Math.PI;
  const sx = (x: number) => (x / xMax) * (W - 16) + 8;
  const sy = (y: number) => H / 2 - y * (H / 2 - 8);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${sx(x).toFixed(2)} ${sy(ys[i]).toFixed(2)}`).join(" ");
  const headX = sx(xs[xs.length - 1]);
  const headY = sy(ys[ys.length - 1]);
  return (
    <div>
      <p className="text-xs font-mono text-[color:var(--ink-soft)] mb-1">y = {title}</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: "var(--bg)", borderRadius: 8 }}>
        <line x1={8} y1={H / 2} x2={W - 8} y2={H / 2} stroke="currentColor" strokeOpacity={0.2} />
        <path d={d} stroke={color} strokeWidth={2} fill="none" />
        <circle cx={headX} cy={headY} r={3.5} fill={color} />
      </svg>
    </div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // SVG arc helper. startAngle and endAngle are in radians, measured counterclockwise from positive x-axis.
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  // SVG arcs go clockwise; with sweep flag 0 we get counterclockwise (which matches math convention).
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
}

function computeQuadrant(theta: number) {
  const t = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (t < Math.PI / 2) return 1;
  if (t < Math.PI) return 2;
  if (t < (3 * Math.PI) / 2) return 3;
  return 4;
}
