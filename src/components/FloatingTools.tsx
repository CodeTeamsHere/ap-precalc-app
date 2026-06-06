import { lazy, Suspense, useState } from "react";
import { Calculator, PenLine } from "lucide-react";

// Two extra always-available study tools that complement the tutor sparkle:
//   - Desmos graphing calculator (industry-standard, full keypad)
//   - Page annotation overlay (pen / eraser, draw anywhere on the page)
//
// Both are lazy-loaded so they don't add anything to the initial bundle.

const DesmosPanel = lazy(() => import("./DesmosPanel"));
const Annotator = lazy(() => import("./Annotator"));

export default function FloatingTools() {
  const [desmosOpen, setDesmosOpen] = useState(false);
  const [annotateOn, setAnnotateOn] = useState(false);

  return (
    <>
      {/* Column of buttons above the TutorChat sparkle (which lives at bottom-5). */}
      <div className="fixed right-5 z-40 flex flex-col gap-2" style={{ bottom: "5.5rem" }}>
        <button
          type="button"
          aria-label={annotateOn ? "Exit annotation mode" : "Draw on the page"}
          title={annotateOn ? "Exit annotation mode" : "Draw / annotate"}
          onClick={() => setAnnotateOn((v) => !v)}
          className={`rounded-full p-3 shadow-card focusring transition ${
            annotateOn
              ? "bg-[color:var(--accent)] text-white"
              : "bg-[color:var(--bg-soft)] text-[color:var(--ink)] border border-[color:var(--line)] hover:border-[color:var(--accent)]"
          }`}
        >
          <PenLine size={16} />
        </button>
        <button
          type="button"
          aria-label={desmosOpen ? "Close Desmos calculator" : "Open Desmos calculator"}
          title={desmosOpen ? "Close calculator" : "Desmos calculator"}
          onClick={() => setDesmosOpen((v) => !v)}
          className={`rounded-full p-3 shadow-card focusring transition ${
            desmosOpen
              ? "bg-[color:var(--accent)] text-white"
              : "bg-[color:var(--bg-soft)] text-[color:var(--ink)] border border-[color:var(--line)] hover:border-[color:var(--accent)]"
          }`}
        >
          <Calculator size={16} />
        </button>
      </div>

      <Suspense fallback={null}>
        <DesmosPanel open={desmosOpen} onClose={() => setDesmosOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <Annotator active={annotateOn} onClose={() => setAnnotateOn(false)} />
      </Suspense>
    </>
  );
}
