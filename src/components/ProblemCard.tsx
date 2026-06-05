import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { RichText } from "./Math";
import { gradeFR } from "../lib/grader";
import { skillById } from "../data/curriculum";
import type { Problem } from "../data/problems";
import { cancelSpeech, isSpeaking, speak, ttsAvailable } from "../lib/voice";
import { Check, X, RotateCw, Calculator, CalculatorIcon, ChevronDown, ChevronUp, Volume2, StopCircle } from "lucide-react";

const Grapher = lazy(() => import("./Grapher"));

export interface ProblemAttempt {
  problemId: string;
  correct: boolean;
  selected: string | null;
  timeMs: number;
}

interface Props {
  problem: Problem;
  /** If provided, called once when the learner submits. */
  onAttempt?: (a: ProblemAttempt) => void;
  /** If true, solution is hidden even after a wrong answer (used by mock exams). */
  hideSolution?: boolean;
  /** If true, render compact (no card chrome). */
  bare?: boolean;
  /** Show "Next problem" CTA at the bottom. */
  onNext?: () => void;
  /** Reset internal state when this changes (used to swap problems in place). */
  resetKey?: string;
}

export default function ProblemCard({ problem, onAttempt, hideSolution, bare, onNext, resetKey }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [free, setFree] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const startedAt = useMemo(() => Date.now(), [resetKey, problem.id]);
  const ttsOk = ttsAvailable();

  // Reset when problem changes
  useEffect(() => {
    setSelected(null);
    setFree("");
    setSubmitted(false);
    setCorrect(false);
    setShowSolution(false);
    cancelSpeech();
    setSpeaking(false);
  }, [resetKey, problem.id]);

  // Stop any in-progress speech when this card unmounts.
  useEffect(() => () => { cancelSpeech(); }, []);

  // Build the spoken script: question (and choices if MC), optionally answer + steps.
  const speakProblem = (includeSolution: boolean) => {
    if (!ttsOk) return;
    if (isSpeaking()) { cancelSpeech(); setSpeaking(false); return; }
    let script = `Question. ${problem.prompt}.`;
    if (problem.type === "mc") {
      script += " Choices: ";
      problem.choices.forEach((c, i) => {
        script += ` Option ${String.fromCharCode(65 + i)}: ${c}. `;
      });
    }
    if (includeSolution) {
      script += " Worked solution. ";
      problem.solution.forEach((s, i) => { script += ` Step ${i + 1}. ${s}. `; });
      if (problem.type === "mc") {
        script += ` The correct answer is ${String.fromCharCode(65 + problem.correctIndex)}: ${problem.choices[problem.correctIndex]}.`;
      } else {
        script += ` The expected answer is ${problem.expectedAnswer}.`;
      }
    }
    setSpeaking(true);
    speak(script, { onEnd: () => setSpeaking(false), rate: 0.95 });
  };

  const submit = () => {
    if (submitted) return;
    let isCorrect = false;
    if (problem.type === "mc") {
      isCorrect = selected === problem.correctIndex;
    } else {
      isCorrect = gradeFR(problem, free).correct;
    }
    setCorrect(isCorrect);
    setSubmitted(true);
    setShowSolution(true);
    onAttempt?.({
      problemId: problem.id,
      correct: isCorrect,
      selected: problem.type === "mc" ? String(selected) : free,
      timeMs: Date.now() - startedAt,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitted && (problem.type === "mc" ? selected !== null : free.trim())) {
      submit();
    }
  };

  const skill = skillById(problem.skill);

  return (
    <article className={bare ? "" : "card"} onKeyDown={onKeyDown}>
      <header className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="chip font-mono">{problem.id}</span>
        <span className="chip" title={skill?.title}>
          <span className="font-mono">{problem.skill}</span>
        </span>
        <span className="chip" title={`Difficulty ${problem.difficulty}/3`}>
          {"●".repeat(problem.difficulty)}{"○".repeat(3 - problem.difficulty)}
        </span>
        <span className="chip" title={problem.calculatorAllowed ? "Calculator allowed" : "No calculator"}>
          {problem.calculatorAllowed ? <Calculator size={12} /> : <span className="line-through"><CalculatorIcon size={12} /></span>}
          <span className="text-[10px]">{problem.calculatorAllowed ? "calc" : "no calc"}</span>
        </span>
        <span className="chip">{problem.type === "mc" ? "Multiple choice" : "Free response"}</span>
        {ttsOk && (
          <button
            type="button"
            onClick={() => speakProblem(submitted)}
            className="chip hover:border-[color:var(--accent)]"
            aria-label={speaking ? "Stop reading" : "Read question aloud"}
            title={speaking ? "Stop reading" : (submitted ? "Read question + worked solution" : "Read question aloud")}
          >
            {speaking ? <StopCircle size={12} /> : <Volume2 size={12} />}
            <span className="text-[10px]">{speaking ? "Stop" : "Listen"}</span>
          </button>
        )}
      </header>

      <p className="text-base leading-relaxed">
        <RichText>{problem.prompt}</RichText>
      </p>

      {problem.graph && (
        <div className="mt-3 surface p-0 overflow-hidden">
          <Suspense fallback={<div className="h-[260px] flex items-center justify-center text-xs text-[color:var(--ink-soft)]">Loading graph…</div>}>
            <Grapher
              expressions={problem.graph.expressions}
              polar={problem.graph.polar}
              xMin={problem.graph.xMin}
              xMax={problem.graph.xMax}
              yMin={problem.graph.yMin}
              yMax={problem.graph.yMax}
              height={260}
              showLegend={false}
            />
          </Suspense>
        </div>
      )}

      {problem.type === "mc" ? (
        <div className="mt-4 space-y-2">
          {problem.choices.map((c, i) => {
            const isCorrectChoice = i === problem.correctIndex;
            const isSelected = i === selected;
            let stateClass = "border-[color:var(--line)] hover:border-[color:var(--accent)]";
            if (submitted) {
              if (isCorrectChoice) stateClass = "border-emerald-500 bg-emerald-500/10";
              else if (isSelected) stateClass = "border-red-500 bg-red-500/10";
              else stateClass = "border-[color:var(--line)] opacity-60";
            } else if (isSelected) {
              stateClass = "border-[color:var(--accent)] bg-[color:var(--accent)]/5";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition focusring flex items-start gap-3 ${stateClass}`}
              >
                <span className="font-mono text-xs mt-0.5">{String.fromCharCode(65 + i)}.</span>
                <span className="flex-1"><RichText>{c}</RichText></span>
                {submitted && isCorrectChoice && <Check size={16} className="text-emerald-600 mt-0.5" />}
                {submitted && isSelected && !isCorrectChoice && <X size={16} className="text-red-600 mt-0.5" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <label className="text-xs text-[color:var(--ink-soft)] block mb-1">Your answer</label>
          <input
            value={free}
            onChange={(e) => setFree(e.target.value)}
            disabled={submitted}
            className="w-full font-mono text-base bg-transparent border border-[color:var(--line)] rounded-lg px-3 py-2 focusring disabled:opacity-70"
            placeholder="Type your answer (LaTeX, fractions, π, etc. accepted)"
            spellCheck={false}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={problem.type === "mc" ? selected === null : !free.trim()}
            className="btn btn-primary disabled:opacity-50"
          >
            Submit
          </button>
        ) : (
          <>
            <span className={`chip ${correct ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300" : "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300"}`}>
              {correct ? <><Check size={12} /> Correct</> : <><X size={12} /> Not quite</>}
            </span>
            {onNext && (
              <button type="button" onClick={onNext} className="btn btn-primary">
                Next problem <RotateCw size={14} />
              </button>
            )}
          </>
        )}
        {submitted && !hideSolution && (
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            className="btn btn-ghost ml-auto"
          >
            {showSolution ? <><ChevronUp size={14} /> Hide solution</> : <><ChevronDown size={14} /> Show solution</>}
          </button>
        )}
      </div>

      {submitted && showSolution && !hideSolution && (
        <div className="mt-4 border-t border-[color:var(--line)] pt-3">
          <p className="text-xs font-mono uppercase tracking-wide text-[color:var(--ink-soft)] mb-2">Worked solution</p>
          <ol className="text-sm space-y-1.5 ml-4 list-decimal">
            {problem.solution.map((step, i) => (
              <li key={i} className="text-[color:var(--ink-soft)]"><RichText>{step}</RichText></li>
            ))}
          </ol>
          {problem.type === "fr" && (
            <p className="mt-2 text-sm">
              <span className="text-[color:var(--ink-soft)]">Expected: </span>
              <span className="font-mono"><RichText>{problem.expectedAnswer}</RichText></span>
            </p>
          )}
        </div>
      )}
    </article>
  );
}
