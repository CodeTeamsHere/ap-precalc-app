// Answer grader. Supports:
//   - multiple-choice (index comparison)
//   - numeric free-response (with tolerance)
//   - symbolic / textual free-response (with normalization + accepted-form list)
//
// The grader is lenient about whitespace, math notation aliases (π/pi, √/sqrt,
// ∞/inf), and ordering of comma-separated answers. It's strict enough that wrong
// answers don't slip through.

import { math } from "./mathParser";
import type { FRProblem } from "../data/problems";

function normalizeText(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .toLowerCase()
    .replace(/π/g, "pi")
    .replace(/τ/g, "tau")
    .replace(/√/g, "sqrt")
    .replace(/∞/g, "inf")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\\cdot/g, "*")
    .replace(/\$/g, "")
    .replace(/[{}]/g, "")
    .replace(/\\frac\(([^)]+)\)\(([^)]+)\)/g, "$1/$2")
    .replace(/\\frac([0-9a-z])([0-9a-z])/g, "$1/$2")
    .replace(/\\sqrt\(([^)]+)\)/g, "sqrt($1)")
    .replace(/\\sqrt([0-9a-z])/g, "sqrt($1)")
    .replace(/\\pi/g, "pi")
    .replace(/\\infty/g, "inf");
}

function splitMultipart(s: string): string[] {
  return normalizeText(s)
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function tryParseNumber(s: string): number | null {
  const cleaned = s.trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (Number.isFinite(n)) return n;
  try {
    const v = math.evaluate(cleaned);
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "object" && v && "re" in v && Math.abs((v as { im: number }).im) < 1e-9) {
      return (v as { re: number }).re;
    }
  } catch {
    /* not parseable as a number */
  }
  return null;
}

function numericMatch(userN: number, refN: number, tol: number): boolean {
  if (Math.abs(userN - refN) <= tol) return true;
  // Relative tolerance for big numbers.
  const relTol = Math.max(Math.abs(refN), 1) * 1e-3;
  return Math.abs(userN - refN) <= relTol;
}

export interface GradeResult {
  correct: boolean;
  matchedAnswer?: string;
}

export function gradeFR(problem: FRProblem, raw: string): GradeResult {
  if (!raw.trim()) return { correct: false };

  const canonical = [problem.expectedAnswer, ...(problem.acceptedAnswers ?? [])];

  // Numeric mode — single number, with tolerance.
  if (problem.numericTolerance !== undefined) {
    const userN = tryParseNumber(raw);
    if (userN === null) return { correct: false };
    for (const c of canonical) {
      const cN = tryParseNumber(c);
      if (cN === null) continue;
      if (numericMatch(userN, cN, problem.numericTolerance)) {
        return { correct: true, matchedAnswer: c };
      }
    }
    return { correct: false };
  }

  // Text / symbolic mode.
  const userParts = splitMultipart(raw).sort();
  const userNorm = normalizeText(raw);

  for (const c of canonical) {
    const cNorm = normalizeText(c);
    if (cNorm === userNorm) return { correct: true, matchedAnswer: c };
    // Multipart: compare unordered sets of tokens (for "x = 2, -3" vs "-3, 2").
    const cParts = splitMultipart(c).sort();
    if (cParts.length > 1 && cParts.length === userParts.length) {
      if (cParts.every((p, i) => p === userParts[i])) return { correct: true, matchedAnswer: c };
    }
  }

  // Final fallback: numeric equivalence even when no tolerance was declared.
  const userN = tryParseNumber(raw);
  if (userN !== null) {
    for (const c of canonical) {
      const cN = tryParseNumber(c);
      if (cN !== null && Math.abs(userN - cN) < 1e-6) return { correct: true, matchedAnswer: c };
    }
  }

  return { correct: false };
}
