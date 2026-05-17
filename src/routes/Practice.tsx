import { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { TOPICS, UNITS, unitTopics, getTopic, neighborTopics } from "../data/curriculum";
import { problemsForTopic, PROBLEMS } from "../data/problems";
import { useProgress } from "../store/progress";
import ProblemCard, { type ProblemAttempt } from "../components/ProblemCard";
import { Shuffle, ChevronRight, Filter, Calculator } from "lucide-react";

const UNIT_BG = {
  unit1: "bg-[color:#f4d8a5] text-[color:#5a3409]",
  unit2: "bg-[color:#bce3df] text-[color:#0a3c3c]",
  unit3: "bg-[color:#d8cbf2] text-[color:#321f5e]",
} as const;

export default function Practice() {
  const { topicId } = useParams();
  if (topicId && !getTopic(topicId)) return <Navigate to="/practice" replace />;
  return topicId ? <Session topicId={topicId} /> : <Picker />;
}

function Picker() {
  const [filter, setFilter] = useState<"all" | "calc" | "nocalc">("all");
  const topicMastery = useProgress((s) => s.topicMastery);

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; calc: number; noCalc: number }>();
    for (const p of PROBLEMS) {
      const m = map.get(p.topicId) ?? { total: 0, calc: 0, noCalc: 0 };
      m.total++;
      if (p.calculatorAllowed) m.calc++;
      else m.noCalc++;
      map.set(p.topicId, m);
    }
    return map;
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="font-display text-4xl">Practice</h1>
          <p className="mt-2 text-[color:var(--ink-soft)]">
            Pick a topic to drill, or shuffle a random problem across all units.
          </p>
        </div>
        <Link to="/practice/random" className="btn btn-primary">
          <Shuffle size={16} /> Random problem
        </Link>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-sm">
        <Filter size={14} className="text-[color:var(--ink-soft)]" />
        {(["all", "nocalc", "calc"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`chip ${filter === f ? "bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]" : ""}`}
          >
            {f === "all" ? "All" : f === "calc" ? "Calc only" : "No calc"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {UNITS.map((u) => (
          <section key={u.id}>
            <div className={`inline-flex chip ${UNIT_BG[u.accentKey]}`}>Unit {u.id}</div>
            <h2 className="font-display text-2xl mt-1">{u.title}</h2>
            <ol className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {unitTopics(u.id).map((t) => {
                const c = counts.get(t.id) ?? { total: 0, calc: 0, noCalc: 0 };
                const visible = filter === "all" ? c.total : filter === "calc" ? c.calc : c.noCalc;
                const m = topicMastery(t.id);
                return (
                  <li key={t.id}>
                    <Link
                      to={`/practice/${t.id}`}
                      className="card hover:shadow-card transition focusring flex items-center gap-3"
                    >
                      <span className="font-mono text-xs chip">{t.id}</span>
                      <span className="flex-1 text-sm font-medium">{t.title}</span>
                      <span className="text-xs text-[color:var(--ink-soft)]">
                        {visible} prob{visible === 1 ? "" : "s"}
                      </span>
                      {m.attempted > 0 && (
                        <span className="font-mono text-xs">{m.pct}%</span>
                      )}
                      <ChevronRight size={14} className="text-[color:var(--ink-soft)]" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function Session({ topicId }: { topicId: string }) {
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const firstTry = useProgress((s) => s.firstTryCorrect);

  const isRandom = topicId === "random";
  const topic = isRandom ? null : getTopic(topicId);
  const { prev, next } = topic ? neighborTopics(topic.id) : { prev: undefined, next: undefined };

  const pool = useMemo(() => {
    if (isRandom) return PROBLEMS;
    return problemsForTopic(topicId);
  }, [topicId, isRandom]);

  // Cursor through the pool. Initial: pick first unattempted (or first if all attempted).
  const initial = useMemo(() => {
    const idx = pool.findIndex((p) => !(p.id in firstTry));
    return idx >= 0 ? idx : 0;
  }, [pool, firstTry]);
  const [cursor, setCursor] = useState(initial);

  useEffect(() => { setCursor(initial); }, [topicId]); // reset on topic change

  if (pool.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl">No problems available</h1>
        <Link to="/practice" className="btn mt-4">Back to topics</Link>
      </div>
    );
  }

  const problem = pool[cursor % pool.length];

  const handleAttempt = (a: ProblemAttempt) => {
    recordAttempt({
      problemId: a.problemId,
      topicId: problem.topicId,
      skill: problem.skill,
      difficulty: problem.difficulty,
      correct: a.correct,
      timeMs: a.timeMs,
      at: new Date().toISOString(),
    });
  };

  const goNext = () => setCursor((c) => (c + 1) % pool.length);
  const goSimilar = () => {
    // Pick another problem from the same topic & skill if possible; else any in topic.
    const samePool = isRandom ? pool : problemsForTopic(problem.topicId).filter((p) => p.id !== problem.id);
    if (samePool.length === 0) return;
    const next = samePool.find((p) => p.skill === problem.skill && p.id !== problem.id)
      ?? samePool[Math.floor(Math.random() * samePool.length)];
    const idx = pool.findIndex((p) => p.id === next.id);
    if (idx >= 0) setCursor(idx);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-xs text-[color:var(--ink-soft)] mb-2">
        <Link to="/practice" className="hover:underline">Practice</Link>
        {topic && <> / <Link to={`/lesson/${topic.id}`} className="hover:underline">Topic {topic.id}</Link></>}
      </nav>

      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl">
          {topic ? `${topic.id} — ${topic.title}` : "Random practice"}
        </h1>
        <div className="text-xs text-[color:var(--ink-soft)] font-mono">
          {cursor + 1} / {pool.length}
        </div>
      </header>

      <div className="mt-4">
        <ProblemCard
          problem={problem}
          onAttempt={handleAttempt}
          onNext={goNext}
          resetKey={problem.id}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={goSimilar} className="btn">
          <Shuffle size={14} /> Try similar
        </button>
        <button onClick={goNext} className="btn btn-ghost">
          Skip to next <ChevronRight size={14} />
        </button>
        {!problem.calculatorAllowed && (
          <span className="chip ml-auto" title="This problem belongs to a no-calculator section">
            <Calculator size={12} className="line-through" /> No-calc
          </span>
        )}
      </div>

      {topic && (
        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4">
          {prev && (
            <Link to={`/practice/${prev.id}`} className="btn btn-ghost">← Topic {prev.id}</Link>
          )}
          <Link to={`/lesson/${topic.id}`} className="btn">Open lesson →</Link>
          {next && (
            <Link to={`/practice/${next.id}`} className="btn btn-ghost">Topic {next.id} →</Link>
          )}
        </nav>
      )}
    </div>
  );
}
