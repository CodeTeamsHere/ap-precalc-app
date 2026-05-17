import { useEffect, useMemo, useState } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import {
  tryCompile, sample, breakDiscontinuities, findZeros, findExtrema, nDeriv, substituteParams,
} from "../lib/mathParser";

// react-plotly.js loads the full plotly bundle by default; using the factory
// with the lighter plotly.js-dist-min keeps initial JS under our 250 KB budget.
const Plot = createPlotlyComponent(Plotly as never);

const TRACE_COLORS = ["#c2701b", "#0e7c7b", "#6f4ab8", "#a13b3b"];

export interface GrapherOverlays {
  zeros?: boolean;
  extrema?: boolean;
}

export interface GrapherProps {
  /** Up to 4 expressions in x (or in t when polar = true). */
  expressions: string[];
  /** If true, expressions are r(θ) and curves are plotted as (r cos θ, r sin θ). */
  polar?: boolean;
  /** Parameters to substitute (e.g. a, b, c, d for transformation sliders). */
  params?: Record<string, number>;
  xMin?: number; xMax?: number;
  yMin?: number; yMax?: number;
  height?: number;
  overlays?: GrapherOverlays;
  /** Names for each expression (defaults to "y = ..."). */
  names?: string[];
  showLegend?: boolean;
}

export default function Grapher({
  expressions, polar, params, xMin = -10, xMax = 10,
  yMin, yMax, height = 360, overlays, names, showLegend,
}: GrapherProps) {
  const isDark = useDarkClass();

  const data = useMemo(() => {
    const traces: Plotly.Data[] = [];
    const overlayMarkers: Plotly.Data[] = [];

    expressions.forEach((rawExpr, i) => {
      const expr = params ? substituteParams(rawExpr, params) : rawExpr;
      const varName = polar ? "t" : "x";
      const compiled = tryCompile(expr, varName);
      if (!compiled) return;
      const start = polar ? 0 : xMin;
      const end = polar ? 2 * Math.PI : xMax;
      const N = polar ? 1200 : 900;
      const { xs, ys } = sample(compiled.fn, start, end, N);
      const color = TRACE_COLORS[i % TRACE_COLORS.length];
      const baseName = (names && names[i]) ?? (polar ? `r = ${rawExpr}` : `y = ${rawExpr}`);

      if (polar) {
        const cx = xs.map((t, k) => ys[k] * Math.cos(t));
        const cy = xs.map((t, k) => ys[k] * Math.sin(t));
        // break discontinuities in r as well
        const { x: bx, y: by } = breakDiscontinuities(cx as number[], cy as number[], 100);
        traces.push({
          x: bx, y: by, mode: "lines", type: "scatter",
          name: baseName, line: { color, width: 2 }, hovertemplate: "%{x:.2f}, %{y:.2f}<extra></extra>",
        });
      } else {
        const yRange = yMin !== undefined && yMax !== undefined ? Math.max(1, yMax - yMin) : 100;
        const { x, y } = breakDiscontinuities(xs, ys, yRange * 1.5);
        traces.push({
          x, y, mode: "lines", type: "scatter",
          name: baseName, line: { color, width: 2 },
          hovertemplate: "x=%{x:.3f}, y=%{y:.3f}<extra></extra>",
        });

        if (overlays?.zeros) {
          const zs = findZeros(compiled.fn, xMin, xMax);
          if (zs.length) {
            overlayMarkers.push({
              x: zs, y: zs.map(() => 0), mode: "markers", type: "scatter",
              name: `${baseName} zeros`, marker: { color, symbol: "circle-open", size: 10, line: { width: 2 } },
              hovertemplate: "zero at x=%{x:.3f}<extra></extra>",
              showlegend: false,
            });
          }
        }
        if (overlays?.extrema) {
          const exs = findExtrema(compiled.fn, xMin, xMax);
          if (exs.length) {
            overlayMarkers.push({
              x: exs, y: exs.map((x) => compiled.fn(x)), mode: "markers", type: "scatter",
              name: `${baseName} extrema`, marker: { color, symbol: "diamond-open", size: 10, line: { width: 2 } },
              hovertemplate: "extremum at (%{x:.3f}, %{y:.3f})<extra></extra>",
              showlegend: false,
            });
          }
        }
      }
    });

    return [...traces, ...overlayMarkers];
  }, [expressions, params, polar, xMin, xMax, yMin, yMax, overlays, names]);

  const paper = isDark ? "#181620" : "#fdfbf6";
  const fontColor = isDark ? "#f4ecd9" : "#15131a";
  const gridColor = isDark ? "rgba(244,236,217,0.10)" : "rgba(21,19,26,0.12)";

  const layout: Partial<Plotly.Layout> = useMemo(() => ({
    height,
    autosize: true,
    margin: { l: 44, r: 16, t: 16, b: 36 },
    paper_bgcolor: paper,
    plot_bgcolor: paper,
    font: { family: "IBM Plex Sans, sans-serif", color: fontColor, size: 12 },
    xaxis: {
      range: polar ? undefined : [xMin, xMax],
      zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor,
    },
    yaxis: {
      range: yMin !== undefined && yMax !== undefined ? [yMin, yMax] : undefined,
      zeroline: true, gridcolor: gridColor, zerolinecolor: gridColor,
      ...(polar ? { scaleanchor: "x" as const, scaleratio: 1 } : {}),
    },
    showlegend: showLegend ?? expressions.length > 1,
    legend: { orientation: "h", y: -0.18 },
    dragmode: "pan",
    hovermode: "closest",
  }), [isDark, polar, xMin, xMax, yMin, yMax, height, paper, fontColor, gridColor, showLegend, expressions.length]);

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ displayModeBar: false, responsive: true, scrollZoom: true } as Partial<Plotly.Config>}
      style={{ width: "100%", height }}
      useResizeHandler
    />
  );
}

function useDarkClass() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// Re-export utilities so the standalone grapher route can use them.
export { tryCompile, sample, nDeriv };
