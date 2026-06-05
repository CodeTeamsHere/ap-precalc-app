// Voice tutor — wraps the browser SpeechSynthesis (TTS) and SpeechRecognition
// (STT) APIs. Falls back gracefully when a browser doesn't support them.
//
// Designed for the AP Precalc tutor: LaTeX in the input string is converted to
// natural spoken language before being passed to the synthesizer.

// Minimal types for the browser SpeechRecognition API (not in lib.dom.d.ts).
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { readonly transcript: string; readonly confidence: number };
}
interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const GREEK: Record<string, string> = {
  alpha: "alpha", beta: "beta", gamma: "gamma", delta: "delta",
  epsilon: "epsilon", zeta: "zeta", eta: "eta", theta: "theta",
  iota: "iota", kappa: "kappa", lambda: "lambda", mu: "mu",
  nu: "nu", xi: "xi", omicron: "omicron", pi: "pi", rho: "rho",
  sigma: "sigma", tau: "tau", upsilon: "upsilon", phi: "phi",
  chi: "chi", psi: "psi", omega: "omega", infty: "infinity",
};

/**
 * Convert KaTeX/LaTeX-flavored math text into something a TTS engine can read
 * out as natural English. This is intentionally heuristic — we trade strict
 * correctness for legible spoken output.
 */
export function spokenizeMath(input: string): string {
  let s = input;

  // Strip code fences and markdown headers/asterisks.
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/#+\s*/g, "");
  s = s.replace(/\*+/g, "");

  // Block math $$...$$ → just unwrap.
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, " $1 ");
  // Inline math $...$ → unwrap.
  s = s.replace(/\$([^$]*?)\$/g, " $1 ");

  // Fractions: \frac{a}{b} → "a over b". Handle nesting one level deep.
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, " $1 over $2 ");
  }
  // Inline forms \fracab → "a over b" (single char only).
  s = s.replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, " $1 over $2 ");

  // Square roots.
  s = s.replace(/\\sqrt\s*\{([^{}]+)\}/g, " square root of $1 ");
  s = s.replace(/\\sqrt([0-9a-zA-Z])/g, " square root of $1 ");

  // Common functions.
  s = s.replace(/\\(?:sin|cos|tan|sec|csc|cot|sinh|cosh|tanh)\b/g, (m) => " " + m.slice(1) + " ");
  s = s.replace(/\\(?:arcsin|arccos|arctan)\b/g, (m) => " arc " + m.slice(4) + " ");
  s = s.replace(/\\ln\b/g, " natural log of ");
  s = s.replace(/\\log\b/g, " log ");
  s = s.replace(/\\exp\b/g, " exp ");

  // Greek and infinity.
  s = s.replace(/\\([a-zA-Z]+)/g, (_, name) => {
    const k = String(name).toLowerCase();
    if (GREEK[k]) return " " + GREEK[k] + " ";
    return " "; // unknown command — drop
  });
  s = s.replace(/π/g, " pi ").replace(/θ/g, " theta ").replace(/∞/g, " infinity ")
       .replace(/√/g, " square root of ").replace(/±/g, " plus or minus ");

  // Exponents: x^2 → x squared, x^3 → x cubed, x^{n} → x to the n.
  s = s.replace(/\^\s*\{?\s*2\s*\}?/g, " squared ");
  s = s.replace(/\^\s*\{?\s*3\s*\}?/g, " cubed ");
  s = s.replace(/\^\s*\{([^{}]+)\}/g, " to the power of $1 ");
  s = s.replace(/\^([0-9]+|[a-zA-Z])/g, " to the power of $1 ");

  // Subscripts ignored as spoken (read base only): "x_1" → "x sub 1".
  s = s.replace(/_\s*\{([^{}]+)\}/g, " sub $1 ");
  s = s.replace(/_([0-9]+|[a-zA-Z])/g, " sub $1 ");

  // Operators.
  s = s.replace(/\\cdot|\\times|×/g, " times ");
  s = s.replace(/\\div|÷/g, " divided by ");
  s = s.replace(/\\le\b|≤|<=/g, " less than or equal to ");
  s = s.replace(/\\ge\b|≥|>=/g, " greater than or equal to ");
  s = s.replace(/\\ne\b|≠|!=/g, " not equal to ");
  s = s.replace(/\\approx|≈/g, " approximately ");
  s = s.replace(/\\to\b|→/g, " approaches ");
  s = s.replace(/=/g, " equals ");
  s = s.replace(/\+/g, " plus ");
  s = s.replace(/\s-\s/g, " minus ");

  // Drop remaining braces, common LaTeX glue, and arrow text.
  s = s.replace(/[{}]/g, " ");
  s = s.replace(/\\,|\\;|\\!|\\:/g, " ");
  s = s.replace(/\\left|\\right/g, " ");

  // Tighten whitespace.
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Returns whether the browser has speech synthesis support. */
export function ttsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Returns whether the browser supports speech recognition. */
export function sttAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

let cachedVoice: SpeechSynthesisVoice | null = null;
function pickVoice(): SpeechSynthesisVoice | null {
  if (!ttsAvailable()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer English voices, prefer "Natural"/"Premium" variants when present.
  const en = voices.filter((v) => /en/i.test(v.lang));
  const ranked = (en.length ? en : voices).sort((a, b) => {
    const sa = qualityScore(a), sb = qualityScore(b);
    return sb - sa;
  });
  cachedVoice = ranked[0] ?? null;
  return cachedVoice;
}

function qualityScore(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (/natural|enhanced|premium|neural/i.test(v.name)) s += 5;
  if (/en[-_]?us/i.test(v.lang)) s += 3;
  else if (/en/i.test(v.lang)) s += 1;
  if (!v.default) s += 0.1; // tiny tiebreaker; default voices are sometimes flat
  return s;
}

export interface SpeakOptions {
  rate?: number;   // 0.1 – 10, default 1
  pitch?: number;  // 0 – 2,    default 1
  volume?: number; // 0 – 1,    default 1
  onEnd?: () => void;
  onStart?: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!ttsAvailable()) {
    opts.onEnd?.();
    return false;
  }
  cancelSpeech();
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(spokenizeMath(text));
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.rate = opts.rate ?? 1;
  u.pitch = opts.pitch ?? 1;
  u.volume = opts.volume ?? 1;
  u.onstart = () => opts.onStart?.();
  u.onend = () => { currentUtterance = null; opts.onEnd?.(); };
  u.onerror = () => { currentUtterance = null; opts.onEnd?.(); };
  currentUtterance = u;
  synth.speak(u);
  return true;
}

export function cancelSpeech() {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return ttsAvailable() && window.speechSynthesis.speaking;
}

// --- Speech recognition (STT) -----------------------------------------------

export interface STTSession {
  stop: () => void;
}

export interface STTHandlers {
  onPartial?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export function listen(handlers: STTHandlers, opts?: { lang?: string; interim?: boolean }): STTSession | null {
  if (!sttAvailable()) {
    handlers.onError?.("Speech recognition not supported in this browser.");
    handlers.onEnd?.();
    return null;
  }
  const Ctor = (window.SpeechRecognition || window.webkitSpeechRecognition)!;
  const rec = new Ctor();
  rec.lang = opts?.lang ?? "en-US";
  rec.interimResults = opts?.interim ?? true;
  rec.continuous = false;

  rec.onresult = (event: SpeechRecognitionEventLike) => {
    let final = "";
    let partial = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) final += r[0].transcript;
      else partial += r[0].transcript;
    }
    if (partial) handlers.onPartial?.(partial);
    if (final) handlers.onFinal?.(final);
  };
  rec.onerror = (e: SpeechRecognitionErrorEventLike) => {
    handlers.onError?.(e.error || "unknown");
  };
  rec.onend = () => handlers.onEnd?.();

  rec.start();
  return { stop: () => { try { rec.stop(); } catch { /* already stopped */ } } };
}
