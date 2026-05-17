import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SKILLS, UNITS, TOPICS, unitTopics, type SkillCode } from "../data/curriculum";
import { useProgress } from "../store/progress";
import { Download, Upload, Trash2, Flame, Target, TrendingUp } from "lucide-react";

const UNIT_COLOR = { unit1: "#c2701b", unit2: "#0e7c7b", unit3: "#6f4ab8" } as const;

export default function Dashboard() {
  const topicMastery = useProgress((s) => s.topicMastery);
  const skillMastery = useProgress((s) => s.skillMastery);
  const exportProgress = useProgress((s) => s.exportProgress);
  const importProgress = useProgress((s) => s.importProgress);
  const resetProgress = useProgress((s) => s.resetProgress);
  const activity = useProgress((s) => s.activity);
  const streak = useProgress((s) => s.streak);
  const attempts = useProgress((s) => s.attempts);
  const examAttempts = useProgress((s) => s.examAttempts);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const overallPct = totalAttempts ? Math.round((100 * totalCorrect) / totalAttempts) : 0;

  // Recommended next: weakest topic with at least 1 attempt; else first topic with 0 attempts; else 1.1.
  const ranked = TOPICS.map((t) => ({ t, m: topicMastery(t.id) }));
  const weakest = ranked
    .filter((x) => x.m.attempted > 0)
    .sort((a, b) => a.m.pct - b.m.pct)[0];
  const unstarted = ranked.find((x) => x.m.attempted === 0);
  const recommended = weakest?.t ?? unstarted?.t ?? TOPICS[0];

  const onExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ap-precalc-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Progress exported.");
    setTimeout(() => setMsg(null), 2000);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const ok = importProgress(text);
    setMsg(ok ? "Progress imported." : "Couldn't parse that file.");
    setTimeout(() => setMsg(null), 2400);
    e.target.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-4xl">Dashboard</h1>
          <p className="text-[color:var(--ink-soft)] mt-1">
            Your progress at a glance. Everything is stored locally in your browser.
          </p>
        </div>
        <button onClick={onExport} className="btn"><Download size={14} /> Export</button>
        <button onClick={() => fileRef.current?.click()} className="btn"><Upload size={14} /> Import</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} />
        <button
          onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetProgress(); }}
          className="btn btn-ghost text-red-700 dark:text-red-300"
        >
          <Trash2 size={14} /> Reset
        </button>
      </header>

      {msg && <p className="card mb-4 text-sm">{msg}</p>}

      <div className="grid md:grid-cols-4 gap-3">
        <Stat icon={<Flame size={18} />} label="Daily streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <Stat icon={<Target size={18} />} label="Overall accuracy" value={totalAttempts ? `${overallPct}%` : "—"} sub={`${totalCorrect}/${totalAttempts}`} />
        <Stat icon={<TrendingUp size={18} />} label="Problems tried" value={`${totalAttempts}`} />
        <Stat icon={<TrendingUp size={18} />} label="Mock exams" value={`${examAttempts.length}`} />
      </div>

      <section className="mt-8 card">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="font-display text-2xl">Recommended next</h2>
            <p className="text-sm text-[color:var(--ink-soft)] mt-1">
              {weakest
                ? `Your weakest topic by accuracy.`
                : unstarted ? "Your next unstarted topic." : "Begin with the first topic."}
            </p>
            <p className="mt-3"><span className="font-mono mr-2">{recommended.id}</span><span className="font-display text-lg">{recommended.title}</span></p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`/lesson/${recommended.id}`} className="btn btn-primary">Open lesson</Link>
              <Link to={`/practice/${recommended.id}`} className="btn">Practice it</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl mb-3">Per-unit mastery</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {UNITS.map((u) => {
            const t = unitTopics(u.id);
            const att = t.reduce((s, top) => s + topicMastery(top.id).attempted, 0);
            const cor = t.reduce((s, top) => s + topicMastery(top.id).correct, 0);
            const pct = att ? Math.round((100 * cor) / att) : 0;
            return (
              <div key={u.id} className="card">
                <p className="text-xs font-mono uppercase tracking-wide" style={{ color: UNIT_COLOR[u.accentKey] }}>Unit {u.id}</p>
                <h3 className="font-display text-lg mt-1">{u.title}</h3>
                <p className="text-3xl font-display mt-2">{att ? `${pct}%` : "—"}</p>
                <p className="text-xs text-[color:var(--ink-soft)]">{cor}/{att} correct · {t.length} topics</p>
                <Bar pct={pct} color={UNIT_COLOR[u.accentKey]} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl mb-3">Per-skill mastery</h2>
        <div className="card divide-y divide-[color:var(--line)]">
          {SKILLS.map((s) => {
            const m = skillMastery(s.code);
            return (
              <div key={s.code} className="py-2.5 flex items-center gap-3 text-sm">
                <span className="font-mono w-10">{s.code}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-[color:var(--ink-soft)] truncate">{s.practiceTitle}</p>
                </div>
                <div className="w-32 hidden sm:block">
                  <Bar pct={m.pct} color="#15131a" />
                </div>
                <span className="font-mono text-sm w-12 text-right">{m.attempted ? `${m.pct}%` : "—"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl mb-2">Activity — last 90 days</h2>
        <Heatmap activity={activity} />
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl mb-3">Topic detail</h2>
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-[color:var(--ink-soft)]">
              <tr>
                <th className="px-3 py-2 font-mono text-xs">ID</th>
                <th className="px-3 py-2 font-mono text-xs">Topic</th>
                <th className="px-3 py-2 font-mono text-xs">Unit</th>
                <th className="px-3 py-2 font-mono text-xs">Attempts</th>
                <th className="px-3 py-2 font-mono text-xs">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((t) => {
                const m = topicMastery(t.id);
                return (
                  <tr key={t.id} className="border-t border-[color:var(--line)] hover:bg-[color:var(--bg)]">
                    <td className="px-3 py-2 font-mono"><Link to={`/practice/${t.id}`} className="hover:underline">{t.id}</Link></td>
                    <td className="px-3 py-2"><Link to={`/lesson/${t.id}`} className="hover:underline">{t.title}</Link></td>
                    <td className="px-3 py-2">{t.unit}</td>
                    <td className="px-3 py-2 font-mono">{m.attempted}</td>
                    <td className="px-3 py-2 font-mono">{m.attempted ? `${m.pct}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card flex items-start gap-3">
      <span className="rounded p-2 bg-[color:var(--bg)]">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-[color:var(--ink-soft)]">{label}</p>
        <p className="font-display text-3xl">{value}</p>
        {sub && <p className="text-xs text-[color:var(--ink-soft)]">{sub}</p>}
      </div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2 h-2 rounded-full bg-[color:var(--line)] overflow-hidden">
      <div className="h-full" style={{ width: `${Math.max(2, pct)}%`, background: color }} />
    </div>
  );
}

function Heatmap({ activity }: { activity: Record<string, number> }) {
  const days = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: { date: string; count: number; weekday: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const date = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    cells.push({ date, count: activity[date] ?? 0, weekday: d.getDay() });
  }
  const max = cells.reduce((m, c) => Math.max(m, c.count), 1);
  const shade = (c: number) => {
    if (c === 0) return "var(--line)";
    const t = Math.min(1, c / max);
    // Amber accent fade
    const alpha = 0.25 + 0.6 * t;
    return `rgba(194, 112, 27, ${alpha.toFixed(2)})`;
  };

  // Lay out in weeks (columns) of 7 days
  const weeks: typeof cells[] = [];
  let current: typeof cells = [];
  for (const c of cells) {
    if (current.length === 0) {
      // pad to align Sunday at top
      for (let p = 0; p < c.weekday; p++) {
        current.push({ date: "", count: -1, weekday: p });
      }
    }
    current.push(c);
    if (current.length === 7) { weeks.push(current); current = []; }
  }
  if (current.length) weeks.push(current);

  return (
    <div className="card overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((wk, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {wk.map((c, j) => (
              <div
                key={j}
                title={c.date ? `${c.date}: ${c.count} attempts` : ""}
                className="w-3 h-3 rounded-[2px]"
                style={{ background: c.count < 0 ? "transparent" : shade(c.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-[color:var(--ink-soft)]">
        Less <span className="inline-block w-3 h-3 rounded-[2px]" style={{ background: "var(--line)" }} />
        <span className="inline-block w-3 h-3 rounded-[2px]" style={{ background: "rgba(194,112,27,0.25)" }} />
        <span className="inline-block w-3 h-3 rounded-[2px]" style={{ background: "rgba(194,112,27,0.55)" }} />
        <span className="inline-block w-3 h-3 rounded-[2px]" style={{ background: "rgba(194,112,27,0.85)" }} />
        More
      </div>
    </div>
  );
}
