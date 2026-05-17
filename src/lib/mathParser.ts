// Thin wrapper around mathjs so the rest of the app can compile expressions,
// sample them safely, and pull derivative info for grapher overlays.

import { create, all, type EvalFunction } from "mathjs";

const math = create(all);

export interface CompiledExpr {
  raw: string;
  fn: (x: number) => number;
}

export function tryCompile(expression: string, varName = "x"): CompiledExpr | null {
  if (!expression.trim()) return null;
  let compiled: EvalFunction;
  try {
    compiled = math.compile(expression);
  } catch {
    return null;
  }
  return {
    raw: expression,
    fn: (x: number) => {
      try {
        const v = compiled.evaluate({ [varName]: x });
        if (typeof v === "number") return v;
        if (typeof v === "object" && v && "re" in v && "im" in v) {
          // Complex result — treat as undefined on the real line.
          const im = (v as { im: number }).im;
          if (Math.abs(im) > 1e-9) return NaN;
          return (v as { re: number }).re;
        }
        return NaN;
      } catch {
        return NaN;
      }
    },
  };
}

/** Sample n+1 points of f(x) on [start, end]. */
export function sample(f: (x: number) => number, start: number, end: number, n = 800): { xs: number[]; ys: number[] } {
  const xs = new Array<number>(n + 1);
  const ys = new Array<number>(n + 1);
  for (let k = 0; k <= n; k++) {
    const x = start + ((end - start) * k) / n;
    xs[k] = x;
    ys[k] = f(x);
  }
  return { xs, ys };
}

/**
 * Insert `null` into the trace where a y-jump exceeds `jumpThreshold`. Plotly
 * draws a line break at `null`, so this hides the vertical-asymptote crossings
 * that would otherwise become huge fake lines.
 */
export function breakDiscontinuities(
  xs: number[],
  ys: number[],
  jumpThreshold: number,
): { x: (number | null)[]; y: (number | null)[] } {
  const x: (number | null)[] = [];
  const y: (number | null)[] = [];
  for (let i = 0; i < xs.length; i++) {
    const yi = ys[i];
    if (!Number.isFinite(yi)) {
      x.push(null);
      y.push(null);
      continue;
    }
    if (i > 0 && Number.isFinite(ys[i - 1])) {
      if (Math.abs(yi - ys[i - 1]) > jumpThreshold) {
        x.push(null);
        y.push(null);
      }
    }
    x.push(xs[i]);
    y.push(yi);
  }
  return { x, y };
}

/** Substitute parameter values into an expression like "a*sin(b*(x+c))+d". */
export function substituteParams(expression: string, params: Record<string, number>): string {
  let out = expression;
  for (const [k, v] of Object.entries(params)) {
    const re = new RegExp(`\\b${k}\\b`, "g");
    out = out.replace(re, `(${v})`);
  }
  return out;
}

/** Numeric derivative via central difference. */
export function nDeriv(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Numeric zero finder over a coarse scan + bisection. */
export function findZeros(f: (x: number) => number, start: number, end: number, n = 400): number[] {
  const zeros: number[] = [];
  let prevX = start;
  let prevY = f(start);
  for (let k = 1; k <= n; k++) {
    const x = start + ((end - start) * k) / n;
    const y = f(x);
    if (Number.isFinite(prevY) && Number.isFinite(y) && prevY * y < 0) {
      // Bisect
      let lo = prevX, hi = x;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (!Number.isFinite(fm)) break;
        if (Math.sign(fm) === Math.sign(prevY)) lo = mid;
        else hi = mid;
      }
      zeros.push((lo + hi) / 2);
    }
    prevX = x;
    prevY = y;
  }
  return zeros;
}

/** Numeric extrema (sign changes of the derivative). */
export function findExtrema(f: (x: number) => number, start: number, end: number, n = 400): number[] {
  return findZeros((x) => nDeriv(f, x), start, end, n);
}

export { math };
