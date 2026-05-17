import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MOCK_EXAMS, getExam, predictedAP, type MockExam, type MockExamFRQ, type MockExamSection } from "../data/mockExams";
import { problemById } from "../data/problems";
import { TOPICS, getTopic } from "../data/curriculum";
import { useProgress } from "../store/progress";
import ProblemCard, { type ProblemAttempt } from "../components/ProblemCard";
import { RichText } from "../components/Math";
import { Clock, Flag, ChevronLeft, ChevronRight, Send, Calculator } from "lucide-react";

export default function Exam() {
  const { examId } = useParams();
  const exam = examId ? getExam(examId) : null;
  if (!examId) return <ExamPicker />;
  if (!exam) return <ExamPicker />;
  return <ExamSession exam={exam} />;
}

function ExamPicker() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl">Mock Exam</h1>
      <p className="mt-2 text-[color:var(--ink-soft)]">
        Two full-length forms, each mirroring the real AP Precalculus exam structure:
        a 40-question multiple-choice section split into a calculator part (28 questions,
        80 minutes) and a no-calculator part (12 questions, 40 minutes), followed by
        4 free-response questions split into two 30-minute sections.
      </p>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        Total estimated time: about 3 hours, 10 minutes. Section timers auto-advance.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {MOCK_EXAMS.map((e) => (
          <Link key={e.id} to={`/exam/${e.id}`} className="card focusring hover:shadow-card">
            <h2 className="font-display text-xl">{e.title}</h2>
            <p className="text-sm text-[color:var(--ink-soft)] mt-1">
              40 MC + 4 FRQ · 3h 10m · weighted across all three units
            </p>
            <p className="mt-3 text-[color:var(--accent)] text-sm">Begin →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface SectionState {
  // For MC sections: per-question answers + marks.
  answers: Record<string, number | null>; // problemId → choice index
  marked: Record<string, boolean>;
  // For FR sections: per-frq, per-part answers + self-scores
  frqResponses: Record<string, { part: number; answer: string; selfScore?: number }[]>;
  finished: boolean;
  remainingSec: number;
}

function ExamSession({ exam }: { exam: MockExam }) {
  const navigate = useNavigate();
  const recordExam = useProgress((s) => s.recordExamAttempt);
  const recordAttempt = useProgress((s) => s.recordAttempt);

  const [sectionIdx, setSectionIdx] = useState(0);
  const [states, setStates] = useState<SectionState[]>(() =>
    exam.sections.map((s) => ({
      answers: {},
      marked: {},
      frqResponses: {},
      finished: false,
      remainingSec: s.minutes * 60,
    }))
  );
  const [questionIdx, setQuestionIdx] = useState(0);
  const [finishedAll, setFinishedAll] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const startTime = useRef(Date.now());

  const section = exam.sections[sectionIdx];
  const state = states[sectionIdx];

  // Timer
  useEffect(() => {
    if (finishedAll || state.finished) return;
    const handle = setInterval(() => {
      setStates((prev) => prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        if (s.finished || s.remainingSec <= 0) return s;
        return { ...s, remainingSec: s.remainingSec - 1 };
      }));
    }, 1000);
    return () => clearInterval(handle);
  }, [sectionIdx, state.finished, finishedAll]);

  // Auto-advance when timer hits 0
  useEffect(() => {
    if (state.remainingSec <= 0 && !state.finished) {
      finishSection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.remainingSec]);

  const finishSection = () => {
    setStates((prev) => prev.map((s, i) => (i === sectionIdx ? { ...s, finished: true } : s)));
    if (sectionIdx + 1 < exam.sections.length) {
      setSectionIdx(sectionIdx + 1);
      setQuestionIdx(0);
    } else {
      submit();
    }
  };

  const submit = () => {
    const r = scoreExam(exam, states);
    setReport(r);
    setFinishedAll(true);

    // Record per-MC attempt to the global store so it counts for mastery.
    for (const sec of exam.sections) {
      if (!sec.problemIds) continue;
      const secState = states[exam.sections.indexOf(sec)];
      for (const pid of sec.problemIds) {
        const chosen = secState.answers[pid];
        const p = problemById(pid);
        if (!p || p.type !== "mc") continue;
        const correct = chosen === p.correctIndex;
        recordAttempt({
          problemId: p.id, topicId: p.topicId, skill: p.skill, difficulty: p.difficulty,
          correct, timeMs: 0, at: new Date().toISOString(),
        });
      }
    }

    recordExam({
      examId: exam.id,
      startedAt: new Date(startTime.current).toISOString(),
      finishedAt: new Date().toISOString(),
      responses: r.responses,
      rawScore: r.raw,
      maxScore: r.max,
      predictedAP: r.predicted,
    });
  };

  if (report && finishedAll) {
    return <Report exam={exam} report={report} onAgain={() => navigate("/exam")} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl">{exam.title}</h1>
          <p className="text-xs text-[color:var(--ink-soft)] font-mono">Section {sectionIdx + 1} of {exam.sections.length} · {section.title}</p>
        </div>
        <span className="chip">
          {section.calculatorAllowed ? <><Calculator size={12} /> Calc</> : <><Calculator size={12} className="line-through" /> No calc</>}
        </span>
        <div className="ml-auto chip" aria-live="polite">
          <Clock size={12} /> <span className="font-mono">{formatTime(state.remainingSec)}</span>
        </div>
      </header>

      <div className="mt-4 grid lg:grid-cols-[1fr_240px] gap-4">
        <div>
          {section.problemIds ? (
            <MCQuestion
              section={section}
              questionIdx={questionIdx}
              state={state}
              setStates={setStates}
              sectionIdx={sectionIdx}
            />
          ) : (
            <FRQuestion
              section={section}
              questionIdx={questionIdx}
              state={state}
              setStates={setStates}
              sectionIdx={sectionIdx}
            />
          )}

          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={() => setQuestionIdx((q) => Math.max(0, q - 1))}
              disabled={questionIdx === 0}
              className="btn btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              type="button"
              onClick={() => {
                const max = section.problemIds?.length ?? section.frqs?.length ?? 0;
                setQuestionIdx((q) => Math.min(max - 1, q + 1));
              }}
              className="btn btn-ghost"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <aside className="card sticky top-20 h-fit">
          <h3 className="font-display text-sm uppercase tracking-wide text-[color:var(--ink-soft)] mb-2">Navigator</h3>
          <div className="grid grid-cols-7 gap-1">
            {section.problemIds?.map((pid, i) => {
              const answered = state.answers[pid] !== undefined && state.answers[pid] !== null;
              const marked = state.marked[pid];
              const active = questionIdx === i;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setQuestionIdx(i)}
                  className={`text-xs w-8 h-8 rounded border flex items-center justify-center transition ${
                    active ? "bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]" :
                    answered ? "bg-[color:var(--accent)]/15 border-[color:var(--accent)]/30" :
                    "border-[color:var(--line)] hover:border-[color:var(--accent)]"
                  }`}
                  aria-label={`Go to question ${i + 1}${marked ? ", marked for review" : ""}`}
                >
                  {marked ? <Flag size={10} /> : i + 1}
                </button>
              );
            })}
            {section.frqs?.map((_, i) => {
              const active = questionIdx === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuestionIdx(i)}
                  className={`text-xs w-8 h-8 rounded border flex items-center justify-center ${
                    active ? "bg-[color:var(--ink)] text-[color:var(--bg)] border-[color:var(--ink)]" :
                    "border-[color:var(--line)]"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={finishSection} className="btn btn-primary mt-3 w-full">
            <Send size={14} /> Finish section
          </button>
          <p className="text-[10px] text-[color:var(--ink-soft)] mt-2">
            Finishing locks your answers and moves on (or submits the exam if this is the last section).
          </p>
        </aside>
      </div>
    </div>
  );
}

function MCQuestion({ section, questionIdx, state, setStates, sectionIdx }: {
  section: MockExamSection;
  questionIdx: number;
  state: SectionState;
  setStates: React.Dispatch<React.SetStateAction<SectionState[]>>;
  sectionIdx: number;
}) {
  const pid = section.problemIds![questionIdx];
  const problem = problemById(pid);
  if (!problem || problem.type !== "mc") return <p>Question unavailable.</p>;
  const choice = state.answers[pid];
  const marked = !!state.marked[pid];

  const set = (idx: number) => {
    setStates((prev) => prev.map((s, i) => i === sectionIdx ? { ...s, answers: { ...s.answers, [pid]: idx } } : s));
  };
  const toggleMark = () => {
    setStates((prev) => prev.map((s, i) => i === sectionIdx ? { ...s, marked: { ...s.marked, [pid]: !marked } } : s));
  };

  return (
    <article className="card">
      <header className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--ink-soft)]">Question {questionIdx + 1}</p>
        <button onClick={toggleMark} className="btn btn-ghost text-xs">
          <Flag size={12} className={marked ? "text-[color:var(--accent)] fill-current" : ""} />
          {marked ? "Marked" : "Mark for review"}
        </button>
      </header>
      <p className="leading-relaxed"><RichText>{problem.prompt}</RichText></p>
      <div className="mt-3 space-y-2">
        {problem.choices.map((c, i) => {
          const sel = choice === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => set(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border focusring flex items-start gap-3 transition ${
                sel ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                    : "border-[color:var(--line)] hover:border-[color:var(--accent)]"
              }`}
            >
              <span className="font-mono text-xs mt-0.5">{String.fromCharCode(65 + i)}.</span>
              <span className="flex-1"><RichText>{c}</RichText></span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function FRQuestion({ section, questionIdx, state, setStates, sectionIdx }: {
  section: MockExamSection;
  questionIdx: number;
  state: SectionState;
  setStates: React.Dispatch<React.SetStateAction<SectionState[]>>;
  sectionIdx: number;
}) {
  const frq = section.frqs![questionIdx];
  const responses = state.frqResponses[frq.id] ?? frq.parts.map((_, i) => ({ part: i, answer: "" }));
  const [showSolutions, setShowSolutions] = useState(false);

  const setPart = (i: number, value: string) => {
    setStates((prev) => prev.map((s, idx) => {
      if (idx !== sectionIdx) return s;
      const next = [...(s.frqResponses[frq.id] ?? frq.parts.map((_, k) => ({ part: k, answer: "" })))];
      next[i] = { ...next[i], answer: value };
      return { ...s, frqResponses: { ...s.frqResponses, [frq.id]: next } };
    }));
  };

  const setSelfScore = (i: number, score: number) => {
    setStates((prev) => prev.map((s, idx) => {
      if (idx !== sectionIdx) return s;
      const next = [...(s.frqResponses[frq.id] ?? frq.parts.map((_, k) => ({ part: k, answer: "" })))];
      next[i] = { ...next[i], selfScore: score };
      return { ...s, frqResponses: { ...s.frqResponses, [frq.id]: next } };
    }));
  };

  return (
    <article className="card">
      <header className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--ink-soft)]">FRQ {questionIdx + 1}</p>
        <span className="chip">Topics: {frq.topicHints.join(", ")}</span>
      </header>
      <p className="leading-relaxed mb-3"><RichText>{frq.context}</RichText></p>

      <div className="space-y-4">
        {frq.parts.map((part, i) => (
          <div key={i} className="border-t border-[color:var(--line)] pt-3">
            <p className="font-medium"><span className="font-mono mr-1">{String.fromCharCode(97 + i)})</span> <RichText>{part.prompt}</RichText></p>
            <textarea
              value={responses[i]?.answer ?? ""}
              onChange={(e) => setPart(i, e.target.value)}
              rows={3}
              placeholder="Show your work, then state the final answer."
              className="mt-2 w-full font-mono text-sm bg-transparent border border-[color:var(--line)] rounded p-2 focusring"
            />
            <p className="text-xs text-[color:var(--ink-soft)] mt-1">{part.points} points</p>
            {showSolutions && (
              <div className="mt-2 surface p-3 text-sm">
                <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--ink-soft)] mb-1">Model solution</p>
                <ol className="ml-4 list-decimal space-y-1">
                  {part.solution.map((s, k) => <li key={k} className="text-[color:var(--ink-soft)]"><RichText>{s}</RichText></li>)}
                </ol>
                <p className="mt-2 text-sm"><span className="text-[color:var(--ink-soft)]">Expected: </span><span className="font-mono"><RichText>{part.expected}</RichText></span></p>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <span className="text-[color:var(--ink-soft)]">Self-score:</span>
                  {[0, 1, 2].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setSelfScore(i, sc)}
                      className={`chip ${responses[i]?.selfScore === sc ? "bg-[color:var(--accent)] text-white border-[color:var(--accent)]" : ""}`}
                    >
                      {sc} / {part.points}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => setShowSolutions((v) => !v)} className="btn mt-4">
        {showSolutions ? "Hide model solutions" : "Show model solutions & self-score"}
      </button>
    </article>
  );
}

interface ReportData {
  raw: number;
  max: number;
  predicted: 1 | 2 | 3 | 4 | 5;
  pct: number;
  byUnit: Record<1 | 2 | 3, { correct: number; total: number }>;
  bySkill: Record<string, { correct: number; total: number }>;
  responses: { questionId: string; correct: boolean; selected: string | null }[];
  weak: string[];
}

function scoreExam(exam: MockExam, states: SectionState[]): ReportData {
  let raw = 0;
  let max = 0;
  const byUnit: Record<1 | 2 | 3, { correct: number; total: number }> = {
    1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 },
  };
  const bySkill: Record<string, { correct: number; total: number }> = {};
  const responses: { questionId: string; correct: boolean; selected: string | null }[] = [];

  exam.sections.forEach((sec, i) => {
    const state = states[i];
    if (sec.problemIds) {
      for (const pid of sec.problemIds) {
        const p = problemById(pid);
        if (!p || p.type !== "mc") continue;
        max += 1;
        const chosen = state.answers[pid];
        const correct = chosen === p.correctIndex;
        if (correct) raw += 1;
        byUnit[p.topicId.startsWith("1") ? 1 : p.topicId.startsWith("2") ? 2 : 3].total++;
        if (correct) byUnit[p.topicId.startsWith("1") ? 1 : p.topicId.startsWith("2") ? 2 : 3].correct++;
        bySkill[p.skill] ??= { correct: 0, total: 0 };
        bySkill[p.skill].total++;
        if (correct) bySkill[p.skill].correct++;
        responses.push({ questionId: pid, correct, selected: chosen != null ? String(chosen) : null });
      }
    }
    if (sec.frqs) {
      for (const frq of sec.frqs) {
        const res = state.frqResponses[frq.id] ?? [];
        for (let k = 0; k < frq.parts.length; k++) {
          max += frq.parts[k].points;
          const score = res[k]?.selfScore ?? 0;
          raw += score;
        }
        responses.push({ questionId: frq.id, correct: false, selected: null });
      }
    }
  });

  const pct = max ? Math.round((100 * raw) / max) : 0;
  const predicted = predictedAP(pct);

  // Weakest topics for follow-up
  const weakByTopic = new Map<string, { c: number; t: number }>();
  exam.sections.forEach((sec, i) => {
    const state = states[i];
    if (!sec.problemIds) return;
    for (const pid of sec.problemIds) {
      const p = problemById(pid);
      if (!p || p.type !== "mc") continue;
      const m = weakByTopic.get(p.topicId) ?? { c: 0, t: 0 };
      m.t++;
      if (state.answers[pid] === p.correctIndex) m.c++;
      weakByTopic.set(p.topicId, m);
    }
  });
  const weak: string[] = [];
  for (const [t, m] of weakByTopic) {
    if (m.t > 0 && m.c / m.t < 0.5) weak.push(t);
  }
  weak.sort((a, b) => (weakByTopic.get(a)!.c / weakByTopic.get(a)!.t) - (weakByTopic.get(b)!.c / weakByTopic.get(b)!.t));

  return { raw, max, predicted, pct, byUnit, bySkill, responses, weak };
}

function Report({ exam, report, onAgain }: { exam: MockExam; report: ReportData; onAgain: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl">Score report</h1>
      <p className="text-[color:var(--ink-soft)]">{exam.title}</p>

      <div className="mt-6 card text-center">
        <p className="text-xs uppercase tracking-wide text-[color:var(--ink-soft)]">Predicted AP score</p>
        <p className="font-display text-7xl mt-2">{report.predicted}</p>
        <p className="text-sm mt-2">{report.raw} / {report.max} ({report.pct}%)</p>
        <p className="text-xs text-[color:var(--ink-soft)] mt-2">
          {report.predicted === 5 && "Excellent — you're ready."}
          {report.predicted === 4 && "Strong performance — polish the weak topics."}
          {report.predicted === 3 && "Passing range — there's room to grow."}
          {report.predicted === 2 && "Below passing — work through the weakest areas first."}
          {report.predicted === 1 && "Restart the curriculum from Unit 1, focus on the basics."}
        </p>
      </div>

      <section className="mt-6">
        <h2 className="font-display text-xl mb-2">By unit (MC only)</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((u) => {
            const m = report.byUnit[u];
            const pct = m.total ? Math.round((100 * m.correct) / m.total) : 0;
            return (
              <div key={u} className="card">
                <p className="text-xs uppercase tracking-wide text-[color:var(--ink-soft)]">Unit {u}</p>
                <p className="font-display text-3xl">{m.total ? `${pct}%` : "—"}</p>
                <p className="text-xs text-[color:var(--ink-soft)]">{m.correct}/{m.total}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl mb-2">By skill (MC only)</h2>
        <div className="card divide-y divide-[color:var(--line)]">
          {Object.entries(report.bySkill).sort(([a], [b]) => a.localeCompare(b)).map(([s, m]) => {
            const pct = m.total ? Math.round((100 * m.correct) / m.total) : 0;
            return (
              <div key={s} className="py-2 flex items-center gap-3 text-sm">
                <span className="font-mono w-10">{s}</span>
                <span className="flex-1 text-[color:var(--ink-soft)]">{m.correct}/{m.total}</span>
                <span className="font-mono">{m.total ? `${pct}%` : "—"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {report.weak.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl mb-2">Weakest topics — start here</h2>
          <div className="space-y-2">
            {report.weak.slice(0, 5).map((tid) => {
              const t = getTopic(tid);
              if (!t) return null;
              return (
                <Link key={tid} to={`/lesson/${tid}`} className="card flex items-center gap-3 hover:shadow-card">
                  <span className="font-mono text-xs chip">{tid}</span>
                  <span className="flex-1 font-medium">{t.title}</span>
                  <span className="text-xs text-[color:var(--accent)]">Open lesson →</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-6 flex gap-2">
        <button onClick={onAgain} className="btn">Take another form</button>
        <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${m}:${`${sec}`.padStart(2, "0")}`;
}
