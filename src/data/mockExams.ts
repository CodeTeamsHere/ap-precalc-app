// Two complete mock exam forms. Mirrors real AP Precalculus structure:
//   Section I Part A — 28 MC, 80 min, calculator
//   Section I Part B — 12 MC, 40 min, no calculator
//   Section II Part A —  2 FRQ, 30 min, calculator
//   Section II Part B —  2 FRQ, 30 min, no calculator
//
// MC questions are pulled from the shared PROBLEMS pool by ID, so problem
// authoring lives in one place. FRQs are written inline because they are
// multi-part with rubric-style scoring.

import { PROBLEMS } from "./problems";

export interface MockExamFRQPart {
  prompt: string;
  expected: string;
  /** Maximum points for this part. */
  points: number;
  solution: string[];
}

export interface MockExamFRQ {
  id: string;
  topicHints: string[]; // topic IDs the question touches
  context: string;
  parts: MockExamFRQPart[];
  calculatorAllowed: boolean;
}

export interface MockExamSection {
  id: "1A" | "1B" | "2A" | "2B";
  title: string;
  minutes: number;
  calculatorAllowed: boolean;
  problemIds?: string[]; // for MC sections
  frqs?: MockExamFRQ[];  // for FR sections
}

export interface MockExam {
  id: "form-1" | "form-2";
  title: string;
  sections: MockExamSection[];
}

// Helper: pick a balanced MC roster from the pool given (count, calc).
function pickMC(count: number, calc: boolean, exclude: Set<string>, seed: number): string[] {
  const candidates = PROBLEMS.filter((p) => p.type === "mc" && p.calculatorAllowed === calc && !exclude.has(p.id));
  // Deterministic pick: deterministic shuffle using seed.
  const arr = [...candidates];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Add a topic-balance pass: don't over-pick from one topic.
  const picked: string[] = [];
  const byTopic = new Map<string, number>();
  for (const p of arr) {
    if (picked.length >= count) break;
    const seen = byTopic.get(p.topicId) ?? 0;
    if (seen >= 3) continue;
    picked.push(p.id);
    byTopic.set(p.topicId, seen + 1);
    exclude.add(p.id);
  }
  // If we ran short, fill arbitrarily.
  if (picked.length < count) {
    for (const p of arr) {
      if (picked.length >= count) break;
      if (!picked.includes(p.id)) {
        picked.push(p.id);
        exclude.add(p.id);
      }
    }
  }
  return picked;
}

function buildExam(id: "form-1" | "form-2", seed: number, frqs: { calcA: MockExamFRQ[]; noCalcB: MockExamFRQ[] }): MockExam {
  const used = new Set<string>();
  const a1 = pickMC(28, true, used, seed);
  const b1 = pickMC(12, false, used, seed + 1);
  return {
    id,
    title: id === "form-1" ? "Mock Exam — Form A" : "Mock Exam — Form B",
    sections: [
      { id: "1A", title: "Section I, Part A — 28 MC with calculator", minutes: 80, calculatorAllowed: true, problemIds: a1 },
      { id: "1B", title: "Section I, Part B — 12 MC without calculator", minutes: 40, calculatorAllowed: false, problemIds: b1 },
      { id: "2A", title: "Section II, Part A — 2 FRQ with calculator", minutes: 30, calculatorAllowed: true, frqs: frqs.calcA },
      { id: "2B", title: "Section II, Part B — 2 FRQ without calculator", minutes: 30, calculatorAllowed: false, frqs: frqs.noCalcB },
    ],
  };
}

const FORM_1_CALC_FRQS: MockExamFRQ[] = [
  {
    id: "f1-frq-1",
    topicHints: ["2.5", "2.13", "2.14"],
    calculatorAllowed: true,
    context:
      "A radioactive sample decays so that its mass in grams is modeled by $M(t) = 80 \\cdot e^{-0.04 t}$, where $t$ is measured in days.",
    parts: [
      { prompt: "Find $M(20)$ to the nearest hundredth gram.", expected: "35.95",
        points: 2,
        solution: ["$M(20) = 80 e^{-0.8} \\approx 80 \\cdot 0.4493 \\approx 35.95$."] },
      { prompt: "Find the half-life of the sample to the nearest day.", expected: "17 days",
        points: 2,
        solution: ["$M(T) = 40 \\Rightarrow e^{-0.04 T} = 1/2 \\Rightarrow T = \\ln 2 / 0.04 \\approx 17.33$ days."] },
      { prompt: "Express $M$ in the form $80 \\cdot b^t$. Give $b$ to four decimal places.",
        expected: "0.9608",
        points: 2,
        solution: ["$b = e^{-0.04} \\approx 0.9608$.",
          "So $M(t) = 80 \\cdot 0.9608^t$."] },
    ],
  },
  {
    id: "f1-frq-2",
    topicHints: ["3.7"],
    calculatorAllowed: true,
    context:
      "A Ferris wheel of radius 12 meters has its center 14 meters above the ground. It completes one revolution every 90 seconds. Riders board at the lowest point, which is 2 meters above the ground.",
    parts: [
      { prompt: "Write a sinusoidal model $h(t)$ for the height of a rider in meters, starting at $t = 0$ at the boarding point.",
        expected: "h(t) = 14 - 12 cos(2 pi t / 90)",
        points: 2,
        solution: ["Midline $= 14$, amplitude $= 12$, period $= 90$.",
          "Boarding at the minimum ⇒ use $-\\cos$: $h(t) = 14 - 12 \\cos\\bigl(\\tfrac{2\\pi t}{90}\\bigr)$."] },
      { prompt: "How high above the ground is a rider 30 seconds after boarding? Round to the nearest hundredth.",
        expected: "20 meters",
        points: 2,
        solution: ["$h(30) = 14 - 12 \\cos(2\\pi/3) = 14 - 12(-1/2) = 20$."] },
      { prompt: "During the second revolution, at what times $t$ is the rider exactly 18 meters above the ground? Give all values to the nearest tenth of a second.",
        expected: "approximately t = 27.5, 62.5, 117.5, 152.5",
        points: 2,
        solution: ["$14 - 12\\cos(2\\pi t/90) = 18 \\Rightarrow \\cos(2\\pi t/90) = -1/3$.",
          "$2\\pi t/90 = \\arccos(-1/3) \\approx 1.9106$ or $2\\pi - 1.9106 \\approx 4.3726$.",
          "$t \\approx 27.4$ s and $t \\approx 62.6$ s in the first cycle.",
          "Add 90 s for the second revolution: $117.4$ s and $152.6$ s."] },
    ],
  },
];

const FORM_1_NOCALC_FRQS: MockExamFRQ[] = [
  {
    id: "f1-frq-3",
    topicHints: ["1.5", "1.6", "1.9"],
    calculatorAllowed: false,
    context: "Let $f(x) = \\dfrac{x^2 - 4}{x^2 - x - 6}$.",
    parts: [
      { prompt: "Find all real zeros of $f$.", expected: "x = 2",
        points: 2,
        solution: ["Numerator: $(x-2)(x+2)$.",
          "Denominator: $(x-3)(x+2)$.",
          "Cancel $(x+2)$ ⇒ simplified $f(x) = (x-2)/(x-3)$, with a hole at $x = -2$.",
          "Real zero at $x = 2$ (only)."] },
      { prompt: "State all asymptotes of $f$.", expected: "Vertical x = 3; horizontal y = 1",
        points: 2,
        solution: ["Vertical at $x = 3$ (denominator zero, numerator nonzero).",
          "Horizontal at $y = 1$ since degrees of numerator and denominator are equal."] },
      { prompt: "Identify the hole (if any) by coordinates.", expected: "(-2, 4/5)",
        points: 2,
        solution: ["The canceling factor was $(x+2)$, simplified form $(x-2)/(x-3)$.",
          "Evaluate at $x = -2$: $(-4)/(-5) = 4/5$.",
          "Hole at $(-2, 4/5)$."] },
    ],
  },
  {
    id: "f1-frq-4",
    topicHints: ["3.9", "3.10", "3.12"],
    calculatorAllowed: false,
    context: "Consider the equation $2\\sin^2 x - \\cos x - 1 = 0$ on the interval $[0, 2\\pi)$.",
    parts: [
      { prompt: "Rewrite the equation as a polynomial in $\\cos x$.",
        expected: "2 cos^2 x + cos x - 1 = 0",
        points: 2,
        solution: ["Use $\\sin^2 x = 1 - \\cos^2 x$: $2(1 - \\cos^2 x) - \\cos x - 1 = 0$.",
          "Simplify: $-2\\cos^2 x - \\cos x + 1 = 0$, or equivalently $2\\cos^2 x + \\cos x - 1 = 0$."] },
      { prompt: "Solve for $\\cos x$.",
        expected: "cos x = 1/2 or -1",
        points: 2,
        solution: ["Factor: $(2\\cos x - 1)(\\cos x + 1) = 0$.",
          "$\\cos x = 1/2$ or $\\cos x = -1$."] },
      { prompt: "Find all solutions $x \\in [0, 2\\pi)$.",
        expected: "x = pi/3, pi, 5pi/3",
        points: 2,
        solution: ["$\\cos x = 1/2$: $x = \\pi/3, 5\\pi/3$.",
          "$\\cos x = -1$: $x = \\pi$.",
          "All solutions: $\\pi/3, \\pi, 5\\pi/3$."] },
    ],
  },
];

const FORM_2_CALC_FRQS: MockExamFRQ[] = [
  {
    id: "f2-frq-1",
    topicHints: ["1.14", "1.7"],
    calculatorAllowed: true,
    context: "A company's average cost per unit when producing $x$ units is modeled by $\\bar C(x) = \\dfrac{1500}{x} + 8$ dollars.",
    parts: [
      { prompt: "Compute $\\bar C(50)$ to the nearest cent.",
        expected: "$38",
        points: 2,
        solution: ["$\\bar C(50) = 30 + 8 = 38$."] },
      { prompt: "Find $\\lim_{x \\to \\infty} \\bar C(x)$ and interpret it in context.",
        expected: "8; long-run marginal cost per unit",
        points: 2,
        solution: ["As $x \\to \\infty$, $1500/x \\to 0$.",
          "So $\\bar C \\to 8$ — the marginal cost per additional unit."] },
      { prompt: "Find $x$ such that $\\bar C(x) = 12$.",
        expected: "x = 375",
        points: 2,
        solution: ["$1500/x = 4 \\Rightarrow x = 375$."] },
    ],
  },
  {
    id: "f2-frq-2",
    topicHints: ["2.5", "2.13"],
    calculatorAllowed: true,
    context: "A population of bacteria starts at $200$ and triples every 5 hours.",
    parts: [
      { prompt: "Write a model $P(t)$ in the form $a \\cdot b^t$ where $t$ is in hours.",
        expected: "P(t) = 200 * 3^(t/5)",
        points: 2,
        solution: ["Tripling every 5 hours ⇒ $P(t) = 200 \\cdot 3^{t/5} = 200 \\cdot (3^{1/5})^t$.",
          "$3^{1/5} \\approx 1.246$."] },
      { prompt: "How many bacteria are present at $t = 12$ hours? Round to the nearest whole.",
        expected: "1245",
        points: 2,
        solution: ["$P(12) = 200 \\cdot 3^{2.4} \\approx 200 \\cdot 13.967 \\approx 2793.4$.",
          "Wait — recompute: $3^{12/5} = 3^{2.4}$.",
          "Using $3^{2.4} \\approx 13.97$ ⇒ $P(12) \\approx 2793$ bacteria."] },
      { prompt: "After how many hours does the population first exceed 10{,}000? Round to the nearest tenth of an hour.",
        expected: "17.8 hours",
        points: 2,
        solution: ["Solve $200 \\cdot 3^{t/5} = 10000 \\Rightarrow 3^{t/5} = 50$.",
          "$t/5 = \\log_3 50 = \\ln 50 / \\ln 3 \\approx 3.561$.",
          "$t \\approx 17.8$ hours."] },
    ],
  },
];

const FORM_2_NOCALC_FRQS: MockExamFRQ[] = [
  {
    id: "f2-frq-3",
    topicHints: ["1.12", "1.4"],
    calculatorAllowed: false,
    context: "Let $g(x) = -(x - 1)^2 (x + 2)$.",
    parts: [
      { prompt: "Find all real zeros of $g$ and state the multiplicity of each.",
        expected: "x = 1 (multiplicity 2); x = -2 (multiplicity 1)",
        points: 2,
        solution: ["Zeros at $x = 1$ with multiplicity 2 (touches), $x = -2$ with multiplicity 1 (crosses)."] },
      { prompt: "Describe the end behavior of $g$ in limit notation.",
        expected: "lim x to inf g = -inf; lim x to -inf g = inf",
        points: 2,
        solution: ["Leading term: $-x^3$. Odd degree with negative leading coefficient.",
          "$\\lim_{x\\to\\infty} g = -\\infty$ and $\\lim_{x\\to-\\infty} g = \\infty$."] },
      { prompt: "Sketch a possible graph of $y = g(x)$ and indicate where $g$ is increasing.",
        expected: "Increases on (-2, 1); decreases elsewhere",
        points: 2,
        solution: ["Expand for derivative analysis: $g(x) = -(x-1)^2(x+2)$.",
          "$g'(x) = -(2(x-1)(x+2) + (x-1)^2) = -(x-1)(2(x+2) + (x-1)) = -(x-1)(3x+3) = -3(x-1)(x+1)$.",
          "Zeros of $g'$: $x = \\pm 1$. Sign analysis: $g$ increasing on $(-1, 1)$ approximately.",
          "More precisely: increasing on $(-1, 1)$, decreasing elsewhere."] },
    ],
  },
  {
    id: "f2-frq-4",
    topicHints: ["3.13", "3.14"],
    calculatorAllowed: false,
    context: "A polar curve is given by $r = 1 - 2\\sin\\theta$ on $0 \\le \\theta < 2\\pi$.",
    parts: [
      { prompt: "Identify the type of curve.",
        expected: "Limaçon with inner loop",
        points: 2,
        solution: ["$|a/b| = 1/2 < 1$ ⇒ limaçon with an inner loop."] },
      { prompt: "Find all values of $\\theta$ in $[0, 2\\pi)$ for which $r = 0$.",
        expected: "theta = pi/6, 5pi/6",
        points: 2,
        solution: ["$1 - 2\\sin\\theta = 0 \\Rightarrow \\sin\\theta = 1/2$.",
          "Solutions in $[0, 2\\pi)$: $\\pi/6, 5\\pi/6$."] },
      { prompt: "Determine the maximum value of $r$ and where it occurs.",
        expected: "r max = 3 at theta = 3pi/2",
        points: 2,
        solution: ["$r$ is largest when $\\sin\\theta$ is most negative, $\\sin\\theta = -1$ at $\\theta = 3\\pi/2$.",
          "$r = 1 - 2(-1) = 3$."] },
    ],
  },
];

export const MOCK_EXAMS: MockExam[] = [
  buildExam("form-1", 137, { calcA: FORM_1_CALC_FRQS, noCalcB: FORM_1_NOCALC_FRQS }),
  buildExam("form-2", 9241, { calcA: FORM_2_CALC_FRQS, noCalcB: FORM_2_NOCALC_FRQS }),
];

export function getExam(id: string): MockExam | undefined {
  return MOCK_EXAMS.find((e) => e.id === id);
}

/**
 * Map raw percent score to a predicted AP score, 1–5.
 * Thresholds approximate the conversion used for similar AP courses.
 */
export function predictedAP(rawPct: number): 1 | 2 | 3 | 4 | 5 {
  if (rawPct >= 80) return 5;
  if (rawPct >= 65) return 4;
  if (rawPct >= 50) return 3;
  if (rawPct >= 35) return 2;
  return 1;
}
