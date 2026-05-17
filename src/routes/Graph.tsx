import { useMemo, useState } from "react";
import Grapher from "../components/Grapher";
import { tryCompile, sample } from "../lib/mathParser";
import { RichText } from "../components/Math";
import { Sliders, Eraser } from "lucide-react";

const DEFAULTS = ["a*sin(b*(x-c))+d", "", "", ""];

const PRESETS: { label: string; expressions: string[]; polar?: boolean; xMin?: number; xMax?: number; yMin?: number; yMax?: number }[] = [
  { label: "Sin / cos", expressions: ["sin(x)", "cos(x)"], xMin: -7, xMax: 7, yMin: -1.5, yMax: 1.5 },
  { label: "Polynomial", expressions: ["x^3 - 3*x"], xMin: -3, xMax: 3, yMin: -6, yMax: 6 },
  { label: "Rational w/ asymptotes", expressions: ["(x^2 - 1)/(x - 2)"], xMin: -6, xMax: 8, yMin: -10, yMax: 20 },
  { label: "Exponential & log", expressions: ["2^x", "log(x, 2)"], xMin: -3, xMax: 6, yMin: -3, yMax: 6 },
  { label: "Rose (polar)", expressions: ["3*sin(2*t)"], polar: true },
  { label: "Cardioid (polar)", expressions: ["2 + 2*cos(t)"], polar: true },
];

export default function Graph() {
  const [exprs, setExprs] = useState<string[]>(DEFAULTS);
  const [polar, setPolar] = useState(false);
  const [xRange, setXRange] = useState<[number, number]>([-10, 10]);
  const [yRange, setYRange] = useState<[number, number] | null>([-10, 10]);
  const [params, setParams] = useState<Record<string, number>>({ a: 1, b: 1, c: 0, d: 0 });
  const [overlays, setOverlays] = useState({ zeros: false, extrema: false });

  const activeExprs = exprs.map((e) => e.trim()).filter(Boolean);

  const valid = activeExprs.every((e) => {
    const varName = polar ? "t" : "x";
    return tryCompile(e, varName) !== null;
  });

  const tableRows = useMemo(() => {
    if (polar || activeExprs.length === 0) return null;
    const first = tryCompile(activeExprs[0], "x");
    if (!first) return null;
    const { xs, ys } = sample(first.fn, xRange[0], xRange[1], 10);
    return xs.map((x, i) => ({ x, y: ys[i] }));
  }, [activeExprs, xRange, polar]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header>
        <h1 className="font-display text-4xl">Function Grapher</h1>
        <p className="mt-2 text-[color:var(--ink-soft)] max-w-prose">
          Plot up to 4 expressions, scrub the parameter sliders, and toggle overlays.
          Use functions like <code className="font-mono">sin, cos, tan, log, ln, sqrt, abs, exp</code>,
          and operators <code className="font-mono">+ − * / ^</code>.
        </p>
      </header>

      <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-4">
        <div className="card p-0 overflow-hidden">
          {activeExprs.length > 0 && valid ? (
            <Grapher
              expressions={activeExprs}
              polar={polar}
              params={params}
              xMin={xRange[0]} xMax={xRange[1]}
              yMin={yRange?.[0]} yMax={yRange?.[1]}
              overlays={overlays}
              height={500}
              showLegend
            />
          ) : (
            <div className="h-[500px] flex items-center justify-center text-[color:var(--ink-soft)] text-sm px-6 text-center">
              {valid
                ? "Type an expression on the right to see a graph."
                : "Couldn't parse one of the expressions — check syntax."}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="card">
            <h3 className="font-display text-lg">Expressions</h3>
            <p className="text-xs text-[color:var(--ink-soft)] mt-1">
              {polar ? "Polar mode: use t as the parameter." : "Variable: x."}
            </p>
            <div className="mt-2 space-y-2">
              {exprs.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs w-4" style={{ color: ["#c2701b","#0e7c7b","#6f4ab8","#a13b3b"][i] }}>{i+1}</span>
                  <input
                    aria-label={`Expression ${i + 1}`}
                    value={e}
                    onChange={(ev) => setExprs((p) => p.map((v, j) => (j === i ? ev.target.value : v)))}
                    className="flex-1 font-mono text-sm bg-transparent border border-[color:var(--line)] rounded px-2 py-1.5 focusring"
                    placeholder={polar ? "r in terms of t" : "y in terms of x"}
                    spellCheck={false}
                  />
                  {e && (
                    <button onClick={() => setExprs((p) => p.map((v, j) => (j === i ? "" : v)))} aria-label="Clear" className="btn btn-ghost p-1">
                      <Eraser size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {!polar && /\b[abcd]\b/.test(exprs.join(" ")) && (
            <section className="card">
              <h3 className="font-display text-lg flex items-center gap-2"><Sliders size={18} /> Parameters</h3>
              <p className="text-xs text-[color:var(--ink-soft)] mt-1">
                Drag to see transformations live: <RichText>{"$a \\cdot f(b(x - c)) + d$"}</RichText>.
              </p>
              <div className="mt-2 space-y-2 text-sm">
                {(["a","b","c","d"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2">
                    <span className="font-mono w-5">{k}</span>
                    <input
                      type="range"
                      min={k === "a" || k === "b" ? -5 : -10}
                      max={k === "a" || k === "b" ? 5 : 10}
                      step={0.1}
                      value={params[k]}
                      onChange={(e) => setParams((p) => ({ ...p, [k]: Number(e.target.value) }))}
                      className="flex-1 accent-[color:var(--accent)]"
                    />
                    <span className="font-mono text-xs w-12 text-right">{params[k].toFixed(1)}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <h3 className="font-display text-lg">View</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <label className="space-y-1">
                <span className="block text-xs text-[color:var(--ink-soft)]">x min</span>
                <input type="number" step="0.5" value={xRange[0]} onChange={(e) => setXRange([Number(e.target.value), xRange[1]])} className="w-full bg-transparent border border-[color:var(--line)] rounded px-2 py-1" />
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[color:var(--ink-soft)]">x max</span>
                <input type="number" step="0.5" value={xRange[1]} onChange={(e) => setXRange([xRange[0], Number(e.target.value)])} className="w-full bg-transparent border border-[color:var(--line)] rounded px-2 py-1" />
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[color:var(--ink-soft)]">y min</span>
                <input type="number" step="0.5" value={yRange?.[0] ?? ""} onChange={(e) => setYRange([Number(e.target.value), yRange?.[1] ?? 10])} className="w-full bg-transparent border border-[color:var(--line)] rounded px-2 py-1" />
              </label>
              <label className="space-y-1">
                <span className="block text-xs text-[color:var(--ink-soft)]">y max</span>
                <input type="number" step="0.5" value={yRange?.[1] ?? ""} onChange={(e) => setYRange([yRange?.[0] ?? -10, Number(e.target.value)])} className="w-full bg-transparent border border-[color:var(--line)] rounded px-2 py-1" />
              </label>
            </div>
          </section>

          <section className="card">
            <h3 className="font-display text-lg">Overlays</h3>
            <div className="mt-2 space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={overlays.zeros} onChange={(e) => setOverlays((o) => ({ ...o, zeros: e.target.checked }))} />
                Zeros
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={overlays.extrema} onChange={(e) => setOverlays((o) => ({ ...o, extrema: e.target.checked }))} />
                Local extrema
              </label>
              <label className="flex items-center gap-2 mt-2 pt-2 border-t border-[color:var(--line)]">
                <input type="checkbox" checked={polar} onChange={(e) => setPolar(e.target.checked)} />
                Polar mode (r as a function of t)
              </label>
            </div>
          </section>

          <section className="card">
            <h3 className="font-display text-lg">Presets</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setExprs([p.expressions[0] ?? "", p.expressions[1] ?? "", p.expressions[2] ?? "", p.expressions[3] ?? ""]);
                    setPolar(!!p.polar);
                    if (p.xMin !== undefined && p.xMax !== undefined) setXRange([p.xMin, p.xMax]);
                    if (p.yMin !== undefined && p.yMax !== undefined) setYRange([p.yMin, p.yMax]);
                  }}
                  className="chip hover:border-[color:var(--accent)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {tableRows && (
        <section className="mt-8">
          <h3 className="font-display text-xl mb-2">Table of values</h3>
          <div className="overflow-x-auto card p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[color:var(--ink-soft)]">
                  <th className="px-3 py-2 font-mono text-xs">x</th>
                  <th className="px-3 py-2 font-mono text-xs">f₁(x)</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r, i) => (
                  <tr key={i} className="border-t border-[color:var(--line)]">
                    <td className="px-3 py-1.5 font-mono">{r.x.toFixed(2)}</td>
                    <td className="px-3 py-1.5 font-mono">{Number.isFinite(r.y) ? r.y.toFixed(4) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
