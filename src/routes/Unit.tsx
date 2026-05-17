import { Link, useParams, Navigate } from "react-router-dom";
import { UNITS, unitTopics, skillById, type SkillCode } from "../data/curriculum";
import { useProgress } from "../store/progress";
import { RichText } from "../components/Math";
import { ChevronRight } from "lucide-react";

const UNIT_BG = {
  unit1: "bg-[color:#f4d8a5] text-[color:#5a3409]",
  unit2: "bg-[color:#bce3df] text-[color:#0a3c3c]",
  unit3: "bg-[color:#d8cbf2] text-[color:#321f5e]",
} as const;

const UNIT_DOT = {
  unit1: "#c2701b",
  unit2: "#0e7c7b",
  unit3: "#6f4ab8",
} as const;

export default function Unit() {
  const { unitId } = useParams();
  const id = Number(unitId) as 1 | 2 | 3;
  if (!UNITS.find((u) => u.id === id)) return <Navigate to="/" replace />;

  const unit = UNITS.find((u) => u.id === id)!;
  const topics = unitTopics(id);
  const topicMastery = useProgress((s) => s.topicMastery);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header>
        <div className={`inline-flex chip ${UNIT_BG[unit.accentKey]}`}>
          Unit {unit.id} · {unit.weight}
        </div>
        <h1 className="font-display text-4xl mt-3">{unit.title}</h1>
        <p className="mt-2 text-[color:var(--ink-soft)] max-w-prose">{unit.description}</p>
      </header>

      <ol className="mt-8 space-y-2">
        {topics.map((t) => {
          const m = topicMastery(t.id);
          return (
            <li key={t.id}>
              <Link
                to={`/lesson/${t.id}`}
                className="card flex items-center gap-4 hover:shadow-card transition focusring"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-mono font-semibold"
                  style={{ background: UNIT_DOT[unit.accentKey] + "22", color: UNIT_DOT[unit.accentKey] }}
                  aria-hidden
                >
                  {t.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg">{t.title}</p>
                  <p className="text-xs text-[color:var(--ink-soft)] mt-0.5">
                    <RichText>{t.summary}</RichText>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.skills.map((s) => (
                      <SkillChip key={s} code={s} />
                    ))}
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-xs text-[color:var(--ink-soft)]">
                    {m.attempted ? `${m.pct}%` : "—"}
                  </p>
                  <p className="text-[10px] text-[color:var(--ink-soft)] uppercase tracking-wide">
                    {m.attempted ? `${m.correct}/${m.attempted}` : "no data"}
                  </p>
                </div>
                <ChevronRight size={18} className="text-[color:var(--ink-soft)]" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SkillChip({ code }: { code: SkillCode }) {
  const s = skillById(code);
  if (!s) return null;
  return (
    <span
      className="text-[10px] font-mono rounded px-1.5 py-0.5 border"
      style={{ borderColor: "var(--line)" }}
      title={s.title}
    >
      {code}
    </span>
  );
}
