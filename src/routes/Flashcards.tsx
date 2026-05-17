import { useEffect, useMemo, useState } from "react";
import { VOCAB, unitVocab, type VocabTerm } from "../data/vocab";
import { UNITS } from "../data/curriculum";
import { useProgress } from "../store/progress";
import { isDue } from "../lib/sm2";
import { RichText } from "../components/Math";
import { Layers, RotateCw, Sparkles, Zap, Frown, Meh, Smile } from "lucide-react";

const UNIT_BG = {
  unit1: "bg-[color:#f4d8a5] text-[color:#5a3409]",
  unit2: "bg-[color:#bce3df] text-[color:#0a3c3c]",
  unit3: "bg-[color:#d8cbf2] text-[color:#321f5e]",
} as const;

type DeckId = "u1" | "u2" | "u3" | "all" | "due";

export default function Flashcards() {
  const [deckId, setDeckId] = useState<DeckId | null>(null);

  if (!deckId) return <DeckPicker onPick={setDeckId} />;
  return <Study deckId={deckId} onExit={() => setDeckId(null)} />;
}

function DeckPicker({ onPick }: { onPick: (d: DeckId) => void }) {
  const cards = useProgress((s) => s.cards);
  const ensureCard = useProgress((s) => s.ensureCard);

  // Seed cards for any vocab term not yet in the store.
  useEffect(() => {
    for (const v of VOCAB) ensureCard(v.id);
  }, [ensureCard]);

  const dueCount = useMemo(() => {
    let n = 0;
    for (const v of VOCAB) {
      const c = cards[v.id];
      if (c && isDue(c)) n++;
    }
    return n;
  }, [cards]);

  const deck = (unit: 1 | 2 | 3) =>
    unitVocab(unit).filter((v) => cards[v.id] && isDue(cards[v.id]!)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header>
        <h1 className="font-display text-4xl">Flashcards</h1>
        <p className="mt-2 text-[color:var(--ink-soft)] max-w-prose">
          Spaced repetition over every vocab term in the course. Cards you find
          easy reappear less often; cards you flunk come back tomorrow.
        </p>
      </header>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <DeckCard
          title="Due today"
          subtitle={`${dueCount} cards`}
          accent="bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]"
          icon={<Zap size={18} />}
          onClick={() => onPick("due")}
          disabled={dueCount === 0}
        />
        <DeckCard
          title="All units"
          subtitle={`${VOCAB.length} cards`}
          icon={<Layers size={18} />}
          onClick={() => onPick("all")}
        />
        {UNITS.map((u, i) => (
          <DeckCard
            key={u.id}
            title={`Unit ${u.id}: ${u.title}`}
            subtitle={`${unitVocab(u.id).length} cards · ${deck(u.id)} due`}
            accent={UNIT_BG[u.accentKey]}
            icon={<Sparkles size={18} />}
            onClick={() => onPick((`u${u.id}`) as DeckId)}
          />
        ))}
      </div>
    </div>
  );
}

function DeckCard({
  title, subtitle, icon, onClick, accent, disabled,
}: { title: string; subtitle: string; icon: React.ReactNode; onClick: () => void; accent?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`card text-left transition focusring disabled:opacity-50 hover:shadow-card flex items-center gap-3 ${accent ?? ""}`}
    >
      <span className="rounded-md p-2 bg-[color:var(--bg)] text-[color:var(--ink)]">{icon}</span>
      <span className="flex-1">
        <p className="font-display text-lg">{title}</p>
        <p className="text-xs opacity-80">{subtitle}</p>
      </span>
    </button>
  );
}

function Study({ deckId, onExit }: { deckId: DeckId; onExit: () => void }) {
  const ensureCard = useProgress((s) => s.ensureCard);
  const gradeCard = useProgress((s) => s.gradeCard);
  const cards = useProgress((s) => s.cards);

  const pool = useMemo<VocabTerm[]>(() => {
    let candidates: VocabTerm[];
    if (deckId === "all") candidates = VOCAB;
    else if (deckId === "due") candidates = VOCAB;
    else candidates = unitVocab(Number(deckId.slice(1)) as 1 | 2 | 3);

    if (deckId === "due") {
      return candidates.filter((v) => {
        const c = cards[v.id];
        return c && isDue(c);
      });
    }
    return candidates;
  }, [deckId, cards]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => { setIdx(0); setFlipped(false); setReviewedCount(0); }, [deckId]);

  if (pool.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-3xl">All caught up!</h2>
        <p className="mt-2 text-[color:var(--ink-soft)]">No cards are due in this deck right now.</p>
        <button onClick={onExit} className="btn mt-4">Back to decks</button>
      </div>
    );
  }

  const term = pool[idx];
  const state = cards[term.id] ?? ensureCard(term.id);

  const grade = (q: "again" | "hard" | "good" | "easy") => {
    gradeCard(term.id, q);
    setReviewedCount((n) => n + 1);
    const next = (idx + 1) % pool.length;
    setIdx(next);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between text-xs text-[color:var(--ink-soft)]">
        <button onClick={onExit} className="hover:underline">← Decks</button>
        <span className="font-mono">Card {idx + 1} / {pool.length} · reviewed {reviewedCount}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); } }}
        className="mt-4 card min-h-[280px] flex flex-col items-center justify-center text-center cursor-pointer focusring"
        aria-label="Flashcard, click to flip"
      >
        {!flipped ? (
          <>
            <p className="text-xs uppercase tracking-widest text-[color:var(--ink-soft)]">Term</p>
            <h2 className="font-display text-4xl mt-3"><RichText>{term.term}</RichText></h2>
            <p className="mt-6 text-xs text-[color:var(--ink-soft)]">Click or press Space to reveal</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-[color:var(--ink-soft)]">Definition</p>
            <p className="mt-3 text-lg max-w-prose"><RichText>{term.definition}</RichText></p>
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <RateBtn label="Again" icon={<Frown size={14} />} hint="1 day" onClick={() => grade("again")} disabled={!flipped} tone="bg-red-500/15 border-red-500/40" />
        <RateBtn label="Hard" icon={<Meh size={14} />} hint="≤ ease" onClick={() => grade("hard")} disabled={!flipped} tone="bg-amber-500/15 border-amber-500/40" />
        <RateBtn label="Good" icon={<Smile size={14} />} hint="schedule" onClick={() => grade("good")} disabled={!flipped} tone="bg-emerald-500/15 border-emerald-500/40" />
        <RateBtn label="Easy" icon={<RotateCw size={14} />} hint="boost" onClick={() => grade("easy")} disabled={!flipped} tone="bg-sky-500/15 border-sky-500/40" />
      </div>
      <p className="mt-3 text-xs text-[color:var(--ink-soft)] text-center">
        Next due: {new Date(state.due).toLocaleDateString()} · ease {state.ease.toFixed(2)} · interval {state.intervalDays}d
      </p>
    </div>
  );
}

function RateBtn({ label, icon, hint, onClick, disabled, tone }: { label: string; icon: React.ReactNode; hint: string; onClick: () => void; disabled?: boolean; tone: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-lg border focusring transition ${tone} disabled:opacity-40 disabled:hover:translate-y-0 hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-center gap-1 font-medium">{icon} {label}</div>
      <div className="text-[10px] text-[color:var(--ink-soft)] mt-0.5">{hint}</div>
    </button>
  );
}
