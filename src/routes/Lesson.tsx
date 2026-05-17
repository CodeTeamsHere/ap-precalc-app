import { useEffect, useState, lazy, Suspense } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  getTopic, neighborTopics, unitInfo, skillById, type SkillCode,
} from "../data/curriculum";
import { problemsForTopic } from "../data/problems";
import { getVocab } from "../data/vocab";
import { RichText } from "../components/Math";
import {
  ArrowLeft, ArrowRight, AlertTriangle, BookOpen, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

const Grapher = lazy(() => import("../components/Grapher"));
const UnitCircleSim = lazy(() => import("../components/UnitCircleSim"));

const UNIT_BG = {
  unit1: "bg-[color:#f4d8a5] text-[color:#5a3409]",
  unit2: "bg-[color:#bce3df] text-[color:#0a3c3c]",
  unit3: "bg-[color:#d8cbf2] text-[color:#321f5e]",
} as const;

export default function Lesson() {
  const { topicId } = useParams();
  const topic = topicId ? getTopic(topicId) : undefined;

  // Scroll to top on navigation
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [topicId]);

  if (!topic) return <Navigate to="/" replace />;

  const u = unitInfo(topic.unit);
  const { prev, next } = neighborTopics(topic.id);
  const problemCount = problemsForTopic(topic.id).length;
  const showUnitCircle = topic.id === "3.2" || topic.id === "3.3";

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-[color:var(--ink-soft)] flex items-center gap-1.5 mb-4" aria-label="breadcrumbs">
        <Link to={`/unit/${topic.unit}`} className="hover:underline">Unit {topic.unit}</Link>
        <span>/</span>
        <span>{topic.id}</span>
      </nav>

      <header className="flex flex-wrap items-start gap-3 mb-4">
        <div className={`chip ${UNIT_BG[u.accentKey]}`}>Topic {topic.id}</div>
        <div className="chip">{topic.suggestedPeriods} period{topic.suggestedPeriods === 1 ? "" : "s"}</div>
        {topic.skills.map((s) => <SkillChip key={s} code={s} />)}
      </header>

      <h1 className="font-display text-4xl leading-tight">{topic.title}</h1>
      <p className="mt-3 text-lg text-[color:var(--ink-soft)]">
        <RichText>{topic.summary}</RichText>
      </p>

      {/* Learn section */}
      <section className="mt-8">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <BookOpen size={20} /> Learn
        </h2>
        <div className="mt-3 space-y-4">
          {topic.learningObjectives.map((lo) => (
            <div key={lo.id} className="card prose-tight">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs chip">{lo.id}</span>
                <p className="font-semibold"><RichText>{lo.text}</RichText></p>
              </div>
              <ul className="mt-2 ml-6 list-disc text-sm text-[color:var(--ink-soft)] space-y-1">
                {topic.essentialKnowledge
                  .filter((ek) => ek.id.startsWith(lo.id))
                  .map((ek) => (
                    <li key={ek.id}>
                      <span className="font-mono text-[10px] mr-1">{ek.id}</span>
                      <RichText>{ek.text}</RichText>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Worked examples */}
      <section className="mt-10">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Sparkles size={20} /> Worked examples
        </h2>
        <div className="mt-3 space-y-3">
          {topic.workedExamples.map((ex, i) => <WorkedExample key={i} index={i + 1} ex={ex} />)}
        </div>
      </section>

      {/* Visualize */}
      {(topic.graph || showUnitCircle) && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Visualize</h2>
          <div className="mt-3 card p-0 overflow-hidden">
            <Suspense
              fallback={<div className="h-[360px] flex items-center justify-center text-[color:var(--ink-soft)] text-sm">Loading visualization…</div>}
            >
              {showUnitCircle ? (
                <UnitCircleSim />
              ) : (
                <Grapher
                  expressions={topic.graph?.expressions ?? ["x"]}
                  polar={!!topic.graph?.polar}
                  xMin={topic.graph?.xMin}
                  xMax={topic.graph?.xMax}
                  yMin={topic.graph?.yMin}
                  yMax={topic.graph?.yMax}
                />
              )}
            </Suspense>
          </div>
          <p className="mt-2 text-xs text-[color:var(--ink-soft)]">
            Pre-loaded for this topic. Open the <Link to="/graph" className="underline">full grapher</Link> to add your own expressions.
          </p>
        </section>
      )}

      {/* Pitfalls */}
      {topic.pitfalls.length > 0 && (
        <section className="mt-10 card border-amber-300/40">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" /> Common pitfalls
          </h2>
          <ul className="mt-3 list-disc ml-6 space-y-1 text-sm">
            {topic.pitfalls.map((p, i) => <li key={i}><RichText>{p}</RichText></li>)}
          </ul>
        </section>
      )}

      {/* Vocab */}
      {topic.vocab.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-lg mb-2">Key vocabulary</h3>
          <div className="flex flex-wrap gap-1.5">
            {topic.vocab.map((id) => {
              const v = getVocab(id);
              if (!v) return null;
              return (
                <Link key={id} to="/flashcards" title={v.definition} className="chip hover:border-[color:var(--accent)]">
                  {v.term}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom navigation */}
      <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-6">
        {prev ? (
          <Link to={`/lesson/${prev.id}`} className="btn">
            <ArrowLeft size={16} /> {prev.id} · {prev.title}
          </Link>
        ) : <span />}
        <Link to={`/practice/${topic.id}`} className="btn btn-primary">
          Practice this topic ({problemCount} problems) <ArrowRight size={16} />
        </Link>
        {next ? (
          <Link to={`/lesson/${next.id}`} className="btn">
            {next.id} · {next.title} <ArrowRight size={16} />
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
}

function WorkedExample({ index, ex }: { index: number; ex: { prompt: string; steps: string[]; answer: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--ink-soft)]">Example {index}</p>
      <p className="mt-1"><RichText>{ex.prompt}</RichText></p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 text-sm inline-flex items-center gap-1 text-[color:var(--accent)] focusring"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {open ? "Hide solution" : "Show solution"}
      </button>
      {open && (
        <div className="mt-3 border-t border-[color:var(--line)] pt-3 space-y-2 text-sm">
          {ex.steps.map((s, i) => (
            <p key={i} className="text-[color:var(--ink-soft)]">
              <span className="font-mono text-[10px] mr-2">{i + 1}.</span>
              <RichText>{s}</RichText>
            </p>
          ))}
          <p className="mt-2 font-semibold">
            Answer: <RichText>{ex.answer}</RichText>
          </p>
        </div>
      )}
    </div>
  );
}

function SkillChip({ code }: { code: SkillCode }) {
  const s = skillById(code);
  if (!s) return null;
  return (
    <span className="chip" title={`${s.practiceTitle}: ${s.title}`}>
      <span className="font-mono">{code}</span>
      <span className="hidden sm:inline">{s.title}</span>
    </span>
  );
}
