import { Link } from "react-router-dom";
import { UNITS, TOPICS, unitTopics } from "../data/curriculum";
import { useProgress } from "../store/progress";
import { RichText } from "../components/Math";
import { ArrowRight, BookOpen, LineChart, CircleDot, Brain, Layers, Clock } from "lucide-react";

const UNIT_BG = {
  unit1: "bg-[color:#f4d8a5] text-[color:#5a3409]",
  unit2: "bg-[color:#bce3df] text-[color:#0a3c3c]",
  unit3: "bg-[color:#d8cbf2] text-[color:#321f5e]",
} as const;

export default function Home() {
  const topicMastery = useProgress((s) => s.topicMastery);
  const due = useProgress((s) => s.dueFlashcardCount());
  const examAttempts = useProgress((s) => s.examAttempts);

  // "Recommended next" — weakest topic with at least one attempt; otherwise the first topic.
  const ranked = TOPICS.map((t) => ({ t, m: topicMastery(t.id) }))
    .filter((x) => x.m.attempted > 0)
    .sort((a, b) => a.m.pct - b.m.pct);
  const recommended = ranked[0]?.t ?? TOPICS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ink-soft)]">
            College Board AP Precalculus, self-paced
          </p>
          <h1 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
            Learn the whole course.
            <br />
            <span className="text-[color:var(--accent)]">No textbook required.</span>
          </h1>
          <p className="mt-4 text-lg text-[color:var(--ink-soft)] max-w-prose">
            Every CED topic, every worked example, an interactive grapher and unit
            circle, spaced-repetition flashcards, and two full timed mock exams —
            all in one app.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={`/lesson/${recommended.id}`} className="btn btn-primary">
              {ranked.length > 0 ? "Continue where you left off" : "Start with topic 1.1"} <ArrowRight size={16} />
            </Link>
            <Link to="/practice" className="btn">Practice problems</Link>
            <Link to="/exam" className="btn">Take a mock exam</Link>
          </div>
        </div>
        <Stats due={due} examCount={examAttempts.length} />
      </header>

      <section className="mt-12">
        <h2 className="font-display text-3xl mb-4">Three units, all on the exam</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {UNITS.map((u) => {
            const t = unitTopics(u.id);
            const attempted = t.reduce((sum, top) => sum + topicMastery(top.id).attempted, 0);
            const correct = t.reduce((sum, top) => sum + topicMastery(top.id).correct, 0);
            const pct = attempted ? Math.round((100 * correct) / attempted) : 0;
            return (
              <Link
                key={u.id}
                to={`/unit/${u.id}`}
                className="card hover:shadow-card transition focusring"
              >
                <div className={`inline-flex chip ${UNIT_BG[u.accentKey]}`}>
                  Unit {u.id} · {u.weight}
                </div>
                <h3 className="font-display text-2xl mt-3">{u.title}</h3>
                <p className="text-sm text-[color:var(--ink-soft)] mt-1">
                  {t.length} topics
                </p>
                <p className="text-sm mt-3">{u.description}</p>
                <div className="mt-4">
                  <ProgressBar pct={pct} accent={u.accentKey} />
                  <p className="text-xs mt-1 text-[color:var(--ink-soft)]">
                    {attempted ? `${pct}% accuracy across ${attempted} attempts` : "No practice yet"}
                  </p>
                </div>
                <p className="mt-3 text-[color:var(--accent)] text-sm flex items-center gap-1">
                  Open unit <ArrowRight size={14} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <ToolCard to="/graph" Icon={LineChart} title="Function Grapher" copy="Plot up to 4 functions with sliders for parameters, asymptotes, and polar mode." />
        <ToolCard to="/unit-circle" Icon={CircleDot} title="Unit Circle" copy="Drag a terminal ray to read off sine, cosine, and tangent in real time." />
        <ToolCard to="/flashcards" Icon={Layers} title="Flashcards" copy={`Spaced repetition over every vocab term. ${due} due today.`} />
        <ToolCard to="/exam" Icon={Clock} title="Mock Exam" copy="Timed full-length practice mirroring the real AP exam structure." />
      </section>

      <section className="mt-12 card">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 text-[color:var(--accent)]" />
          <div>
            <h3 className="font-display text-xl">About the curriculum</h3>
            <p className="text-sm text-[color:var(--ink-soft)] mt-1">
              Every learning objective is paraphrased from the official AP Precalculus
              Course and Exam Description. Topic IDs (e.g. <span className="font-mono">1.5</span>)
              match the CED. Unit 4 isn't on the exam, so we leave it out of the main flow.
            </p>
          </div>
        </div>
      </section>

      {ranked.length > 0 && (
        <section className="mt-8 card">
          <div className="flex items-start gap-3">
            <Brain className="mt-1 text-[color:var(--accent)]" />
            <div className="flex-1">
              <h3 className="font-display text-xl">Recommended next: {recommended.id} — {recommended.title}</h3>
              <p className="text-sm text-[color:var(--ink-soft)] mt-1">
                <RichText>{recommended.summary}</RichText>
              </p>
              <Link to={`/lesson/${recommended.id}`} className="btn mt-3">
                Open lesson <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stats({ due, examCount }: { due: number; examCount: number }) {
  const streak = useProgress((s) => s.streak);
  const attempts = useProgress((s) => s.attempts.length);
  return (
    <aside className="card grid grid-cols-2 gap-3 text-sm">
      <Stat label="Daily streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
      <Stat label="Problems tried" value={`${attempts}`} />
      <Stat label="Cards due" value={`${due}`} />
      <Stat label="Mock exams" value={`${examCount}`} />
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[color:var(--ink-soft)] uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function ToolCard({ to, Icon, title, copy }: { to: string; Icon: typeof BookOpen; title: string; copy: string }) {
  return (
    <Link to={to} className="card hover:shadow-card transition focusring block">
      <Icon className="text-[color:var(--accent)]" size={20} />
      <h4 className="font-display text-lg mt-2">{title}</h4>
      <p className="text-sm text-[color:var(--ink-soft)] mt-1">{copy}</p>
    </Link>
  );
}

function ProgressBar({ pct, accent }: { pct: number; accent: "unit1" | "unit2" | "unit3" }) {
  const fill = accent === "unit1" ? "#c2701b" : accent === "unit2" ? "#0e7c7b" : "#6f4ab8";
  return (
    <div className="h-2 w-full rounded-full bg-[color:var(--line)] overflow-hidden">
      <div className="h-full" style={{ width: `${Math.max(2, pct)}%`, background: fill }} />
    </div>
  );
}
