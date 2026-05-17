import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { askTutor } from "../lib/tutor";
import { getTopic } from "../data/curriculum";
import { RichText } from "./Math";
import { Sparkles, Send, X, Bot, User } from "lucide-react";

interface Msg { role: "user" | "tutor"; text: string }

const SUGGESTIONS = [
  "Explain this lesson in simpler terms.",
  "Walk me through a similar example.",
  "Why does this method work?",
  "What's the most common mistake here?",
];

export default function TutorChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const listRef = useRef<HTMLDivElement>(null);

  const context = useContextForRoute(location.pathname);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy, open]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    const res = await askTutor(text, context);
    setMessages((m) => [...m, { role: "tutor", text: res.text }]);
    setBusy(false);
  }, [busy, context]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close tutor" : "Open tutor"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full p-3.5 bg-[color:var(--ink)] text-[color:var(--bg)] shadow-card hover:bg-[color:var(--accent)] transition focusring"
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[min(96vw,420px)] h-[min(82vh,640px)] card flex flex-col p-0 overflow-hidden shadow-card animate-[fadeIn_0.15s_ease-out]">
          <header className="px-4 py-3 border-b border-[color:var(--line)] flex items-center gap-2">
            <Sparkles size={16} className="text-[color:var(--accent)]" />
            <h2 className="font-display text-base">AP Precalc tutor</h2>
            <span className="ml-auto text-[10px] text-[color:var(--ink-soft)] font-mono">{context.slice(0, 32)}…</span>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Ask anything about the topic you're on. The tutor uses puter.js (free, no API key) and renders math with LaTeX.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} className="chip hover:border-[color:var(--accent)] text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) => (
              <MsgBubble key={i} msg={m} />
            ))}
            {busy && (
              <MsgBubble msg={{ role: "tutor", text: "Thinking…" }} />
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-[color:var(--line)] p-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this lesson or problem…"
              className="flex-1 px-3 py-2 bg-transparent border border-[color:var(--line)] rounded-lg focusring"
              aria-label="Tutor question"
            />
            <button type="submit" disabled={!input.trim() || busy} className="btn btn-primary disabled:opacity-50">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </>
  );
}

function MsgBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 text-sm ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <span className="shrink-0 rounded-full w-7 h-7 flex items-center justify-center bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
          <Bot size={14} />
        </span>
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl ${
          isUser ? "bg-[color:var(--ink)] text-[color:var(--bg)]" : "bg-[color:var(--bg)] border border-[color:var(--line)]"
        }`}
      >
        <RichText>{msg.text}</RichText>
      </div>
      {isUser && (
        <span className="shrink-0 rounded-full w-7 h-7 flex items-center justify-center bg-[color:var(--bg)] border border-[color:var(--line)]">
          <User size={14} />
        </span>
      )}
    </div>
  );
}

function useContextForRoute(pathname: string): string {
  if (pathname.startsWith("/lesson/")) {
    const id = pathname.split("/")[2];
    const t = getTopic(id);
    if (t) return `Student is on lesson ${t.id} — "${t.title}". Summary: ${t.summary}`;
  }
  if (pathname.startsWith("/practice/")) {
    const id = pathname.split("/")[2];
    if (id === "random") return "Student is doing mixed-topic random practice.";
    const t = getTopic(id);
    if (t) return `Student is doing practice problems for topic ${t.id} — ${t.title}.`;
  }
  if (pathname.startsWith("/exam")) return "Student is taking a mock exam.";
  if (pathname.startsWith("/graph")) return "Student is exploring the function grapher.";
  if (pathname.startsWith("/unit-circle")) return "Student is exploring the unit circle simulator.";
  if (pathname.startsWith("/flashcards")) return "Student is reviewing vocabulary flashcards.";
  if (pathname.startsWith("/dashboard")) return "Student is on the progress dashboard.";
  return "Student is on the home page of the AP Precalculus study app.";
}
