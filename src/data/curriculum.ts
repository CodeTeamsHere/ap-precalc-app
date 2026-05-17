// Curriculum data, derived from the College Board AP Precalculus Course and
// Exam Description (CED). Learning Objectives and Essential Knowledge statements
// are paraphrased in plain English; the official CED is the source of truth.
//
// Topic IDs match the CED (e.g. "1.5"), so problems, lessons, and worked
// examples all share a stable key. Unit 4 is intentionally omitted because it
// is not assessed on the AP exam.

export type SkillCode =
  | "1.A" | "1.B" | "1.C"
  | "2.A" | "2.B"
  | "3.A" | "3.B" | "3.C";

export interface Skill {
  code: SkillCode;
  practice: 1 | 2 | 3;
  practiceTitle: string;
  title: string;
  description: string;
}

export const SKILLS: Skill[] = [
  {
    code: "1.A",
    practice: 1,
    practiceTitle: "Procedural and Symbolic Fluency",
    title: "Solve equations and inequalities",
    description:
      "Manipulate expressions and equations using algebraic properties to isolate variables, find zeros, and solve inequalities.",
  },
  {
    code: "1.B",
    practice: 1,
    practiceTitle: "Procedural and Symbolic Fluency",
    title: "Express in analytically equivalent forms",
    description:
      "Rewrite functions, equations, or expressions in forms that reveal useful information (factored form, vertex form, log/exp pivots, etc.).",
  },
  {
    code: "1.C",
    practice: 1,
    practiceTitle: "Procedural and Symbolic Fluency",
    title: "Construct new functions",
    description:
      "Build new functions from old ones by transformation, composition, inversion, or by fitting a model to data.",
  },
  {
    code: "2.A",
    practice: 2,
    practiceTitle: "Multiple Representations",
    title: "Identify information from representations",
    description:
      "Read features (zeros, asymptotes, extrema, end behavior, period, amplitude) from a graph, table, expression, or verbal description.",
  },
  {
    code: "2.B",
    practice: 2,
    practiceTitle: "Multiple Representations",
    title: "Construct equivalent representations",
    description:
      "Translate between graphical, numerical, analytical, and verbal forms of a function or relation.",
  },
  {
    code: "3.A",
    practice: 3,
    practiceTitle: "Communication and Reasoning",
    title: "Describe with appropriate precision",
    description:
      "Use correct notation, units, and language when describing how a function behaves.",
  },
  {
    code: "3.B",
    practice: 3,
    practiceTitle: "Communication and Reasoning",
    title: "Apply numerical results in context",
    description:
      "Interpret numerical answers in the real-world or mathematical setting that produced the question.",
  },
  {
    code: "3.C",
    practice: 3,
    practiceTitle: "Communication and Reasoning",
    title: "Support choices with rationale",
    description:
      "Justify a modeling decision, a conclusion, or a prediction using evidence from the function or its representations.",
  },
];

export interface UnitInfo {
  id: 1 | 2 | 3;
  title: string;
  weight: string;
  description: string;
  /** Tailwind color tokens — keys for unit1 / unit2 / unit3 in tailwind.config.js */
  accentKey: "unit1" | "unit2" | "unit3";
}

export const UNITS: UnitInfo[] = [
  {
    id: 1,
    title: "Polynomial and Rational Functions",
    weight: "30–40%",
    accentKey: "unit1",
    description:
      "Average rates of change, polynomial behavior, complex zeros, end behavior, rational functions, holes, asymptotes, transformations, and modeling.",
  },
  {
    id: 2,
    title: "Exponential and Logarithmic Functions",
    weight: "27–40%",
    accentKey: "unit2",
    description:
      "Arithmetic and geometric sequences, exponential growth and decay, logarithms as inverses, log laws, equations and inequalities, semi-log plots, and modeling.",
  },
  {
    id: 3,
    title: "Trigonometric and Polar Functions",
    weight: "30–35%",
    accentKey: "unit3",
    description:
      "Periodic phenomena, sine and cosine, the unit circle, sinusoidal modeling, inverse trig, secant/cosecant/cotangent, identities, and polar functions.",
  },
];

export interface LearningObjective { id: string; text: string }
export interface EssentialKnowledge { id: string; text: string }
export interface WorkedExample {
  prompt: string;     // KaTeX-friendly
  steps: string[];    // each step is one short line
  answer: string;     // final answer in KaTeX
}

export interface Topic {
  id: string;         // e.g. "1.5"
  unit: 1 | 2 | 3;
  title: string;
  suggestedPeriods: number;
  skills: SkillCode[];
  summary: string;
  learningObjectives: LearningObjective[];
  essentialKnowledge: EssentialKnowledge[];
  workedExamples: WorkedExample[];
  pitfalls: string[];
  vocab: string[];    // refs into vocab.ts (term ids)
  /** If set, the in-lesson grapher will pre-load these. */
  graph?: {
    expressions?: string[];
    polar?: boolean;
    xMin?: number; xMax?: number;
    yMin?: number; yMax?: number;
  };
}

// ---------------------------------------------------------------------------
// UNIT 1 — Polynomial and Rational Functions
// ---------------------------------------------------------------------------

export const TOPICS: Topic[] = [
  {
    id: "1.1",
    unit: 1,
    title: "Change in Tandem",
    suggestedPeriods: 1,
    skills: ["2.A", "3.A"],
    summary:
      "A function ties an input to exactly one output. As the input changes, the output changes in tandem — and the shape of that change tells you whether the function is increasing, decreasing, concave up, or concave down.",
    learningObjectives: [
      { id: "1.1.A", text: "Describe how two quantities change together using a function." },
      { id: "1.1.B", text: "Use function notation and graphs to describe behavior over an interval." },
    ],
    essentialKnowledge: [
      { id: "1.1.A.1", text: "A function f maps each input value x to exactly one output value f(x)." },
      { id: "1.1.A.2", text: "On an interval, a function is increasing if outputs grow as inputs grow, decreasing if outputs shrink as inputs grow, and constant if outputs do not change." },
      { id: "1.1.B.1", text: "On an interval, a graph is concave up if it curves upward (rates of change increase) and concave down if it curves downward (rates of change decrease)." },
      { id: "1.1.B.2", text: "A point where concavity changes is a point of inflection." },
    ],
    workedExamples: [
      {
        prompt: "Given $f(x) = x^3 - 3x$, describe where $f$ is increasing or decreasing on $[-2, 2]$.",
        steps: [
          "Compute $f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$.",
          "Zeros of $f'$: $x = -1$ and $x = 1$.",
          "Test points: $f'(-2) > 0$, $f'(0) < 0$, $f'(2) > 0$.",
        ],
        answer: "Increasing on $[-2, -1)$ and $(1, 2]$; decreasing on $(-1, 1)$.",
      },
      {
        prompt: "A water tank fills so that the depth $D$ rises faster as time passes. Is $D(t)$ concave up or concave down?",
        steps: [
          "Rates of change increase over time, since each minute adds more depth than the last.",
          "Increasing rates of change ⇒ concave up.",
        ],
        answer: "Concave up.",
      },
    ],
    pitfalls: [
      "Confusing concavity with increasing/decreasing — they are independent.",
      "Calling a function decreasing because the graph is below the x-axis. Sign of the output is not the same as direction of change.",
    ],
    vocab: ["function", "increasing", "decreasing", "concavity", "inflection-point"],
    graph: { expressions: ["x^3 - 3*x"], xMin: -3, xMax: 3, yMin: -6, yMax: 6 },
  },

  {
    id: "1.2",
    unit: 1,
    title: "Rates of Change",
    suggestedPeriods: 1,
    skills: ["1.A", "1.B", "2.A"],
    summary:
      "The average rate of change of $f$ on $[a,b]$ is the slope of the line connecting $(a,f(a))$ and $(b,f(b))$. This is the most reliable measure of how a function changes across an interval.",
    learningObjectives: [
      { id: "1.2.A", text: "Compute the average rate of change of a function over an interval." },
      { id: "1.2.B", text: "Interpret the rate of change with appropriate units." },
    ],
    essentialKnowledge: [
      { id: "1.2.A.1", text: "The average rate of change of f on the interval [a, b] equals (f(b) − f(a)) / (b − a)." },
      { id: "1.2.A.2", text: "Geometrically, the average rate of change is the slope of the secant line joining the endpoints of the graph on that interval." },
      { id: "1.2.B.1", text: "Average rates of change carry the units of the output divided by the units of the input." },
    ],
    workedExamples: [
      {
        prompt: "Find the average rate of change of $f(x) = x^2 + 1$ on $[1, 4]$.",
        steps: [
          "$f(1) = 2$, $f(4) = 17$.",
          "$\\frac{f(4) - f(1)}{4 - 1} = \\frac{17 - 2}{3}$.",
        ],
        answer: "$5$ per unit of $x$.",
      },
      {
        prompt: "A car's distance $d(t)$ in miles is recorded at $t=1$ hour ($d=40$) and $t=4$ hours ($d=205$). What is the car's average speed?",
        steps: [
          "Average speed is the average rate of change of $d$ over $[1,4]$.",
          "$\\frac{205 - 40}{4 - 1} = \\frac{165}{3}$.",
        ],
        answer: "$55$ miles per hour.",
      },
    ],
    pitfalls: [
      "Dropping the minus sign in $f(b) - f(a)$ when $a$ is negative.",
      "Forgetting that average rate of change is not the same as the value of the function at the midpoint.",
    ],
    vocab: ["average-rate-of-change", "secant-line", "slope"],
    graph: { expressions: ["x^2 + 1"], xMin: -1, xMax: 6, yMin: -2, yMax: 20 },
  },

  {
    id: "1.3",
    unit: 1,
    title: "Rates of Change in Linear and Quadratic Functions",
    suggestedPeriods: 1,
    skills: ["1.A", "2.A", "3.A"],
    summary:
      "Linear functions have a constant rate of change. Quadratic functions do not — but the rate of change of a quadratic is itself linear, which is why second differences are constant on equally spaced inputs.",
    learningObjectives: [
      { id: "1.3.A", text: "Recognize that a linear function has a constant rate of change, while a quadratic does not." },
      { id: "1.3.B", text: "Use first and second differences to identify whether a table is linear, quadratic, or neither." },
    ],
    essentialKnowledge: [
      { id: "1.3.A.1", text: "A function is linear if and only if its rate of change is constant over every interval." },
      { id: "1.3.A.2", text: "For a quadratic function, the rate of change changes linearly with x." },
      { id: "1.3.B.1", text: "If inputs are equally spaced and first differences in output are constant, the data is linear; if second differences are constant, the data is quadratic." },
    ],
    workedExamples: [
      {
        prompt: "Decide whether the table is linear, quadratic, or neither: $x = 0,1,2,3$, $y = 1, 4, 9, 16$.",
        steps: [
          "First differences: $3, 5, 7$ — not constant, so not linear.",
          "Second differences: $2, 2$ — constant, so quadratic.",
        ],
        answer: "Quadratic.",
      },
      {
        prompt: "A linear function $L$ satisfies $L(2) = 5$ and $L(6) = 17$. Write a formula for $L$.",
        steps: [
          "Slope $= (17 - 5)/(6 - 2) = 3$.",
          "Use point-slope: $L(x) - 5 = 3(x - 2)$.",
        ],
        answer: "$L(x) = 3x - 1$.",
      },
    ],
    pitfalls: [
      "Reading constant second differences as constant rate of change.",
      "Assuming any growing table is linear without checking differences.",
    ],
    vocab: ["linear-function", "quadratic-function", "first-difference", "second-difference"],
    graph: { expressions: ["x", "x^2"], xMin: -4, xMax: 4, yMin: -2, yMax: 16 },
  },

  {
    id: "1.4",
    unit: 1,
    title: "Polynomial Functions and Rates of Change",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A", "3.A"],
    summary:
      "A polynomial of degree $n$ has at most $n-1$ turning points. Between turning points the function is monotonic; at each turning point the rate of change changes sign.",
    learningObjectives: [
      { id: "1.4.A", text: "Describe the rate of change behavior of polynomial functions." },
      { id: "1.4.B", text: "Identify local and global extrema from a graph or expression." },
    ],
    essentialKnowledge: [
      { id: "1.4.A.1", text: "A polynomial of degree n has at most n − 1 local extrema and at most n − 2 inflection points." },
      { id: "1.4.A.2", text: "Between consecutive extrema a polynomial is either increasing or decreasing." },
      { id: "1.4.B.1", text: "A local maximum is a point where the function changes from increasing to decreasing; a local minimum, the reverse." },
      { id: "1.4.B.2", text: "A global extremum is the largest or smallest output value the function attains on its domain." },
    ],
    workedExamples: [
      {
        prompt: "How many turning points can $f(x) = x^5 - 4x^3 + x$ have at most?",
        steps: [
          "Degree of $f$ is 5.",
          "Maximum number of turning points is degree − 1.",
        ],
        answer: "At most 4 turning points.",
      },
      {
        prompt: "From the graph of $f(x) = -(x-1)^2(x+2)$, identify local extrema.",
        steps: [
          "Zeros: $x = 1$ (double) and $x = -2$.",
          "Sign analysis shows $f$ rises, hits a local max, falls, touches $x = 1$, and continues down.",
        ],
        answer: "Local maximum between $x=-2$ and $x=1$; touches and bounces at $x=1$.",
      },
    ],
    pitfalls: [
      "Confusing 'turning point' (where direction changes) with 'inflection point' (where concavity changes).",
      "Missing that even-degree polynomials need not have a global max but odd-degree polynomials never do.",
    ],
    vocab: ["polynomial", "local-extremum", "global-extremum", "turning-point"],
    graph: { expressions: ["-(x-1)^2*(x+2)"], xMin: -4, xMax: 4, yMin: -10, yMax: 10 },
  },

  {
    id: "1.5",
    unit: 1,
    title: "Polynomial Functions and Complex Zeros",
    suggestedPeriods: 1,
    skills: ["1.A", "1.B"],
    summary:
      "By the Fundamental Theorem of Algebra, a polynomial of degree $n$ has exactly $n$ complex zeros (counting multiplicity). Real coefficients force complex zeros to occur in conjugate pairs.",
    learningObjectives: [
      { id: "1.5.A", text: "Determine the real and non-real zeros of a polynomial." },
      { id: "1.5.B", text: "Use multiplicity to predict the shape of the graph at a zero." },
    ],
    essentialKnowledge: [
      { id: "1.5.A.1", text: "A polynomial of degree n has exactly n zeros in the complex numbers, counting multiplicity." },
      { id: "1.5.A.2", text: "If a polynomial has real coefficients, non-real zeros occur in complex conjugate pairs." },
      { id: "1.5.B.1", text: "A zero of even multiplicity touches the x-axis without crossing; a zero of odd multiplicity crosses." },
      { id: "1.5.B.2", text: "Higher multiplicity flattens the graph near the zero." },
    ],
    workedExamples: [
      {
        prompt: "Find all zeros of $p(x) = x^3 - x^2 + 4x - 4$.",
        steps: [
          "Group: $x^2(x-1) + 4(x-1) = (x-1)(x^2 + 4)$.",
          "$x - 1 = 0 \\Rightarrow x = 1$.",
          "$x^2 + 4 = 0 \\Rightarrow x = \\pm 2i$.",
        ],
        answer: "$x = 1,\\ \\pm 2i$.",
      },
      {
        prompt: "If $p(x)$ has real coefficients, degree 4, and zeros $2$ and $3 + i$, what are the other zeros?",
        steps: [
          "Real coefficients force complex zeros in conjugate pairs.",
          "Conjugate of $3 + i$ is $3 - i$.",
          "Degree 4 with three zeros listed leaves one more.",
          "But $\\{2, 3+i, 3-i\\}$ are 3 zeros, so the 4th must be real.",
        ],
        answer: "The fourth zero is real and must be supplied by another condition; the complex pair is $3 \\pm i$.",
      },
    ],
    pitfalls: [
      "Forgetting the conjugate pair rule and reporting an odd number of non-real zeros.",
      "Treating multiplicity as if it created extra distinct zeros.",
    ],
    vocab: ["complex-zero", "multiplicity", "conjugate-pair", "fundamental-theorem-of-algebra"],
    graph: { expressions: ["x^3 - x^2 + 4*x - 4"], xMin: -3, xMax: 4, yMin: -10, yMax: 20 },
  },

  {
    id: "1.6",
    unit: 1,
    title: "Polynomial Functions and End Behavior",
    suggestedPeriods: 1,
    skills: ["2.A", "3.A"],
    summary:
      "The end behavior of a polynomial is governed entirely by the leading term. The degree decides whether both ends head the same way; the sign of the leading coefficient decides which way.",
    learningObjectives: [
      { id: "1.6.A", text: "Predict the end behavior of a polynomial from its leading term." },
      { id: "1.6.B", text: "Use limit notation to record end behavior." },
    ],
    essentialKnowledge: [
      { id: "1.6.A.1", text: "For large |x|, a polynomial behaves like its leading term ax^n." },
      { id: "1.6.A.2", text: "If n is even and a > 0, both ends rise; if n is even and a < 0, both ends fall." },
      { id: "1.6.A.3", text: "If n is odd and a > 0, the right end rises and the left end falls; if a < 0, the reverse." },
      { id: "1.6.B.1", text: "End behavior can be recorded with limit notation, for example lim_{x→∞} f(x) = ∞." },
    ],
    workedExamples: [
      {
        prompt: "Describe the end behavior of $f(x) = -2x^4 + 3x - 7$.",
        steps: [
          "Leading term is $-2x^4$, degree 4 (even), coefficient negative.",
          "Even degree + negative leading coefficient ⇒ both ends fall.",
        ],
        answer: "$f(x) \\to -\\infty$ as $x \\to \\pm\\infty$.",
      },
      {
        prompt: "Write end behavior of $g(x) = 5x^3 - x$ in limit notation.",
        steps: [
          "Odd degree, positive leading coefficient.",
          "Right end up, left end down.",
        ],
        answer: "$\\lim_{x\\to\\infty} g(x) = \\infty$, $\\lim_{x\\to -\\infty} g(x) = -\\infty$.",
      },
    ],
    pitfalls: [
      "Letting middle terms confuse the end-behavior answer — only the leading term matters.",
      "Mixing up sign conventions for $\\lim_{x\\to -\\infty}$ on odd-degree functions.",
    ],
    vocab: ["end-behavior", "leading-term", "degree"],
    graph: { expressions: ["-2*x^4 + 3*x - 7", "5*x^3 - x"], xMin: -3, xMax: 3, yMin: -50, yMax: 30 },
  },

  {
    id: "1.7",
    unit: 1,
    title: "Rational Functions and End Behavior",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A"],
    summary:
      "For a rational function, end behavior is decided by comparing the degrees of the numerator and denominator. Three cases — numerator smaller, equal, or bigger — give horizontal asymptotes, slant asymptotes, or none.",
    learningObjectives: [
      { id: "1.7.A", text: "Determine horizontal and slant asymptotes for rational functions." },
      { id: "1.7.B", text: "Describe end behavior using limit notation." },
    ],
    essentialKnowledge: [
      { id: "1.7.A.1", text: "If deg(numerator) < deg(denominator), the horizontal asymptote is y = 0." },
      { id: "1.7.A.2", text: "If the degrees are equal, the horizontal asymptote is y = (ratio of leading coefficients)." },
      { id: "1.7.A.3", text: "If deg(numerator) = deg(denominator) + 1, there is a slant asymptote found by polynomial long division." },
      { id: "1.7.B.1", text: "When |x| is large, a rational function is approximated by the quotient of leading terms." },
    ],
    workedExamples: [
      {
        prompt: "Find the horizontal or slant asymptote of $f(x) = \\frac{2x^2 + 3}{x^2 - 1}$.",
        steps: [
          "Degrees of numerator and denominator are both 2.",
          "Ratio of leading coefficients is $2/1$.",
        ],
        answer: "$y = 2$.",
      },
      {
        prompt: "Find the slant asymptote of $g(x) = \\frac{x^2 + 1}{x - 2}$.",
        steps: [
          "Long division: $x^2 + 1 = (x - 2)(x + 2) + 5$.",
          "Quotient is $x + 2$, remainder $5$.",
        ],
        answer: "$y = x + 2$.",
      },
    ],
    pitfalls: [
      "Reporting a horizontal asymptote when degrees differ by more than 0.",
      "Forgetting that a slant asymptote requires the numerator's degree to be exactly one more than the denominator's.",
    ],
    vocab: ["rational-function", "horizontal-asymptote", "slant-asymptote", "end-behavior"],
    graph: { expressions: ["(2*x^2 + 3) / (x^2 - 1)"], xMin: -6, xMax: 6, yMin: -10, yMax: 10 },
  },

  {
    id: "1.8",
    unit: 1,
    title: "Rational Functions and Zeros",
    suggestedPeriods: 1,
    skills: ["1.A", "2.A"],
    summary:
      "A rational function is zero exactly where its numerator is zero — but only at inputs where the denominator is non-zero. Shared factors hide zeros (they become holes instead).",
    learningObjectives: [
      { id: "1.8.A", text: "Find the zeros of a rational function." },
    ],
    essentialKnowledge: [
      { id: "1.8.A.1", text: "A rational function r(x) = p(x)/q(x) has a zero at x = a if and only if p(a) = 0 and q(a) ≠ 0." },
      { id: "1.8.A.2", text: "Values where both p(a) = 0 and q(a) = 0 must be examined separately; they may produce holes." },
    ],
    workedExamples: [
      {
        prompt: "Find the zeros of $r(x) = \\frac{x^2 - 4}{x + 1}$.",
        steps: [
          "Numerator: $x^2 - 4 = (x-2)(x+2)$, zeros at $x = \\pm 2$.",
          "Denominator at those inputs: $x+1$ gives $3$ and $-1$, both non-zero.",
        ],
        answer: "Zeros at $x = 2$ and $x = -2$.",
      },
      {
        prompt: "Find the zeros of $r(x) = \\frac{x^2 - 1}{x - 1}$.",
        steps: [
          "Numerator factors as $(x-1)(x+1)$.",
          "$x = 1$ also zeros the denominator — that's a hole, not a zero.",
        ],
        answer: "Only $x = -1$ is a zero.",
      },
    ],
    pitfalls: [
      "Calling shared zeros 'real' zeros — they become holes.",
      "Forgetting to check that a candidate zero is in the domain.",
    ],
    vocab: ["rational-function", "zero", "hole"],
    graph: { expressions: ["(x^2 - 4)/(x + 1)"], xMin: -6, xMax: 6, yMin: -10, yMax: 10 },
  },

  {
    id: "1.9",
    unit: 1,
    title: "Rational Functions and Vertical Asymptotes",
    suggestedPeriods: 1,
    skills: ["1.A", "2.A"],
    summary:
      "A vertical asymptote of a rational function lives at any input where the denominator equals zero but the numerator does not. Approaching from each side, output values blow up to $+\\infty$ or $-\\infty$.",
    learningObjectives: [
      { id: "1.9.A", text: "Identify vertical asymptotes of rational functions." },
    ],
    essentialKnowledge: [
      { id: "1.9.A.1", text: "A vertical asymptote of r(x) = p(x)/q(x) occurs at x = a when q(a) = 0 and p(a) ≠ 0." },
      { id: "1.9.A.2", text: "Near a vertical asymptote, function values approach +∞ or −∞ depending on the sign of the function on each side." },
    ],
    workedExamples: [
      {
        prompt: "Find the vertical asymptotes of $r(x) = \\frac{x + 2}{x^2 - 9}$.",
        steps: [
          "Denominator: $x^2 - 9 = (x-3)(x+3)$, zeros at $x = \\pm 3$.",
          "Numerator at $\\pm 3$ is non-zero.",
        ],
        answer: "Vertical asymptotes at $x = 3$ and $x = -3$.",
      },
      {
        prompt: "Describe behavior of $r(x) = \\frac{1}{x - 4}$ near $x = 4$.",
        steps: [
          "Approaching $x = 4$ from the right, $x - 4$ is a small positive number → $r$ goes to $+\\infty$.",
          "Approaching from the left, $x - 4$ is a small negative number → $r$ goes to $-\\infty$.",
        ],
        answer: "$\\lim_{x\\to 4^+} r(x) = \\infty$, $\\lim_{x\\to 4^-} r(x) = -\\infty$.",
      },
    ],
    pitfalls: [
      "Declaring every denominator zero a vertical asymptote — if the numerator is also zero, check for a hole first.",
      "Reporting the same one-sided limit on both sides.",
    ],
    vocab: ["vertical-asymptote", "one-sided-limit"],
    graph: { expressions: ["(x + 2)/(x^2 - 9)"], xMin: -6, xMax: 6, yMin: -10, yMax: 10 },
  },

  {
    id: "1.10",
    unit: 1,
    title: "Rational Functions and Holes",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A"],
    summary:
      "When a factor cancels between numerator and denominator, the rational function has a 'hole' (removable discontinuity) at that input — the limit exists but the function value does not.",
    learningObjectives: [
      { id: "1.10.A", text: "Identify holes in rational functions and compute their y-coordinates." },
    ],
    essentialKnowledge: [
      { id: "1.10.A.1", text: "If x − a is a common factor of numerator and denominator, the function r is undefined at x = a but its graph is otherwise smooth there — a hole." },
      { id: "1.10.A.2", text: "The y-coordinate of the hole is the value of the simplified expression evaluated at x = a." },
    ],
    workedExamples: [
      {
        prompt: "Find any holes of $r(x) = \\frac{x^2 - 4}{x - 2}$.",
        steps: [
          "Factor: $\\frac{(x-2)(x+2)}{x-2}$.",
          "Cancel: simplified expression is $x + 2$, valid except at $x = 2$.",
          "$y$-coordinate of hole: $2 + 2 = 4$.",
        ],
        answer: "Hole at $(2, 4)$.",
      },
      {
        prompt: "Distinguish hole vs. vertical asymptote for $r(x) = \\frac{(x-1)(x+3)}{(x-1)(x-2)}$.",
        steps: [
          "Common factor $(x-1)$ cancels → hole at $x = 1$.",
          "Remaining factor $(x-2)$ in the denominator → vertical asymptote at $x = 2$.",
        ],
        answer: "Hole at $x = 1$; vertical asymptote at $x = 2$.",
      },
    ],
    pitfalls: [
      "Forgetting to plug the input back into the simplified form to find the hole's height.",
      "Treating a hole as if the function is defined there — it isn't.",
    ],
    vocab: ["hole", "removable-discontinuity"],
    graph: { expressions: ["(x^2 - 4)/(x - 2)"], xMin: -4, xMax: 5, yMin: -2, yMax: 8 },
  },

  {
    id: "1.11",
    unit: 1,
    title: "Equivalent Representations of Polynomial and Rational Expressions",
    suggestedPeriods: 2,
    skills: ["1.B", "2.B"],
    summary:
      "Polynomials and rational expressions can be written in many algebraically equivalent forms. Each form reveals different features — factored shows zeros, expanded shows degree and end behavior, divided form shows asymptotes.",
    learningObjectives: [
      { id: "1.11.A", text: "Convert between factored, expanded, and divided forms of polynomial and rational expressions." },
      { id: "1.11.B", text: "Use the form that best reveals the requested feature." },
    ],
    essentialKnowledge: [
      { id: "1.11.A.1", text: "Polynomial multiplication and factoring rewrite the same function in different forms." },
      { id: "1.11.A.2", text: "Polynomial long division rewrites p(x)/q(x) as a polynomial plus a proper rational remainder." },
      { id: "1.11.B.1", text: "Factored form makes zeros obvious; standard form makes leading coefficient and degree obvious; quotient form makes slant asymptotes obvious." },
    ],
    workedExamples: [
      {
        prompt: "Rewrite $\\frac{x^3 + 1}{x + 1}$ without the rational form.",
        steps: [
          "Factor numerator: $x^3 + 1 = (x+1)(x^2 - x + 1)$.",
          "Cancel $(x+1)$ for $x \\ne -1$.",
        ],
        answer: "$x^2 - x + 1$, with a hole at $x = -1$.",
      },
      {
        prompt: "Use long division to rewrite $\\frac{2x^2 + 3x - 1}{x + 2}$.",
        steps: [
          "Divide $2x^2$ by $x$: quotient term $2x$. Multiply back: $2x \\cdot (x+2) = 2x^2 + 4x$. Subtract: $-x - 1$.",
          "Divide $-x$ by $x$: quotient term $-1$. Multiply: $-1 \\cdot (x+2) = -x - 2$. Subtract: $1$.",
        ],
        answer: "$2x - 1 + \\frac{1}{x + 2}$.",
      },
    ],
    pitfalls: [
      "Forgetting to flag any holes after canceling factors.",
      "Sign errors when subtracting during long division.",
    ],
    vocab: ["factored-form", "standard-form", "polynomial-division"],
    graph: { expressions: ["(x^3 + 1)/(x + 1)", "x^2 - x + 1"], xMin: -3, xMax: 3, yMin: -2, yMax: 10 },
  },

  {
    id: "1.12",
    unit: 1,
    title: "Transformations of Functions",
    suggestedPeriods: 2,
    skills: ["1.C", "2.B"],
    summary:
      "From a parent function $f$, transformations $a \\cdot f(b(x - h)) + k$ produce shifts, stretches, and reflections. Inside changes happen in reverse; outside changes happen as written.",
    learningObjectives: [
      { id: "1.12.A", text: "Apply vertical and horizontal shifts, stretches, and reflections to functions." },
      { id: "1.12.B", text: "Determine the equation of a transformed function from a description or graph." },
    ],
    essentialKnowledge: [
      { id: "1.12.A.1", text: "g(x) = f(x) + k shifts f vertically by k units." },
      { id: "1.12.A.2", text: "g(x) = f(x − h) shifts f horizontally by h units (right if h > 0)." },
      { id: "1.12.A.3", text: "g(x) = a · f(x) stretches vertically by a factor of |a| and reflects across the x-axis if a < 0." },
      { id: "1.12.A.4", text: "g(x) = f(bx) compresses horizontally by a factor of |b| and reflects across the y-axis if b < 0." },
    ],
    workedExamples: [
      {
        prompt: "Describe $g(x) = -2(x - 3)^2 + 5$ as a transformation of $f(x) = x^2$.",
        steps: [
          "Inside: $x - 3$ → shift right by 3.",
          "Coefficient: $-2$ → vertical stretch by 2 and reflect across the x-axis.",
          "Outside: $+5$ → shift up by 5.",
        ],
        answer: "Shift right 3, stretch by 2, reflect over x-axis, shift up 5.",
      },
      {
        prompt: "If $f(2) = 7$, find $g(2)$ for $g(x) = -3 f(x - 1) + 4$.",
        steps: [
          "We need $f(x - 1)$ at $x = 2$, which is $f(1)$ — but that wasn't given. So instead, work with the rule that needs $x - 1 = 2$, i.e., $x = 3$.",
          "$g(3) = -3 f(2) + 4 = -3(7) + 4$.",
        ],
        answer: "$g(3) = -17$.",
      },
    ],
    pitfalls: [
      "Reversing the direction of horizontal shifts — $x - h$ shifts right, not left.",
      "Applying horizontal stretches with the coefficient as written rather than its reciprocal.",
    ],
    vocab: ["transformation", "shift", "stretch", "reflection", "parent-function"],
    graph: { expressions: ["x^2", "-2*(x - 3)^2 + 5"], xMin: -2, xMax: 7, yMin: -8, yMax: 12 },
  },

  {
    id: "1.13",
    unit: 1,
    title: "Function Model Selection and Assumption Articulation",
    suggestedPeriods: 1,
    skills: ["3.A", "3.C"],
    summary:
      "Choosing a function model means noticing whether change is constant, polynomial, exponential, or periodic — and being explicit about assumptions and limitations.",
    learningObjectives: [
      { id: "1.13.A", text: "Pick a function family that matches the behavior of a real-world context." },
      { id: "1.13.B", text: "Articulate assumptions and the domain over which the model is valid." },
    ],
    essentialKnowledge: [
      { id: "1.13.A.1", text: "Linear models are appropriate when the rate of change is constant." },
      { id: "1.13.A.2", text: "Polynomial models suit contexts with bounded extrema and end behavior controlled by powers." },
      { id: "1.13.A.3", text: "Rational models suit contexts with asymptotic behavior, including saturation and resource constraints." },
      { id: "1.13.B.1", text: "Every model has a domain of validity beyond which predictions are unreliable." },
    ],
    workedExamples: [
      {
        prompt: "Population growth that approaches a carrying capacity — what model fits?",
        steps: [
          "Approaches a limit but is not exponential forever → involves a horizontal asymptote.",
          "Rational (or logistic) function captures saturation.",
        ],
        answer: "A rational or logistic model.",
      },
      {
        prompt: "Stretch of a metal spring vs. force applied (within elastic limit).",
        steps: [
          "Within elastic limit, Hooke's law gives proportional response.",
          "Constant rate of change ⇒ linear model.",
        ],
        answer: "Linear model.",
      },
    ],
    pitfalls: [
      "Using a polynomial model for unbounded growth contexts where exponential is the better fit.",
      "Forgetting to state the input domain on which the model makes sense.",
    ],
    vocab: ["model", "domain", "assumption"],
  },

  {
    id: "1.14",
    unit: 1,
    title: "Function Model Construction and Application",
    suggestedPeriods: 2,
    skills: ["1.C", "3.B", "3.C"],
    summary:
      "Once a function family is chosen, the model is constructed by fitting parameters to known information — initial value, rate, endpoints, asymptotes — and used to answer context questions.",
    learningObjectives: [
      { id: "1.14.A", text: "Construct a polynomial or rational model from given conditions." },
      { id: "1.14.B", text: "Use the model to answer questions in the original context." },
    ],
    essentialKnowledge: [
      { id: "1.14.A.1", text: "Model parameters are chosen so that the function matches specified inputs, outputs, asymptotes, and extrema." },
      { id: "1.14.B.1", text: "Model outputs should be interpreted in the units of the context." },
      { id: "1.14.B.2", text: "Predictions outside the data range are extrapolations and may not be reliable." },
    ],
    workedExamples: [
      {
        prompt: "A box has a square base of side $x$ and an open top, with a fixed volume of 32. Express the surface area as a function of $x$.",
        steps: [
          "Volume condition: $x^2 h = 32 \\Rightarrow h = 32/x^2$.",
          "Open-top surface area: $x^2 + 4xh$.",
          "Substitute: $A(x) = x^2 + 4x \\cdot \\frac{32}{x^2} = x^2 + \\frac{128}{x}$.",
        ],
        answer: "$A(x) = x^2 + \\dfrac{128}{x}$.",
      },
      {
        prompt: "If the average cost per item is $\\bar C(x) = \\frac{2000}{x} + 5$, what does $\\bar C$ approach as $x$ grows?",
        steps: [
          "$2000/x \\to 0$ as $x \\to \\infty$.",
        ],
        answer: "Approaches $5$ — interpreted as the long-run marginal cost per item.",
      },
    ],
    pitfalls: [
      "Building a model in the wrong units (e.g., minutes vs. hours).",
      "Extrapolating well outside where data was collected and trusting the answer.",
    ],
    vocab: ["model", "extrapolation", "parameter"],
  },

  // -------------------------------------------------------------------------
  // UNIT 2 — Exponential and Logarithmic Functions
  // -------------------------------------------------------------------------

  {
    id: "2.1",
    unit: 2,
    title: "Change in Arithmetic and Geometric Sequences",
    suggestedPeriods: 1,
    skills: ["1.A", "2.A"],
    summary:
      "Arithmetic sequences add a constant difference; geometric sequences multiply by a constant ratio. Both can be modeled with closed-form expressions, but they grow very differently.",
    learningObjectives: [
      { id: "2.1.A", text: "Identify arithmetic and geometric sequences from a list of terms or a recursive rule." },
      { id: "2.1.B", text: "Find closed-form formulas for arithmetic and geometric sequences." },
    ],
    essentialKnowledge: [
      { id: "2.1.A.1", text: "An arithmetic sequence has a constant common difference d between successive terms." },
      { id: "2.1.A.2", text: "A geometric sequence has a constant common ratio r between successive terms." },
      { id: "2.1.B.1", text: "Arithmetic closed-form: a_n = a_1 + (n − 1)d." },
      { id: "2.1.B.2", text: "Geometric closed-form: a_n = a_1 · r^{n−1}." },
    ],
    workedExamples: [
      {
        prompt: "Find the 10th term of the arithmetic sequence $3, 7, 11, \\ldots$.",
        steps: [
          "$a_1 = 3$, $d = 4$.",
          "$a_{10} = 3 + 9 \\cdot 4$.",
        ],
        answer: "$a_{10} = 39$.",
      },
      {
        prompt: "Find a closed form for the geometric sequence $a_1 = 5$, $r = 1/2$.",
        steps: [
          "$a_n = 5 \\cdot (1/2)^{n-1}$.",
        ],
        answer: "$a_n = 5 \\cdot (1/2)^{n-1}$.",
      },
    ],
    pitfalls: [
      "Confusing additive growth (arithmetic) with multiplicative growth (geometric).",
      "Using $r^n$ instead of $r^{n-1}$ in the closed form.",
    ],
    vocab: ["sequence", "arithmetic-sequence", "geometric-sequence", "common-difference", "common-ratio"],
  },

  {
    id: "2.2",
    unit: 2,
    title: "Change in Linear and Exponential Functions",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A", "3.A"],
    summary:
      "Linear functions change by equal differences over equal intervals; exponential functions change by equal ratios over equal intervals. That distinction is the heart of choosing between the two.",
    learningObjectives: [
      { id: "2.2.A", text: "Distinguish linear and exponential change by inspecting equal-interval tables." },
      { id: "2.2.B", text: "Translate between continuous and discrete forms of these models." },
    ],
    essentialKnowledge: [
      { id: "2.2.A.1", text: "Over equally spaced inputs, linear outputs differ by a constant; exponential outputs differ by a constant ratio." },
      { id: "2.2.A.2", text: "The continuous version of an arithmetic sequence is a linear function; of a geometric sequence, an exponential function." },
    ],
    workedExamples: [
      {
        prompt: "Table: $x = 0,1,2,3$, $y = 4, 6, 9, 13.5$. Linear or exponential?",
        steps: [
          "Differences: $2, 3, 4.5$ — not constant.",
          "Ratios: $6/4 = 1.5$, $9/6 = 1.5$, $13.5/9 = 1.5$ — constant.",
        ],
        answer: "Exponential with ratio $1.5$.",
      },
      {
        prompt: "Convert the arithmetic sequence $a_n = 5 + 3n$ to a linear function in continuous $t$.",
        steps: [
          "Replace $n$ with $t$: $f(t) = 5 + 3t$.",
        ],
        answer: "$f(t) = 5 + 3t$.",
      },
    ],
    pitfalls: [
      "Checking differences for an exponential pattern — you need ratios.",
      "Assuming a smooth-looking curve is exponential without checking ratios.",
    ],
    vocab: ["linear-function", "exponential-function", "common-ratio"],
  },

  {
    id: "2.3",
    unit: 2,
    title: "Exponential Functions",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A"],
    summary:
      "An exponential function has the form $f(x) = a \\cdot b^x$ with $a \\ne 0$, $b > 0$, and $b \\ne 1$. The base $b$ determines growth ($b > 1$) or decay ($0 < b < 1$).",
    learningObjectives: [
      { id: "2.3.A", text: "Identify exponential functions and their key features." },
      { id: "2.3.B", text: "Interpret the parameters a and b in the model." },
    ],
    essentialKnowledge: [
      { id: "2.3.A.1", text: "An exponential function has constant percentage change rather than constant additive change." },
      { id: "2.3.A.2", text: "The y-intercept of f(x) = a · b^x is a." },
      { id: "2.3.B.1", text: "If b > 1, f increases; if 0 < b < 1, f decreases. The closer b is to 1, the gentler the curve." },
    ],
    workedExamples: [
      {
        prompt: "An exponential function passes through $(0, 8)$ and $(2, 18)$. Find $f$.",
        steps: [
          "$a = 8$ from the y-intercept.",
          "$f(2) = 8 b^2 = 18 \\Rightarrow b^2 = 9/4 \\Rightarrow b = 3/2$ (taking positive root).",
        ],
        answer: "$f(x) = 8 (3/2)^x$.",
      },
      {
        prompt: "Is $g(x) = 5(0.7)^x$ growth or decay?",
        steps: [
          "Base $0.7 < 1$, so values shrink as $x$ increases.",
        ],
        answer: "Exponential decay.",
      },
    ],
    pitfalls: [
      "Allowing base $b = 1$ — the function would be constant, not exponential.",
      "Treating negative $a$ as if it changed growth/decay direction.",
    ],
    vocab: ["exponential-function", "growth", "decay", "base"],
    graph: { expressions: ["8 * (3/2)^x", "5 * 0.7^x"], xMin: -4, xMax: 4, yMin: -2, yMax: 30 },
  },

  {
    id: "2.4",
    unit: 2,
    title: "Exponential Function Manipulation",
    suggestedPeriods: 1,
    skills: ["1.B"],
    summary:
      "Properties of exponents let you rewrite exponential expressions to reveal different features. Common moves include factoring out a base, switching the base, or expressing time in different units.",
    learningObjectives: [
      { id: "2.4.A", text: "Apply exponent rules to rewrite exponential expressions in useful forms." },
    ],
    essentialKnowledge: [
      { id: "2.4.A.1", text: "b^{m+n} = b^m · b^n, b^{mn} = (b^m)^n, and (bc)^n = b^n · c^n." },
      { id: "2.4.A.2", text: "An exponential function with a different base can be rewritten: b^x = (c)^{x · log_c b}." },
      { id: "2.4.A.3", text: "Rewriting f(t) = 100 · 2^{t/3} as 100 · (2^{1/3})^t exposes the per-unit growth factor." },
    ],
    workedExamples: [
      {
        prompt: "Rewrite $f(t) = 100 \\cdot 2^{t/3}$ in the form $a \\cdot b^t$.",
        steps: [
          "$b = 2^{1/3} \\approx 1.2599$.",
        ],
        answer: "$f(t) \\approx 100 \\cdot 1.2599^t$.",
      },
      {
        prompt: "Express $\\frac{4^{x}}{8^{x-1}}$ as a single exponential expression.",
        steps: [
          "$4^x = 2^{2x}$, $8^{x-1} = 2^{3(x-1)}$.",
          "Ratio: $2^{2x - 3(x-1)} = 2^{2x - 3x + 3} = 2^{3 - x}$.",
        ],
        answer: "$2^{3 - x}$.",
      },
    ],
    pitfalls: [
      "Mishandling fractional exponents when changing bases.",
      "Distributing exponents over sums — that's not allowed: $(a+b)^n \\ne a^n + b^n$.",
    ],
    vocab: ["exponent-rules", "base", "exponential-form"],
  },

  {
    id: "2.5",
    unit: 2,
    title: "Exponential Function Context and Data Modeling",
    suggestedPeriods: 2,
    skills: ["1.C", "3.B"],
    summary:
      "Exponential models capture growth or decay at a constant percent rate. Doubling time and half-life are useful shortcuts for translating between rates and durations.",
    learningObjectives: [
      { id: "2.5.A", text: "Fit an exponential model to a context or data." },
      { id: "2.5.B", text: "Convert between rate, doubling time, and half-life." },
    ],
    essentialKnowledge: [
      { id: "2.5.A.1", text: "An exponential growth/decay model has the form a · b^t or a · e^{kt} for some constants." },
      { id: "2.5.B.1", text: "Doubling time T_d satisfies b^{T_d} = 2; half-life T_{1/2} satisfies b^{T_{1/2}} = 1/2." },
      { id: "2.5.B.2", text: "Continuous rate k and per-unit base b are related by b = e^k." },
    ],
    workedExamples: [
      {
        prompt: "A bacterial colony doubles every 4 hours. Express its size $N(t)$ if $N(0) = 200$.",
        steps: [
          "Doubling time 4 ⇒ $N(t) = 200 \\cdot 2^{t/4}$.",
        ],
        answer: "$N(t) = 200 \\cdot 2^{t/4}$.",
      },
      {
        prompt: "A drug has a half-life of 6 hours; the patient starts with 80 mg. Find a model.",
        steps: [
          "Half-life form: $A(t) = 80 \\cdot (1/2)^{t/6}$.",
        ],
        answer: "$A(t) = 80 \\cdot (1/2)^{t/6}$.",
      },
    ],
    pitfalls: [
      "Mixing units (rate per minute with time in hours).",
      "Confusing per-period base $b$ with continuous rate $k$.",
    ],
    vocab: ["growth", "decay", "doubling-time", "half-life", "continuous-rate"],
    graph: { expressions: ["200 * 2^(x/4)", "80 * 0.5^(x/6)"], xMin: 0, xMax: 24, yMin: 0, yMax: 1600 },
  },

  {
    id: "2.6",
    unit: 2,
    title: "Competing Function Model Validation",
    suggestedPeriods: 1,
    skills: ["3.A", "3.C"],
    summary:
      "When several function families could fit the data, residuals — the differences between observed and predicted values — are the tiebreaker. Patterns in residuals suggest the wrong model; randomness suggests the model captures the structure.",
    learningObjectives: [
      { id: "2.6.A", text: "Compare candidate models using residuals." },
    ],
    essentialKnowledge: [
      { id: "2.6.A.1", text: "A residual at x is the observed value minus the predicted value, y − f(x)." },
      { id: "2.6.A.2", text: "If residuals show a curved pattern, the model is missing curvature and likely needs a different family." },
      { id: "2.6.A.3", text: "Random scatter of residuals around zero suggests an appropriate model." },
    ],
    workedExamples: [
      {
        prompt: "A linear model produces residuals that form a clear U-shape across the data. What does that suggest?",
        steps: [
          "U-shape in residuals reveals systematic curvature.",
          "A polynomial (quadratic) or other curved family fits better.",
        ],
        answer: "Use a curved model — likely quadratic.",
      },
      {
        prompt: "Compare predictions: at $x = 5$, model A gives $7.2$ and the data shows $7.5$; model B gives $8.0$. Which has the smaller residual magnitude?",
        steps: [
          "$|7.5 - 7.2| = 0.3$.",
          "$|7.5 - 8.0| = 0.5$.",
        ],
        answer: "Model A.",
      },
    ],
    pitfalls: [
      "Judging model fit by a single residual instead of a pattern across residuals.",
      "Comparing residuals from different units or scales.",
    ],
    vocab: ["residual", "model-fit"],
  },

  {
    id: "2.7",
    unit: 2,
    title: "Composition of Functions",
    suggestedPeriods: 1,
    skills: ["1.C", "2.B"],
    summary:
      "Composition $(f \\circ g)(x) = f(g(x))$ chains two functions together. The output of $g$ becomes the input of $f$; the domain of the composition must respect both functions.",
    learningObjectives: [
      { id: "2.7.A", text: "Evaluate compositions and determine their domains." },
      { id: "2.7.B", text: "Decompose a function into simpler component functions." },
    ],
    essentialKnowledge: [
      { id: "2.7.A.1", text: "(f ∘ g)(x) = f(g(x))." },
      { id: "2.7.A.2", text: "The domain of f ∘ g consists of all x in the domain of g for which g(x) is in the domain of f." },
      { id: "2.7.B.1", text: "Many functions can be decomposed as compositions; the decomposition is not unique." },
    ],
    workedExamples: [
      {
        prompt: "If $f(x) = \\sqrt{x}$ and $g(x) = x - 3$, find $(f \\circ g)(x)$ and its domain.",
        steps: [
          "$(f \\circ g)(x) = \\sqrt{x - 3}$.",
          "Domain: $x - 3 \\ge 0$.",
        ],
        answer: "$(f \\circ g)(x) = \\sqrt{x - 3}$ with domain $x \\ge 3$.",
      },
      {
        prompt: "Decompose $h(x) = (3x + 1)^4$ into $f(g(x))$.",
        steps: [
          "Pick $g(x) = 3x + 1$, $f(u) = u^4$.",
        ],
        answer: "$h = f \\circ g$ with $g(x) = 3x + 1$, $f(u) = u^4$.",
      },
    ],
    pitfalls: [
      "Computing $g(f(x))$ when asked for $f(g(x))$.",
      "Forgetting to restrict the domain of the composition to where $g(x)$ is allowed in $f$.",
    ],
    vocab: ["composition", "domain", "decomposition"],
  },

  {
    id: "2.8",
    unit: 2,
    title: "Inverse Functions",
    suggestedPeriods: 1,
    skills: ["1.A", "1.C", "2.B"],
    summary:
      "If $f$ is one-to-one, its inverse $f^{-1}$ undoes $f$. Algebraically, swap $x$ and $y$ and solve; graphically, reflect across the line $y = x$.",
    learningObjectives: [
      { id: "2.8.A", text: "Determine whether a function is invertible." },
      { id: "2.8.B", text: "Compute the inverse algebraically and graphically." },
    ],
    essentialKnowledge: [
      { id: "2.8.A.1", text: "A function is invertible if and only if it is one-to-one — different inputs always give different outputs." },
      { id: "2.8.A.2", text: "The graph of f^{−1} is the reflection of the graph of f across y = x." },
      { id: "2.8.B.1", text: "(f ∘ f^{−1})(x) = x for x in the range of f, and (f^{−1} ∘ f)(x) = x for x in the domain of f." },
    ],
    workedExamples: [
      {
        prompt: "Find $f^{-1}$ for $f(x) = 3x - 5$.",
        steps: [
          "Set $y = 3x - 5$ and solve for $x$: $x = (y + 5)/3$.",
          "Swap variables.",
        ],
        answer: "$f^{-1}(x) = (x + 5)/3$.",
      },
      {
        prompt: "Is $g(x) = x^2$ invertible on all of $\\mathbb{R}$?",
        steps: [
          "$g(2) = g(-2) = 4$ — not one-to-one.",
        ],
        answer: "No; restrict the domain (e.g., $x \\ge 0$) to make it invertible.",
      },
    ],
    pitfalls: [
      "Inverting a many-to-one function without restricting the domain first.",
      "Confusing $f^{-1}(x)$ with the reciprocal $1/f(x)$.",
    ],
    vocab: ["inverse-function", "one-to-one", "domain", "range"],
    graph: { expressions: ["3*x - 5", "(x + 5)/3", "x"], xMin: -6, xMax: 8, yMin: -8, yMax: 6 },
  },

  {
    id: "2.9",
    unit: 2,
    title: "Logarithmic Expressions",
    suggestedPeriods: 1,
    skills: ["1.A", "1.B"],
    summary:
      "By definition, $\\log_b(x) = y$ exactly when $b^y = x$. Logarithms answer the question: 'to what power must we raise $b$ to get $x$?'",
    learningObjectives: [
      { id: "2.9.A", text: "Convert between exponential and logarithmic forms." },
      { id: "2.9.B", text: "Evaluate logarithms using the definition." },
    ],
    essentialKnowledge: [
      { id: "2.9.A.1", text: "log_b(x) = y ⟺ b^y = x for b > 0, b ≠ 1, x > 0." },
      { id: "2.9.A.2", text: "Natural log: ln(x) = log_e(x). Common log: log(x) usually means log_{10}(x)." },
    ],
    workedExamples: [
      {
        prompt: "Evaluate $\\log_2 32$.",
        steps: [
          "Ask: $2^? = 32$.",
          "$2^5 = 32$.",
        ],
        answer: "$5$.",
      },
      {
        prompt: "Rewrite $\\log_3 81 = 4$ in exponential form.",
        steps: [
          "Definition: $b^y = x$.",
        ],
        answer: "$3^4 = 81$.",
      },
    ],
    pitfalls: [
      "Allowing $\\log_b(0)$ or $\\log_b$ of a negative number.",
      "Confusing $\\log$ (base 10) with $\\ln$ (base $e$).",
    ],
    vocab: ["logarithm", "natural-log", "common-log", "base"],
  },

  {
    id: "2.10",
    unit: 2,
    title: "Inverses of Exponential Functions",
    suggestedPeriods: 1,
    skills: ["1.C", "2.B"],
    summary:
      "Logarithms are the inverses of exponential functions. Reflecting $y = b^x$ across $y = x$ gives $y = \\log_b x$ — and the domain/range swap accordingly.",
    learningObjectives: [
      { id: "2.10.A", text: "Recognize log functions as inverses of exponential functions and use that relationship." },
    ],
    essentialKnowledge: [
      { id: "2.10.A.1", text: "If f(x) = b^x then f^{−1}(x) = log_b x." },
      { id: "2.10.A.2", text: "Domain of log_b is (0, ∞); range is all real numbers." },
    ],
    workedExamples: [
      {
        prompt: "Solve $5^x = 30$ for $x$.",
        steps: [
          "Apply $\\log_5$ to both sides: $x = \\log_5 30$.",
          "Or use change of base: $x = \\ln 30 / \\ln 5$.",
        ],
        answer: "$x = \\log_5 30 \\approx 2.113$.",
      },
      {
        prompt: "Find the inverse of $f(x) = 3 \\cdot 2^x$.",
        steps: [
          "Set $y = 3 \\cdot 2^x$, solve: $2^x = y/3$, so $x = \\log_2(y/3)$.",
          "Swap.",
        ],
        answer: "$f^{-1}(x) = \\log_2(x/3)$.",
      },
    ],
    pitfalls: [
      "Forgetting that the inverse of $a \\cdot b^x$ is $\\log_b(x/a)$, not $\\log_b(x) / a$.",
      "Confusing the original domain (all reals) with the inverse's domain (positive reals).",
    ],
    vocab: ["logarithm", "inverse-function", "exponential-function"],
    graph: { expressions: ["2^x", "log(x, 2)", "x"], xMin: -3, xMax: 6, yMin: -3, yMax: 6 },
  },

  {
    id: "2.11",
    unit: 2,
    title: "Logarithmic Functions",
    suggestedPeriods: 1,
    skills: ["2.A", "2.B"],
    summary:
      "Logarithmic functions have a vertical asymptote at $x = 0$, pass through $(1, 0)$, and grow without bound — but very slowly. The base controls how steeply they rise.",
    learningObjectives: [
      { id: "2.11.A", text: "Describe key features of logarithmic functions." },
      { id: "2.11.B", text: "Sketch transformations of log functions." },
    ],
    essentialKnowledge: [
      { id: "2.11.A.1", text: "y = log_b x has domain (0, ∞), range ℝ, vertical asymptote x = 0, and passes through (1, 0)." },
      { id: "2.11.A.2", text: "If b > 1, log_b is increasing; if 0 < b < 1, decreasing." },
      { id: "2.11.B.1", text: "Transformations of log functions follow the standard a · f(b(x − h)) + k pattern." },
    ],
    workedExamples: [
      {
        prompt: "Describe transformations of $g(x) = 2 \\ln(x - 3) + 1$.",
        steps: [
          "$x - 3$: shift right 3.",
          "Coefficient 2: vertical stretch by 2.",
          "$+1$: shift up 1.",
          "Asymptote moves with horizontal shift: $x = 3$.",
        ],
        answer: "Shift right 3, stretch by 2, shift up 1; asymptote $x = 3$.",
      },
      {
        prompt: "What is $\\log_{1/2}(8)$?",
        steps: [
          "Ask: $(1/2)^? = 8$.",
          "$(1/2)^{-3} = 8$.",
        ],
        answer: "$-3$.",
      },
    ],
    pitfalls: [
      "Ignoring that logs of base less than 1 are decreasing.",
      "Drawing the asymptote in the wrong place after a horizontal shift.",
    ],
    vocab: ["logarithm", "asymptote", "transformation"],
    graph: { expressions: ["log(x, 2)", "log(x, 10)", "log(x)"], xMin: 0.05, xMax: 10, yMin: -3, yMax: 4 },
  },

  {
    id: "2.12",
    unit: 2,
    title: "Logarithmic Function Manipulation",
    suggestedPeriods: 1,
    skills: ["1.B"],
    summary:
      "Three log laws — product, quotient, and power — let you compress or expand log expressions. Change of base lets a calculator evaluate any base.",
    learningObjectives: [
      { id: "2.12.A", text: "Apply log laws to rewrite expressions." },
      { id: "2.12.B", text: "Use change of base." },
    ],
    essentialKnowledge: [
      { id: "2.12.A.1", text: "Product: log_b(MN) = log_b M + log_b N." },
      { id: "2.12.A.2", text: "Quotient: log_b(M/N) = log_b M − log_b N." },
      { id: "2.12.A.3", text: "Power: log_b(M^k) = k · log_b M." },
      { id: "2.12.B.1", text: "Change of base: log_b x = (log_c x)/(log_c b) for any valid c." },
    ],
    workedExamples: [
      {
        prompt: "Expand $\\log_b \\left(\\dfrac{x^3 \\sqrt{y}}{z}\\right)$.",
        steps: [
          "$= \\log_b x^3 + \\log_b y^{1/2} - \\log_b z$.",
          "$= 3\\log_b x + \\tfrac{1}{2}\\log_b y - \\log_b z$.",
        ],
        answer: "$3\\log_b x + \\tfrac{1}{2}\\log_b y - \\log_b z$.",
      },
      {
        prompt: "Compute $\\log_5 87$ using natural log.",
        steps: [
          "$\\log_5 87 = \\ln 87 / \\ln 5$.",
          "$\\approx 4.4659 / 1.6094$.",
        ],
        answer: "$\\approx 2.775$.",
      },
    ],
    pitfalls: [
      "Applying a product rule across an addition: $\\log(M + N) \\ne \\log M + \\log N$.",
      "Forgetting that $\\log(M^k) = k\\log M$ holds for positive $M$.",
    ],
    vocab: ["log-laws", "change-of-base"],
  },

  {
    id: "2.13",
    unit: 2,
    title: "Exponential and Logarithmic Equations and Inequalities",
    suggestedPeriods: 2,
    skills: ["1.A", "1.B"],
    summary:
      "To solve an exponential equation, take a log of both sides; to solve a log equation, exponentiate both sides — and always check that any candidate is in the original domain.",
    learningObjectives: [
      { id: "2.13.A", text: "Solve exponential and logarithmic equations and inequalities." },
    ],
    essentialKnowledge: [
      { id: "2.13.A.1", text: "Take log of both sides of an exponential equation to bring variable exponents down." },
      { id: "2.13.A.2", text: "Exponentiate both sides of a logarithmic equation to remove the log." },
      { id: "2.13.A.3", text: "Logarithmic solutions must satisfy the domain restriction of the original expression." },
    ],
    workedExamples: [
      {
        prompt: "Solve $3^{x+1} = 50$.",
        steps: [
          "$\\ln 3^{x+1} = \\ln 50$.",
          "$(x+1)\\ln 3 = \\ln 50$.",
          "$x = \\dfrac{\\ln 50}{\\ln 3} - 1$.",
        ],
        answer: "$x \\approx 2.561$.",
      },
      {
        prompt: "Solve $\\log_2(x) + \\log_2(x - 2) = 3$.",
        steps: [
          "$\\log_2(x(x - 2)) = 3$.",
          "$x(x - 2) = 8 \\Rightarrow x^2 - 2x - 8 = 0$.",
          "$(x - 4)(x + 2) = 0 \\Rightarrow x = 4$ or $x = -2$.",
          "Reject $x = -2$ (log domain).",
        ],
        answer: "$x = 4$.",
      },
    ],
    pitfalls: [
      "Accepting a candidate solution that makes the original log undefined.",
      "Mishandling inequality direction when applying a decreasing log (base less than 1).",
    ],
    vocab: ["exponential-equation", "logarithmic-equation", "domain"],
  },

  {
    id: "2.14",
    unit: 2,
    title: "Logarithmic Function Context and Data Modeling",
    suggestedPeriods: 1,
    skills: ["1.C", "3.B"],
    summary:
      "Log models suit phenomena that grow quickly at first then slow down — sound intensity (decibels), earthquake magnitude (Richter), pH, sensory perception.",
    learningObjectives: [
      { id: "2.14.A", text: "Use logarithmic models to interpret context." },
    ],
    essentialKnowledge: [
      { id: "2.14.A.1", text: "Many real-world scales are logarithmic — each unit corresponds to a factor of 10 (or e) in the underlying quantity." },
      { id: "2.14.A.2", text: "Log models capture diminishing returns: large changes in input produce small changes in output." },
    ],
    workedExamples: [
      {
        prompt: "An earthquake of magnitude 6 vs. magnitude 4: how much stronger is the seismic wave?",
        steps: [
          "Each Richter unit is ×10.",
          "Difference of 2 → factor of $10^2 = 100$.",
        ],
        answer: "100 times.",
      },
      {
        prompt: "If $I_2 = 100 I_1$ in sound intensity, what is the decibel difference?",
        steps: [
          "dB$_2 - $dB$_1 = 10 \\log_{10}(I_2/I_1)$.",
          "$= 10 \\log_{10}(100) = 20$.",
        ],
        answer: "$20$ dB.",
      },
    ],
    pitfalls: [
      "Reading a 1-unit change on a log scale as if it were a 1-unit additive change.",
      "Confusing $\\log_{10}$ with $\\ln$ in physics formulas.",
    ],
    vocab: ["logarithmic-scale", "decibel", "richter"],
  },

  {
    id: "2.15",
    unit: 2,
    title: "Semi-log Plots",
    suggestedPeriods: 1,
    skills: ["2.B", "3.A"],
    summary:
      "On a semi-log plot, the y-axis is logarithmic and the x-axis is linear. Exponential data plotted on a semi-log plot becomes a straight line — its slope tells you the per-unit growth or decay rate.",
    learningObjectives: [
      { id: "2.15.A", text: "Interpret semi-log plots and use them to identify exponential behavior." },
    ],
    essentialKnowledge: [
      { id: "2.15.A.1", text: "Plotting log y against x linearizes exponential data y = a · b^x." },
      { id: "2.15.A.2", text: "On a semi-log plot, the slope of the resulting line equals log b; the y-intercept equals log a." },
    ],
    workedExamples: [
      {
        prompt: "A semi-log plot of population vs. time gives a straight line with slope $0.04$ when log base 10 is used. What is the underlying growth factor?",
        steps: [
          "Slope $= \\log_{10} b$.",
          "$b = 10^{0.04} \\approx 1.0965$.",
        ],
        answer: "Growth factor $\\approx 1.0965$ per unit of time.",
      },
      {
        prompt: "Why does an exponential function appear as a line on a semi-log plot?",
        steps: [
          "Take log of both sides: $\\log y = \\log a + x \\log b$.",
          "This is linear in $x$.",
        ],
        answer: "Because $\\log y$ is a linear function of $x$.",
      },
    ],
    pitfalls: [
      "Reading slope on a semi-log plot as if the y-axis were linear.",
      "Forgetting the log-base used when converting slope back to growth rate.",
    ],
    vocab: ["semi-log-plot", "linearization", "growth-factor"],
  },

  // -------------------------------------------------------------------------
  // UNIT 3 — Trigonometric and Polar Functions
  // -------------------------------------------------------------------------

  {
    id: "3.1",
    unit: 3,
    title: "Periodic Phenomena",
    suggestedPeriods: 1,
    skills: ["2.A", "3.A"],
    summary:
      "A function is periodic when its outputs repeat at regular input intervals. Period, amplitude, midline, and frequency are the four numbers that describe such repetition.",
    learningObjectives: [
      { id: "3.1.A", text: "Identify period, amplitude, midline, and frequency of a periodic function." },
    ],
    essentialKnowledge: [
      { id: "3.1.A.1", text: "Period P is the smallest positive value with f(x + P) = f(x)." },
      { id: "3.1.A.2", text: "Midline is the horizontal line halfway between max and min outputs." },
      { id: "3.1.A.3", text: "Amplitude is the distance from the midline to the maximum (or minimum)." },
      { id: "3.1.A.4", text: "Frequency is 1/P — the number of periods per unit of input." },
    ],
    workedExamples: [
      {
        prompt: "A tide reaches max 8 ft and min 2 ft, repeating every 12 hours. Find midline, amplitude, period.",
        steps: [
          "Midline $= (8 + 2)/2 = 5$ ft.",
          "Amplitude $= (8 - 2)/2 = 3$ ft.",
          "Period $= 12$ hours.",
        ],
        answer: "Midline $5$ ft, amplitude $3$ ft, period $12$ hr.",
      },
      {
        prompt: "Frequency of a wave with period $0.25$ seconds?",
        steps: [
          "Frequency $= 1/0.25$.",
        ],
        answer: "$4$ Hz.",
      },
    ],
    pitfalls: [
      "Confusing peak-to-peak range with amplitude (range is twice the amplitude).",
      "Reading the period from a phase shift instead of the underlying repetition length.",
    ],
    vocab: ["period", "amplitude", "midline", "frequency"],
  },

  {
    id: "3.2",
    unit: 3,
    title: "Sine, Cosine, and Tangent",
    suggestedPeriods: 1,
    skills: ["1.B", "2.B"],
    summary:
      "On the unit circle, $\\cos\\theta$ is the x-coordinate and $\\sin\\theta$ is the y-coordinate of the point on the circle at angle $\\theta$. Tangent is the ratio $\\sin\\theta / \\cos\\theta$.",
    learningObjectives: [
      { id: "3.2.A", text: "Define sine, cosine, and tangent via the unit circle and via right triangles." },
    ],
    essentialKnowledge: [
      { id: "3.2.A.1", text: "On the unit circle, the point at angle θ from the positive x-axis has coordinates (cos θ, sin θ)." },
      { id: "3.2.A.2", text: "In a right triangle, sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent." },
      { id: "3.2.A.3", text: "Angles can be measured in degrees or radians; one full revolution is 2π radians = 360°." },
    ],
    workedExamples: [
      {
        prompt: "Convert $135°$ to radians.",
        steps: [
          "$135° \\cdot \\dfrac{\\pi}{180°} = \\dfrac{135\\pi}{180}$.",
          "Simplify.",
        ],
        answer: "$\\dfrac{3\\pi}{4}$ rad.",
      },
      {
        prompt: "In a right triangle with legs 3 and 4 and hypotenuse 5, find $\\sin$ of the angle opposite the leg of length 3.",
        steps: [
          "$\\sin = 3/5$.",
        ],
        answer: "$3/5$.",
      },
    ],
    pitfalls: [
      "Mixing degree and radian modes when evaluating trig functions on a calculator.",
      "Calling the y-coordinate cosine instead of sine.",
    ],
    vocab: ["radian", "degree", "unit-circle", "sine", "cosine", "tangent"],
  },

  {
    id: "3.3",
    unit: 3,
    title: "Sine and Cosine Function Values",
    suggestedPeriods: 1,
    skills: ["1.A", "1.B"],
    summary:
      "Special angles — multiples of $\\pi/6$ and $\\pi/4$ — have exact sine and cosine values. Reference angles let you find sine and cosine in any quadrant using these special values.",
    learningObjectives: [
      { id: "3.3.A", text: "Compute exact sine and cosine values at special angles using the unit circle." },
    ],
    essentialKnowledge: [
      { id: "3.3.A.1", text: "Memorize the unit circle values at multiples of π/6 and π/4." },
      { id: "3.3.A.2", text: "A reference angle is the acute angle between the terminal ray and the x-axis." },
      { id: "3.3.A.3", text: "Sign of sine and cosine is determined by the quadrant of the terminal ray." },
    ],
    workedExamples: [
      {
        prompt: "Find $\\cos(5\\pi/6)$.",
        steps: [
          "Quadrant II. Reference angle $\\pi/6$.",
          "Cosine is negative in Q II.",
          "$\\cos(\\pi/6) = \\sqrt{3}/2$, so $\\cos(5\\pi/6) = -\\sqrt{3}/2$.",
        ],
        answer: "$-\\sqrt{3}/2$.",
      },
      {
        prompt: "Find $\\sin(-\\pi/4)$.",
        steps: [
          "Quadrant IV (negative angle, below x-axis). Reference $\\pi/4$.",
          "Sine is negative in Q IV.",
        ],
        answer: "$-\\sqrt{2}/2$.",
      },
    ],
    pitfalls: [
      "Forgetting the sign rule when the angle is not in the first quadrant.",
      "Mistakenly using degree special angles when the problem is in radians.",
    ],
    vocab: ["special-angle", "reference-angle", "quadrant"],
  },

  {
    id: "3.4",
    unit: 3,
    title: "Sine and Cosine Function Graphs",
    suggestedPeriods: 1,
    skills: ["2.A", "2.B"],
    summary:
      "The graphs of sine and cosine are smooth, periodic, and identical in shape — cosine is sine shifted left by $\\pi/2$. Both have amplitude 1, period $2\\pi$, and midline $y = 0$.",
    learningObjectives: [
      { id: "3.4.A", text: "Sketch and describe key features of y = sin x and y = cos x." },
    ],
    essentialKnowledge: [
      { id: "3.4.A.1", text: "y = sin x: zeros at multiples of π; max +1 at π/2 + 2kπ; min −1 at 3π/2 + 2kπ." },
      { id: "3.4.A.2", text: "y = cos x: zeros at π/2 + kπ; max +1 at multiples of 2π; min −1 at π + 2kπ." },
      { id: "3.4.A.3", text: "cos x = sin(x + π/2): cosine is sine shifted left by π/2." },
    ],
    workedExamples: [
      {
        prompt: "Where does $y = \\sin x$ achieve its maximum on $[0, 2\\pi]$?",
        steps: [
          "Sine peaks at $x = \\pi/2$.",
        ],
        answer: "$x = \\pi/2$.",
      },
      {
        prompt: "Compare zeros of sine and cosine on $[0, 2\\pi)$.",
        steps: [
          "Sine zeros: $0, \\pi$.",
          "Cosine zeros: $\\pi/2, 3\\pi/2$.",
        ],
        answer: "Sine: $0, \\pi$; cosine: $\\pi/2, 3\\pi/2$.",
      },
    ],
    pitfalls: [
      "Sketching the wave starting at the max instead of the midline.",
      "Mixing up zeros of sine and cosine.",
    ],
    vocab: ["sine", "cosine", "period", "amplitude"],
    graph: { expressions: ["sin(x)", "cos(x)"], xMin: -7, xMax: 7, yMin: -1.5, yMax: 1.5 },
  },

  {
    id: "3.5",
    unit: 3,
    title: "Sinusoidal Functions",
    suggestedPeriods: 1,
    skills: ["1.B", "1.C"],
    summary:
      "A sinusoidal function is $f(x) = a\\sin(b(x - h)) + k$ (or with cosine in place of sine). The four parameters control amplitude, period, phase shift, and midline.",
    learningObjectives: [
      { id: "3.5.A", text: "Identify amplitude, period, phase shift, and midline of a sinusoid." },
    ],
    essentialKnowledge: [
      { id: "3.5.A.1", text: "Amplitude = |a|." },
      { id: "3.5.A.2", text: "Period = 2π / |b|." },
      { id: "3.5.A.3", text: "Phase shift = h." },
      { id: "3.5.A.4", text: "Midline = y = k." },
    ],
    workedExamples: [
      {
        prompt: "For $f(x) = 3\\sin(2(x - \\pi/4)) + 1$, identify the four parameters.",
        steps: [
          "$a = 3$, $b = 2$, $h = \\pi/4$, $k = 1$.",
        ],
        answer: "Amplitude 3, period $\\pi$, phase shift $\\pi/4$, midline $y = 1$.",
      },
      {
        prompt: "Write a sinusoid with amplitude 4, period 8, midline $y = -2$, no phase shift, starting at the midline going up.",
        steps: [
          "$b = 2\\pi / 8 = \\pi/4$.",
          "Use sine for 'starts at midline going up'.",
        ],
        answer: "$f(x) = 4 \\sin(\\pi x / 4) - 2$.",
      },
    ],
    pitfalls: [
      "Forgetting that period uses $2\\pi / |b|$, not $2\\pi \\cdot |b|$.",
      "Picking phase shift sign from $b(x - h)$ vs. $bx - bh$ incorrectly.",
    ],
    vocab: ["sinusoid", "amplitude", "period", "phase-shift", "midline"],
    graph: { expressions: ["3*sin(2*(x - pi/4)) + 1"], xMin: -2, xMax: 6, yMin: -4, yMax: 6 },
  },

  {
    id: "3.6",
    unit: 3,
    title: "Sinusoidal Function Transformations",
    suggestedPeriods: 1,
    skills: ["1.C", "2.B"],
    summary:
      "Transformations of $\\sin x$ and $\\cos x$ follow the standard transformation rules, but be careful: factoring $b$ out of the inside is essential for reading the phase shift correctly.",
    learningObjectives: [
      { id: "3.6.A", text: "Apply transformations to sinusoidal functions; convert between sine and cosine forms." },
    ],
    essentialKnowledge: [
      { id: "3.6.A.1", text: "Factor b out of (bx − c) before reading the phase shift: bx − c = b(x − c/b)." },
      { id: "3.6.A.2", text: "Reflecting a sinusoid across its midline negates a." },
      { id: "3.6.A.3", text: "Any sinusoid can be written equivalently with sine or cosine, with a different phase shift." },
    ],
    workedExamples: [
      {
        prompt: "Read phase shift of $f(x) = \\cos(3x - \\pi)$.",
        steps: [
          "Factor: $\\cos(3(x - \\pi/3))$.",
          "Phase shift $= \\pi/3$.",
        ],
        answer: "Right by $\\pi/3$.",
      },
      {
        prompt: "Rewrite $\\sin(x - \\pi/2)$ as a cosine.",
        steps: [
          "$\\sin(x - \\pi/2) = -\\cos x$ (identity).",
        ],
        answer: "$-\\cos x$.",
      },
    ],
    pitfalls: [
      "Reading phase shift as the value of $c$ in $bx - c$ rather than $c/b$.",
      "Forgetting the sign change when converting sine to cosine via identity.",
    ],
    vocab: ["transformation", "phase-shift", "sinusoid"],
    graph: { expressions: ["cos(3*x - pi)", "cos(3*(x - pi/3))"], xMin: -2, xMax: 4, yMin: -1.5, yMax: 1.5 },
  },

  {
    id: "3.7",
    unit: 3,
    title: "Sinusoidal Function Context and Data Modeling",
    suggestedPeriods: 2,
    skills: ["1.C", "3.B"],
    summary:
      "Sinusoidal models fit periodic real-world data: temperature cycles, daylight hours, tides, sound waves, biorhythms. Choose midline = average, amplitude = (max − min)/2, period = repetition interval, phase shift = first peak (or zero).",
    learningObjectives: [
      { id: "3.7.A", text: "Build a sinusoidal model from periodic data." },
    ],
    essentialKnowledge: [
      { id: "3.7.A.1", text: "Midline equals (max + min)/2; amplitude equals (max − min)/2." },
      { id: "3.7.A.2", text: "Period is the repetition length of the underlying phenomenon." },
      { id: "3.7.A.3", text: "Phase shift is chosen so the function starts at the appropriate place in the cycle." },
    ],
    workedExamples: [
      {
        prompt: "A city's mean daily high temperature ranges from 30°F (mid-Jan) to 90°F (mid-Jul) annually. Model $T(t)$ in months.",
        steps: [
          "Midline $= 60$, amplitude $= 30$.",
          "Period $= 12$ months → $b = 2\\pi/12 = \\pi/6$.",
          "Peak in mid-Jul corresponds to $t = 6$ (if Jan = 0). Use cosine peaking at $t = 6$.",
        ],
        answer: "$T(t) = 30 \\cos(\\pi(t - 6)/6) + 60$.",
      },
      {
        prompt: "Tide model has midline 5 ft, amplitude 3 ft, period 12 hr. Write a model that starts at low tide at $t = 0$.",
        steps: [
          "Low at $t = 0$ ⇒ use $-\\cos$ or shifted cosine.",
          "$y = 5 + 3\\cos(\\pi (t - 6)/6)$ — but that peaks at $t = 6$, low at $t = 0$. Equivalent: $5 - 3\\cos(\\pi t /6)$.",
        ],
        answer: "$y = 5 - 3\\cos(\\pi t / 6)$.",
      },
    ],
    pitfalls: [
      "Choosing the wrong phase shift sign.",
      "Mixing units of time when reading data (hours vs. days).",
    ],
    vocab: ["sinusoid", "model", "amplitude", "period"],
  },

  {
    id: "3.8",
    unit: 3,
    title: "The Tangent Function",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A"],
    summary:
      "$\\tan\\theta = \\sin\\theta / \\cos\\theta$. It has period $\\pi$ (not $2\\pi$), passes through the origin, and has vertical asymptotes where cosine is zero.",
    learningObjectives: [
      { id: "3.8.A", text: "Describe key features of the tangent function." },
    ],
    essentialKnowledge: [
      { id: "3.8.A.1", text: "Period of tan is π." },
      { id: "3.8.A.2", text: "Vertical asymptotes at θ = π/2 + kπ." },
      { id: "3.8.A.3", text: "Tan is increasing on each branch (π/2 + kπ, π/2 + (k+1)π)." },
    ],
    workedExamples: [
      {
        prompt: "List the vertical asymptotes of $\\tan x$ on $[-2\\pi, 2\\pi]$.",
        steps: [
          "Where $\\cos x = 0$: $x = \\pm \\pi/2, \\pm 3\\pi/2$.",
        ],
        answer: "$x = \\pm \\pi/2, \\pm 3\\pi/2$.",
      },
      {
        prompt: "Find $\\tan(7\\pi/4)$.",
        steps: [
          "Quadrant IV. Reference $\\pi/4$.",
          "$\\tan$ negative in Q IV. $\\tan(\\pi/4) = 1$.",
        ],
        answer: "$-1$.",
      },
    ],
    pitfalls: [
      "Forgetting that tangent has period $\\pi$, not $2\\pi$.",
      "Forgetting tangent is undefined at the asymptotes.",
    ],
    vocab: ["tangent", "period", "asymptote"],
    graph: { expressions: ["tan(x)"], xMin: -7, xMax: 7, yMin: -6, yMax: 6 },
  },

  {
    id: "3.9",
    unit: 3,
    title: "Inverse Trigonometric Functions",
    suggestedPeriods: 1,
    skills: ["1.A", "1.C"],
    summary:
      "Sine, cosine, and tangent are not one-to-one — so their inverses require restricted domains. The standard restrictions give arcsin on $[-\\pi/2, \\pi/2]$, arccos on $[0, \\pi]$, and arctan on $(-\\pi/2, \\pi/2)$.",
    learningObjectives: [
      { id: "3.9.A", text: "Evaluate inverse trig functions and identify their domains and ranges." },
    ],
    essentialKnowledge: [
      { id: "3.9.A.1", text: "arcsin x: domain [−1, 1], range [−π/2, π/2]." },
      { id: "3.9.A.2", text: "arccos x: domain [−1, 1], range [0, π]." },
      { id: "3.9.A.3", text: "arctan x: domain ℝ, range (−π/2, π/2)." },
    ],
    workedExamples: [
      {
        prompt: "Compute $\\arcsin(-1/2)$.",
        steps: [
          "Want angle in $[-\\pi/2, \\pi/2]$ with sine $-1/2$.",
          "$\\theta = -\\pi/6$.",
        ],
        answer: "$-\\pi/6$.",
      },
      {
        prompt: "Compute $\\arctan(\\sqrt{3})$.",
        steps: [
          "Want angle in $(-\\pi/2, \\pi/2)$ with tangent $\\sqrt{3}$.",
        ],
        answer: "$\\pi/3$.",
      },
    ],
    pitfalls: [
      "Returning an angle outside the principal value range.",
      "Confusing $\\arcsin(x)$ with $1/\\sin(x)$ (csc).",
    ],
    vocab: ["arcsine", "arccosine", "arctangent", "principal-value"],
  },

  {
    id: "3.10",
    unit: 3,
    title: "Trigonometric Equations and Inequalities",
    suggestedPeriods: 2,
    skills: ["1.A"],
    summary:
      "Solving a trig equation usually involves isolating a trig function, taking its inverse to find one solution, and then listing all solutions in the requested interval using the function's period.",
    learningObjectives: [
      { id: "3.10.A", text: "Solve trigonometric equations on a specified interval." },
    ],
    essentialKnowledge: [
      { id: "3.10.A.1", text: "An inverse trig function yields one solution; the period yields the rest." },
      { id: "3.10.A.2", text: "For sin θ = c with c ∈ [−1, 1], all solutions in [0, 2π) are θ_1 and π − θ_1 where θ_1 = arcsin c." },
      { id: "3.10.A.3", text: "For cos θ = c, solutions in [0, 2π) are θ_1 = arccos c and 2π − θ_1." },
    ],
    workedExamples: [
      {
        prompt: "Solve $2\\sin x = 1$ for $x \\in [0, 2\\pi)$.",
        steps: [
          "$\\sin x = 1/2$.",
          "$x = \\pi/6$ or $x = \\pi - \\pi/6 = 5\\pi/6$.",
        ],
        answer: "$x = \\pi/6, 5\\pi/6$.",
      },
      {
        prompt: "Solve $\\tan x = -1$ for $x \\in [0, 2\\pi)$.",
        steps: [
          "$\\tan$ is negative in Q II and Q IV; reference angle $\\pi/4$.",
          "Q II: $\\pi - \\pi/4 = 3\\pi/4$.",
          "Q IV: $2\\pi - \\pi/4 = 7\\pi/4$.",
        ],
        answer: "$x = 3\\pi/4, 7\\pi/4$.",
      },
    ],
    pitfalls: [
      "Reporting only the inverse value and missing the second solution in $[0, 2\\pi)$.",
      "Forgetting tangent's period is $\\pi$ when listing solutions.",
    ],
    vocab: ["inverse-trig", "period"],
  },

  {
    id: "3.11",
    unit: 3,
    title: "The Secant, Cosecant, and Cotangent Functions",
    suggestedPeriods: 1,
    skills: ["1.B", "2.A"],
    summary:
      "Secant, cosecant, and cotangent are reciprocals of cosine, sine, and tangent respectively. They share the period of their parent and acquire vertical asymptotes wherever the parent is zero.",
    learningObjectives: [
      { id: "3.11.A", text: "Identify domain, range, and key features of sec, csc, and cot." },
    ],
    essentialKnowledge: [
      { id: "3.11.A.1", text: "sec x = 1/cos x, csc x = 1/sin x, cot x = cos x / sin x." },
      { id: "3.11.A.2", text: "sec and csc have range (−∞, −1] ∪ [1, ∞); cot has range ℝ." },
      { id: "3.11.A.3", text: "Vertical asymptotes appear at the zeros of the parent denominator." },
    ],
    workedExamples: [
      {
        prompt: "Find $\\sec(\\pi/3)$.",
        steps: [
          "$\\cos(\\pi/3) = 1/2$.",
          "$\\sec = 1/(1/2) = 2$.",
        ],
        answer: "$2$.",
      },
      {
        prompt: "Find vertical asymptotes of $\\csc x$ on $[0, 2\\pi)$.",
        steps: [
          "$\\sin x = 0$ at $x = 0, \\pi$.",
        ],
        answer: "$x = 0$ and $x = \\pi$.",
      },
    ],
    pitfalls: [
      "Writing sec as $1/\\sin$ instead of $1/\\cos$.",
      "Forgetting that cot has asymptotes at the zeros of sine, not cosine.",
    ],
    vocab: ["secant", "cosecant", "cotangent", "reciprocal-trig"],
  },

  {
    id: "3.12",
    unit: 3,
    title: "Equivalent Representations of Trigonometric Functions",
    suggestedPeriods: 2,
    skills: ["1.B", "2.B"],
    summary:
      "Pythagorean, sum/difference, and double-angle identities rewrite trig expressions in equivalent forms. The right identity is the one that turns the problem into algebra you can finish.",
    learningObjectives: [
      { id: "3.12.A", text: "Apply trig identities to simplify expressions or solve equations." },
    ],
    essentialKnowledge: [
      { id: "3.12.A.1", text: "Pythagorean: sin²θ + cos²θ = 1; 1 + tan²θ = sec²θ; 1 + cot²θ = csc²θ." },
      { id: "3.12.A.2", text: "Sum: sin(a±b) = sin a cos b ± cos a sin b; cos(a±b) = cos a cos b ∓ sin a sin b." },
      { id: "3.12.A.3", text: "Double angle: sin 2θ = 2 sin θ cos θ; cos 2θ = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1." },
    ],
    workedExamples: [
      {
        prompt: "Simplify $\\dfrac{1 - \\cos^2 x}{\\sin x}$.",
        steps: [
          "$1 - \\cos^2 x = \\sin^2 x$.",
          "$\\sin^2 x / \\sin x = \\sin x$ (for $\\sin x \\ne 0$).",
        ],
        answer: "$\\sin x$.",
      },
      {
        prompt: "Express $\\cos 2x$ using $\\sin x$ only.",
        steps: [
          "$\\cos 2x = 1 - 2\\sin^2 x$.",
        ],
        answer: "$1 - 2\\sin^2 x$.",
      },
    ],
    pitfalls: [
      "Confusing $\\sin^2 x$ with $\\sin x^2$.",
      "Forgetting to check $\\sin x = 0$ before dividing by $\\sin x$.",
    ],
    vocab: ["pythagorean-identity", "sum-formula", "double-angle"],
  },

  {
    id: "3.13",
    unit: 3,
    title: "Trigonometry and Polar Coordinates",
    suggestedPeriods: 1,
    skills: ["1.B", "2.B"],
    summary:
      "A point in the plane can be located by $(x, y)$ or by $(r, \\theta)$, where $r$ is the distance from the origin and $\\theta$ is the angle from the positive x-axis. Conversion uses $x = r\\cos\\theta$, $y = r\\sin\\theta$.",
    learningObjectives: [
      { id: "3.13.A", text: "Convert between rectangular and polar coordinates." },
    ],
    essentialKnowledge: [
      { id: "3.13.A.1", text: "x = r cos θ, y = r sin θ." },
      { id: "3.13.A.2", text: "r² = x² + y²; tan θ = y/x (quadrant must be checked)." },
      { id: "3.13.A.3", text: "Polar representation is not unique: (r, θ) = (r, θ + 2π) = (−r, θ + π)." },
    ],
    workedExamples: [
      {
        prompt: "Convert $(x, y) = (-1, 1)$ to polar.",
        steps: [
          "$r = \\sqrt{1 + 1} = \\sqrt{2}$.",
          "Quadrant II. Reference $\\pi/4$. $\\theta = 3\\pi/4$.",
        ],
        answer: "$(\\sqrt{2}, 3\\pi/4)$.",
      },
      {
        prompt: "Convert $(r, \\theta) = (4, \\pi/3)$ to rectangular.",
        steps: [
          "$x = 4 \\cos(\\pi/3) = 2$.",
          "$y = 4 \\sin(\\pi/3) = 2\\sqrt{3}$.",
        ],
        answer: "$(2, 2\\sqrt{3})$.",
      },
    ],
    pitfalls: [
      "Using $\\arctan(y/x)$ blindly without quadrant check.",
      "Treating polar representation as unique.",
    ],
    vocab: ["polar-coordinates", "radius", "polar-angle"],
  },

  {
    id: "3.14",
    unit: 3,
    title: "Polar Function Graphs",
    suggestedPeriods: 2,
    skills: ["2.A", "2.B"],
    summary:
      "A polar function $r = f(\\theta)$ traces a curve as $\\theta$ sweeps through an interval. Roses, cardioids, limaçons, and circles all emerge from simple polar equations.",
    learningObjectives: [
      { id: "3.14.A", text: "Sketch and recognize common polar curves." },
    ],
    essentialKnowledge: [
      { id: "3.14.A.1", text: "r = a cos θ and r = a sin θ are circles." },
      { id: "3.14.A.2", text: "r = a + b cos θ (or sin) is a limaçon; cardioid when a = b." },
      { id: "3.14.A.3", text: "r = a cos(kθ) or a sin(kθ) gives a rose with k or 2k petals depending on parity of k." },
    ],
    workedExamples: [
      {
        prompt: "Describe the shape of $r = 4 \\cos\\theta$.",
        steps: [
          "Multiply by $r$: $r^2 = 4r\\cos\\theta \\Rightarrow x^2 + y^2 = 4x$.",
          "Rewrite: $(x - 2)^2 + y^2 = 4$.",
        ],
        answer: "Circle of radius 2 centered at $(2, 0)$.",
      },
      {
        prompt: "How many petals does $r = 3\\sin(2\\theta)$ have?",
        steps: [
          "$k = 2$ is even, so the rose has $2k = 4$ petals.",
        ],
        answer: "4 petals.",
      },
    ],
    pitfalls: [
      "Treating negative $r$ values as 'no graph' — they reflect across the origin.",
      "Counting petals using the wrong parity rule.",
    ],
    vocab: ["polar-curve", "rose", "cardioid", "limacon"],
    graph: { polar: true, expressions: ["4*cos(t)", "3*sin(2*t)"] },
  },

  {
    id: "3.15",
    unit: 3,
    title: "Rates of Change in Polar Functions",
    suggestedPeriods: 1,
    skills: ["2.A", "3.A"],
    summary:
      "$dr/d\\theta$ tells you how $r$ responds to small changes in $\\theta$. Where $dr/d\\theta > 0$, the radius grows as $\\theta$ increases; where $dr/d\\theta < 0$, it shrinks. Zeros of $dr/d\\theta$ correspond to extreme radii.",
    learningObjectives: [
      { id: "3.15.A", text: "Use the rate of change of r with respect to θ to describe polar curves." },
    ],
    essentialKnowledge: [
      { id: "3.15.A.1", text: "The average rate of change of r on [θ₁, θ₂] equals (r(θ₂) − r(θ₁))/(θ₂ − θ₁)." },
      { id: "3.15.A.2", text: "Where dr/dθ > 0, r grows; where dr/dθ < 0, r shrinks." },
      { id: "3.15.A.3", text: "Local extrema of r occur where dr/dθ changes sign." },
    ],
    workedExamples: [
      {
        prompt: "For $r = 2 + 2\\cos\\theta$, find where $r$ is largest.",
        steps: [
          "$r$ depends on $\\cos\\theta$, which peaks at $\\theta = 0$.",
          "Max $r = 4$ at $\\theta = 0$.",
        ],
        answer: "$\\theta = 0$, with $r = 4$.",
      },
      {
        prompt: "Average rate of change of $r = 1 + \\sin\\theta$ on $[\\pi/6, \\pi/2]$.",
        steps: [
          "$r(\\pi/6) = 1 + 1/2 = 3/2$.",
          "$r(\\pi/2) = 1 + 1 = 2$.",
          "Slope: $(2 - 3/2)/(\\pi/2 - \\pi/6) = (1/2)/(\\pi/3)$.",
        ],
        answer: "$3/(2\\pi) \\approx 0.477$.",
      },
    ],
    pitfalls: [
      "Confusing the rate of change of $r$ with the slope $dy/dx$ in rectangular coordinates.",
      "Reading 'where $r$ is largest' as 'where $\\theta$ is largest'.",
    ],
    vocab: ["rate-of-change", "polar-curve"],
    graph: { polar: true, expressions: ["2 + 2*cos(t)", "1 + sin(t)"] },
  },
];

// ---------------------------------------------------------------------------
// Lookups & convenience helpers
// ---------------------------------------------------------------------------

const topicById = new Map<string, Topic>();
for (const t of TOPICS) topicById.set(t.id, t);

export function getTopic(id: string): Topic | undefined {
  return topicById.get(id);
}

export function unitTopics(unit: 1 | 2 | 3): Topic[] {
  return TOPICS.filter((t) => t.unit === unit);
}

export function neighborTopics(id: string): { prev?: Topic; next?: Topic } {
  const idx = TOPICS.findIndex((t) => t.id === id);
  if (idx < 0) return {};
  return { prev: TOPICS[idx - 1], next: TOPICS[idx + 1] };
}

export function skillById(code: SkillCode): Skill | undefined {
  return SKILLS.find((s) => s.code === code);
}

export function unitInfo(unit: 1 | 2 | 3): UnitInfo {
  return UNITS.find((u) => u.id === unit)!;
}
