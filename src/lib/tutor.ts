// Thin wrapper around puter.js for the AI tutor. Loads asynchronously via the
// CDN script tag in index.html. We never assume `window.puter` exists — every
// call defends against the script having failed to load.

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string, options?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  }
}

const SYSTEM_PROMPT = `You are an AP Precalculus tutor. Help a student preparing for the AP exam.
The course is organized into three units (Polynomial & Rational Functions; Exponential & Logarithmic Functions; Trigonometric & Polar Functions) and references topic IDs like "1.5" or "3.7" matching the College Board CED.
Rules:
- Write math in LaTeX between $ ... $ for inline and $$ ... $$ for display.
- Reference the CED topic ID when relevant.
- Show steps, not just the answer.
- Keep responses focused and under ~250 words unless the student asks for more detail.`;

export interface TutorResult {
  ok: boolean;
  text: string;
  error?: string;
}

export async function isTutorAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // Give the CDN script up to 4s to attach.
  for (let i = 0; i < 8; i++) {
    if (window.puter?.ai?.chat) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return !!window.puter?.ai?.chat;
}

function extractText(response: unknown): string {
  if (typeof response === "string") return response;
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    // OpenAI-shaped response from puter
    const message = r.message as Record<string, unknown> | undefined;
    if (message && typeof message.content === "string") return message.content;
    if (message && Array.isArray(message.content)) {
      return message.content
        .map((c: unknown) => (typeof c === "object" && c && "text" in c ? (c as { text: string }).text : ""))
        .join("");
    }
    if (typeof r.text === "string") return r.text;
    if (typeof r.content === "string") return r.content;
    // Fallback: try toString
    if (typeof r.toString === "function") {
      const s = (r as { toString(): string }).toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return String(response ?? "");
}

export async function askTutor(userMessage: string, context: string): Promise<TutorResult> {
  const ok = await isTutorAvailable();
  if (!ok) {
    return {
      ok: false,
      text: "Tutor offline — the third-party puter.js service didn't load. Use the worked solution on this page for guidance.",
    };
  }
  const prompt = `${SYSTEM_PROMPT}

Context from the app:
${context}

Student question: ${userMessage}`;
  try {
    const response = await window.puter!.ai!.chat(prompt, { model: "gpt-4o-mini" });
    return { ok: true, text: extractText(response) };
  } catch (e) {
    return {
      ok: false,
      text: "Sorry — the tutor couldn't answer right now. Try the worked solution on this page.",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
